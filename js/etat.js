/* ===== État, calendrier, règles ===== */
const APP_ID = 'theo-8-semaines', SCHEMA = 1;
const KEY = 'theo8.state.v1', BKEY = 'theo8.backup.v1';
const FRAMED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const STANDALONE = (() => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } })();
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* ---- dates (locales, sans fuseau) ---- */
const pad = n => String(n).padStart(2, '0');
const ds = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const dow = s => (pd(s).getDay() + 6) % 7;
const mondayOf = s => addD(s, -dow(s));
const nextMonday = s => dow(s) === 0 ? s : addD(s, 7 - dow(s));
const diffD = (a, b) => Math.round((pd(b) - pd(a)) / 86400000);
const today = () => ds(new Date());
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(pd(s));
const DOW = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DOWS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MON = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const fmtD = s => { const d = pd(s); return d.getDate() + ' ' + MON[d.getMonth()]; };
const fmtDY = s => fmtD(s) + ' ' + pd(s).getFullYear();
const fmtDL = s => DOW[dow(s)] + ' ' + fmtD(s);
const fmtDl = s => DOW[dow(s)].toLowerCase() + ' ' + fmtD(s);
const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
const fmtShort = s => { const d = pd(s); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
const num = (v, d = 1) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- état ---- */
function defaults() {
  return {
    app: APP_ID, schema: SCHEMA, createdAt: new Date().toISOString(),
    profile: {
      name: '', heightCm: null, startWeightKg: null, gainLowG: 200, gainHighG: 300, proteinG: 80, welcomed: false, voice: false,
      recipe: { text: '', kcal: null, protein: null }, bands: [], medical: { date: '', note: '' },
      pushVariant: 'pushup_knee', rest: {}, sound: true, vibrate: true, nutritionNotes: [], theme: 'nuit', themeV: 2, anim3d: true
    },
    plan: { startDate: null, seq: [1, 2, 3, 4, 5, 6, 7, 8], runs: JSON.parse(JSON.stringify(RUN_DEFAULT)) },
    sessions: {}, runs: {}, weights: [], shakes: {}, mobility: {}, checkins: {}, badges: {}, levels: {},
    sugg: { dismissed: {} }, kcalSugg: { dismissedWeek: null }, runClearedAt: null,
    active: null, timer: null, stopwatch: null
  };
}
/* « 1,73 m · départ 50 kg », sans les valeurs non renseignées */
function bodyLine(p, wLabel) {
  return [p.heightCm ? (p.heightCm / 100).toLocaleString('fr-FR') + ' m' : '', p.startWeightKg ? wLabel + ' ' + num(p.startWeightKg, 1) + ' kg' : ''].filter(Boolean).join(' · ');
}
function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
function normalize(o) {
  const d = defaults();
  if (!isObj(o)) return d;
  const out = d;
  if (isObj(o.profile)) {
    const p = o.profile;
    for (const k of ['name']) if (typeof p[k] === 'string') out.profile[k] = p[k].slice(0, 40);
    for (const k of ['heightCm', 'startWeightKg', 'gainLowG', 'gainHighG', 'proteinG']) if (typeof p[k] === 'number' && isFinite(p[k])) out.profile[k] = p[k];
    if (isObj(p.recipe)) out.profile.recipe = { text: String(p.recipe.text || '').slice(0, 2000), kcal: typeof p.recipe.kcal === 'number' ? p.recipe.kcal : null, protein: typeof p.recipe.protein === 'number' ? p.recipe.protein : null };
    if (Array.isArray(p.bands)) out.profile.bands = p.bands.filter(isObj).map(b => ({ id: String(b.id || Math.random().toString(36).slice(2)), name: String(b.name || '').slice(0, 40), note: String(b.note || '').slice(0, 120) }));
    if (isObj(p.medical)) out.profile.medical = { date: isDate(p.medical.date) ? p.medical.date : '', note: String(p.medical.note || '').slice(0, 300) };
    if (p.pushVariant === 'pushup_wall' || p.pushVariant === 'pushup_knee') out.profile.pushVariant = p.pushVariant;
    if (isObj(p.rest)) for (const k in p.rest) if (EX[k] && typeof p.rest[k] === 'number') out.profile.rest[k] = clamp(p.rest[k], 15, 300);
    if (typeof p.sound === 'boolean') out.profile.sound = p.sound;
    if (typeof p.vibrate === 'boolean') out.profile.vibrate = p.vibrate;
    if (['nuit', 'peche', 'menthe', 'dark'].includes(p.theme) && p.themeV === 2) out.profile.theme = p.theme; /* nouvelle DA : on passe une fois au thème Nuit */
    if (typeof p.anim3d === 'boolean') out.profile.anim3d = p.anim3d;
    if (typeof p.voice === 'boolean') out.profile.voice = p.voice;
    /* données d’avant l’écran d’accueil : le profil était déjà rempli */
    out.profile.welcomed = typeof p.welcomed === 'boolean' ? p.welcomed : true;
    if (Array.isArray(p.nutritionNotes)) out.profile.nutritionNotes = p.nutritionNotes.filter(n => isObj(n) && isDate(n.date)).map(n => ({ date: n.date, text: String(n.text || '').slice(0, 200) }));
  }
  if (isObj(o.plan)) {
    if (o.plan.startDate === null || isDate(o.plan.startDate)) out.plan.startDate = o.plan.startDate;
    if (Array.isArray(o.plan.seq) && o.plan.seq.length >= 8 && o.plan.seq.length <= 14 && o.plan.seq.every(n => Number.isInteger(n) && n >= 1 && n <= 8)) out.plan.seq = o.plan.seq.slice();
    if (isObj(o.plan.runs)) for (let w = 1; w <= 8; w++) {
      const r = o.plan.runs[w];
      if (isObj(r)) for (const k of ['tue', 'sat']) if (typeof r[k] === 'number' && r[k] >= 0 && r[k] <= 90) out.plan.runs[w][k] = r[k];
    }
  }
  for (const k of ['sessions', 'runs', 'shakes', 'mobility', 'checkins']) if (isObj(o[k])) for (const dk in o[k]) if (isDate(dk) && (isObj(o[k][dk]) || typeof o[k][dk] === 'boolean')) out[k][dk] = o[k][dk];
  for (const dk in out.sessions) { const s = out.sessions[dk]; if (!Array.isArray(s.ex) || !SESSIONS[s.kind]) delete out.sessions[dk]; else s.ex = s.ex.filter(e => isObj(e) && EX[e.id]).map(e => ({ ...e, sets: Array.isArray(e.sets) ? e.sets.filter(isObj) : [] })); }
  if (Array.isArray(o.weights)) out.weights = o.weights.filter(w => isObj(w) && isDate(w.date) && typeof w.kg === 'number' && w.kg > 20 && w.kg < 300).map(w => ({ date: w.date, kg: w.kg }));
  if (isObj(o.levels)) for (const k in o.levels) if (EX[k] && isObj(o.levels[k]) && Number.isInteger(o.levels[k].level)) out.levels[k] = { level: o.levels[k].level, hist: Array.isArray(o.levels[k].hist) ? o.levels[k].hist : [] };
  if (isObj(o.sugg) && isObj(o.sugg.dismissed)) out.sugg.dismissed = o.sugg.dismissed;
  if (isObj(o.badges)) for (const k in o.badges) if (isDate(o.badges[k])) out.badges[k] = o.badges[k];
  if (isObj(o.kcalSugg)) out.kcalSugg.dismissedWeek = isDate(o.kcalSugg.dismissedWeek) ? o.kcalSugg.dismissedWeek : null;
  if (isDate(o.runClearedAt)) out.runClearedAt = o.runClearedAt;
  if (typeof o.active === 'string' && out.sessions[o.active]) out.active = o.active;
  if (isObj(o.timer) && typeof o.timer.total === 'number') out.timer = o.timer;
  if (isObj(o.stopwatch)) out.stopwatch = o.stopwatch;
  out.createdAt = typeof o.createdAt === 'string' ? o.createdAt : out.createdAt;
  return out;
}
let storageOK = true;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { storageOK = false; }
  return defaults();
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); storageOK = true; }
  catch (e) { storageOK = false; }
  cloudSchedule();
}
