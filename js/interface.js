/* ===== Interface : composants, écran Aujourd’hui, Programme, feuilles ===== */
const sv = (d, extra = '') => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + extra + '>' + d + '</svg>';
const I = {
  close: sv('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.3"'),
  back: sv('<path d="M15 5l-7 7 7 7"/>', 'stroke-width="2.3"'),
  fwd: sv('<path d="M9 5l7 7-7 7"/>', 'stroke-width="2.3"'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>',
  check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.8"'),
  warn: sv('<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4M12 17.2v.3"/>'),
  info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/>'),
  q: sv('<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.2"/>', 'stroke-width="2.4"'),
  up: sv('<path d="M12 19V5M6 11l6-6 6 6"/>', 'stroke-width="2.3"'),
  cup: sv('<path d="M7 8h10l-1.2 11.2a2 2 0 0 1-2 1.8h-3.6a2 2 0 0 1-2-1.8z"/><path d="M6 5h12v3H6zM13 5l1.5-3"/>'),
  scale: sv('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9.5a5 5 0 0 1 7 0M12 9.5l1.6 2.2"/>'),
  dumbbell: sv('<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'),
  run: sv('<circle cx="15" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v4M6 12l3-4 4 1 3 4 3 1"/><path d="m11 15-1.5-4"/>'),
  cal: sv('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 2.5v4M16 2.5v4"/>'),
  repeat: sv('<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-1a5 5 0 0 1 5-5h11M7 21.5l-3-3 3-3"/><path d="M20 12.5v1a5 5 0 0 1-5 5H4"/>'),
  book: sv('<path d="M4 4.5h6a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H4zM20 4.5h-6a2 2 0 0 0-2 2V20a1.5 1.5 0 0 1 1.5-1.5H20z"/>'),
  print: sv('<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="2"/><path d="M7 14h10v6.5H7z"/>'),
  flag: sv('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  foot: sv('<path d="M8 21c-2 0-3-1.5-3-3.5 0-3 2-4 2.5-7C8 7 9 4 12 4s3.5 3 3 6c-.4 2.6-1 4-1.5 6.5C13 19.5 11 21 8 21z"/><circle cx="17.5" cy="6" r="1"/><circle cx="19" cy="9" r=".9"/>'),
  target: sv('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'),
  bowl: sv('<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0zM8 7.5c0-1.5 1-2 1-3.5M12 7.5c0-1.5 1-2 1-3.5M16 7.5c0-1.5 1-2 1-3.5"/>'),
  band: sv('<path d="M6 7c4-4 8 4 12 0M6 17c4-4 8 4 12 0"/><path d="M6 7v10M18 7v10"/>'),
  bell: sv('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>'),
  save: sv('<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 17v3.5h15V17"/>'),
  phone: sv('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  spark: sv('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  flame: sv('<path d="M12 22c4 0 7-2.8 7-6.8 0-3.2-2-5.6-3.6-7.4-.4 1.8-1.4 3-2.6 3.4.4-3-1-6.2-3.8-8.2.2 3.2-1.6 5.2-3.2 7.2C4.6 12 4 13.6 4 15.4 4 19.2 7.6 22 12 22z"/><path d="M12 22c-1.8 0-3-1.2-3-2.9 0-1.8 1.4-2.8 2.2-4.1.8 1 2.6 2 3 3.6.5 1.9-.5 3.4-2.2 3.4z"/>'),
  medal: sv('<circle cx="12" cy="14.5" r="6"/><path d="m8.5 9.6-3-6.1h4.5l2 4M15.5 9.6l3-6.1H14l-2 4M12 12v5"/>'),
  moon: sv('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
  leaf: sv('<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>'),
  timer: sv('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/>'),
  minus: sv('<path d="M5 12h14"/>', 'stroke-width="2.6"'),
  plus: sv('<path d="M12 5v14M5 12h14"/>', 'stroke-width="2.6"')
};
const CHEV = I.fwd.replace('<svg', '<svg class="chev"');
const ui = { week: null, sess: false, sheetFn: null, confirmReset: false, importPreview: null, weightDate: null, ptab: 'poids', fresh: null, last: null };
let ANIM = true;
const stageCache = new Map();

function pill(t, cls = '') { return '<span class="pill ' + cls + '">' + t + '</span>'; }
function alertBox(cls, icon, html) { return '<div class="alert ' + cls + '">' + I[icon] + '<div>' + html + '</div></div>'; }
function listRow(act, icon, icCls, title, sub, right = '', attrs = '') {
  const tag = act.startsWith('#') ? 'a' : 'button';
  return '<' + tag + ' class="listrow" ' + (tag === 'a' ? 'href="' + act + '"' : 'data-act="' + act + '"') + ' ' + attrs + '><span class="ic ' + icCls + '">' + I[icon] + '</span><div><div class="t">' + title + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>' + (right || '<span></span>') + CHEV + '</' + tag + '>';
}
function stg() { return ANIM ? ' stagger' : ''; }

/* ---------- illustrations animées ---------- */
function stageHTML(id, key) {
  return '<div class="stage" data-stage="' + id + '" data-key="' + (key || id) + '">' + FIG.svg(EX[id], 0, 1) +
    '<div class="stage-lbl"><b data-lbl>Départ</b>' + (M3.ok ? '<button class="s3d" data-act="stage3d" aria-pressed="false" aria-label="Basculer en 3D">3D</button>' : '') + '</div>' +
    '<div class="s3d-hint">Glisse pour tourner</div>' +
    '<div class="stage-ctl"><button class="btn icon sm" data-act="stagePlay" aria-label="Lecture ou pause">' + I.play + '</button>' +
    '<input type="range" min="0" max="1000" value="0" aria-label="Position dans le mouvement"></div></div>';
}
function pairHTML(id) {
  const ex = EX[id];
  return '<div class="pair"><figure>' + FIG.svg(ex, 0, 1) + '<figcaption>Départ</figcaption></figure><figure>' + FIG.svg(ex, 1, 1) + '<figcaption>Arrivée</figcaption></figure></div>';
}
const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
class Stage {
  constructor(el) {
    this.el = el; this.ex = EX[el.dataset.stage]; this.svg = el.querySelector('svg'); this.range = el.querySelector('input[type=range]');
    this.lbl = el.querySelector('[data-lbl]'); this.btn = el.querySelector('[data-act=stagePlay]');
    this.ms = 0; this.playing = false; this.total = FIG.sample(this.ex.seq, 0).total;
    this.range.addEventListener('input', () => { this.stop(); this.ms = this.range.value / 1000 * this.total; this.draw(); });
    if (M3.ok && S.profile.anim3d !== false) this.enable3d();
    this.draw();
    if (!RM()) this.play();
  }
  enable3d() {
    this.want3d = true; this.syncBtn(); this.el.classList.add('loading3d');
    M3.load().then(() => {
      this.el.classList.remove('loading3d');
      if (!this.want3d || this.v3 || !this.el.isConnected) return;
      try { this.v3 = new M3.View(this.el, this.ex); this.el.classList.add('is3d'); } catch (e) { this.want3d = false; }
      this.syncBtn(); this.draw();
    }, () => { this.want3d = false; this.el.classList.remove('loading3d'); this.syncBtn(); if (!M3.warned) { M3.warned = true; toast('3D indisponible ici : animation 2D.'); } });
  }
  disable3d() { this.want3d = false; if (this.v3) { this.v3.dispose(); this.v3 = null; } this.el.classList.remove('is3d', 'loading3d'); this.syncBtn(); this.draw(); }
  syncBtn() { const b = this.el.querySelector('.s3d'); if (b) { b.classList.toggle('on', !!this.want3d); b.setAttribute('aria-pressed', String(!!this.want3d)); } }
  play() {
    if (this.playing) return; this.playing = true; this.btn.innerHTML = I.pause; this.last = performance.now();
    const f = now => { if (!this.playing) return; if (!this.el.isConnected) { this.kill(); return; } this.ms += Math.min(now - this.last, 100); this.last = now; this.draw(); this.raf = requestAnimationFrame(f); };
    this.raf = requestAnimationFrame(f);
  }
  stop() { this.playing = false; cancelAnimationFrame(this.raf); if (this.btn) this.btn.innerHTML = I.play; }
  kill() { this.stop(); if (this.v3) { this.v3.dispose(); this.v3 = null; } }
  toggle() { this.playing ? this.stop() : this.play(); }
  draw() {
    const s = FIG.sample(this.ex.seq, this.ms);
    if (this.v3) this.v3.set(s.t, s.side); else FIG.update(this.svg, this.ex, s.t, s.side);
    this.range.value = Math.round(((this.ms % this.total) / this.total) * 1000);
    if (this.lbl.textContent !== s.label) this.lbl.textContent = s.label;
  }
}
function mountStages(root) { root.querySelectorAll('.stage[data-stage]').forEach(el => { if (!el._st) el._st = new Stage(el); }); }
function preserveStages(root) { root.querySelectorAll('.stage[data-stage]').forEach(el => { if (el._st) stageCache.set(el.dataset.key, el); }); }
function restoreStages(root) {
  root.querySelectorAll('.stage[data-stage]').forEach(el => {
    const old = stageCache.get(el.dataset.key);
    if (old && old !== el && old.dataset.stage === el.dataset.stage) { el.replaceWith(old); if (old._st && !old._st.playing && !RM() && old._st.wasPlaying !== false) old._st.play(); }
  });
  stageCache.forEach((el, k) => { if (!el.isConnected) { el._st && el._st.kill(); stageCache.delete(k); } });
  mountStages(root);
}
document.addEventListener('visibilitychange', () => {
  document.querySelectorAll('.stage').forEach(el => { const st = el._st; if (!st) return; if (document.hidden) { st.resume = st.playing; st.stop(); } else if (st.resume) { st.resume = false; st.play(); } });
});

function cuesHTML(id) {
  const ex = EX[id];
  let h = '<div class="cues">';
  h += '<div><h4>Étapes</h4><ol>' + ex.steps.map(s => '<li>' + s + '</li>').join('') + '</ol></div>';
  h += '<div><h4>Erreurs fréquentes</h4><ul>' + ex.errors.map(s => '<li>' + s + '</li>').join('') + '</ul></div>';
  h += '<div><h4>Respiration</h4><p>' + ex.breath + '</p></div>';
  h += '<div class="grid2"><div><h4>Plus facile</h4><p>' + ex.easier + '</p></div><div><h4>Progression</h4><p>' + ex.prog + '</p></div></div>';
  if (ex.stopRule) h += alertBox('warn', 'warn', ex.stopRule);
  if (ex.safety) h += alertBox('warn', 'warn', '<b>Bande. </b>' + ex.safety);
  h += '<p class="note">' + FIG_LIMIT + '</p></div>';
  return h;
}

/* ---------- Aujourd’hui ---------- */
const RUNNER = { name: 'Footing', pose: () => ({ hip: [160, 92], torso: -76, headTilt: 6, sw: 0, hw: 0, armN: { a: [62, -28] }, armF: { a: [128, 78] }, legN: { a: [22, 104] }, legF: { a: [112, 152] }, footN: 4, footF: 120 }) };
function artSVG(kind) { return kind === 'run' ? FIG.svg(RUNNER, 0, 1) : FIG.svg(EX[kind], 1, 1); }
const ART = { A: 'squat', B: 'row_band' };
function scrToday() {
  const t = today(), ci = calInfo(t), p = S.profile;
  let h = '<section class="screen' + stg() + '">';
  h += '<header class="top"><div><div class="eyebrow">' + (ci.idx != null ? weekLabel(ci.idx) + ' · ' : '') + fmtDL(t) + '</div><h1 class="title-xl">Salut' + (p.name ? ', <em>' + esc(p.name) + '</em>' : '') + '</h1></div><div class="row" style="gap:8px;flex:none">' + streakChip() + '<a class="avatar" href="#profile" aria-label="Profil">' + esc((p.name || 'É')[0].toUpperCase()) + '</a></div></header>';
  const act = S.active && S.sessions[S.active];
  if (act && act.status === 'active') {
    const n = doneSetsCount(act);
    h += '<section class="hero">' + heroMedia(ART[act.kind], pill('Séance en cours', 'warn')) + '<div class="hero-body"><div class="hero-name">Séance ' + act.kind + '</div><div class="hero-sub" style="margin:0">' + plural(n, 'série') + ' validée' + (n > 1 ? 's' : '') + '</div>' +
      '<button class="btn primary xl block shine" data-act="openSession">' + I.play + 'Reprendre</button></div></section>';
  }
  if (ci.noStart) h += startHero();
  else if (ci.before) h += beforeHero(ci);
  else if (ci.after) h += afterHero();
  else {
    if (!(act && act.status === 'active' && act.date === t)) h += dayHero(ci);
    h += weekRingCard(ci);
  }
  if (!ci.noStart && !ci.before && !ci.after) h += activityCard(ci);
  h += '<div class="sec-t">Actions rapides</div>' + tiles(t, ci);
  if (!ci.noStart && !ci.after) h += upcoming(t);
  return h + '</section>';
}
function doneSetsCount(s) { return s.ex.reduce((a, e) => a + e.sets.length, 0); }
function heroMedia(art, pillHtml) { return '<div class="hero-media">' + pillHtml + artSVG(art) + '</div>'; }
function startHero() {
  return '<section class="hero">' + heroMedia('squat', pill('Pour commencer', 'acc')) + '<div class="hero-body"><div class="hero-name">Choisis ta date de départ</div><div class="hero-sub" style="margin:0">Le programme démarre un lundi.</div>' + startPicker() + '</div></section>';
}
function startPicker() {
  const cur = S.plan.startDate, first = nextMonday(today());
  return '<div class="stack"><div class="chips grid4">' + [0, 1, 2, 3].map(i => addD(first, i * 7)).map(m => '<button class="chip' + (cur === m ? ' on' : '') + '" data-act="setStart" data-v="' + m + '">' + fmtD(m) + '</button>').join('') + '</div>' +
    '<label class="field"><span>Autre date</span><input class="input" type="date" id="startInput" value="' + (cur || '') + '"></label></div>';
}
function beforeHero(ci) {
  return '<section class="hero">' + heroMedia('squat', pill('Départ le ' + fmtDl(S.plan.startDate), 'acc')) + '<div class="hero-body"><div class="hero-name">J−' + ci.daysTo + '</div><div class="hero-sub" style="margin:0">Première séance : A</div>' +
    '<button class="btn pill block" data-act="previewKind" data-kind="A" data-pw="1">Découvrir la séance A</button></div></section>';
}
function afterHero() {
  return '<section class="hero">' + heroMedia('glute_bridge', pill('Programme terminé', 'acc')) + '<div class="hero-body"><div class="hero-name">Ton bilan est prêt</div><a class="btn primary xl block" href="#progress">Voir mon bilan</a></div></section>';
}
function dayHero(ci) {
  if (ci.type === 'strength') {
    const s = S.sessions[ci.date];
    if (s && s.status === 'done') {
      return '<section class="hero">' + heroMedia(ART[s.kind], pill(I.check + 'Faite', 'acc')) + '<div class="hero-body"><div class="hero-name">Séance ' + s.kind + '</div><div class="meta"><span><b>' + doneSetsCount(s) + '</b>séries</span><span><b>' + Math.round(sessDuration(s) / 60000) + '</b>min</span>' + (s.fatigue ? '<span><b>' + s.fatigue + '/5</b>fatigue</span>' : '') + '</div>' +
        '<button class="btn pill block" data-act="viewSession" data-date="' + s.date + '">Voir le résumé</button></div></section>';
    }
    const wk = WEEKS[ci.pw - 1];
    return '<section class="hero">' + heroMedia(ART[ci.kind], pill('Musculation · ' + (ci.k + 1) + '/3', 'acc')) + '<div class="hero-body"><div class="hero-name">Séance ' + ci.kind + '</div>' +
      '<div class="meta"><span><b>' + SESSIONS[ci.kind].length + '</b>exercices</span><span><b>' + wk.setsMain + '</b>séries</span><span><b>' + estMinutes(ci.kind, ci.pw, false) + '</b>min</span></div>' +
      '<button class="btn primary xl block shine" data-act="startSession" data-date="' + ci.date + '">' + I.play + 'Démarrer la séance</button>' +
      '<div class="hero-foot"><label class="toggle" style="min-height:40px;gap:10px"><input type="checkbox" class="sw" id="reducedToggle"><span class="small">Version allégée</span></label><button class="linkbtn" data-act="previewKind" data-kind="' + ci.kind + '" data-pw="' + ci.pw + '" data-date="' + ci.date + '">Exercices' + I.fwd + '</button></div></div></section>';
  }
  if (ci.type === 'run') return runHero(ci);
  if (ci.type === 'mobility') {
    const done = !!S.mobility[ci.date];
    return '<section class="hero">' + heroMedia('glute_bridge', pill('Récupération')) + '<div class="hero-body"><div class="hero-name">Jour de repos</div><div class="hero-sub" style="margin:0">Mobilité douce facultative, 8 à 10 min.</div>' +
      '<button class="btn pill block" data-act="mobSheet" data-date="' + ci.date + '">' + (done ? I.check + 'Mobilité faite' : I.leaf + 'Voir la mobilité douce') + '</button></div></section>';
  }
  return '<section class="hero">' + heroMedia('side_abduction', pill('Récupération')) + '<div class="hero-body"><div class="hero-name">Jour de repos</div><div class="hero-sub" style="margin:0">Une séance manquée ne se rattrape pas en double.</div></div></section>';
}
function runHero(ci) {
  const r = S.runs[ci.date], adv = runAdvice(ci.date);
  const planned = adv.level === 'hold' ? Math.min(ci.planned, adv.cap) : ci.planned;
  let h = '<section class="hero run">' + heroMedia('run', pill('Course facile · ' + (ci.slot === 'tue' ? '1re' : '2e') + ' sortie', 'run')) + '<div class="hero-body">';
  if (r) {
    h += '<div class="hero-name">' + (r.kind === 'skipped' ? 'Non faite' : r.minutes + ' min') + '</div><div class="meta">' + (r.km ? '<span><b>' + num(r.km, 1) + '</b>km</span>' : '') + (r.effort ? '<span><b>' + r.effort + '/10</b>effort</span>' : '') + '</div>';
    if (runFlag(r)) h += alertBox('bad', 'warn', 'Douleur signalée : pause course jusqu’à ce qu’elle disparaisse.');
    h += '<button class="btn pill block" data-act="runSheet" data-date="' + ci.date + '">Modifier</button>';
  } else if (adv.level === 'stop') {
    h += '<div class="hero-name">En pause</div>' + alertBox('bad', 'warn', adv.text) + '<button class="btn pill block" data-act="runSheet" data-date="' + ci.date + '">Noter la journée</button>';
  } else {
    h += '<div class="hero-name">' + planned + ' min</div><div class="hero-sub" style="margin:0">+ 5 min de marche avant et après</div>';
    if (adv.level === 'hold') h += alertBox('warn', 'warn', adv.text);
    if (ci.date === today()) { const ck = S.checkins[ci.date]; h += checkComplete(ck) ? '<button class="coach mini run" data-act="ckOpen" data-date="' + ci.date + '" data-kind="run"><div class="coach-h">' + coachRing(coachPlan(ci.date, ck).score) + '<div><div class="eyebrow">Coach · ta forme du jour</div><b>' + (COACH_TXT[coachPlan(ci.date, ck).level].t) + '</b><p style="margin-top:2px;font-size:13px">' + RUN_COACH[coachPlan(ci.date, ck).level] + '</p></div></div></button>' : '<button class="btn pill block" data-act="ckOpen" data-date="' + ci.date + '" data-kind="run">' + I.spark + 'Comment tu te sens ?</button>'; }
    h += '<div class="chips">' + pill('Effort 3–4/10', 'run') + pill('Parler en phrases') + pill('Terrain plat') + '</div><button class="btn runb xl block shine" data-act="runSheet" data-date="' + ci.date + '">Saisir ma sortie</button>';
  }
  return h + '</div></section>';
}
function weekStats(ci) {
  const ws = weekStart(ci.idx); let sd = 0, rd = 0;
  for (let d = 0; d < 7; d++) { const date = addD(ws, d); if (S.sessions[date] && S.sessions[date].status === 'done') sd++; const r = S.runs[date]; if (r && r.kind !== 'skipped') rd++; }
  const wN = S.weights.filter(w => w.date >= ws && w.date <= addD(ws, 6)).length;
  return { ws, sd: Math.min(sd, 3), rd: Math.min(rd, 2), wN, sh: shakeDaysInWeek(ws) };
}
function weekRingCard(ci) {
  const st = weekStats(ci), pct = Math.round((st.sd + st.rd) / 5 * 100);
  const off = (289 * (1 - pct / 100)).toFixed(1);
  return '<section class="card"><div class="row between"><h2>Ta semaine</h2><span class="pill">' + weekLabel(ci.idx) + '</span></div><div class="wring"><div class="rg"><svg viewBox="0 0 112 112" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop class="r0" offset="0"/><stop class="r1" offset="1"/></linearGradient></defs><circle class="b" cx="56" cy="56" r="46"></circle><circle class="f" cx="56" cy="56" r="46" data-off="' + off + '"></circle>' + (pct > 0 ? '<g class="tip" data-rot="' + (pct * 3.6).toFixed(1) + '"><circle cx="102" cy="56" r="4.5"></circle></g>' : '') + '</svg><div class="pc"><div><b>' + pct + '%</b><span>activités</span></div></div></div>' +
    '<div class="legend"><div><i></i><span>Séances</span><b>' + st.sd + '/3</b></div><div><i class="c"></i><span>Footings</span><b>' + st.rd + '/2</b></div><div><i class="y"></i><span>Pesées</span><b>' + st.wN + '/3</b></div><div><i class="p"></i><span>Shakers</span><b>' + st.sh + '/7</b></div></div></div></section>';
}
function activityCard(ci) {
  const ws = weekStart(ci.idx), t = today();
  let tot = 0, bars = '';
  for (let d = 0; d < 7; d++) {
    const date = addD(ws, d), info = dayOf(ci.idx, d);
    const s = S.sessions[date], r = S.runs[date];
    let v = 0, c = '';
    if (s && s.status === 'done') v += Math.round(sessDuration(s) / 60000);
    if (r && r.kind !== 'skipped') { v += r.minutes || 0; if (!s) c = 'c'; }
    tot += v;
    const plan = !v && date >= t && (info.type === 'strength' || info.type === 'run');
    bars += '<div class="bc"><div class="bt' + (plan ? ' plan' : '') + '" title="' + v + ' min">' + (v ? '<i class="' + c + '" style="height:' + Math.max(8, Math.min(100, v / 60 * 100)) + '%;animation-delay:' + (d * 0.05) + 's"></i>' : '') + '</div><span class="dl' + (date === t ? ' now' : '') + '">' + 'LMMJVSD'[d] + '</span></div>';
  }
  return '<section class="card"><div class="row between"><h2>Activité</h2><span class="note tnum">' + tot + ' min cette semaine</span></div><div class="bars">' + bars + '</div></section>';
}
function tiles(t, ci) {
  const sh = S.shakes[t] || {}, tw = S.weights.find(w => w.date === t), m = mondayOf(t);
  const nW = S.weights.filter(w => mondayOf(w.date) === m).length;
  const tile = (act, ic, icc, title, sub) => (act.startsWith('#') ? '<a class="tile" href="' + act + '">' : '<button class="tile" data-act="' + act + '">') + '<span class="ic ' + icc + '">' + I[ic] + '</span><div><div class="t">' + title + '</div><div class="s">' + sub + '</div></div>' + (act.startsWith('#') ? '</a>' : '</button>');
  return '<div class="tiles">' +
    tile('weighSheet', 'scale', tw ? 'fill' : '', 'Pesée', tw ? num(tw.kg, 1) + ' kg ✓' : nW + '/3 cette sem.') +
    tile('shakeSheet', 'cup', sh.taken ? 'fill run' : 'run', 'Shaker', sh.taken ? (sh.kcal ? sh.kcal + ' kcal ✓' : 'Pris ✓') : 'Pas encore') +
    tile('#program', 'cal', 'n', 'Programme', ci.idx != null ? weekLabel(ci.idx) : '8 semaines') +
    tile('rulesSheet', 'book', 'n', 'Règles', 'Réserve, course') + '</div>';
}
function weighSheet() {
  const fn = () => {
    const t = today(), m = mondayOf(t), wl = S.weights.filter(w => w.date >= m).sort((a, b) => a.date.localeCompare(b.date));
    return sheetHead('Pesée du matin', 'Après les toilettes, avant de manger') +
      '<div class="grid2"><input class="input" type="date" id="wDate" value="' + (ui.weightDate || t) + '" max="' + t + '" aria-label="Date"><input class="input" type="text" inputmode="decimal" autocomplete="off" id="wKg" placeholder="Poids (kg)" aria-label="Poids en kg"></div>' +
      '<button class="btn primary xl block" data-act="addWeight">Enregistrer</button>' +
      (wl.length ? '<div class="list">' + wl.map(w => '<div class="li"><div><div class="t tnum">' + num(w.kg, 1) + ' kg</div><div class="s">' + fmtDL(w.date) + '</div></div><button class="btn sm ghost" data-act="delWeight" data-date="' + w.date + '">Supprimer</button></div>').join('') + '</div>' : '') +
      '<p class="note">Trois pesées par semaine suffisent. Seule la moyenne compte.</p>';
  };
  openSheet(fn(), fn);
}
function shakeSheet() {
  const fn = () => {
    const t = today(), sh = S.shakes[t] || { taken: false, kcal: null }, r = S.profile.recipe;
    return sheetHead('Shaker du matin', shakeDaysInWeek(mondayOf(t)) + '/7 cette semaine') +
      '<label class="toggle card" style="flex-direction:row;padding:12px 16px"><span><b>Pris aujourd’hui</b><br><span class="note">400 à 500 kcal en plus des repas</span></span><input type="checkbox" class="sw" data-chg="shake" data-date="' + t + '"' + (sh.taken ? ' checked' : '') + '></label>' +
      (sh.taken ? '<label class="field"><span>Calories réellement prises</span><input class="input" type="number" inputmode="numeric" min="0" max="2000" step="10" id="shakeKcal" data-date="' + t + '" value="' + (sh.kcal ?? '') + '" placeholder="kcal"></label>' : '') +
      '<div class="daily"><span class="ic run">' + I.bowl + '</span><div><div class="t">Ma recette</div><div class="s">' + (r.text ? (r.kcal ? r.kcal + ' kcal' : 'notée') + (r.protein ? ' · ' + r.protein + ' g de protéines' : '') : 'À compléter dans Profil') + '</div></div><button class="btn sm pill" data-act="profSheet" data-k="recipe">Ouvrir</button></div>' +
      '<p class="note">Repère protéines : environ ' + S.profile.proteinG + ' g par jour, shaker compris.</p>';
  };
  openSheet(fn(), fn);
}
function upcoming(t) {
  const rows = [];
  for (let i = 1; i <= 3; i++) {
    const d = addD(t, i), ci = calInfo(d);
    if (ci.noStart || ci.after) break;
    if (ci.before) continue;
    rows.push('<div class="li"><div><div class="t">' + (i === 1 ? 'Demain' : fmtDL(d)) + '</div><div class="s">' + dayText(ci) + '</div></div>' + kindPill(ci) + '</div>');
  }
  if (!rows.length) return '';
  return '<div class="sec-t">À venir</div><section class="card" style="padding-block:4px"><div class="list">' + rows.join('') + '</div></section>';
}
function dayText(ci) {
  if (ci.type === 'strength') return 'Séance ' + ci.kind;
  if (ci.type === 'run') return 'Footing ' + ci.planned + ' min';
  if (ci.type === 'mobility') return 'Repos · mobilité';
  return 'Repos';
}
function kindPill(ci) {
  if (ci.type === 'strength') return pill(ci.kind, 'acc');
  if (ci.type === 'run') return pill(ci.planned + ' min', 'run');
  return '';
}

/* ---------- Programme ---------- */
function scrProgram() {
  const n = S.plan.seq.length, st = S.plan.startDate;
  if (ui.week == null || ui.week >= n) ui.week = currentIdx();
  const cur = st ? calInfo(today()) : {};
  let h = '<section class="screen' + stg() + '"><header class="top"><div><div class="eyebrow">' + (st ? fmtD(st) + ' → ' + fmtD(addD(st, n * 7 - 1)) : 'Ton programme') + '</div><h1 class="title-xl">Programme <em>' + n + ' sem.</em></h1></div></header>';
  if (!st) h += '<section class="card"><h2>Date de départ</h2>' + startPicker() + '</section>';
  h += '<section class="card"><div class="weekgrid">';
  for (let i = 0; i < n; i++) {
    const pw = S.plan.seq[i], rep = S.plan.seq.slice(0, i).includes(pw);
    h += '<button class="wk' + (i === ui.week ? ' sel' : '') + (cur.idx === i ? ' cur' : '') + '" data-act="selWeek" data-i="' + i + '" aria-pressed="' + (i === ui.week) + '"><b>S' + pw + (rep ? '<small>bis</small>' : '') + '</b><span>' + (st ? fmtShort(weekStart(i)) : '—') + '</span></button>';
  }
  h += '</div></section>';
  h += weekDetail(ui.week);
  const pw = S.plan.seq[ui.week];
  h += '<div class="sec-t">Séances et course</div>';
  h += ['A', 'B'].map(k => '<button class="wcard" data-act="previewKind" data-kind="' + k + '" data-pw="' + pw + '"><div class="wt"><div><b>Séance ' + k + '</b><br><span>' + SESSIONS[k].length + ' exercices · ' + estMinutes(k, pw, false) + ' min</span></div><span class="go">' + I.fwd + '</span></div><div class="wa">' + artSVG(ART[k]) + '</div></button>').join('');
  h += '<button class="wcard run" data-act="runDurSheet" data-pw="' + pw + '"><div class="wt"><div><b>Footing facile</b><br><span>Mardi ' + S.plan.runs[pw].tue + ' min · samedi ' + S.plan.runs[pw].sat + ' min</span></div><span class="go c">' + I.fwd + '</span></div><div class="wa">' + artSVG('run') + '</div></button>';
  h += '<div class="group">' + listRow('repeatSheet', 'repeat', 'n', 'Répéter ou alléger', 'Si la semaine a été trop dure', '', 'data-i="' + ui.week + '"') + '</div>';
  h += '<div class="group">' + listRow('rulesSheet', 'book', 'n', 'Réserve et règles', 'Progression, course, poids') +
    listRow('#print', 'print', 'n', 'Version A4', 'Imprimer ou enregistrer en PDF') +
    (st ? listRow('startSheet', 'flag', 'n', 'Date de départ', fmtDL(st)) : '') + '</div>';
  return h + '</section>';
}
function weekDetail(i) {
  const pw = S.plan.seq[i], wk = WEEKS[pw - 1], st = S.plan.startDate, t = today();
  let h = '<section class="card"><div class="row between"><div><div class="eyebrow">' + (st ? fmtD(weekStart(i)) + ' – ' + fmtD(addD(weekStart(i), 6)) : 'Dates selon le départ') + '</div><h2 style="font-size:28px;margin-top:2px">' + weekLabel(i) + '</h2></div>' +
    '<div class="row" style="gap:6px"><button class="btn icon sm" data-act="selWeek" data-i="' + Math.max(0, i - 1) + '" aria-label="Semaine précédente"' + (i === 0 ? ' disabled' : '') + '>' + I.back + '</button><button class="btn icon sm" data-act="selWeek" data-i="' + Math.min(S.plan.seq.length - 1, i + 1) + '" aria-label="Semaine suivante"' + (i === S.plan.seq.length - 1 ? ' disabled' : '') + '>' + I.fwd + '</button></div></div>';
  h += '<div class="mini3"><div><b>' + wk.setsMain + '</b><span>séries principaux</span></div><div><b>' + wk.setsComp + '</b><span>séries complém.</span></div><div><b>' + rirLabel(wk.rir[0], wk.rir[1]) + '</b><span>en réserve</span></div></div>';
  h += '<p class="note">' + wk.note + '</p><div class="days">';
  for (let d = 0; d < 7; d++) {
    const date = st ? addD(weekStart(i), d) : null;
    const ci = st ? dayOf(i, d) : { type: DAYTYPE[d], pw, kind: [0, 2, 4].includes(d) ? (pw % 2 ? ['A', 'B', 'A'] : ['B', 'A', 'B'])[d / 2] : null, planned: d === 1 ? S.plan.runs[pw].tue : S.plan.runs[pw].sat };
    let main = '', stat = '';
    if (ci.type === 'strength') {
      main = 'Séance ' + ci.kind;
      const s = date && S.sessions[date];
      stat = s ? (s.status === 'done' ? pill(I.check + 'Faite', 'acc') : pill('En cours', 'warn')) : (date && date < t ? pill('Non faite') : '');
    } else if (ci.type === 'run') {
      main = 'Footing ' + ci.planned + ' min';
      const r = date && S.runs[date];
      stat = r ? (runFlag(r) ? pill('Signal', 'bad') : r.kind === 'skipped' ? pill('Non faite') : pill(r.kind === 'badminton' ? 'Badminton' : r.minutes + ' min', 'run')) : (date && date < t ? pill('Non saisie') : '');
    } else if (ci.type === 'mobility') { main = 'Repos · mobilité'; stat = date && S.mobility[date] ? pill(I.check + 'Faite', 'acc') : ''; }
    else main = 'Repos';
    const act = ci.type === 'strength' ? (date ? 'data-act="dayStrength" data-date="' + date + '"' : 'data-act="previewKind" data-kind="' + ci.kind + '" data-pw="' + pw + '"')
      : ci.type === 'run' && date ? 'data-act="runSheet" data-date="' + date + '"' : ci.type === 'mobility' && date ? 'data-act="mobSheet" data-date="' + date + '"' : 'data-act="noop"';
    h += '<button class="day k-' + ci.type + (date === t ? ' today' : '') + '" ' + act + '><span class="dd">' + DOWS[d] + (date ? '<small>' + fmtD(date) + '</small>' : '') + '</span><span class="dw">' + main + '</span>' + stat + '</button>';
  }
  return h + '</div></section>';
}

/* ---------- feuilles ---------- */
let sheetTimer = null;
function openSheet(html, fn) {
  const el = document.getElementById('sheet');
  clearTimeout(sheetTimer);
  const swap = !el.hidden && !el.classList.contains('out');
  el.classList.remove('out'); el.classList.toggle('swap', swap);
  const prevScroll = swap && fn && ui.sheetFn === fn ? (el.querySelector('.sh-panel') || {}).scrollTop : 0;
  el.querySelectorAll('.stage').forEach(s => s._st && s._st.kill());
  el.innerHTML = '<div class="sh-back" data-act="closeSheet"></div><div class="sh-panel" role="dialog" aria-modal="true"><div class="sh-grab"></div>' + html + '</div>';
  el.hidden = false; document.body.classList.add('noscroll');
  ui.sheetFn = fn || null;
  mountStages(el);
  const p = el.querySelector('.sh-panel'); if (p && prevScroll) p.scrollTop = prevScroll;
}
function refreshSheet() { const el = document.getElementById('sheet'); if (!el.hidden && ui.sheetFn) { const f = ui.sheetFn; openSheet(f(), f); el.classList.add('swap'); el.querySelectorAll('.sh-panel > *').forEach(x => x.style.animation = 'none'); } }
function closeSheet(instant) {
  const el = document.getElementById('sheet');
  if (el.hidden) return;
  ui.sheetFn = null;
  const done = () => { el.querySelectorAll('.stage').forEach(s => s._st && s._st.kill()); el.hidden = true; el.innerHTML = ''; el.classList.remove('out', 'swap'); if (!ui.sess) document.body.classList.remove('noscroll'); };
  if (instant || RM()) { done(); return; }
  el.classList.add('out'); clearTimeout(sheetTimer); sheetTimer = setTimeout(done, 240);
}
function sheetHead(title, eyebrow) {
  return '<div class="sh-head"><div>' + (eyebrow ? '<div class="eyebrow" style="margin-bottom:4px">' + eyebrow + '</div>' : '') + '<h2>' + title + '</h2></div><button class="btn icon" data-act="closeSheet" aria-label="Fermer">' + I.close + '</button></div>';
}
function previewSheet(kind, pw, date) {
  const fake = { pw, reduced: false };
  let h = sheetHead('Séance ' + kind, 'Semaine ' + pw + ' · environ ' + estMinutes(kind, pw, false) + ' min');
  h += '<div class="list">' + SESSIONS[kind].map((sl, i) => {
    const id = slotEx(kind, i), pr = prescFor(fake, i);
    return '<button class="li" data-act="exSheet" data-id="' + id + '"><div class="row"><div class="thumb">' + FIG.svg(EX[id], 1, 1) + '</div><div style="min-width:0"><div class="t">' + EX[id].name + '</div><div class="s tnum">' + pr.sets + ' × ' + rangeLabel(id) + ' · repos ' + restLabel(id) + '</div></div></div>' + CHEV + '</button>';
  }).join('') + '</div>';
  h += '<p class="note">Avant chaque séance : 6 à 8 min d’échauffement, proposé au démarrage.</p>';
  if (date) {
    const t = today(), s = S.sessions[date];
    if (!s && date <= t) h += '<button class="btn primary xl block shine" data-act="startSession" data-date="' + date + '">' + (date === t ? 'Démarrer' : 'Saisir la séance du ' + fmtD(date)) + '</button>';
    else if (!s) h += '<p class="note">Disponible le ' + fmtDl(date) + '.</p>';
  }
  openSheet(h);
}
function exSheet(id) {
  const ex = EX[id];
  openSheet(sheetHead(ex.name, rangeLabel(id) + ' · repos ' + restLabel(id)) + (exHistory(id).length ? '<section class="card"><h2>Ta courbe</h2>' + forceChart(id) + '</section>' : '') + stageHTML(id, 'sheet-' + id) + pairHTML(id) + '<p class="small"><span class="muted">Niveau actuel :</span> ' + levelLabel(id) + '</p>' + cuesHTML(id));
}
function mobSheet(date) {
  const fn = () => {
    const done = !!S.mobility[date];
    return sheetHead('Mobilité douce', '8 à 10 min') + '<ol class="exmini">' + MOBILITY.map(m => '<li><span>' + m + '</span></li>').join('') + '</ol>' +
      '<button class="btn ' + (done ? '' : 'primary') + ' xl block" data-act="mobToggle" data-date="' + date + '">' + (done ? 'Faite ' + I.check : 'Marquer comme faite') + '</button>';
  };
  openSheet(fn(), fn);
}
function runDurSheet(pw) {
  const fn = () => sheetHead('Durées de course', 'Semaine ' + pw) + '<div class="grid2">' +
    ['tue', 'sat'].map(k => '<label class="field"><span>' + (k === 'tue' ? 'Mardi' : 'Samedi') + ' (min)</span><div class="stepper sm"><button class="btn" data-act="runDur" data-pw="' + pw + '" data-k="' + k + '" data-d="-1" aria-label="Moins">−</button><input type="number" inputmode="numeric" id="rd-' + pw + '-' + k + '" value="' + S.plan.runs[pw][k] + '" data-chg="runDurIn" data-pw="' + pw + '" data-k="' + k + '"><button class="btn" data-act="runDur" data-pw="' + pw + '" data-k="' + k + '" data-d="1" aria-label="Plus">+</button></div></label>').join('') + '</div>' +
    '<p class="note">Footing hors 5 min de marche au début et à la fin. Propositions, pas obligations.</p>' +
    (S.plan.runs[pw].tue !== RUN_DEFAULT[pw].tue || S.plan.runs[pw].sat !== RUN_DEFAULT[pw].sat ? '<button class="btn block" data-act="runReset" data-pw="' + pw + '">Revenir à ' + RUN_DEFAULT[pw].tue + ' / ' + RUN_DEFAULT[pw].sat + ' min</button>' : '');
  openSheet(fn(), fn);
}
function repeatSheet(i) {
  const fn = () => {
    const pw = S.plan.seq[i], rep = canRepeat(i), undo = canUndoRepeat(i);
    return sheetHead('Répéter ou alléger', weekLabel(i)) +
      '<div class="daily"><span class="ic n">' + I.repeat + '</span><div><div class="t">Refaire la semaine ' + pw + '</div><div class="s">La suite se décale de 7 jours</div></div><span></span></div>' +
      (rep ? '<button class="btn primary block" data-act="repeatDo" data-i="' + i + '">Répéter la semaine ' + pw + '</button>' : '<p class="note">' + (!S.plan.startDate ? 'Choisis d’abord une date de départ.' : 'Impossible : des séances sont déjà saisies après cette semaine.') + '</p>') +
      (undo ? '<button class="btn ghost block" data-act="undoRepeat" data-i="' + i + '">Annuler cette répétition</button>' : '') +
      '<div class="daily"><span class="ic n">' + I.moon + '</span><div><div class="t">Une seule séance difficile ?</div><div class="s">Active « Version allégée » au démarrage</div></div><span></span></div>';
  };
  openSheet(fn(), fn);
}
function rulesSheet() {
  openSheet(sheetHead('Réserve et règles') + '<div class="cues">' +
    '<div><h4>Répétitions en réserve</h4><p>' + RIR_TEXT + '</p></div>' +
    '<div><h4>Progression</h4><ul><li>Haut de la fourchette sur toutes les séries, deux séances de suite, technique propre et réserve respectée : une petite augmentation est proposée.</li><li>Elle ne s’applique que si tu la valides, puis tu repars en bas de la fourchette.</li><li>Les séances allégées ne comptent pas. Une séance manquée ne se rattrape pas en double.</li></ul></div>' +
    '<div><h4>Course</h4><ul>' + RUN_RULES.map(r => '<li>' + r + '</li>').join('') + '</ul><p class="note" style="margin-top:6px">Le badminton remplace une sortie, il ne s’ajoute pas.</p></div>' +
    '<div><h4>Poids et repas</h4><ul><li>Trois pesées par semaine, le matin à jeun. Seule la moyenne compte.</li><li>Repère : ' + S.profile.gainLowG + ' à ' + S.profile.gainHighG + ' g par semaine, protéines environ ' + S.profile.proteinG + ' g par jour.</li></ul></div></div>');
}
function startSheet() { const fn = () => sheetHead('Date de départ') + startPicker() + (Object.keys(S.sessions).length ? '<p class="note">Les séances déjà saisies gardent leur date.</p>' : ''); openSheet(fn(), fn); }
function runSheet(date) {
  const ci = calInfo(date), r = S.runs[date] || {}, adv = runAdvice(date);
  const planned = ci.planned ?? 20;
  ui.runForm = { date, f: { kind: r.kind || 'run', minutes: r.minutes ?? (adv.level === 'hold' ? Math.min(planned, adv.cap) : planned), km: r.km ?? '', effort: r.effort ?? null,
    painDuring: !!r.painDuring, painAfter: !!r.painAfter, swelling: !!r.swelling, limp: !!r.limp, legsTired: !!r.legsTired, note: r.note || '', nextDay: r.nextDay || null } };
  renderRunSheet();
}
function renderRunSheet() {
  const { date, f } = ui.runForm, ci = calInfo(date), a = runAdvice(date);
  let h = sheetHead('Sortie du ' + fmtD(date), ci.planned != null ? 'Prévu : ' + ci.planned + ' min de footing' : 'Sortie cardio');
  if (S.runs[date]) h += '<label class="field"><span>Date de la sortie</span><input class="input" type="date" id="rfDate" value="' + (ui.runForm.newDate || date) + '" max="' + today() + '"></label>';
  if (a.level !== 'ok') h += alertBox(a.level === 'stop' ? 'bad' : 'warn', 'warn', a.text);
  h += '<div class="chips grid5" style="grid-template-columns:repeat(3,1fr)">' + Object.keys(RUNKINDS).map(k => '<button class="chip runon' + (f.kind === k ? ' on' : '') + '" data-act="rf" data-k="kind" data-v="' + k + '">' + ({ run: 'Course', runwalk: 'Course + marche', walk: 'Marche', badminton: 'Badminton', skipped: 'Non faite' })[k] + '</button>').join('') + '</div>';
  if (f.kind !== 'skipped') {
    h += '<div class="grid2"><label class="field"><span>Durée (min)</span><div class="stepper sm"><button class="btn" data-act="rfMin" data-d="-1" aria-label="Moins">−</button><input type="number" inputmode="numeric" id="rfMinutes" value="' + f.minutes + '"><button class="btn" data-act="rfMin" data-d="1" aria-label="Plus">+</button></div></label>' +
      '<label class="field"><span>Distance (km)</span><input class="input" type="text" inputmode="decimal" autocomplete="off" id="rfKm" value="' + f.km + '" placeholder="facultatif"></label></div>';
    h += '<div class="field"><span>Effort sur 10 · cible 3 à 4</span><div class="chips grid5">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => '<button class="chip runon' + (f.effort === n ? ' on' : '') + (n === 3 || n === 4 ? ' hint' : '') + '" data-act="rf" data-k="effort" data-v="' + n + '">' + n + '</button>').join('') + '</div></div>';
    h += '<div class="field"><span>Symptômes</span><div class="chips">' + [['painDuring', 'Douleur pendant'], ['painAfter', 'Douleur après'], ['swelling', 'Gonflement'], ['limp', 'Boiterie'], ['legsTired', 'Jambes lourdes']].map(([k, l]) => '<button class="chip ' + (k === 'legsTired' ? '' : 'badon') + (f[k] ? ' on' : '') + '" data-act="rfFlag" data-k="' + k + '">' + l + '</button>').join('') + '</div></div>';
  }
  h += '<label class="field"><span>Note</span><textarea class="input" id="rfNote" maxlength="300" style="min-height:60px" placeholder="facultatif">' + esc(f.note) + '</textarea></label>';
  h += '<button class="btn runb xl block" data-act="saveRun">Enregistrer</button>';
  if (S.runs[date]) h += '<button class="btn ghost block" data-act="delRun" data-date="' + date + '">Supprimer la sortie</button>';
  openSheet(h);
}
function confirmSheet(title, text, act, label, extra = '') {
  openSheet(sheetHead(title) + '<p>' + text + '</p><div class="btns"><button class="btn" data-act="closeSheet">Annuler</button><button class="btn danger" data-act="' + act + '" ' + extra + '>' + label + '</button></div>');
}
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.innerHTML = I.check + '<span>' + esc(msg) + '</span>'; el.hidden = false; el.classList.remove('out');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.classList.add('out'); toastTimer = setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, 260); }, 2400);
}
