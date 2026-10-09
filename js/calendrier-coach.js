const DAYTYPE = ['strength', 'run', 'strength', 'mobility', 'strength', 'run', 'rest'];
function weekStart(idx) { return addD(S.plan.startDate, idx * 7); }
function calInfo(date) {
  const st = S.plan.startDate;
  if (!st) return { noStart: true, date };
  const off = diffD(st, date);
  if (off < 0) return { before: true, daysTo: -off, date };
  const idx = Math.floor(off / 7);
  if (idx >= S.plan.seq.length) return { after: true, date };
  return dayOf(idx, off % 7);
}
function dayOf(idx, d) {
  const pw = S.plan.seq[idx];
  const date = addD(S.plan.startDate, idx * 7 + d);
  const info = { idx, pw, d, date, type: DAYTYPE[d], repeat: S.plan.seq.slice(0, idx).includes(pw) };
  if (info.type === 'strength') { const k = { 0: 0, 2: 1, 4: 2 }[d]; info.k = k; info.kind = (pw % 2 ? ['A', 'B', 'A'] : ['B', 'A', 'B'])[k]; }
  if (info.type === 'run') { info.slot = d === 1 ? 'tue' : 'sat'; info.planned = S.plan.runs[pw][info.slot]; }
  return info;
}
function weekLabel(idx) { const pw = S.plan.seq[idx]; const rep = S.plan.seq.slice(0, idx).includes(pw); return 'Semaine ' + pw + (rep ? ' bis' : ''); }
function currentIdx() {
  const ci = calInfo(today());
  if (ci.noStart) return 0;
  if (ci.before) return 0;
  if (ci.after) return S.plan.seq.length - 1;
  return ci.idx;
}
function hasLogsFrom(date) {
  return [S.sessions, S.runs, S.mobility].some(o => Object.keys(o).some(k => k >= date));
}
function canRepeat(idx) { return !!S.plan.startDate && S.plan.seq.length < 14 && !hasLogsFrom(weekStart(idx + 1)); }
function canUndoRepeat(idx) { const pw = S.plan.seq[idx]; return idx > 0 && S.plan.seq.slice(0, idx).includes(pw) && !hasLogsFrom(weekStart(idx)); }

/* ---- séances ---- */
function prescFor(sess, slot, base) {
  const wk = WEEKS[sess.pw - 1];
  let sets = slot < 3 ? wk.setsMain : wk.setsComp, rmin = wk.rir[0], rmax = wk.rir[1];
  if (sess.reduced) { sets = Math.max(1, sets - 1); rmin += 1; rmax += 1; }
  if (!base && sess.adapt && sess.adapt.comp && slot >= 3) sets = Math.max(1, sets - sess.adapt.comp);
  return { sets, rmin, rmax };
}
function rirLabel(a, b) { return a === b ? String(a) : a + '–' + b; }
function levelOf(id) { return S.levels[id]?.level || 0; }
function targetSec(id, lvl = levelOf(id)) { return Math.min(30, 15 + 5 * lvl); }
function levelLabel(id, lvl = levelOf(id)) {
  const ex = EX[id];
  if (ex.unit === 'sec') return 'Tenue cible : ' + targetSec(id, lvl) + ' s par côté';
  if (ex.band) return lvl ? 'Tension augmentée ' + lvl + ' fois' : 'Tension de départ';
  return ex.levels[Math.min(lvl, ex.levels.length - 1)];
}
function rangeLabel(id) {
  const ex = EX[id];
  if (ex.unit === 'sec') return ex.range[0] + '–' + ex.range[1] + ' s' + (ex.perSide ? ' par côté' : '');
  return ex.range[0] + '–' + ex.range[1] + ' rép.' + (ex.perSide ? ' par côté' : '');
}
function restLabel(id) { const r = EX[id].rest; return (r[0] === r[1] ? r[0] : r[0] + '–' + r[1]) + ' s'; }
function slotEx(kind, i) { const sl = SESSIONS[kind][i]; return sl.alt && S.profile.pushVariant === sl.alt ? sl.alt : sl.ex; }
function lastLogOf(id, beforeDate) {
  const list = Object.values(S.sessions).filter(s => s.date !== beforeDate).sort((a, b) => b.date.localeCompare(a.date));
  for (const s of list) { const e = s.ex.find(x => x.id === id && x.sets.length); if (e) return { s, e }; }
  return null;
}
function newSession(date, info, reduced) {
  return {
    date, idx: info.idx, pw: info.pw, kind: info.kind, reduced: !!reduced, status: 'active', pos: -1, warm: false,
    startedAt: Date.now(), lastAt: Date.now(), pausedMs: 0, paused: null, finishedAt: null,
    ex: SESSIONS[info.kind].map((sl, i) => mkExLog(i, slotEx(info.kind, i), date)),
    fatigue: null, pain: null, painWhere: [], note: ''
  };
}
function mkExLog(slot, id, date) {
  const ex = EX[id], last = lastLogOf(id, date);
  const o = { slot, id, level: levelOf(id), sets: [], draft: null, tech: null, skipped: false };
  if (ex.band) { o.band = last?.e.band || ''; o.grip = last?.e.grip || ''; }
  return o;
}
function defaultValue(sess, e, setIdx) {
  const ex = EX[e.id];
  if (e.sets[setIdx - 1]) return e.sets[setIdx - 1].reps;
  const last = lastLogOf(e.id, sess.date);
  if (last && last.e.level === e.level && last.e.sets[setIdx]) return ex.unit === 'sec' ? Math.min(last.e.sets[setIdx].reps, 60) : clamp(last.e.sets[setIdx].reps, ex.range[0], ex.range[1]);
  return ex.unit === 'sec' ? targetSec(e.id, e.level) : ex.range[0];
}
function touch(sess) {
  const now = Date.now();
  if (!sess.paused && sess.status === 'active' && now - sess.lastAt > 20 * 60000) sess.pausedMs += now - sess.lastAt;
  sess.lastAt = now;
}
function sessDuration(s) { const end = s.finishedAt || (s.paused || Date.now()); return Math.max(0, end - s.startedAt - s.pausedMs); }
function estMinutes(kind, pw, reduced) {
  const fake = { pw, reduced };
  let sec = 7 * 60;
  SESSIONS[kind].forEach((sl, i) => {
    const id = sl.ex, ex = EX[id], pr = prescFor(fake, i);
    const work = ex.unit === 'sec' ? (targetSec(id) + 15) * (ex.perSide ? 2 : 1) : (ex.range[0] + ex.range[1]) / 2 * 3 * (ex.perSide ? 2 : 1);
    const rest = (ex.rest[0] + ex.rest[1]) / 2;
    sec += pr.sets * work + (pr.sets - 1) * rest + 75;
  });
  return Math.round(sec / 60);
}

/* ---- progression musculation ---- */
function doneLogs(id) {
  return Object.values(S.sessions).filter(s => s.status === 'done' && !s.reduced)
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap(s => s.ex.filter(e => e.id === id && !e.skipped && e.sets.length).map(e => ({ s, e })));
}
function passes({ s, e }) {
  const ex = EX[e.id], pr = prescFor(s, e.slot, true);
  if (e.sets.length < pr.sets || e.tech !== 'clean') return false;
  const top = ex.unit === 'sec' ? targetSec(e.id, e.level) : ex.range[1];
  const rmin = ex.unit === 'sec' ? 5 : pr.rmin;
  return e.sets.slice(0, pr.sets).every(x => x.reps >= top && x.rir >= rmin);
}
function canLevelUp(id) {
  const ex = EX[id], lvl = levelOf(id);
  if (ex.band) return true;
  if (ex.unit === 'sec') return targetSec(id) < 30;
  return lvl < ex.levels.length - 1;
}
function nextLevelText(id) {
  const ex = EX[id], lvl = levelOf(id);
  if (ex.band) return ex.prog;
  if (ex.unit === 'sec') return 'Tenue cible : ' + (targetSec(id) + 5) + ' s par côté';
  return ex.levels[lvl + 1];
}
function suggestion(id) {
  const lvl = levelOf(id);
  const logs = doneLogs(id).filter(x => x.e.level === lvl);
  if (!canLevelUp(id)) return { state: 'max' };
  const last2 = logs.slice(0, 2);
  const ok = last2.filter(passes).length;
  if (last2.length < 2 || ok < 2) return { state: 'building', ok: last2.length && passes(last2[0]) ? (last2[1] && passes(last2[1]) ? 2 : 1) : 0 };
  const lastDate = last2[0].s.date;
  const ci = calInfo(today());
  if (!ci.noStart && !ci.before && !ci.after && ci.pw === 8) return { state: 'hold8' };
  const dis = S.sugg.dismissed[id];
  if (dis && dis >= lastDate) return { state: 'later' };
  return { state: 'ready', lastDate };
}
function acceptLevel(id) {
  const lvl = levelOf(id);
  const cur = S.levels[id] || { level: 0, hist: [] };
  cur.level = lvl + 1; cur.hist = (cur.hist || []).concat({ date: today(), from: lvl, to: lvl + 1 });
  S.levels[id] = cur;
  // la séance en cours, si elle contient cet exercice sans série validée, passe au nouveau niveau
  const a = S.active && S.sessions[S.active];
  if (a && a.status === 'active') a.ex.forEach(e => { if (e.id === id && !e.sets.length) e.level = cur.level; });
  save();
}
function progressIds() {
  const ids = ['squat', 'squat_tempo', 'pushup_knee', 'pushup_wall', 'row_band', 'glute_bridge', 'dead_bug', 'side_abduction', 'band_pull_apart', 'side_plank_knee'];
  return ids.filter(id => id !== 'pushup_wall' || S.profile.pushVariant === 'pushup_wall' || doneLogs('pushup_wall').length);
}

/* ---- bilan avant séance et coach local ----
   Trois réponses (sommeil, énergie, courbatures) + ce que tu as noté aux séances précédentes
   (fatigue, douleur, réserve) donnent un niveau : feu vert, normal, ajusté ou allégé. Tout reste sur le téléphone. */
const CHECK_Q = [
  { k: 'sleep', t: 'Sommeil', o: ['Mauvais', 'Correct', 'Bon'] },
  { k: 'energy', t: 'Énergie', o: ['Basse', 'Normale', 'Haute'] },
  { k: 'sore', t: 'Courbatures', o: ['Fortes', 'Légères', 'Aucune'] }
];
const COACH_TXT = {
  push: { t: 'Feu vert', pill: 'acc', s: 'Tu es en forme : plan complet. Vise le haut de la fourchette tant que la technique reste propre.' },
  normal: { t: 'Plan normal', pill: '', s: 'Rien à changer aujourd’hui : séance prévue, réserve prévue.' },
  ease: { t: 'Séance ajustée', pill: 'warn', s: '1 série de moins sur les exercices complémentaires et 15 s de repos en plus. Les exercices principaux restent au plan.' },
  light: { t: 'Version allégée', pill: 'warn', s: '1 série de moins partout, 1 répétition de plus en réserve et 30 s de repos en plus. Elle ne compte pas pour la progression.' }
};
const RUN_COACH = {
  push: 'La sortie prévue, en restant à 3–4 sur 10.',
  normal: 'Sortie prévue, effort facile.',
  ease: 'Raccourcis la sortie (environ 2/3 du temps prévu) ou alterne course et marche.',
  light: 'Remplace la course par 20 min de marche, ou prends ta journée.'
};
function checkComplete(c) { return !!c && CHECK_Q.every(q => Number.isInteger(c[q.k])); }
function lastDoneSession(before) { return Object.values(S.sessions).filter(x => x.status === 'done' && x.date < before).sort((a, b) => b.date.localeCompare(a.date))[0] || null; }
function tooHard(sess) {
  let n = 0, low = 0;
  sess.ex.forEach(e => { if (e.skipped || EX[e.id].unit === 'sec') return; const pr = prescFor(sess, e.slot); e.sets.forEach(x => { if (typeof x.rir === 'number') { n++; if (x.rir < pr.rmin) low++; } }); });
  return n >= 4 && low / n >= 0.4;
}
function coachPlan(date, c) {
  const why = [];
  let score = checkComplete(c) ? c.sleep + c.energy + c.sore : 4;
  if (checkComplete(c)) {
    if (c.sleep === 0) why.push('nuit difficile');
    if (c.energy === 0) why.push('énergie basse');
    if (c.sore === 0) why.push('courbatures fortes');
  }
  const prev = lastDoneSession(date), recent = prev && diffD(prev.date, date) <= 4;
  if (recent && prev.fatigue >= 4) { score -= 1; why.push('dernière séance très fatigante'); }
  if (recent && prev.pain) { score -= 2; why.push('gêne notée à la dernière séance'); }
  if (recent && tooHard(prev)) { score -= 1; why.push('réserve souvent dépassée la dernière fois'); }
  const flag = lastPainFlag(); if (flag && diffD(flag, date) <= 3) { score -= 1; why.push('douleur récente en course'); }
  let level = score >= 5 ? 'push' : score >= 3 ? 'normal' : score >= 1 ? 'ease' : 'light';
  if (level === 'push' && why.length) level = 'normal';
  if (checkComplete(c) && c.sore === 0 && (level === 'push' || level === 'normal')) level = 'ease';
  if (!why.length && (level === 'normal' || level === 'push') && checkComplete(c) && score >= 5) why.push('bien reposé');
  return { level, why, comp: level === 'ease' ? 1 : 0, rest: level === 'ease' ? 15 : level === 'light' ? 30 : 0, score: Math.max(0, score) };
}
function restFor(sess, id) { return (S.profile.rest[id] || EX[id].rest[0]) + (sess && sess.adapt ? sess.adapt.rest || 0 : 0); }
function formeLabel(c) { return checkComplete(c) ? CHECK_Q.map(q => q.t.toLowerCase() + ' ' + q.o[c[q.k]].toLowerCase()).join(' · ') : ''; }

/* ---- série et badges ----
   Série : activités prévues faites d’affilée (séance ou sortie). Les jours de repos ne cassent rien.
   Une activité du jour pas encore faite ne casse pas non plus la série : elle reste à entretenir. */
function dayKind(date) { const ci = calInfo(date); return ci.noStart || ci.before || ci.after ? null : ci.type; }
function dayDone(date) { const t = dayKind(date); if (t === 'strength') return S.sessions[date]?.status === 'done'; if (t === 'run') { const r = S.runs[date]; return !!r && r.kind !== 'skipped'; } return null; }
function streakInfo() {
  const st = S.plan.startDate, t = today(), out = { cur: 0, best: 0, pending: false, todayDone: false };
  if (!st || t < st) return out;
  let run = 0, d = st;
  const end = calInfo(t).after ? addD(st, S.plan.seq.length * 7 - 1) : t;
  while (d <= end) {
    const done = dayDone(d);
    if (done === true) { run++; out.best = Math.max(out.best, run); if (d === t) out.todayDone = true; }
    else if (done === false) { if (d === t) out.pending = true; else run = 0; }
    d = addD(d, 1);
  }
  out.cur = run; return out;
}
function weekComplete(idx) { const w = weekStats({ idx }); return w.sd >= 3 && w.rd >= 2; }
function weekStreak() {
  const st = S.plan.startDate; if (!st) return { cur: 0, best: 0, weeks: [] };
  const ci = calInfo(today()), last = ci.noStart || ci.before ? -1 : ci.after ? S.plan.seq.length - 1 : ci.idx;
  const weeks = S.plan.seq.map((_, i) => ({ i, done: i <= last && weekComplete(i), cur: i === last && !ci.after }));
  let cur = 0, best = 0, run = 0;
  for (let i = 0; i <= last; i++) { if (weeks[i].done) { run++; best = Math.max(best, run); } else if (!(i === last && !ci.after)) run = 0; }
  cur = run; return { cur, best, weeks };
}
const BADGE_CAT = { force: ['#FF8AB2', '#E2306C'], course: ['#B39CFF', '#6E4FE6'], regul: ['#FFD27A', '#F08A24'], suivi: ['#7FD3FF', '#2E86F0'] };
const BADGES = [
  { id: 'first_session', cat: 'force', ic: 'dumbbell', t: 'Premier pas', d: 'Termine ta première séance.', v: x => [x.sess, 1] },
  { id: 'sessions_10', cat: 'force', ic: 'dumbbell', t: 'Dizaine', d: '10 séances terminées.', v: x => [x.sess, 10] },
  { id: 'sessions_24', cat: 'force', ic: 'medal', t: 'Force tranquille', d: '24 séances : tout le programme de muscu.', v: x => [x.sess, 24] },
  { id: 'level_1', cat: 'force', ic: 'up', t: 'Ça monte', d: 'Valide ta première montée de niveau.', v: x => [x.lv, 1] },
  { id: 'level_5', cat: 'force', ic: 'up', t: 'Costaud', d: '5 montées de niveau.', v: x => [x.lv, 5] },
  { id: 'first_run', cat: 'course', ic: 'run', t: 'Premières foulées', d: 'Note ta première sortie.', v: x => [x.runs, 1] },
  { id: 'runs_10', cat: 'course', ic: 'run', t: 'Coureur régulier', d: '10 sorties notées.', v: x => [x.runs, 10] },
  { id: 'min_300', cat: 'course', ic: 'timer', t: 'Cinq heures', d: '300 minutes de course cumulées.', v: x => [x.min, 300] },
  { id: 'km_50', cat: 'course', ic: 'run', t: '50 km', d: '50 km cumulés (distance notée dans tes sorties).', v: x => [Math.floor(x.km), 50] },
  { id: 'streak_7', cat: 'regul', ic: 'flame', t: 'En feu', d: '7 activités prévues d’affilée.', v: x => [x.streak, 7] },
  { id: 'streak_15', cat: 'regul', ic: 'flame', t: 'Inarrêtable', d: '15 activités prévues d’affilée.', v: x => [x.streak, 15] },
  { id: 'week_full', cat: 'regul', ic: 'check', t: 'Semaine parfaite', d: '3 séances et 2 sorties dans la même semaine.', v: x => [x.weeksDone, 1] },
  { id: 'weeks_3', cat: 'regul', ic: 'spark', t: 'Trois d’affilée', d: '3 semaines parfaites de suite.', v: x => [x.weekBest, 3] },
  { id: 'program_done', cat: 'regul', ic: 'medal', t: 'Élan complet', d: 'Toutes les semaines du programme parfaites.', v: x => [x.weeksDone, S.plan.seq.length] },
  { id: 'weights_12', cat: 'suivi', ic: 'scale', t: 'Balance fidèle', d: '12 pesées notées.', v: x => [x.weights, 12] },
  { id: 'checkins_10', cat: 'suivi', ic: 'spark', t: 'À l’écoute', d: '10 bilans avant séance.', v: x => [x.checks, 10] },
  { id: 'early', cat: 'suivi', ic: 'timer', t: 'Lève-tôt', d: 'Une séance commencée avant 8 h.', v: x => [x.early, 1] },
  { id: 'late', cat: 'suivi', ic: 'moon', t: 'Oiseau de nuit', d: 'Une séance commencée après 21 h.', v: x => [x.late, 1] }
];
function badgeStats() {
  const done = Object.values(S.sessions).filter(x => x.status === 'done'), runs = Object.values(S.runs).filter(r => r.kind !== 'skipped');
  const hr = x => new Date(x.startedAt).getHours();
  const ws = weekStreak();
  return {
    sess: done.length, lv: Object.values(S.levels).reduce((a, l) => a + (l.hist || []).length, 0),
    runs: runs.length, min: runs.filter(r => r.kind === 'run' || r.kind === 'runwalk').reduce((a, r) => a + (r.minutes || 0), 0), km: runs.reduce((a, r) => a + (r.km || 0), 0),
    streak: streakInfo().best, weeksDone: ws.weeks.filter(w => w.done).length, weekBest: ws.best,
    weights: S.weights.length, checks: Object.values(S.checkins).filter(checkComplete).length,
    early: done.some(x => x.startedAt && hr(x) < 8) ? 1 : 0, late: done.some(x => x.startedAt && hr(x) >= 21) ? 1 : 0
  };
}
function badgeList() { const x = badgeStats(); return BADGES.map(b => { const [cur, tg] = b.v(x); return { ...b, cur: Math.min(cur, tg), tg, done: cur >= tg, at: S.badges[b.id] || null }; }); }
function medalSVG(b, locked) {
  const [c1, c2] = locked ? ['#4A4D6B', '#34365A'] : BADGE_CAT[b.cat];
  const gid = 'bg-' + b.id + (locked ? '-l' : '');
  return '<svg class="medal" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
    '<path d="M40 3 71 20.5v39L40 77 9 59.5v-39z" fill="url(#' + gid + ')"/><path d="M40 10 65 24v32L40 70 15 56V24z" fill="none" stroke="rgba(255,255,255,' + (locked ? '.12' : '.45') + ')" stroke-width="2"/>' +
    '<g transform="translate(26 26) scale(1.17)" class="mi' + (locked ? ' lk' : '') + '">' + I[b.ic].replace(/<svg[^>]*>/, '').replace('</svg>', '') + '</g></svg>';
}
let badgeQueue = [];
function checkBadges() {
  if (!S.plan.startDate && !Object.keys(S.sessions).length) return;
  const fresh = badgeList().filter(b => b.done && !S.badges[b.id]);
  if (!fresh.length) return;
  fresh.forEach(b => S.badges[b.id] = today()); save();
  badgeQueue = badgeQueue.concat(fresh);
  setTimeout(showUnlock, INTRO ? 1400 : 500);
}
function showUnlock() {
  const el = document.getElementById('unlock');
  if (!badgeQueue.length || !el.hidden) return;
  if (ui.sess || !document.getElementById('celebrate').hidden || INTRO) { setTimeout(showUnlock, 800); return; }
  const list = badgeQueue; badgeQueue = [];
  const one = list.length === 1, b = list[0];
  el.innerHTML = '<div class="ul-in"><div class="ul-rays"></div><div class="ul-medals' + (one ? '' : ' many') + '">' + list.slice(0, 8).map((x, k) => '<div class="ul-m" style="--k:' + k + '">' + medalSVG(x) + '</div>').join('') + '</div>' +
    '<div class="burst">' + Array.from({ length: 16 }, (_, k) => '<i style="--a:' + (k * 22.5) + 'deg"></i>').join('') + '</div>' +
    '<div class="eyebrow">' + (one ? 'Badge débloqué' : list.length + ' badges débloqués') + '</div><h2>' + (one ? esc(b.t) : 'Bravo !') + '</h2><p class="muted">' + (one ? esc(b.d) : list.map(x => esc(x.t)).join(' · ')) + '</p>' +
    '<button class="btn primary xl" data-act="unlockClose">Continuer</button><button class="linkbtn" data-act="badgesOpen">Voir mes badges</button></div>';
  el.hidden = false; el.classList.remove('out'); haptic([20, 50, 20, 50, 40]);
}
function closeUnlock() { const el = document.getElementById('unlock'); el.classList.add('out'); setTimeout(() => { el.hidden = true; el.innerHTML = ''; el.classList.remove('out'); showUnlock(); }, RM() ? 0 : 280); }
function streakChip() {
  const si = streakInfo(); if (!S.plan.startDate) return '';
  return '<button class="streak' + (si.cur ? ' on' : '') + (si.pending ? ' pending' : '') + '" data-act="badgesOpen" aria-label="Série : ' + si.cur + ' activités d’affilée">' + I.flame + '<b class="tnum">' + si.cur + '</b></button>';
}
function badgesSheetHTML() {
  const si = streakInfo(), ws = weekStreak(), list = badgeList(), got = list.filter(b => b.done).length;
  let h = sheetHead('Série et badges', got + ' / ' + list.length + ' badges');
  h += '<section class="streak-hero' + (si.cur ? ' on' : '') + '"><div class="sh-flame">' + I.flame + '</div><div><b class="tnum">' + si.cur + '</b><span>activité' + (si.cur > 1 ? 's' : '') + ' d’affilée</span><span class="note">' + (si.pending ? 'Celle d’aujourd’hui t’attend pour l’entretenir.' : si.todayDone ? 'Entretenue aujourd’hui.' : 'Les jours de repos ne cassent pas la série.') + ' Record : ' + si.best + '</span></div></section>';
  h += '<div class="field"><span>Semaines parfaites · 3 séances + 2 sorties' + (ws.cur ? ' · ' + ws.cur + ' d’affilée' : '') + '</span><div class="wkdots">' + ws.weeks.map(w => '<i class="' + (w.done ? 'done' : w.cur ? 'cur' : '') + '">' + (w.done ? I.check : 'S' + S.plan.seq[w.i]) + '</i>').join('') + '</div></div>';
  h += '<div class="badges">' + list.map(b => '<div class="bdg' + (b.done ? ' got' : '') + '">' + medalSVG(b, !b.done) + '<b>' + esc(b.t) + '</b><span>' + (b.done ? (b.at ? 'le ' + fmtD(b.at) : 'obtenu') : esc(b.d)) + '</span>' + (!b.done && b.tg > 1 ? '<div class="bp"><i style="width:' + Math.round(b.cur / b.tg * 100) + '%"></i></div><span class="tnum bpn">' + b.cur + ' / ' + b.tg + '</span>' : '') + '</div>').join('') + '</div>';
  return h;
}

/* ---- course ---- */
const RUNKINDS = { run: 'Course facile', runwalk: 'Course et marche', walk: 'Marche', badminton: 'Badminton (remplace la sortie)', skipped: 'Non faite' };
function runFlag(r) { return !!(r.painDuring || r.painAfter || r.swelling || r.limp); }
function lastPainFlag() {
  const dates = [];
  for (const d in S.runs) if (runFlag(S.runs[d])) dates.push(d);
  dates.sort();
  const last = dates[dates.length - 1];
  if (!last) return null;
  if (S.runClearedAt && S.runClearedAt >= last) return null;
  return last;
}
function runAdvice(date) {
  const flag = lastPainFlag();
  if (flag) return { level: 'stop', text: 'Douleur notée le ' + fmtD(flag) + ' : pause course. Reprends quand elle a disparu, et demande un avis si elle persiste.' };
  const prev = Object.values(S.runs).filter(r => r.date < date && (r.kind === 'run' || r.kind === 'runwalk')).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!prev) return { level: 'ok' };
  if (prev.legsTired || prev.effort >= 6) return { level: 'hold', cap: prev.minutes, text: 'Dernière sortie avec jambes très fatiguées ou effort élevé : reste à ' + prev.minutes + ' min maximum.' };
  return { level: 'ok' };
}

/* ---- poids ---- */
function weeklyWeights() {
  const g = {};
  for (const w of S.weights) { const m = mondayOf(w.date); (g[m] = g[m] || []).push(w.kg); }
  return Object.keys(g).sort().map(m => ({ week: m, n: g[m].length, avg: g[m].reduce((a, b) => a + b, 0) / g[m].length }));
}
function weightTrend() {
  const ws = weeklyWeights().filter(w => w.n >= 2);
  if (ws.length < 2) return null;
  const a = ws[0], b = ws[ws.length - 1], weeks = diffD(a.week, b.week) / 7;
  if (weeks < 1) return null;
  return { perWeekG: (b.avg - a.avg) * 1000 / weeks, weeks, from: a, to: b };
}
function shakeDaysInWeek(m) { let n = 0; for (let i = 0; i < 7; i++) if (S.shakes[addD(m, i)]?.taken) n++; return n; }
function kcalSuggestion() {
  const thisMon = mondayOf(today());
  const ws = weeklyWeights().filter(w => w.week < thisMon);
  if (ws.length < 3) return null;
  const last3 = ws.slice(-3);
  if (diffD(last3[0].week, last3[2].week) !== 14) return null;
  if (!last3.every(w => w.n >= 2)) return null;
  if (!last3.every(w => shakeDaysInWeek(w.week) >= 5)) return null;
  if (last3[2].avg - last3[0].avg > 0.1) return null;
  if (S.kcalSugg.dismissedWeek && S.kcalSugg.dismissedWeek >= last3[2].week) return null;
  return { weeks: last3 };
}
