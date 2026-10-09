/* ===== Mode mains libres : la voix du téléphone annonce la séance =====
   Synthèse vocale du navigateur (aucune connexion nécessaire). Elle annonce l’exercice, la série,
   le repos, les 10 dernières secondes, la fin du repos et le chrono des gainages.
   Limites : le système choisit la voix ; écran verrouillé, le navigateur peut se taire. */
const VOICE = { ok: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, voice: null, unlocked: false, lastKey: null };
I.voiceOn = sv('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>');
I.voiceOff = sv('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>');

function voiceOn() { return VOICE.ok && !!S.profile.voice; }
function pickVoice() {
  if (!VOICE.ok) return null;
  const vs = speechSynthesis.getVoices().filter(v => /^fr(-|_|$)/i.test(v.lang));
  return vs.find(v => /fr[-_]FR/i.test(v.lang) && v.localService) || vs.find(v => /fr[-_]FR/i.test(v.lang)) || vs[0] || null;
}
if (VOICE.ok) {
  VOICE.voice = pickVoice();
  try { speechSynthesis.addEventListener('voiceschanged', () => { VOICE.voice = pickVoice(); }); } catch (e) { }
}
/* iPhone : la première parole doit partir d’un geste (toucher). On envoie une phrase vide au premier toucher. */
function voiceUnlock() {
  if (!voiceOn() || VOICE.unlocked) return;
  VOICE.unlocked = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { }
}
function say(text, interrupt = true) {
  if (!voiceOn() || !text) return;
  try {
    if (interrupt) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; u.rate = 1; u.pitch = 1;
    if (VOICE.voice) u.voice = VOICE.voice;
    speechSynthesis.speak(u);
  } catch (e) { }
}
function voiceStop() { if (VOICE.ok) try { speechSynthesis.cancel(); } catch (e) { } }

/* ---- textes parlés ---- */
function spokenDur(sec) {
  sec = Math.round(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  if (!m) return sec + ' secondes';
  return m + (m > 1 ? ' minutes' : ' minute') + (s ? ' ' + s : '');
}
function spokenRange(id) {
  const ex = EX[id], r = ex.range[0] + ' à ' + ex.range[1];
  return (ex.unit === 'sec' ? r + ' secondes' : r + ' répétitions') + (ex.perSide ? ' par côté' : '');
}
function spokenSet(s, i) {
  const e = s.ex[i], ex = EX[e.id], pr = prescFor(s, e.slot), k = Math.min(e.sets.length + 1, pr.sets);
  return 'Série ' + k + ' sur ' + pr.sets + ', ' + ex.name + '. ' + spokenRange(e.id) + '.';
}
function spokenExercise(s, i) {
  const e = s.ex[i], ex = EX[e.id], pr = prescFor(s, e.slot), n = s.ex.length;
  if (e.skipped) return 'Exercice ' + (i + 1) + ' sur ' + n + ', ' + ex.name + ' : passé.';
  if (e.sets.length >= pr.sets) return 'Exercice ' + (i + 1) + ' sur ' + n + ', ' + ex.name + ' : terminé.';
  if (e.sets.length) return spokenSet(s, i);
  return 'Exercice ' + (i + 1) + ' sur ' + n + ' : ' + ex.name + '. ' + pr.sets + (pr.sets > 1 ? ' séries' : ' série') + ' de ' + spokenRange(e.id) + '.';
}
/* Ce qui vient après le repos en cours */
function spokenNext(s) {
  if (!s || s.pos < 0 || s.pos >= s.ex.length) return '';
  const e = s.ex[s.pos], pr = prescFor(s, e.slot);
  if (e.sets.length < pr.sets && !e.skipped) return spokenSet(s, s.pos);
  const j = s.ex.findIndex((x, k) => k > s.pos && !x.skipped);
  if (j < 0) return 'C’était le dernier exercice. Passe au résumé.';
  return 'Exercice suivant : ' + EX[s.ex[j].id].name + '.';
}

/* ---- annonces branchées sur la séance ---- */
function voiceOnView(s, prefix = '') {
  if (!voiceOn() || !s || s.status !== 'active' || s.paused) return;
  const key = s.date + ':' + s.pos;
  if (VOICE.lastKey === key && !prefix) return;
  VOICE.lastKey = key;
  say(prefix + (s.pos < 0 ? 'Échauffement, 6 à 8 minutes. Coche chaque étape, puis lance la séance.'
    : s.pos < s.ex.length ? spokenExercise(s, s.pos)
    : 'Dernière étape : le résumé. Note ta fatigue, puis termine la séance.'));
}
function voiceOnSet(s, e, sec) {
  if (!voiceOn()) return;
  const pr = prescFor(s, e.slot), last = e.sets.length >= pr.sets;
  say((last ? 'Dernière série validée.' : 'Série ' + e.sets.length + ' validée.') + ' Repos ' + spokenDur(sec) + '.');
}
function voiceOnTick(tm, left) {
  if (!voiceOn() || !tm) return;
  if (left > 10500) { tm.warned = false; return; }
  if (left > 0 && left <= 10500 && !tm.warned && tm.total > 20) { tm.warned = true; say('10 secondes.'); }
}
function voiceOnRestEnd(tm) {
  if (!voiceOn() || !tm) return;
  if (!tm.id) { say('Fin du minuteur.'); return; }
  say('Repos terminé. ' + spokenNext(curSess()));
}
function voiceOnHold(sw) {
  if (!voiceOn() || !sw) return;
  const s = Math.floor((Date.now() - sw.startAt) / 1000);
  if (s > 0 && s % 10 === 0 && sw.spoken !== s) { sw.spoken = s; say(s + ' secondes.', false); }
}
function voiceToggle() {
  if (!VOICE.ok) { toast('La synthèse vocale n’est pas disponible sur ce navigateur.'); return; }
  S.profile.voice = !S.profile.voice; save();
  if (S.profile.voice) {
    VOICE.unlocked = false; voiceUnlock(); VOICE.lastKey = null;
    const s = curSess();
    if (ui.sess && s && s.status === 'active') voiceOnView(s, 'Mode mains libres activé. ');
    else say('Mode mains libres activé.');
  } else voiceStop();
  haptic(8);
  if (ui.sess) renderSession(); else refreshSheet();
}
