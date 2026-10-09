/* ===== Accueil au premier lancement =====
   Le fichier publié ne contient aucune donnée personnelle : prénom, taille et poids sont demandés ici,
   puis enregistrés uniquement sur le téléphone. */
function scrWelcome() {
  const p = S.profile, v = x => x == null ? '' : esc(String(x).replace('.', ','));
  return '<section class="screen' + stg() + '">' +
    '<header class="top"><div><div class="eyebrow">Bienvenue</div><h1 class="title-xl">Élan</h1></div></header>' +
    '<section class="hero">' + heroMedia('squat', pill('8 semaines · force · course', 'acc')) +
    '<div class="hero-body"><div class="hero-name">Faisons connaissance</div>' +
    '<div class="hero-sub">Trois informations pour personnaliser l’application. Elles restent sur ce téléphone.</div>' +
    '<div class="stack">' +
    '<label class="field"><span>Prénom</span><input class="input" type="text" id="wName" maxlength="40" autocomplete="given-name" value="' + esc(p.name) + '"></label>' +
    '<div class="grid2">' +
    '<label class="field"><span>Taille (cm)</span><input class="input" type="text" inputmode="decimal" autocomplete="off" id="wHeight" placeholder="175" value="' + v(p.heightCm) + '"></label>' +
    '<label class="field"><span>Poids actuel (kg)</span><input class="input" type="text" inputmode="decimal" autocomplete="off" id="wWeight" placeholder="65" value="' + v(p.startWeightKg) + '"></label>' +
    '</div>' +
    '<button class="btn primary xl block" data-act="welcomeDone">C’est parti</button>' +
    '</div></div></section>' +
    '<div class="eyebrow">J’ai déjà une sauvegarde</div>' +
    '<div class="group">' + listRow('profSheet', 'save', '', 'Sauvegarde cloud', 'Même jeton et même code secret', '', 'data-k="cloud"') +
    listRow('profSheet', 'save', 'run', 'Fichier de sauvegarde', 'Restaurer un fichier .json', '', 'data-k="data"') + '</div>' +
    '<p class="note">Tu pourras tout modifier ensuite dans Profil. Aucun compte nécessaire.</p>' +
    '</section>';
}
function welcomeDone() {
  const val = id => { const t = (document.getElementById(id)?.value || '').trim().replace(',', '.'); return t === '' ? null : parseFloat(t); };
  const name = (document.getElementById('wName')?.value || '').trim().slice(0, 40), h = val('wHeight'), w = val('wWeight');
  if (!name) { toast('Indique ton prénom.'); document.getElementById('wName')?.focus(); return; }
  if (h != null && !(h >= 120 && h <= 230)) { toast('Indique une taille entre 120 et 230 cm.'); return; }
  if (w != null && !(w >= 30 && w <= 200)) { toast('Indique un poids entre 30 et 200 kg.'); return; }
  const p = S.profile;
  p.name = name;
  if (h != null) p.heightCm = Math.round(h);
  if (w != null) {
    p.startWeightKg = Math.round(w * 10) / 10;
    /* repère protéines : environ 1,6 g par kg, ajustable dans Profil → Repères */
    p.proteinG = Math.round(w * 1.6 / 5) * 5;
  }
  p.welcomed = true;
  save(); haptic(15); window.scrollTo(0, 0); render({ anim: true });
  toast('Bienvenue, ' + name + ' !');
}
const WACT = {
  welcomeDone() { welcomeDone(); }
};
