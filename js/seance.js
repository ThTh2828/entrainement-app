/* ===== Séance plein écran ===== */
const FATIGUE = ['Très frais', 'Frais', 'Correct', 'Fatigué', 'Épuisé'];
const PAIN_WHERE = ['Pied / cheville', 'Genou', 'Bas du dos', 'Épaule', 'Poignet', 'Autre'];
let lastPos = null;

function curSess() { return S.active ? S.sessions[S.active] : null; }
function renderSession() {
  const el = document.getElementById('session');
  const s = curSess();
  if (!ui.sess || !s) {
    el.querySelectorAll('.stage').forEach(x => x._st && x._st.kill());
    el.hidden = true; el.innerHTML = ''; el.classList.remove('out'); releaseWake(); renderRest(); lastPos = null; VOICE.lastKey = null;
    document.body.classList.remove('insession');
    if (document.getElementById('sheet').hidden) document.body.classList.remove('noscroll');
    return;
  }
  preserveStages(el);
  const n = s.ex.length, editing = s.status === 'done';
  const key = s.date + ':' + s.pos;
  let dir = '';
  if (lastPos && lastPos !== key) { const prev = +lastPos.split(':')[1]; dir = s.pos > prev ? ' enter-r' : ' enter-l'; }
  const label = s.pos < 0 ? 'Échauffement' : s.pos < n ? 'Exercice ' + (s.pos + 1) + '/' + n : 'Résumé';
  let h = '<header class="s-head"><div class="s-head-in"><button class="btn icon" data-act="sClose" aria-label="Fermer la séance">' + I.close + '</button>' +
    '<div class="s-title"><b>Séance ' + s.kind + (s.reduced ? ' · allégée' : '') + '</b><span>' + (editing ? 'Correction · ' : '') + label + '</span></div>' +
    (editing ? '<span></span>' : '<div class="s-head-r">' + (VOICE.ok ? '<button class="btn icon' + (S.profile.voice ? ' on' : '') + '" data-act="voiceToggle" aria-pressed="' + !!S.profile.voice + '" aria-label="Mode mains libres">' + (S.profile.voice ? I.voiceOn : I.voiceOff) + '</button>' : '') + '<button class="btn icon" data-act="sPause" aria-label="Mettre en pause">' + I.pause + '</button></div>') + '</div>' +
    '<div class="prog" aria-hidden="true">' + Array.from({ length: n + 2 }, (_, k) => { const p = k - 1; const done = p < s.pos || (p >= 0 && p < n && (s.ex[p].skipped || s.ex[p].sets.length >= prescFor(s, s.ex[p].slot).sets)); return '<i class="' + (p === s.pos && !done ? 'cur' : done ? 'done' : '') + '"></i>'; }).join('') + '</div></header>';
  h += '<div class="s-body' + dir + '">';
  if (s.pos < 0) h += warmView(s);
  else if (s.pos < n) h += exView(s, s.pos);
  else h += summaryView(s);
  h += '</div>';
  if (s.paused) h += '<div class="pause-veil"><div class="box"><b>En pause</b><p class="muted">Tout est enregistré. Tu peux fermer l’application et revenir plus tard.</p><button class="btn primary xl block" data-act="sResume">Reprendre</button><button class="btn ghost block" data-act="sClose">Quitter pour l’instant</button></div></div>';
  const opening = el.hidden;
  el.innerHTML = h; el.hidden = false; el.classList.remove('out');
  if (opening && !RM()) { const tp = window.__tap; el.style.setProperty('--rx', (tp ? tp.x : innerWidth / 2) + 'px'); el.style.setProperty('--ry', (tp ? tp.y : innerHeight * .7) + 'px'); el.classList.remove('reveal'); void el.offsetWidth; el.classList.add('reveal'); }
  document.body.classList.add('noscroll', 'insession');
  restoreStages(el);
  if (lastPos !== key) el.scrollTop = 0;
  lastPos = key;
  renderRest();
  requestWake();
  voiceOnView(s);
}
function warmView(s) {
  const hasBand = s.ex.some(e => EX[e.id].band);
  s.warmChk = s.warmChk || [];
  let h = '<div class="stack"><div class="eyebrow">Avant de commencer · 6 à 8 min</div><h2 class="ex-title">Échauffement</h2></div>' + coachBanner(s);
  h += '<ul class="check-list">' + WARMUP.map((w, i) => '<li><button class="' + (s.warmChk[i] ? 'on' : '') + '" data-act="warmChk" data-i="' + i + '"><span class="cb">' + I.check + '</span><span>' + w + '</span></button></li>').join('') + '</ul>';
  if (hasBand) h += alertBox('warn', 'warn', '<b>Bande :</b> ni entaille ni zone blanchie. Au tirage, au milieu des semelles chaussées.');
  if (s.status === 'active') h += '<label class="toggle card" style="padding:10px 14px;flex-direction:row"><span><b>Version allégée</b><br><span class="note">−1 série, +1 en réserve</span></span><input type="checkbox" data-chg="sReduced"' + (s.reduced ? ' checked' : '') + '></label>';
  h += '<div class="ex-nav" style="grid-template-columns:1fr 1.7fr"><button class="btn" data-act="sTimerWarm">' + I.timer + '7 min</button><button class="btn primary xl" data-act="sGo" data-pos="0">C’est parti</button></div>';
  if (s.status === 'active') h += '<button class="linkbtn" data-act="sMenu" style="align-self:center">Autres options</button>';
  return h;
}
function exView(s, i) {
  const e = s.ex[i], ex = EX[e.id], pr = prescFor(s, e.slot), sl = SESSIONS[s.kind][e.slot], n = s.ex.length;
  const lvl = e.level ? levelLabel(e.id, e.level) : (ex.unit === 'sec' ? levelLabel(e.id, e.level) : '');
  let h = '<div class="stack"><div class="eyebrow">' + (e.slot < 3 ? 'Principal' : 'Complémentaire') + (lvl ? ' · ' + lvl : '') + '</div><h2 class="ex-title">' + ex.name + '</h2>' +
    '<div class="ex-meta"><span><b>' + pr.sets + ' ×</b> ' + rangeLabel(e.id) + '</span><span>Réserve <b>' + (ex.unit === 'sec' ? '5 s' : rirLabel(pr.rmin, pr.rmax)) + '</b> <button class="info" data-act="rirInfo" aria-label="Qu’est-ce que la réserve ?">' + I.q + '</button></span><span>Repos <b>' + restLabel(e.id) + (s.adapt && s.adapt.rest ? ' +' + s.adapt.rest + ' s' : '') + '</b></span></div></div>';
  if (sl.alt && !e.sets.length && s.status === 'active') h += '<div class="seg" role="group" aria-label="Variante">' + [sl.ex, sl.alt].map(v => '<button class="' + (e.id === v ? 'on' : '') + '" data-act="variant" data-v="' + v + '" aria-pressed="' + (e.id === v) + '">' + EX[v].variant + '</button>').join('') + '</div>';
  h += stageHTML(e.id, 'sess-' + i + '-' + e.id);
  h += '<button class="footline glass" data-act="cuesSheet" data-id="' + e.id + '">' + I.book.replace('<svg', '<svg style="color:var(--acc)"') + '<span style="color:var(--fg);font-weight:600">Consignes' + (ex.safety || ex.stopRule ? ' et sécurité' : '') + '</span>' + CHEV + '</button>';
  const sg = suggestion(e.id);
  if (sg.state === 'ready' && !e.sets.length && s.status === 'active') h += '<div class="alert acc">' + I.up + '<div>Critères remplis : <b>' + nextLevelText(e.id) + '</b> ?<div class="btns" style="margin-top:8px"><button class="btn sm primary" data-act="acceptLevel" data-id="' + e.id + '">Valider</button><button class="btn sm" data-act="laterLevel" data-id="' + e.id + '">Plus tard</button></div></div></div>';
  if (ex.band) {
    const bands = S.profile.bands;
    h += '<div class="grid2">' + (bands.length ? '<select class="input" id="bandSel" data-chg="band" data-i="' + i + '" aria-label="Bande utilisée"><option value="">Bande…</option>' + bands.map(b => '<option' + (e.band === b.name ? ' selected' : '') + '>' + esc(b.name) + '</option>').join('') + (e.band && !bands.some(b => b.name === e.band) ? '<option selected>' + esc(e.band) + '</option>' : '') + '</select>'
      : '<input class="input" id="bandSel" data-chg="band" data-i="' + i + '" value="' + esc(e.band || '') + '" placeholder="Bande utilisée" maxlength="40" aria-label="Bande utilisée">') +
      '<input class="input" id="gripIn" data-chg="grip" data-i="' + i + '" value="' + esc(e.grip || '') + '" placeholder="Réglage des prises" maxlength="60" aria-label="Réglage des prises"></div>';
  }
  const max = Math.max(pr.sets, e.sets.length);
  const editK = ui.editSet != null && ui.editSet < e.sets.length ? ui.editSet : (e.sets.length < pr.sets && !e.skipped && s.status === 'active' ? e.sets.length : null);
  h += '<div class="stack">';
  for (let k = 0; k < max; k++) {
    if (k === editK) { h += setEditor(s, i, k); continue; }
    const x = e.sets[k];
    const fresh = ui.fresh && ui.fresh.i === i && ui.fresh.k === k ? ' fresh' : '';
    if (x) h += '<button class="setrow done' + fresh + '" data-act="editSet" data-k="' + k + '" aria-label="Modifier la série ' + (k + 1) + '"><span class="no">' + (k + 1) + '</span><span class="v">' + x.reps + '<small>' + unitShort(ex).trim() + ' · réserve ' + x.rir + (ex.unit === 'sec' ? ' s' : '') + '</small></span><span class="ck">' + I.check + '</span></button>';
    else h += '<div class="setrow todo"><span class="no">' + (k + 1) + '</span><span class="v">' + (e.skipped ? 'Passée' : 'À faire') + '</span><span></span></div>';
  }
  if (editK == null && s.status === 'done' && !e.skipped && e.sets.length < pr.sets) h += '<button class="btn block" data-act="editSet" data-k="' + e.sets.length + '">Ajouter une série</button>';
  h += '</div>';
  if (e.sets.length) h += '<div class="row between"><span class="small muted">Technique</span><div class="seg" style="flex:0 1 230px"><button class="' + (e.tech === 'clean' ? 'on' : '') + '" data-act="tech" data-v="clean">Propre</button><button class="' + (e.tech === 'fix' ? 'on' : '') + '" data-act="tech" data-v="fix">À revoir</button></div></div>';
  const done = e.skipped || e.sets.length >= pr.sets;
  h += '<div class="ex-nav"><button class="btn" data-act="sGo" data-pos="' + (i - 1) + '">' + I.back + 'Préc.</button><button class="btn ' + (done ? 'primary' : '') + '" data-act="sGo" data-pos="' + (i + 1) + '">' + (i + 1 < n ? 'Exercice suivant' : 'Terminer') + I.fwd + '</button></div>';
  if (!e.sets.length && s.status === 'active') h += '<button class="linkbtn" data-act="sSkip" data-i="' + i + '" style="align-self:center">' + (e.skipped ? 'Reprendre cet exercice' : 'Passer cet exercice') + '</button>';
  ui.fresh = null;
  return h;
}
function unitShort(ex) { return ex.unit === 'sec' ? ' s' : (ex.perSide ? ' rép./côté' : ' rép.'); }
function setEditor(s, i, k) {
  const e = s.ex[i], ex = EX[e.id], pr = prescFor(s, e.slot), isEdit = k < e.sets.length;
  if (!e.draft || e.draft.k !== k) e.draft = { k, reps: isEdit ? e.sets[k].reps : defaultValue(s, e, k), rir: isEdit ? e.sets[k].rir : null };
  const d = e.draft, sec = ex.unit === 'sec';
  const opts = sec ? [0, 3, 5, 8] : [0, 1, 2, 3, 4, 5];
  const hint = v => sec ? v === 5 : v >= pr.rmin && v <= pr.rmax;
  let h = '<div class="seteditor"><div class="row between"><span class="lbl">Série ' + (k + 1) + ' / ' + pr.sets + '</span><span class="small muted">' + (sec ? 'secondes, côté le plus faible' : ex.perSide ? 'rép. par côté' : 'répétitions') + '</span></div>';
  h += '<div class="stepper"><button class="btn" data-act="repsD" data-d="-1" aria-label="Moins">' + I.minus + '</button><input type="number" inputmode="numeric" id="repsIn" min="0" max="' + (sec ? 120 : 60) + '" value="' + d.reps + '" aria-label="Valeur réalisée"><button class="btn" data-act="repsD" data-d="1" aria-label="Plus">' + I.plus + '</button></div>';
  if (sec) {
    const sw = S.stopwatch && S.stopwatch.i === i ? S.stopwatch : null;
    h += sw ? '<button class="btn block" data-act="swStop"><span class="js-sw tnum" style="font:800 22px var(--f-display)">0 s</span> · Arrêter et noter</button>' : '<button class="btn block" data-act="swStart" data-i="' + i + '">' + I.timer + 'Chrono de tenue</button>';
  }
  h += '<div class="field"><span>' + (sec ? 'Réserve (secondes encore possibles)' : 'Réserve : répétitions encore possibles') + '</span><div class="chips ' + (sec ? 'grid4' : 'grid6') + '">' + opts.map(v => '<button class="chip' + (d.rir === v ? ' on' : '') + (hint(v) ? ' hint' : '') + '" data-act="rir" data-v="' + v + '" aria-pressed="' + (d.rir === v) + '">' + v + (v === opts[opts.length - 1] ? '+' : '') + '</button>').join('') + '</div></div>';
  h += '<button class="btn primary xl block" data-act="validateSet" data-k="' + k + '"' + (d.rir == null ? ' disabled' : '') + '><span>' + (d.rir == null ? 'Choisis la réserve' : isEdit ? 'Enregistrer' : 'Valider la série') + '</span></button>';
  if (isEdit) h += '<button class="linkbtn" data-act="delSet" data-k="' + k + '" style="align-self:center">Supprimer cette série</button>';
  return h + '</div>';
}
function summaryView(s) {
  const n = s.ex.length, editing = s.status === 'done';
  let h = '<div class="stack"><div class="eyebrow">' + (editing ? 'Correction' : 'Dernière étape') + '</div><h2 class="ex-title">Résumé</h2></div>';
  h += '<div class="mini3"><div><b>' + Math.round(sessDuration(s) / 60000) + '</b><span>minutes</span></div><div><b>' + doneSetsCount(s) + '</b><span>séries</span></div><div><b>' + s.ex.filter(e => e.sets.length).length + '/' + n + '</b><span>exercices</span></div></div>';
  h += '<div class="group">' + s.ex.map((e, i) => { const ex = EX[e.id]; return '<button class="listrow" data-act="sGo" data-pos="' + i + '" style="grid-template-columns:1fr auto 18px"><div><div class="t">' + ex.short + '</div><div class="s tnum">' + (e.skipped ? 'Passé' : e.sets.length ? e.sets.map(x => x.reps).join(' · ') + unitShort(ex) : 'Aucune série') + '</div></div>' + (e.tech === 'clean' ? pill('propre', 'acc') : e.tech === 'fix' ? pill('à revoir', 'warn') : '<span></span>') + CHEV + '</button>'; }).join('') + '</div>';
  h += '<div class="field"><span>Fatigue</span><div class="chips grid5">' + FATIGUE.map((f, k) => '<button class="chip' + (s.fatigue === k + 1 ? ' on' : '') + '" data-act="fatigue" data-v="' + (k + 1) + '" aria-label="' + f + '">' + (k + 1) + '</button>').join('') + '</div><span class="note">' + (s.fatigue ? FATIGUE[s.fatigue - 1] : '1 très frais · 5 épuisé') + '</span></div>';
  h += '<div class="field"><span>Douleur</span><div class="seg"><button class="' + (s.pain === false ? 'on' : '') + '" data-act="pain" data-v="0">Aucune</button><button class="' + (s.pain === true ? 'on' : '') + '" data-act="pain" data-v="1">Douleur ou gêne</button></div></div>';
  if (s.pain) {
    h += '<div class="chips">' + PAIN_WHERE.map(w => '<button class="chip badon' + ((s.painWhere || []).includes(w) ? ' on' : '') + '" data-act="painWhere" data-v="' + w + '">' + w + '</button>').join('') + '</div>';
    h += alertBox('warn', 'warn', 'Si elle persiste ou augmente, demande un avis médical.');
  }
  h += '<textarea class="input" id="sNote" maxlength="400" style="min-height:64px" placeholder="Note (facultatif)" aria-label="Note de séance">' + esc(s.note || '') + '</textarea>';
  h += '<button class="btn primary xl block shine" data-act="sFinish">' + (editing ? 'Enregistrer' : 'Terminer la séance') + '</button>';
  if (!editing) h += '<button class="linkbtn" data-act="sMenu" style="align-self:center">Autres options</button>';
  return h;
}
function openCheck(date, kind) {
  const rt = document.getElementById('reducedToggle');
  ui.ck = { date, kind, light: kind === 'strength' && !!(rt && rt.checked), anim: false };
  openSheet(checkSheetHTML(), checkSheetHTML);
}
function coachRing(score) {
  const p = Math.max(0, Math.min(6, score)) / 6;
  return '<div class="coach-ring" style="--p:' + p.toFixed(3) + '"><b>' + Math.max(0, Math.min(6, score)) + '</b><span>/6</span></div>';
}
function checkSheetHTML() {
  const { date, kind, light } = ui.ck, c = S.checkins[date] || {}, run = kind === 'run';
  let h = sheetHead('Comment tu te sens ?', 'Bilan avant ' + (run ? 'la sortie' : 'la séance'));
  h += '<div class="ckq">' + CHECK_Q.map(q => '<div class="field"><span>' + q.t + '</span><div class="chips grid3">' + q.o.map((o, i) => '<button class="chip ck' + i + (c[q.k] === i ? ' on' : '') + '" data-act="ckSet" data-k="' + q.k + '" data-v="' + i + '">' + o + '</button>').join('') + '</div></div>').join('') + '</div>';
  if (checkComplete(c)) {
    const pl = coachPlan(date, c), lvl = light && !run ? 'light' : pl.level, T = COACH_TXT[lvl];
    const why = light && !run ? ['version allégée choisie'].concat(pl.why) : pl.why;
    h += '<div><section class="coach' + (ui.ck.anim ? ' coach-in' : '') + '"><div class="coach-h">' + coachRing(pl.score) + '<div><div class="eyebrow">Coach</div><b>' + T.t + '</b></div></div><p>' + (run ? RUN_COACH[lvl] : T.s) + '</p>' +
      (why.length ? '<div class="chips">' + why.map(w => pill(esc(w))).join('') + '</div>' : '') + '</section></div>';
    if (run) h += '<button class="btn runb xl block" data-act="closeSheet">Compris</button>';
    else {
      h += '<button class="btn primary xl block shine" data-act="ckGo" data-m="coach">' + I.play + (lvl === 'ease' || lvl === 'light' ? 'Démarrer la séance ajustée' : 'Démarrer la séance') + '</button>';
      if (lvl === 'ease' || (lvl === 'light' && !light)) h += '<button class="btn ghost block" data-act="ckGo" data-m="plan">Garder le plan normal</button>';
    }
  } else {
    h += '<p class="note">Trois touches : le coach ajuste ' + (run ? 'ta sortie' : 'ta séance') + ' selon ta forme et tes dernières saisies. Rien ne quitte ton téléphone.</p>';
    if (!run) h += '<button class="linkbtn" data-act="ckGo" data-m="skip" style="align-self:center">Passer et démarrer</button>';
  }
  return h;
}
function coachBanner(s) {
  if (!s.adapt && !s.check) return '';
  const lvl = s.adapt ? s.adapt.level : (s.reduced ? 'light' : 'normal'), T = COACH_TXT[lvl] || COACH_TXT.normal;
  const why = s.adapt && s.adapt.why && s.adapt.why.length ? ' <span class="note">(' + esc(s.adapt.why.join(', ')) + ')</span>' : '';
  return '<div class="coach mini"><div class="coach-h"><span class="ic fill">' + I.spark + '</span><div><div class="eyebrow">Coach' + (s.adapt ? '' : ' · plan normal gardé') + '</div><b>' + (s.adapt ? T.t : 'Plan normal') + '</b></div></div>' + (s.adapt ? '<p>' + T.s + why + '</p>' : '') + '</div>';
}
function sessionSummarySheet(date) {
  const s = S.sessions[date]; if (!s) return;
  let h = sheetHead('Séance ' + s.kind, fmtDL(s.date) + ' · semaine ' + s.pw + (s.reduced ? ' · allégée' : ''));
  h += '<div class="mini3"><div><b>' + Math.round(sessDuration(s) / 60000) + '</b><span>minutes</span></div><div><b>' + doneSetsCount(s) + '</b><span>séries</span></div><div><b>' + (s.fatigue || '—') + '</b><span>fatigue /5</span></div></div>';
  h += '<div class="list">' + s.ex.map(e => { const ex = EX[e.id]; return '<div class="li"><div><div class="t">' + ex.short + '</div><div class="s tnum">' + (e.skipped ? 'Passé' : e.sets.length ? e.sets.map(x => x.reps).join(' · ') + unitShort(ex) + ' · réserve ' + e.sets.map(x => x.rir).join('/') : 'Aucune série') + (e.band ? ' · ' + esc(e.band) + (e.grip ? ', ' + esc(e.grip) : '') : '') + '</div></div>' + (e.tech === 'clean' ? pill('propre', 'acc') : e.tech === 'fix' ? pill('à revoir', 'warn') : '') + '</div>'; }).join('') + '</div>';
  if (s.pain) h += alertBox('warn', 'warn', 'Douleur notée : ' + esc((s.painWhere || []).join(', ') || 'non précisée'));
  if (s.check) h += '<p class="small"><b>Forme :</b> ' + formeLabel(s.check) + (s.adapt ? ' · coach : ' + (COACH_TXT[s.adapt.level] || COACH_TXT.normal).t.toLowerCase() : '') + '</p>';
  if (s.note) h += '<p class="small">' + esc(s.note) + '</p>';
  h += s.status === 'done' ? '<button class="btn block" data-act="editSession" data-date="' + date + '">Corriger</button>' : '<button class="btn primary block" data-act="openSessionDate" data-date="' + date + '">Reprendre</button>';
  openSheet(h);
}
function sessionMenu() {
  if (!curSess()) return;
  openSheet(sheetHead('Options') + '<div class="stack"><button class="btn block" data-act="sGo" data-pos="-1">Revenir à l’échauffement</button><button class="btn danger block" data-act="sDeleteAsk">Supprimer cette séance</button></div>');
}
function celebrate(s) {
  const el = document.getElementById('celebrate');
  const sets = doneSetsCount(s), min = Math.round(sessDuration(s) / 60000), ex = s.ex.filter(e => e.sets.length).length;
  el.innerHTML = '<div class="cel"><div class="cel-ring"><svg viewBox="0 0 136 136"><circle class="c" cx="68" cy="68" r="60"></circle><path class="k" d="M44 70 l16 16 l32 -34"></path></svg><div class="burst">' + Array.from({ length: 14 }, (_, k) => '<i style="--a:' + (k * 360 / 14) + 'deg"></i>').join('') + '</div></div>' +
    '<h2>Séance ' + s.kind + '<br>terminée</h2><div class="meta"><span><b data-count="' + sets + '">0</b>séries</span><span><b data-count="' + ex + '">0</b>exercices</span><span><b data-count="' + min + '">0</b>min</span></div>' +
    '<button class="btn primary xl" data-act="celClose">Continuer</button></div>';
  el.hidden = false; el.classList.remove('out');
  const t0 = performance.now() + (RM() ? 0 : 1000);
  const step = now => {
    const p = Math.max(0, Math.min(1, (now - t0) / 700));
    el.querySelectorAll('[data-count]').forEach(b => b.textContent = Math.round(+b.dataset.count * (1 - Math.pow(1 - p, 3))));
    if (p < 1 && !el.hidden) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  haptic([20, 60, 30]);
}
function closeCelebrate() { const el = document.getElementById('celebrate'); el.classList.add('out'); setTimeout(() => { el.hidden = true; el.innerHTML = ''; el.classList.remove('out'); }, RM() ? 0 : 280); }

/* ---- minuteur ---- */
const RING_C = 2 * Math.PI * 30;
function timerLeft(tm = S.timer) { if (!tm) return 0; return tm.left != null ? tm.left : Math.max(0, tm.endAt - Date.now()); }
function startRest(sec, label, id) { S.timer = { endAt: Date.now() + sec * 1000, total: sec, left: null, label, id: id || null, rang: false }; save(); renderRest(); }
function renderRest() {
  const el = document.getElementById('restbar'), tm = S.timer;
  if (!tm || !ui.sess) { el.hidden = true; el.innerHTML = ''; return; }
  const ex = tm.id && EX[tm.id];
  const presets = ex ? [...new Set([ex.rest[0], Math.round((ex.rest[0] + ex.rest[1]) / 2), ex.rest[1]])] : [];
  const paused = tm.left != null, wasHidden = el.hidden;
  el.innerHTML = '<div class="rb-in"><div class="ring js-ring"><svg viewBox="0 0 72 72"><defs><linearGradient id="restGrad" x1="0" y1="0" x2="1" y2="1"><stop class="r0" offset="0"/><stop class="r1" offset="1"/></linearGradient></defs><circle class="bgc" cx="36" cy="36" r="30"></circle><circle class="fgc js-arc" cx="36" cy="36" r="30" stroke-dasharray="' + RING_C.toFixed(1) + '" stroke-dashoffset="0"></circle></svg><span class="tt js-time" role="timer">0:00</span></div>' +
    '<div class="rb-main"><div class="rb-top"><span class="rb-lbl"><b>Repos</b> · ' + esc(tm.label) + '</span>' + (presets.length > 1 ? '<span class="rb-pre">' + presets.map(p => '<button class="chip' + (tm.total === p ? ' on' : '') + '" data-act="tPreset" data-v="' + p + '">' + p + '</button>').join('') + '</span>' : '') + '</div>' +
    '<div class="rb-ctl"><button class="btn" data-act="tAdj" data-v="-15">−15</button><button class="btn" data-act="tToggle" aria-label="' + (paused ? 'Reprendre' : 'Pause') + '">' + (paused ? I.play : I.pause) + '</button><button class="btn" data-act="tAdj" data-v="15">+15</button><button class="btn primary js-skip" data-act="tSkip">' + (timerLeft() <= 0 ? 'OK' : 'Passer') + '</button></div></div></div>';
  el.hidden = false;
  el.style.animation = wasHidden ? '' : 'none';
  tick();
}
function fmtClock(ms) { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + pad(s % 60); }
function tick() {
  const tm = S.timer;
  if (tm) {
    const left = timerLeft(tm);
    const t = document.querySelector('.js-time'), arc = document.querySelector('.js-arc'), ring = document.querySelector('.js-ring');
    if (t) t.textContent = left > 0 ? fmtClock(left) : 'OK';
    if (arc) arc.setAttribute('stroke-dashoffset', left <= 0 ? '0' : (RING_C * (1 - left / (tm.total * 1000))).toFixed(1));
    if (ring) ring.classList.toggle('done', left <= 0);
    voiceOnTick(tm, left);
    if (left <= 0 && !tm.rang) { tm.rang = true; save(); buzz(); voiceOnRestEnd(tm); const sk = document.querySelector('.js-skip'); if (sk) sk.textContent = 'OK'; }
  }
  const sw = S.stopwatch, swEl = document.querySelector('.js-sw');
  if (sw && swEl) swEl.textContent = Math.floor((Date.now() - sw.startAt) / 1000) + ' s';
  if (sw) voiceOnHold(sw);
}
let actx = null;
function unlockAudio() { if (!S.profile.sound) return; try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; } }
function haptic(p) { if (S.profile.vibrate && navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) try { navigator.vibrate(p); } catch (e) { } }
function buzz() {
  haptic([180, 90, 180]);
  if (S.profile.sound && actx && !document.hidden) {
    try { [0, 0.22].forEach(dt => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(actx.destination); const t0 = actx.currentTime + dt; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16); o.start(t0); o.stop(t0 + 0.18); }); } catch (e) { }
  }
}
let wake = null;
async function requestWake() { if (wake || document.hidden || !('wakeLock' in navigator)) return; try { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } catch (e) { wake = null; } }
function releaseWake() { if (wake) { try { wake.release(); } catch (e) { } wake = null; } }

/* ---- actions de séance ---- */
function startSession(date, opts = {}) {
  const other = curSess();
  if (other && other.status === 'active' && other.date !== date) { toast('Une séance du ' + fmtD(other.date) + ' est déjà en cours.'); ui.sess = true; closeSheet(true); renderSession(); return; }
  let s = S.sessions[date];
  if (!s) {
    const ci = calInfo(date);
    if (ci.type !== 'strength') return;
    const rt = document.getElementById('reducedToggle');
    s = newSession(date, ci, opts.reduced != null ? opts.reduced : rt && rt.checked);
    if (opts.adapt) s.adapt = opts.adapt;
    if (opts.check) s.check = { ...opts.check };
    S.sessions[date] = s;
  }
  if (s.status === 'done') { sessionSummarySheet(date); return; }
  S.active = date; ui.sess = true; ui.editSet = null;
  if (s.paused) { s.pausedMs += Date.now() - s.paused; s.paused = null; }
  touch(s); save(); closeSheet(true); haptic(12); renderSession();
}
function closeSessionView() {
  const el = document.getElementById('session');
  ui.sess = false; ui.editSet = null; S.stopwatch = null; save();
  document.getElementById('restbar').hidden = true;
  if (RM()) { renderSession(); render(); return; }
  el.classList.add('out'); render();
  setTimeout(() => { if (!ui.sess) renderSession(); }, 250);
}
const SACT = {
  sClose() { const s = curSess(); if (s && s.status === 'done') S.active = null; closeSessionView(); },
  sPause() { const s = curSess(); if (!s) return; voiceStop(); s.paused = Date.now(); if (S.timer && S.timer.left == null) { S.timer.left = timerLeft(); S.timer.endAt = null; } save(); renderSession(); },
  sResume() { const s = curSess(); if (!s || !s.paused) return; s.pausedMs += Date.now() - s.paused; s.paused = null; s.lastAt = Date.now(); if (S.timer && S.timer.left != null) { S.timer.endAt = Date.now() + S.timer.left; S.timer.left = null; } save(); VOICE.lastKey = null; renderSession(); },
  sMenu() { sessionMenu(); },
  sDeleteAsk() { confirmSheet('Supprimer la séance ?', 'Les séries saisies pour la séance du ' + fmtD(S.active) + ' seront effacées.', 'sDelete', 'Supprimer'); },
  sDelete() { const d = S.active; delete S.sessions[d]; S.active = null; S.timer = null; closeSheet(true); closeSessionView(); toast('Séance supprimée.'); },
  sGo(el) { const s = curSess(); if (!s) return; const p = clamp(+el.dataset.pos, -1, s.ex.length); if (s.pos === -1 && p >= 0) s.warm = true; s.pos = p; ui.editSet = null; S.stopwatch = null; touch(s); save(); closeSheet(true); renderSession(); },
  warmChk(el) { const s = curSess(); s.warmChk = s.warmChk || []; const i = +el.dataset.i; s.warmChk[i] = !s.warmChk[i]; save(); el.classList.toggle('on', !!s.warmChk[i]); haptic(8); },
  sTimerWarm() { startRest(7 * 60, 'Échauffement', null); },
  cuesSheet(el) { const id = el.dataset.id; openSheet(sheetHead(EX[id].name, 'Consignes') + pairHTML(id) + cuesHTML(id)); },
  rirInfo() { openSheet(sheetHead('La réserve') + '<p>' + RIR_TEXT + '</p><p class="note">Les chiffres entourés de vert correspondent à la réserve prévue cette semaine.</p>'); },
  variant(el) { const s = curSess(), e = s.ex[s.pos], v = el.dataset.v; if (e.sets.length) return; S.profile.pushVariant = v; s.ex[s.pos] = mkExLog(e.slot, v, s.date); touch(s); save(); renderSession(); },
  repsD(el) {
    const s = curSess(), e = s.ex[s.pos]; if (!e.draft) return;
    e.draft.reps = clamp((+e.draft.reps || 0) + (+el.dataset.d), 0, EX[e.id].unit === 'sec' ? 120 : 60);
    const inp = document.getElementById('repsIn'); if (inp) { inp.value = e.draft.reps; inp.classList.remove('bump'); void inp.offsetWidth; inp.classList.add('bump'); }
    haptic(5); save();
  },
  rir(el) { const s = curSess(), e = s.ex[s.pos]; if (!e.draft) return; e.draft.rir = +el.dataset.v; haptic(6); save(); renderSession(); },
  validateSet(el) {
    const s = curSess(), e = s.ex[s.pos], k = +el.dataset.k, d = e.draft;
    if (!d || d.rir == null || el.classList.contains('ok')) return;
    const inp = document.getElementById('repsIn'); if (inp) d.reps = clamp(Math.round(+inp.value || 0), 0, 120);
    el.classList.add('ok'); el.innerHTML = I.check + '<span>Validée</span>'; haptic(18);
    setTimeout(() => {
      const isNew = k >= e.sets.length, rec = { reps: d.reps, rir: d.rir, at: Date.now() };
      if (isNew) e.sets.push(rec); else e.sets[k] = rec;
      e.draft = null; ui.editSet = null; S.stopwatch = null; touch(s);
      ui.fresh = { i: s.pos, k };
      if (isNew && s.status === 'active') {
        const ex = EX[e.id], pr = prescFor(s, e.slot), lastOfEx = e.sets.length >= pr.sets;
        const sec = restFor(s, e.id);
        startRest(sec, lastOfEx ? 'puis exercice suivant' : 'puis série ' + (e.sets.length + 1), e.id);
        voiceOnSet(s, e, sec);
      }
      save(); renderSession();
    }, RM() ? 0 : 230);
  },
  editSet(el) { const s = curSess(), e = s.ex[s.pos]; ui.editSet = +el.dataset.k; e.draft = null; renderSession(); },
  delSet(el) { const s = curSess(), e = s.ex[s.pos]; e.sets.splice(+el.dataset.k, 1); e.draft = null; ui.editSet = null; touch(s); save(); renderSession(); },
  tech(el) { const s = curSess(), e = s.ex[s.pos]; e.tech = el.dataset.v; touch(s); save(); renderSession(); },
  sSkip(el) { const s = curSess(), e = s.ex[+el.dataset.i]; e.skipped = !e.skipped; touch(s); save(); renderSession(); },
  swStart(el) { S.stopwatch = { startAt: Date.now(), i: +el.dataset.i }; save(); haptic(10); renderSession(); },
  swStop() { const s = curSess(), e = s.ex[s.pos], sw = S.stopwatch; if (!sw) return; if (e.draft) e.draft.reps = clamp(Math.floor((Date.now() - sw.startAt) / 1000), 0, 120); S.stopwatch = null; save(); renderSession(); },
  fatigue(el) { const s = curSess(); s.fatigue = +el.dataset.v; save(); renderSession(); },
  pain(el) { const s = curSess(); s.pain = el.dataset.v === '1'; if (!s.pain) s.painWhere = []; save(); renderSession(); },
  painWhere(el) { const s = curSess(), v = el.dataset.v; s.painWhere = s.painWhere || []; const i = s.painWhere.indexOf(v); i >= 0 ? s.painWhere.splice(i, 1) : s.painWhere.push(v); save(); renderSession(); },
  sFinish() {
    const s = curSess(); if (!s) return;
    const note = document.getElementById('sNote'); if (note) s.note = note.value.slice(0, 400);
    const wasEdit = s.status === 'done';
    if (!wasEdit) { s.status = 'done'; s.finishedAt = Date.now(); if (s.paused) { s.pausedMs += Date.now() - s.paused; s.paused = null; } }
    S.active = null; S.timer = null; S.stopwatch = null;
    save(); closeSessionView();
    if (wasEdit) toast('Corrections enregistrées.');
    else { celebrate(s); say('Séance terminée. Bravo !'); }
  },
  voiceToggle() { voiceToggle(); },
  badgesOpen() { if (!document.getElementById('unlock').hidden) closeUnlock(); openSheet(badgesSheetHTML(), badgesSheetHTML); },
  unlockClose() { closeUnlock(); },
  celClose() { closeCelebrate(); setTimeout(checkBadges, 400); const ready = progressIds().filter(id => suggestion(id).state === 'ready').length; if (ready) toast('Progression proposée : voir Progression › Force.'); },
  tAdj(el) { const tm = S.timer; if (!tm) return; const d = +el.dataset.v * 1000; if (tm.left != null) tm.left = Math.max(0, tm.left + d); else tm.endAt = Math.max(Date.now(), tm.endAt + d); tm.total = Math.max(5, tm.total + (+el.dataset.v)); if (timerLeft() > 0) tm.rang = false; save(); renderRest(); },
  tToggle() { const tm = S.timer; if (!tm) return; if (tm.left != null) { tm.endAt = Date.now() + tm.left; tm.left = null; } else { tm.left = timerLeft(); tm.endAt = null; } save(); renderRest(); },
  tSkip() { const hadEx = S.timer && S.timer.id; S.timer = null; save(); if (hadEx) say('C’est reparti. ' + spokenNext(curSess())); const el = document.getElementById('restbar'); if (RM()) { renderRest(); return; } el.style.transition = 'transform .25s var(--ease)'; el.style.transform = 'translateY(100%)'; setTimeout(() => { el.style.transition = ''; el.style.transform = ''; renderRest(); }, 230); },
  tPreset(el) { const tm = S.timer; if (!tm) return; const v = +el.dataset.v; if (tm.id) S.profile.rest[tm.id] = v; const elapsed = tm.total * 1000 - timerLeft(); const paused = tm.left != null; S.timer = { ...tm, total: v, rang: false }; if (paused) S.timer.left = Math.max(0, v * 1000 - elapsed); else S.timer.endAt = Date.now() + Math.max(0, v * 1000 - elapsed); save(); renderRest(); }
};
