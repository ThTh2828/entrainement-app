/* ---- sauvegarde cloud ----
   Un Gist GitHub secret sur TON compte. Le contenu est chiffré sur le téléphone (AES-256, clé tirée de ton code secret) :
   GitHub ne voit qu’un bloc illisible. Le jeton et le code restent sur ce téléphone, hors des sauvegardes. */
const CKEY = 'elan.cloud.v1', GIST_FILE = 'elan-sauvegarde.json', GIST_DESC = 'Élan · sauvegarde chiffrée';
let CLOUD = (() => { try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; } })();
function cloudStore() { try { CLOUD ? localStorage.setItem(CKEY, JSON.stringify(CLOUD)) : localStorage.removeItem(CKEY); } catch (e) { } }
function b64(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192)); return btoa(s); }
function unb64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptText(txt, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await deriveKey(pass, salt), new TextEncoder().encode(txt));
  return JSON.stringify({ app: 'elan-cloud', v: 1, at: new Date().toISOString(), salt: b64(salt), iv: b64(iv), ct: b64(ct) });
}
async function decryptText(json, pass) {
  let o; try { o = JSON.parse(json); } catch (e) { throw new Error('format'); }
  if (!o || o.app !== 'elan-cloud') throw new Error('format');
  try { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, await deriveKey(pass, unb64(o.salt)), unb64(o.ct)); return { text: new TextDecoder().decode(pt), at: o.at }; }
  catch (e) { throw new Error('pass'); }
}
async function gh(path, token, opts = {}) {
  let r;
  try { r = await fetch('https://api.github.com' + path, { ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } }); }
  catch (e) { throw new Error('net'); }
  if (r.status === 401) throw new Error('token');
  if (r.status === 403 || r.status === 404) throw new Error('scope');
  if (!r.ok) throw new Error('http');
  return r.json();
}
async function findGist(token) {
  for (let page = 1; page <= 5; page++) {
    const list = await gh('/gists?per_page=100&page=' + page, token);
    const g = list.find(x => x.files && x.files[GIST_FILE]);
    if (g) return g;
    if (list.length < 100) break;
  }
  return null;
}
async function readGist(id, token) {
  const g = await gh('/gists/' + id, token), f = g.files && g.files[GIST_FILE];
  if (!f) throw new Error('missing');
  if (f.truncated) { const r = await fetch(f.raw_url); return r.text(); }
  return f.content;
}
const CLOUD_ERR = { token: 'Jeton refusé par GitHub (expiré ou mal copié).', scope: 'Le jeton n’a pas le droit « gist ».', net: 'Pas de connexion pour l’instant.', http: 'GitHub ne répond pas correctement, nouvel essai plus tard.', pass: 'Code secret incorrect.', format: 'Ce Gist ne contient pas une sauvegarde Élan.', missing: 'Sauvegarde introuvable dans le Gist.' };
let cloudTimer = null, cloudBusy = false, cloudDirty = false;
function cloudSchedule(delay = 15000) {
  if (!CLOUD || !CLOUD.on) return;
  cloudDirty = true;
  if (!cloudTimer) cloudTimer = setTimeout(cloudPush, delay);
}
async function cloudPush(force) {
  clearTimeout(cloudTimer); cloudTimer = null;
  if (!CLOUD || !CLOUD.on || cloudBusy) return false;
  if (!force && !cloudDirty) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { CLOUD.err = 'net'; cloudStore(); return false; }
  cloudBusy = true; cloudDirty = false;
  let ok = false;
  try {
    const content = await encryptText(exportPayload(), CLOUD.pass);
    const body = JSON.stringify({ description: GIST_DESC, files: { [GIST_FILE]: { content } } });
    if (CLOUD.gist) await gh('/gists/' + CLOUD.gist, CLOUD.token, { method: 'PATCH', body, keepalive: body.length < 60000 });
    else { const g = await gh('/gists', CLOUD.token, { method: 'POST', body: JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content } } }) }); CLOUD.gist = g.id; }
    CLOUD.last = Date.now(); CLOUD.err = null; ok = true;
  } catch (e) { CLOUD.err = e.message; cloudDirty = true; if (e.message === 'net' || e.message === 'http') cloudTimer = setTimeout(cloudPush, 120000); }
  cloudBusy = false; cloudStore();
  if (ok && cloudDirty) cloudSchedule();
  if (ui.sheetFn === PROF.cloud) refreshSheet();
  return ok;
}
function agoLabel(t) { if (!t) return 'jamais'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'à l’instant' : m < 60 ? 'il y a ' + m + ' min' : m < 1440 ? 'il y a ' + Math.round(m / 60) + ' h' : 'le ' + new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
function cloudStatus() { return !CLOUD || !CLOUD.on ? 'Désactivée' : CLOUD.err && CLOUD.err !== 'net' ? 'À vérifier' : 'Auto · ' + agoLabel(CLOUD.last); }
function cloudSheetHTML() {
  const c = ui.cloud || (ui.cloud = {});
  let h = sheetHead('Sauvegarde cloud', 'Automatique et chiffrée');
  if (CLOUD && CLOUD.on) {
    h += '<section class="cloud-st' + (CLOUD.err && CLOUD.err !== 'net' ? ' bad' : '') + '"><span class="ic fill">' + I.save + '</span><div><b>' + (cloudBusy ? 'Envoi en cours…' : 'Dernière sauvegarde ' + agoLabel(CLOUD.last)) + '</b><span class="note">' + (CLOUD.err ? CLOUD_ERR[CLOUD.err] || 'Erreur inconnue.' : 'Chaque modification part vers ton Gist privé quelques secondes après.') + '</span></div></section>';
    h += '<div class="btns"><button class="btn primary" data-act="cloudNow">Sauvegarder maintenant</button><button class="btn" data-act="cloudRestore">Restaurer</button></div>';
    if (c.preview) h += cloudPreviewHTML(c.preview);
    h += '<p class="note">Sur un nouveau téléphone : installe Élan, puis Profil → Sauvegarde cloud, avec le même jeton et le même code secret.</p>';
    h += '<button class="btn ghost block" data-act="cloudOff">Désactiver sur ce téléphone</button>';
    return h;
  }
  h += '<p class="small">Tes données partent toutes seules sur ton compte GitHub, dans un Gist secret. Elles sont <b>chiffrées sur le téléphone</b> avec ton code secret : sans lui, personne ne peut les lire, ni GitHub ni moi.</p>';
  h += '<ol class="steps"><li><b>Crée un jeton</b> sur GitHub (droit « gist » déjà coché). Choisis une expiration longue, puis copie-le.<a class="btn sm block" href="https://github.com/settings/tokens/new?scopes=gist&description=%C3%89lan%20sauvegarde" target="_blank" rel="noopener">Ouvrir GitHub</a></li>' +
    '<li><b>Colle le jeton</b><input class="input" type="password" id="cloudToken" autocomplete="off" placeholder="ghp_…" value="' + esc(c.token || '') + '"></li>' +
    '<li><b>Choisis un code secret</b> (6 caractères minimum). Note-le : sans lui, la sauvegarde est illisible, même pour toi.<input class="input" type="password" id="cloudPass" autocomplete="new-password" placeholder="Code secret" value="' + esc(c.pass || '') + '"></li></ol>';
  if (c.err) h += alertBox('bad', 'warn', esc(c.err));
  if (c.found) {
    h += alertBox('acc', 'save', 'Une sauvegarde Élan existe déjà sur ce compte (' + esc(new Date(c.found.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })) + ').');
    if (c.preview) h += cloudPreviewHTML(c.preview);
    else h += '<div class="btns"><button class="btn primary" data-act="cloudRestore">La restaurer ici</button><button class="btn" data-act="cloudOverwrite">La remplacer par ce téléphone</button></div>';
  } else h += '<button class="btn primary xl block" data-act="cloudConnect"' + (c.busy ? ' disabled' : '') + '>' + (c.busy ? 'Connexion…' : 'Activer la sauvegarde') + '</button>';
  return h;
}
function cloudPreviewHTML(v) {
  return v.ok ? alertBox('acc', 'check', 'Sauvegarde du ' + esc(v.when) + ' : ' + v.sum + '. Elle remplacera les données de ce téléphone (une copie locale est gardée).<div class="btns" style="margin-top:8px"><button class="btn sm primary" data-act="cloudApply">Remplacer mes données</button><button class="btn sm" data-act="cloudCancel">Annuler</button></div>') : alertBox('bad', 'warn', v.errors.map(esc).join('<br>'));
}
function readCloudForm() { const c = ui.cloud || (ui.cloud = {}), t = document.getElementById('cloudToken'), p = document.getElementById('cloudPass'); if (t) c.token = t.value.trim(); if (p) c.pass = p.value; return c; }
async function cloudFetchPreview(token, pass, id) {
  const raw = await readGist(id, token), dec = await decryptText(raw, pass);
  return validateImport(dec.text);
}
const CLOUD_ACT = {
  async cloudConnect() {
    const c = readCloudForm(); c.err = null; c.found = null; c.preview = null;
    if (c.token.length < 20) { c.err = 'Colle le jeton GitHub en entier.'; refreshSheet(); return; }
    if ((c.pass || '').length < 6) { c.err = 'Code secret trop court : 6 caractères minimum.'; refreshSheet(); return; }
    c.busy = true; refreshSheet();
    try {
      const g = await findGist(c.token);
      if (g) c.found = { id: g.id, at: g.updated_at };
      else { CLOUD = { on: true, token: c.token, pass: c.pass, gist: null, last: null, err: null }; cloudStore(); cloudDirty = true; const ok = await cloudPush(true); if (ok) { ui.cloud = {}; toast('Sauvegarde cloud activée.'); } else c.err = CLOUD_ERR[CLOUD.err] || 'Échec de l’envoi.'; if (!ok) { CLOUD = null; cloudStore(); } }
    } catch (e) { c.err = CLOUD_ERR[e.message] || 'Connexion impossible.'; }
    c.busy = false; refreshSheet();
  },
  async cloudRestore() {
    const c = readCloudForm(); c.err = null;
    const token = CLOUD && CLOUD.on ? CLOUD.token : c.token, pass = CLOUD && CLOUD.on ? CLOUD.pass : c.pass, id = CLOUD && CLOUD.on ? CLOUD.gist : c.found && c.found.id;
    if (!id) { toast('Aucune sauvegarde cloud pour l’instant.'); return; }
    try { c.preview = await cloudFetchPreview(token, pass, id); } catch (e) { c.err = CLOUD_ERR[e.message] || 'Lecture impossible.'; c.preview = null; if (CLOUD && CLOUD.on) toast(c.err); }
    refreshSheet();
  },
  async cloudOverwrite() {
    const c = readCloudForm();
    CLOUD = { on: true, token: c.token, pass: c.pass, gist: c.found.id, last: null, err: null }; cloudStore();
    const ok = await cloudPush(true);
    if (ok) { ui.cloud = {}; toast('Sauvegarde cloud activée.'); } else { c.err = CLOUD_ERR[CLOUD.err] || 'Échec de l’envoi.'; CLOUD = null; cloudStore(); }
    refreshSheet();
  },
  cloudApply() {
    const c = ui.cloud || {}, v = c.preview; if (!v || !v.ok) return;
    if (!(CLOUD && CLOUD.on)) { CLOUD = { on: true, token: c.token, pass: c.pass, gist: c.found.id, last: Date.now(), err: null }; cloudStore(); }
    backupNow(); S = v.data; applyTheme(); S.active = S.active && S.sessions[S.active]?.status === 'active' ? S.active : null; S.timer = null;
    ui.cloud = {}; save(); cloudDirty = false; clearTimeout(cloudTimer); cloudTimer = null; closeSheet(); render(); toast('Données restaurées depuis le cloud.');
  },
  cloudCancel() { if (ui.cloud) ui.cloud.preview = null; refreshSheet(); },
  async cloudNow() { cloudDirty = true; refreshSheet(); const ok = await cloudPush(true); toast(ok ? 'Sauvegarde envoyée.' : CLOUD_ERR[CLOUD.err] || 'Échec de l’envoi.'); },
  cloudOff() { CLOUD = null; cloudStore(); ui.cloud = {}; refreshSheet(); toast('Sauvegarde cloud désactivée sur ce téléphone. Ton Gist reste sur GitHub.'); }
};
document.addEventListener('visibilitychange', () => { if (document.hidden && cloudDirty) cloudPush(); });
window.addEventListener('online', () => { if (cloudDirty) cloudPush(); });

function backupNow() { try { localStorage.setItem(BKEY, JSON.stringify({ at: new Date().toISOString(), data: S })); } catch (e) { } }

/* ---- calendrier ---- */
