/* ===== Navigation, événements, démarrage ===== */
const ROUTES = { today: scrToday, program: scrProgram, progress: scrProgress, profile: scrProfile };
const ORDER = ['today', 'program', 'progress', 'profile'];
let route = 'today', prevRoute = null; const SEEN = new Set();
function readRoute() { const h = (location.hash || '').replace('#', ''); return (ROUTES[h] || h === 'print') ? h : 'today'; }
function render(opts = {}) {
  const app = document.getElementById('app'), pr = document.getElementById('print'), tabs = document.getElementById('tabs');
  if (route === 'print') { app.hidden = true; tabs.hidden = true; pr.hidden = false; renderPrint(); window.scrollTo(0, 0); prevRoute = route; return; }
  pr.hidden = true; pr.innerHTML = ''; app.hidden = false; tabs.hidden = !S.profile.welcomed;
  if (!S.profile.welcomed) { preserveStages(app); ANIM = true; app.innerHTML = scrWelcome(); restoreStages(app); ANIM = false; prevRoute = null; return; }
  const changed = prevRoute !== route;
  ANIM = changed || !!opts.anim;
  preserveStages(app);
  /* l’ancien écran reste affiché le temps du fondu : plus de flash vide entre deux onglets */
  const old = changed && prevRoute && prevRoute !== 'print' && !RM() ? app.firstElementChild : null;
  if (old) {
    const r = old.getBoundingClientRect(), g = old.cloneNode(true);
    g.classList.remove('stagger', 'enter', 'enter-r', 'enter-l'); g.classList.add('scr-ghost'); g.removeAttribute('id');
    g.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    Object.assign(g.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px' });
    g.style.setProperty('--gx', (ORDER.indexOf(route) > ORDER.indexOf(prevRoute) ? -18 : 18) + 'px');
    document.querySelectorAll('.scr-ghost').forEach(n => n.remove());
    document.body.appendChild(g); setTimeout(() => g.remove(), 260);
  }
  app.innerHTML = ROUTES[route]();
  restoreStages(app);
  const scr = app.firstElementChild;
  if (changed && scr && !RM()) scr.classList.add(prevRoute == null || prevRoute === 'print' ? 'enter' : ORDER.indexOf(route) > ORDER.indexOf(prevRoute) ? 'enter-r' : 'enter-l');
  const anim = ANIM;
  const ringGo = () => { app.querySelectorAll('.wring .f').forEach(c => c.style.strokeDashoffset = c.dataset.off); app.querySelectorAll('.wring .tip').forEach(g => g.style.transform = 'rotate(' + g.dataset.rot + 'deg)'); };
  if (anim && !RM()) { const first = !SEEN.has(route); SEEN.add(route); const go = () => { requestAnimationFrame(() => requestAnimationFrame(ringGo)); if (first) countUps(app); }; INTRO ? INTRO.then(go) : go(); }
  else { app.querySelectorAll('.wring .f, .wring .tip').forEach(c => c.style.transition = 'none'); ringGo(); }
  prevRoute = route; ANIM = false;
  if (!ui.sess) checkBadges();
  const idx = ORDER.indexOf(route), ind = tabs.querySelector('.ind');
  if (ind) ind.style.transform = 'translateX(' + (idx * 100) + '%)';
  tabs.querySelectorAll('a').forEach(a => a.getAttribute('href') === '#' + route ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}
function rerender() { render(); refreshSheet(); }
/* Les chiffres clés défilent jusqu’à leur valeur quand un écran apparaît. */
function countUps(root) {
  root.querySelectorAll('.wring .pc b, .bignum').forEach((el, k) => {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!tn) return;
    const txt = tn.nodeValue, m = txt.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/s);
    if (!m) return;
    const end = parseFloat(m[2].replace(',', '.')), dec = (m[2].split(/[.,]/)[1] || '').length, comma = m[2].includes(',');
    if (!isFinite(end) || end === 0) return;
    const from = el.classList.contains('bignum') && end > 20 ? end * 0.9 : 0;
    const dur = 900, t0 = performance.now() + k * 40;
    const fmt = v => { let x = v.toFixed(dec); if (comma) x = x.replace('.', ','); return m[1] + x + m[3]; };
    tn.nodeValue = fmt(from);
    const step = now => { const p = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 3); if (!tn.isConnected) return; tn.nodeValue = fmt(from + (end - from) * e); if (p < 1) requestAnimationFrame(step); else tn.nodeValue = txt; };
    requestAnimationFrame(step);
  });
}
window.addEventListener('hashchange', () => { const r = readRoute(); if (r !== route) { route = r; ui.week = null; closeSheet(true); render(); window.scrollTo(0, 0); } });

function setPath(path, val) { const ks = path.split('.'); let o = S; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }
function getPath(path) { return path.split('.').reduce((o, k) => o && o[k], S); }

function exportPayload() { return JSON.stringify({ app: APP_ID, schema: SCHEMA, exportedAt: new Date().toISOString(), data: { ...S, timer: null, stopwatch: null } }, null, 1); }
function validateImport(txt) {
  let o;
  try { o = JSON.parse(txt); } catch (e) { return { ok: false, errors: ['Ce n’est pas un fichier JSON lisible.'] }; }
  const errors = [];
  if (!isObj(o)) errors.push('Contenu inattendu.');
  else {
    if (o.app !== APP_ID) errors.push('Ce fichier ne vient pas de cette application.');
    if (o.schema !== SCHEMA) errors.push('Version de sauvegarde non reconnue.');
    const d = o.data;
    if (!isObj(d)) errors.push('Données absentes.');
    else {
      if (!isObj(d.profile) || !isObj(d.plan)) errors.push('Profil ou programme manquant.');
      if (d.plan && d.plan.startDate != null && !isDate(d.plan.startDate)) errors.push('Date de départ invalide.');
      if (d.weights && !Array.isArray(d.weights)) errors.push('Pesées illisibles.');
      for (const k of ['sessions', 'runs', 'shakes']) if (d[k] && !isObj(d[k])) errors.push('Rubrique « ' + k + ' » illisible.');
    }
  }
  if (errors.length) return { ok: false, errors };
  const n = normalize(o.data);
  const sum = plural(Object.keys(n.sessions).length, 'séance') + ', ' + plural(Object.keys(n.runs).length, 'sortie') + ', ' + plural(n.weights.length, 'pesée') + (n.plan.startDate ? ', départ le ' + fmtD(n.plan.startDate) : '');
  return { ok: true, data: n, sum, when: o.exportedAt ? new Date(o.exportedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'date inconnue' };
}
function addWeight(date, val) {
  const kg = Math.round(parseFloat(String(val).replace(',', '.')) * 10) / 10;
  if (!isDate(date) || !(kg >= 30 && kg <= 200)) { toast('Indique un poids entre 30 et 200 kg.'); return false; }
  if (date > today()) { toast('La date ne peut pas être dans le futur.'); return false; }
  S.weights = S.weights.filter(w => w.date !== date).concat({ date, kg });
  save(); haptic(12); toast('Pesée du ' + fmtD(date) + ' : ' + num(kg, 1) + ' kg'); return true;
}
function setStart(v) {
  if (!isDate(v)) return;
  const m = nextMonday(v);
  S.plan.startDate = m; ui.week = null; save(); rerender();
  toast(m === v ? 'Départ le ' + fmtDl(m) : 'Départ calé au lundi ' + fmtD(m));
}

const ACT = {
  noop() { },
  closeSheet() { closeSheet(); },
  setStart(el) { setStart(el.dataset.v); },
  selWeek(el) { ui.week = +el.dataset.i; render(); },
  setTheme(el) { const v = el.dataset.v; S.profile.theme = ['nuit', 'peche', 'menthe', 'dark'].includes(v) ? v : 'nuit'; save(); applyTheme(); rerender(); },
  weighSheet() { weighSheet(); },
  shakeSheet() { shakeSheet(); },
  setPtab(el) { ui.ptab = el.dataset.v; render({ anim: true }); },
  previewKind(el) { previewSheet(el.dataset.kind, +el.dataset.pw, el.dataset.date); },
  dayStrength(el) { const d = el.dataset.date, s = S.sessions[d]; if (s) sessionSummarySheet(d); else { const ci = calInfo(d); previewSheet(ci.kind, ci.pw, d); } },
  exSheet(el) { exSheet(el.dataset.id); },
  mobSheet(el) { mobSheet(el.dataset.date); },
  mobToggle(el) { const d = el.dataset.date; if (S.mobility[d]) delete S.mobility[d]; else { S.mobility[d] = true; haptic(15); } save(); rerender(); },
  runDurSheet(el) { runDurSheet(+el.dataset.pw); },
  repeatSheet(el) { repeatSheet(+el.dataset.i); },
  rulesSheet() { rulesSheet(); },
  startSheet() { startSheet(); },
  weightsSheet() { weightsSheet(); },
  profSheet(el) { profSheet(el.dataset.k); },
  startSession(el) {
    const d = el.dataset.date, ci = calInfo(d);
    if (!S.sessions[d] && ci.type === 'strength' && d === today() && !curSess()) { openCheck(d, 'strength'); return; }
    startSession(d);
  },
  ckOpen(el) { openCheck(el.dataset.date, el.dataset.kind || 'strength'); },
  ckSet(el) {
    const { date } = ui.ck, was = checkComplete(S.checkins[date]);
    S.checkins[date] = { ...(S.checkins[date] || {}), [el.dataset.k]: +el.dataset.v, at: Date.now() };
    save(); haptic(8);
    ui.ck.anim = !was && checkComplete(S.checkins[date]);
    refreshSheet(); ui.ck.anim = false;
    if (ui.ck.kind === 'run') render();
  },
  ckGo(el) {
    const { date, light } = ui.ck, c = S.checkins[date], m = el.dataset.m;
    if (m === 'skip' || !checkComplete(c)) { startSession(date, { reduced: light }); return; }
    const pl = coachPlan(date, c), lvl = light ? 'light' : pl.level;
    const adapt = { level: lvl, why: pl.why, comp: lvl === 'ease' ? 1 : 0, rest: lvl === 'ease' ? 15 : lvl === 'light' ? 30 : 0, at: Date.now() };
    if (m === 'plan') startSession(date, { reduced: light, check: c });
    else startSession(date, { reduced: lvl === 'light', adapt, check: c });
  },
  openSession() { ui.sess = true; renderSession(); },
  openSessionDate(el) { startSession(el.dataset.date); },
  viewSession(el) { sessionSummarySheet(el.dataset.date); },
  editSession(el) {
    const other = curSess();
    if (other && other.status === 'active' && other.date !== el.dataset.date) { toast('Termine d’abord la séance en cours.'); return; }
    S.active = el.dataset.date; const s = curSess(); s.pos = s.ex.length; ui.sess = true; closeSheet(true); save(); renderSession();
  },
  stage3d(el) { const st = el.closest('.stage')._st; if (!st) return; S.profile.anim3d = !st.want3d; save(); st.want3d ? st.disable3d() : st.enable3d(); },
  stagePlay(el) { const st = el.closest('.stage'); if (st && st._st) { st._st.toggle(); st._st.wasPlaying = st._st.playing; } },
  runSheet(el) { runSheet(el.dataset.date); },
  rf(el) { captureRunForm(); const f = ui.runForm.f; const k = el.dataset.k; let v = el.dataset.v; if (k === 'effort') v = +v; f[k] = f[k] === v && k === 'effort' ? null : v; if (k === 'kind' && v === 'badminton' && !S.runs[ui.runForm.date]) f.minutes = 60; renderRunSheet(); },
  rfFlag(el) { captureRunForm(); const f = ui.runForm.f; f[el.dataset.k] = !f[el.dataset.k]; renderRunSheet(); },
  rfMin(el) { captureRunForm(); const f = ui.runForm.f; f.minutes = clamp((+f.minutes || 0) + (+el.dataset.d), 0, 240); const inp = document.getElementById('rfMinutes'); if (inp) { inp.value = f.minutes; inp.classList.remove('bump'); void inp.offsetWidth; inp.classList.add('bump'); } },
  saveRun() {
    captureRunForm();
    const { f } = ui.runForm, old = ui.runForm.date, date = ui.runForm.newDate && ui.runForm.newDate <= today() ? ui.runForm.newDate : old, ci = calInfo(date);
    if (date !== old && S.runs[date]) { toast('Une sortie est déjà notée le ' + fmtD(date) + '.'); return; }
    if (date !== old) delete S.runs[old];
    const rec = { date, planned: ci.planned ?? null, kind: f.kind, minutes: f.kind === 'skipped' ? 0 : clamp(Math.round(+f.minutes || 0), 0, 240), km: f.km === '' || f.km == null ? null : Math.max(0, Math.round(parseFloat(String(f.km).replace(',', '.')) * 100) / 100) || null,
      effort: f.effort, painDuring: f.painDuring, painAfter: f.painAfter, swelling: f.swelling, limp: f.limp, legsTired: f.legsTired, note: (f.note || '').slice(0, 300), nextDay: f.nextDay };
    if (f.kind === 'skipped') Object.assign(rec, { effort: null, painDuring: false, painAfter: false, swelling: false, limp: false, legsTired: false });
    S.runs[date] = rec; save(); haptic(15); render();
    if (runFlag(rec)) openSheet(sheetHead('Douleur signalée') + alertBox('bad', 'warn', 'Les prochaines sorties sont en pause jusqu’à ce que tu indiques que la douleur a disparu. Si elle persiste, demande un avis médical.') + '<button class="btn block" data-act="closeSheet">Compris</button>');
    else { closeSheet(); toast('Sortie enregistrée.'); }
  },
  delRun(el) { const d = el.dataset.date; confirmSheet('Supprimer la sortie ?', 'La sortie du ' + fmtD(d) + ' sera effacée.', 'delRunOk', 'Supprimer', 'data-date="' + d + '"'); },
  delRunOk(el) { delete S.runs[el.dataset.date]; save(); closeSheet(); render(); toast('Sortie supprimée.'); },
  clearFlag() { S.runClearedAt = today(); save(); render(); toast('Signal levé. Reprends en douceur.'); },
  addWeightQuick() { const v = document.getElementById('wQuick').value; if (addWeight(today(), v)) render(); },
  addWeight() { const d = document.getElementById('wDate').value, v = document.getElementById('wKg').value; ui.weightDate = d; if (addWeight(d, v)) rerender(); },
  delWeight(el) { S.weights = S.weights.filter(w => w.date !== el.dataset.date); save(); rerender(); toast('Pesée supprimée.'); },
  kcalYes() { const ks = kcalSuggestion(); S.profile.nutritionNotes.push({ date: today(), text: 'Ajout envisagé : environ 100 à 150 kcal par jour' }); S.kcalSugg.dismissedWeek = ks ? ks.weeks[2].week : mondayOf(today()); save(); render(); toast('Noté.'); },
  kcalNo() { const ks = kcalSuggestion(); S.kcalSugg.dismissedWeek = ks ? ks.weeks[2].week : mondayOf(today()); save(); render(); },
  acceptLevel(el) { const id = el.dataset.id; acceptLevel(id); haptic([15, 40, 15]); toast('Nouveau niveau : ' + levelLabel(id)); ui.sess ? renderSession() : render(); },
  laterLevel(el) { const id = el.dataset.id, sg = suggestion(id); S.sugg.dismissed[id] = sg.lastDate || today(); save(); ui.sess ? renderSession() : render(); },
  runDur(el) { const pw = +el.dataset.pw, k = el.dataset.k; S.plan.runs[pw][k] = clamp(S.plan.runs[pw][k] + (+el.dataset.d), 0, 90); save(); const inp = document.getElementById('rd-' + pw + '-' + k); if (inp) { inp.value = S.plan.runs[pw][k]; inp.classList.remove('bump'); void inp.offsetWidth; inp.classList.add('bump'); } render(); },
  runReset(el) { const pw = +el.dataset.pw; S.plan.runs[pw] = { ...RUN_DEFAULT[pw] }; save(); rerender(); },
  repeatDo(el) { const i = +el.dataset.i; if (!canRepeat(i)) return; S.plan.seq.splice(i + 1, 0, S.plan.seq[i]); ui.week = i + 1; save(); closeSheet(); render(); toast('Semaine ' + S.plan.seq[i] + ' répétée.'); },
  undoRepeat(el) { const i = +el.dataset.i; if (!canUndoRepeat(i)) return; S.plan.seq.splice(i, 1); ui.week = Math.max(0, i - 1); save(); closeSheet(); render(); toast('Répétition annulée.'); },
  addBand() { const n = document.getElementById('bandName').value.trim(), note = document.getElementById('bandNote').value.trim(); if (!n) { toast('Donne un nom à la bande.'); return; } S.profile.bands.push({ id: Math.random().toString(36).slice(2, 9), name: n.slice(0, 40), note: note.slice(0, 120) }); save(); rerender(); },
  delBand(el) { S.profile.bands = S.profile.bands.filter(b => b.id !== el.dataset.id); save(); rerender(); },
  exportFile() {
    if (FRAMED) {
      if (!DL) return;
      DL.save({ filename: 'elan-sauvegarde-' + today() + '.json', data: exportPayload() }).then(r => toast(r.status === 'saved' ? 'Sauvegarde enregistrée.' : 'Sauvegarde envoyée.'), e => { const c = e && e.code; toast(c === 'declined' ? 'Enregistrement annulé.' : c === 'rate_limited' ? 'Une demande est déjà ouverte.' : 'Enregistrement impossible : utilise « Copier ».'); if (['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(c)) { DL = null; rerender(); } });
      return;
    }
    try {
      const blob = new Blob([exportPayload()], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'elan-sauvegarde-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Sauvegarde téléchargée.');
    } catch (e) { toast('Téléchargement impossible : utilise « Copier ».'); }
  },
  exportCopy() {
    const txt = exportPayload(); ui.exportText = txt; refreshSheet();
    const box = document.getElementById('exportBox'), sel = () => { if (box) { box.focus(); box.select(); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('Sauvegarde copiée.'), () => { sel(); toast('Texte sélectionné : copie-le.'); });
    else { sel(); toast('Texte sélectionné : copie-le.'); }
  },
  importPaste() { const t = document.getElementById('importText').value.trim(); if (!t) { toast('Colle d’abord le texte de la sauvegarde.'); return; } ui.importPreview = validateImport(t); refreshSheet(); },
  importApply() { const v = ui.importPreview; if (!v || !v.ok) return; backupNow(); S = v.data; applyTheme(); S.active = S.active && S.sessions[S.active]?.status === 'active' ? S.active : null; S.timer = null; ui.importPreview = null; ui.exportText = null; save(); closeSheet(); render(); toast('Données restaurées.'); },
  importCancel() { ui.importPreview = null; refreshSheet(); },
  restoreBackup() { let bk = null; try { bk = JSON.parse(localStorage.getItem(BKEY) || 'null'); } catch (e) { } if (!bk) return; const cur = S; S = normalize(bk.data); try { localStorage.setItem(BKEY, JSON.stringify({ at: new Date().toISOString(), data: cur })); } catch (e) { } save(); rerender(); toast('Copie de sécurité restaurée.'); },
  persist() { navigator.storage.persist().then(ok => toast(ok ? 'Stockage durable accordé.' : 'Stockage durable refusé : exporte régulièrement.')).catch(() => toast('Demande impossible ici.')); },
  resetAsk() { ui.confirmReset = true; refreshSheet(); },
  resetCancel() { ui.confirmReset = false; refreshSheet(); },
  resetDo() { backupNow(); S = defaults(); ui.confirmReset = false; ui.sess = false; save(); closeSheet(true); renderSession(); render(); toast('Données effacées. Copie de sécurité conservée.'); },
  install() { if (!installEvt) return; installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; rerender(); }); },
  doPrint() { try { window.print(); } catch (e) { toast('Impression indisponible ici.'); } },
  ...SACT,
  ...CLOUD_ACT,
  ...WACT
};
function captureRunForm() {
  const f = ui.runForm && ui.runForm.f; if (!f) return;
  const m = document.getElementById('rfMinutes'), k = document.getElementById('rfKm'), n = document.getElementById('rfNote');
  if (m) f.minutes = m.value; if (k) f.km = k.value; if (n) f.note = n.value;
  const d = document.getElementById('rfDate'); if (d && isDate(d.value)) ui.runForm.newDate = d.value;
}

/* ---- retours tactiles : onde, ressort, vibration légère ---- */
const RIPPLE = '.btn, .chip, .seg button, .day, .wk, .setrow, .listrow, button.li, .footline, .check-list button, .tile, .wcard';
document.addEventListener('pointerdown', e => {
  window.__tap = { x: e.clientX, y: e.clientY };
  const el = e.target.closest(RIPPLE);
  if (!el || el.disabled || RM()) return;
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.4;
  const s = document.createElement('span'); s.className = 'rip';
  s.style.width = s.style.height = d + 'px'; s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
  el.appendChild(s); setTimeout(() => s.remove(), 650);
}, { passive: true });
const POP = new Set(['ckSet', 'rir', 'fatigue', 'pain', 'painWhere', 'rf', 'rfFlag', 'selWeek', 'tech', 'variant', 'setPtab', 'tPreset', 'setStart']);
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  unlockAudio(); voiceUnlock();
  if (!el || el.disabled) return;
  const a = el.dataset.act, f = ACT[a];
  if (!f) return;
  if (el.tagName === 'BUTTON' || el.tagName === 'DIV') e.preventDefault();
  if (el.matches('.chip, .seg button, .wk') && !['rir', 'rfMin'].includes(a)) haptic(5);
  f(el, e);
  if (POP.has(a) && !el.isConnected && !RM()) {
    const sel = '[data-act="' + a + '"]' + ['v', 'k', 'i', 'id'].filter(k => el.dataset[k] != null).map(k => '[data-' + k + '="' + CSS.escape(el.dataset[k]) + '"]').join('');
    const n = document.querySelector(sel); if (n) n.classList.add('pop');
  }
});
document.addEventListener('change', e => {
  const el = e.target, c = el.dataset.chg;
  if (el.id === 'startInput') { setStart(el.value); return; }
  if (el.id === 'importFile') {
    const file = el.files && el.files[0]; if (!file) return;
    if (file.size > 5e6) { ui.importPreview = { ok: false, errors: ['Fichier trop volumineux pour une sauvegarde de cette application.'] }; refreshSheet(); return; }
    const rd = new FileReader(); rd.onload = () => { ui.importPreview = validateImport(String(rd.result)); refreshSheet(); }; rd.onerror = () => { ui.importPreview = { ok: false, errors: ['Lecture du fichier impossible.'] }; refreshSheet(); }; rd.readAsText(file); return;
  }
  if (el.id === 'shakeKcal') { const d = el.dataset.date, v = el.value === '' ? null : clamp(Math.round(+el.value), 0, 3000); S.shakes[d] = { ...(S.shakes[d] || {}), taken: true, kcal: v }; save(); return; }
  if (el.id === 'wDate') { ui.weightDate = el.value; return; }
  if (el.id === 'reducedToggle') { haptic(6); return; }
  if (!c) return;
  if (c === 'path') {
    const p = el.dataset.path, cur = getPath(p);
    let v = el.value;
    if (el.type === 'number' || el.dataset.num) { v = v.trim() === '' ? null : parseFloat(String(v).replace(',', '.')); if (v != null && !isFinite(v)) { el.value = cur ?? ''; return; } }
    if (p === 'profile.name') v = String(v || '').trim().slice(0, 40);
    if (['profile.heightCm', 'profile.startWeightKg', 'profile.gainLowG', 'profile.gainHighG', 'profile.proteinG'].includes(p) && (v == null || v <= 0)) { el.value = cur; return; }
    setPath(p, v); save(); render(); return;
  }
  if (c === 'bool') { setPath(el.dataset.path, el.checked); save(); if (el.dataset.path === 'profile.voice') { if (el.checked) { VOICE.unlocked = false; voiceUnlock(); say('Mode mains libres activé.'); } else voiceStop(); } return; }
  if (c === 'shake') { const d = el.dataset.date; const prev = S.shakes[d] || {}; S.shakes[d] = { taken: el.checked, kcal: el.checked ? (prev.kcal ?? S.profile.recipe.kcal ?? null) : prev.kcal ?? null }; save(); haptic(8); setTimeout(() => { rerender(); if (el.checked) { const k = document.getElementById('shakeKcal'); if (k) k.classList.add('pop'); } }, RM() ? 0 : 280); return; }
  if (c === 'runDurIn') { const pw = +el.dataset.pw, k = el.dataset.k; S.plan.runs[pw][k] = clamp(Math.round(+el.value || 0), 0, 90); el.value = S.plan.runs[pw][k]; save(); render(); return; }
  if (c === 'sReduced') { const s = curSess(); if (s && s.status === 'active') { s.reduced = el.checked; if (!el.checked && s.adapt && s.adapt.level === 'light') s.adapt = null; save(); haptic(6); setTimeout(renderSession, RM() ? 0 : 280); } return; }
  if (c === 'band' || c === 'grip') { const s = curSess(), ex = s && s.ex[+el.dataset.i]; if (ex) { ex[c] = el.value.slice(0, 60); save(); } return; }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'repsIn') { const s = curSess(), ex = s && s.ex[s.pos]; if (ex && ex.draft) { ex.draft.reps = clamp(Math.round(+el.value || 0), 0, 120); save(); } }
  if (el.id === 'sNote') { const s = curSess(); if (s) { s.note = el.value.slice(0, 400); save(); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!document.getElementById('unlock').hidden) { closeUnlock(); return; } if (!document.getElementById('celebrate').hidden) closeCelebrate(); else if (!document.getElementById('sheet').hidden) closeSheet(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); if (ui.sess) requestWake(); } });
window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) { S = load(); applyTheme(); render(); renderSession(); } });

let DL = null, tickTimer = null, INTRO = null;
/* Intro : anneau qui se remplit, haltère tracé, nom de l’app, puis l’écran se déploie. Un toucher la passe. */
function playIntro() {
  const root = document.documentElement, el = document.getElementById('intro');
  if (!el || !root.classList.contains('intro')) { root.classList.remove('intro'); if (el) el.remove(); return; }
  INTRO = new Promise(done => {
    let gone = false;
    const leave = () => {
      if (gone) return; gone = true;
      const ring = el.querySelector('.i-ring').getBoundingClientRect();
      el.style.setProperty('--cx', (ring.left + ring.width / 2) + 'px'); el.style.setProperty('--cy', (ring.top + ring.height / 2) + 'px');
      el.classList.add('out');
      setTimeout(() => { root.classList.add('reveal'); done(); }, 120);
      setTimeout(() => { el.remove(); root.classList.remove('intro', 'reveal'); INTRO = null; }, 950);
    };
    const t = setTimeout(leave, 2550);
    el.addEventListener('pointerdown', () => { clearTimeout(t); leave(); }, { once: true });
  });
}
function applyTheme() {
  const th = ['nuit', 'peche', 'menthe', 'dark'].includes(S.profile.theme) ? S.profile.theme : 'nuit';
  document.documentElement.dataset.ui = th;
  let m = document.querySelector('meta[name=theme-color]'); if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
  m.content = ({ nuit: '#1D1F33', dark: '#080C0D', menthe: '#DDF2EA', peche: '#FCEDE6' })[th];
}
function boot() {
  applyTheme();
  playIntro();
  route = readRoute();
  if (S.active && S.sessions[S.active]?.status === 'active') ui.sess = true;
  else if (S.active && S.sessions[S.active]?.status === 'done') S.active = null;
  render(); renderSession();
  tickTimer = setInterval(() => { if (S.timer || S.stopwatch) tick(); }, 250);
  if (FRAMED) { try { if (window.claude && window.claude.use) window.claude.use('downloads').then(d => { DL = d || null; if (DL) refreshSheet(); }, () => { }); } catch (e) { } }
  else {
    const add = (rel, href) => { const l = document.createElement('link'); l.rel = rel; l.href = href; document.head.appendChild(l); };
    add('manifest', 'manifest.webmanifest');
    add('apple-touch-icon', 'icons/apple-touch-icon-v3.png');
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js').catch(() => { });
  }
}
boot();
