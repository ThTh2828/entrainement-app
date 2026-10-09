/* ===== Programme, exercices, consignes ===== */
const WEEKS = [
  { n: 1, setsMain: 2, setsComp: 2, rir: [4, 4], note: "Apprentissage : découvre les mouvements, sans forcer." },
  { n: 2, setsMain: 2, setsComp: 2, rir: [3, 3], note: "Même volume, un peu plus près de l’effort." },
  { n: 3, setsMain: 3, setsComp: 2, rir: [3, 3], note: "Une série de plus sur les trois exercices principaux." },
  { n: 4, setsMain: 3, setsComp: 2, rir: [2, 3], note: "Mêmes séries, deux à trois répétitions en réserve." },
  { n: 5, setsMain: 3, setsComp: 2, rir: [2, 3], note: "Légère augmentation de difficulté seulement si le mouvement est maîtrisé." },
  { n: 6, setsMain: 3, setsComp: 2, rir: [2, 2], note: "Mêmes séries, deux répétitions en réserve." },
  { n: 7, setsMain: 3, setsComp: 2, rir: [2, 2], note: "Progression seulement si les critères sont remplis." },
  { n: 8, setsMain: 2, setsComp: 2, rir: [3, 4], note: "Semaine allégée et bilan, sans test maximal." }
];

const RUN_DEFAULT = {
  1: { tue: 15, sat: 20 }, 2: { tue: 18, sat: 20 }, 3: { tue: 20, sat: 22 }, 4: { tue: 20, sat: 25 },
  5: { tue: 22, sat: 25 }, 6: { tue: 25, sat: 28 }, 7: { tue: 25, sat: 30 }, 8: { tue: 20, sat: 25 }
};

// Les trois premiers emplacements sont les exercices principaux.
const SESSIONS = {
  A: [{ ex: 'squat' }, { ex: 'pushup_knee', alt: 'pushup_wall' }, { ex: 'row_band' }, { ex: 'glute_bridge' }, { ex: 'dead_bug' }],
  B: [{ ex: 'squat_tempo' }, { ex: 'pushup_knee', alt: 'pushup_wall' }, { ex: 'row_band' }, { ex: 'side_abduction' }, { ex: 'band_pull_apart' }, { ex: 'side_plank_knee' }]
};

const WARMUP = [
  "2 à 3 min de marche douce, sans rebonds ni sautillements",
  "Cercles d’épaules et de bras, une dizaine dans chaque sens",
  "Cercles de hanches et balancés de jambe légers, en appui stable",
  "8 à 10 squats de faible amplitude",
  "Une série facile des premiers exercices, environ la moitié des répétitions"
];

const MOBILITY = [
  "Respiration lente allongé sur le dos, 1 min",
  "Chat-vache à quatre pattes, pieds relâchés (orteils non repliés), 8 mouvements lents",
  "Rotations du haut du dos allongé sur le côté (« livre ouvert »), 6 par côté",
  "Genoux ramenés vers la poitrine sur le dos, 30 s",
  "Étirement doux des fessiers sur le dos, cheville posée sur le genou opposé, 30 s par côté",
  "Posture de l’enfant, pieds relâchés, 30 à 45 s"
];

const RUN_RULES = [
  "Allure qui te permet de parler en phrases complètes.",
  "Effort facile, environ 3 à 4 sur 10.",
  "Terrain plat. Pas de sprint, de fractionné, de côte ni d’objectif de chrono.",
  "Tu peux alterner course et marche, ou faire une marche confortable à la place.",
  "Ne progresse que s’il n’y a ni douleur ni gonflement pendant, après et le lendemain, et si tu récupères bien.",
  "Jambes encore très fatiguées par la musculation : raccourcis ou remplace par une marche.",
  "Douleur, gonflement ou boiterie : arrête la course et demande un avis médical."
];

const RIR_TEXT = "Les répétitions en réserve, c’est le nombre de répétitions propres que tu aurais encore pu faire au moment où tu t’arrêtes. « 3 en réserve » veut dire : tu poses la série alors que tu pourrais en faire encore 3 avec une bonne technique. On ne va jamais jusqu’à l’échec.";


const FIG_LIMIT = "Illustrations schématiques : elles montrent les positions de départ et d’arrivée et la trajectoire, pas chaque détail (rotation du bassin, placement exact des mains). En cas de doute, ce sont les consignes écrites qui font foi.";

/* ---------- Poses (t = 0 départ, t = 1 arrivée) ---------- */
const _F = FIG;
const squatPose = t => ({
  hip: _F.lp([150, 86], [116, 130], t), torso: _F.lerp(-88, -50, t), headTilt: _F.lerp(0, 22, t),
  armN: { a: [_F.lerp(-2, -10, t), _F.lerp(-2, -10, t)] }, armF: { a: [_F.lerp(-1, -9, t), _F.lerp(-1, -9, t)] },
  legN: { ik: [150, 164], bend: -1 }, legF: { ik: [147, 164], bend: -1 }, footN: 0, footF: 0
});
const pushKneePose = t => {
  const th = _F.lerp(-31, -9, t), K = [108, 165];
  return {
    hip: _F.add(K, _F.dir(th, 42)), torso: th,
    legN: { a: [th + 180, 184] }, legF: { a: [th + 180, 182] }, footN: 182, footF: 180,
    armN: { ik: [192, 169], bend: 1 }, armF: { ik: [189, 169], bend: 1 }
  };
};
const pushWallPose = t => {
  const A = [120, 164], th = _F.lerp(-63, -50, t);
  return {
    hip: _F.add(A, _F.dir(th, 81)), torso: th,
    legN: { ik: A, bend: -1 }, legF: { ik: [117, 164], bend: -1 }, footN: 0, footF: 0,
    armN: { ik: [231, 62], bend: 1 }, armF: { ik: [231, 65], bend: 1 }
  };
};
const rowPose = t => ({
  hip: [112, 160], torso: _F.lerp(-84, -90, t), headTilt: _F.lerp(6, 0, t),
  legN: { ik: [194, 163], bend: -1 }, legF: { ik: [191, 163], bend: -1 }, footN: -80, footF: -80,
  armN: { ik: _F.lp([167, 128], [130, 132], t), bend: 1 }, armF: { ik: _F.lp([164, 129], [127, 133], t), bend: 1 }
});
const bridgePose = t => {
  const S = [88, 161], a = _F.lerp(0, -24.4, t);
  return {
    hip: _F.add(S, _F.dir(a, 50)), shoulder: S, headAbs: 180, sw: 0, hw: 0,
    legN: { ik: [176, 165], bend: -1 }, legF: { ik: [173, 165], bend: -1 }, footN: 0, footF: 0,
    armN: { a: [7, 2] }, armF: { a: [6, 1] }
  };
};
const deadBugPose = (t, side = 1) => {
  const mA = { a: [_F.lerp(-90, -177, t), _F.lerp(-90, -177, t)] };
  const mL = { a: [_F.lerp(-90, -10, t), _F.lerp(0, -10, t)] };
  const sA = { a: [-90, -90] }, sL = { a: [-90, 0] };
  const fM = _F.lerp(-65, -85, t), fS = -65;
  const one = side === 1;
  return {
    hip: [140, 161], torso: 180, headAbs: 180, sw: 0, hw: 0,
    armN: one ? mA : sA, armF: one ? sA : mA, legN: one ? sL : mL, legF: one ? mL : sL,
    footN: one ? fS : fM, footF: one ? fM : fS
  };
};
const abdPose = t => {
  const a = _F.lerp(3, -30, t);
  return {
    front: true, hip: [150, 152], torso: 180, sw: 20, hw: 16, torsoW: 9, headAbs: 180,
    legN: { a: [a, a] }, legF: { a: [1, 1] }, footN: a, footF: 1, footS: 0.45,
    armF: { a: [180, 180] }, armN: { ik: [118, 170], bend: -1 }
  };
};
const pullPose = t => {
  const phi = _F.lerp(10, 86, t) * Math.PI / 180, k = Math.sin(phi);
  const hN = [177 + 52 * k, 42], hF = [143 - 52 * k, 42];
  const s = (Math.hypot(52 * k, 6) + 1) / 54;
  return {
    front: true, hip: [160, 85], torso: -90, sw: 34, hw: 18, torsoW: 8, handR: _F.lerp(5.5, 4, t),
    armN: { ik: hN, s1: s, s2: s, bend: 1 }, armF: { ik: hF, s1: s, s2: s, bend: -1 },
    legN: { ik: [172, 166], bend: -1 }, legF: { ik: [148, 166], bend: 1 }, footN: 25, footF: 155, footS: 0.5
  };
};
const plankPose = t => {
  const E = [92, 168], ua = _F.lerp(-81, -90, t);
  const SB = _F.add(E, _F.dir(ua, 28)), K = [181, 164];
  const hip = FIGik(SB, K, 50, 42, 1)[1];
  const tA = _F.ang(hip, SB), th = _F.ang(hip, K);
  const n = _F.dir(tA + 90);
  return {
    hip, shoulder: SB, sw: 0, hw: 6, torsoW: 16, headAbs: tA,
    armF: { a: [ua + 180, ua + 180 + 95], s2: 0.32 },
    armN: { ik: _F.add(hip, _F.mul(n, 9)), bend: -1 },
    legN: { a: [th, th - 35], s2: 0.3 }, legF: { a: [th, th - 30], s2: 0.3 }, footS: 0.01
  };
};
function FIGik(root, target, l1, l2, bend) {
  let d = _F.dist(root, target); const base = _F.ang(root, target);
  d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, d));
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) * 180 / Math.PI;
  const j = _F.add(root, _F.dir(base + bend * a, l1));
  return [root, j, _F.add(j, _F.dir(_F.ang(j, target), l2))];
}
const rowExtras = o => {
  const an = o.legN[2];
  const sole = _F.add(_F.add(an, _F.dir(-80, 6)), _F.dir(10, 4.5));
  const soleF = _F.add(sole, [-3, 0]);
  return {
    bx: _F.P([soleF, o.armF[2]]),
    fx: _F.P([sole, o.armN[2]]),
    fx2: 'M ' + (sole[0] - 2).toFixed(1) + ' ' + (sole[1] - 7).toFixed(1) + ' q 7 7 0 14'
  };
};
const pullExtras = o => ({ fx: _F.P([o.armF[2], o.armN[2]]) });
const pullInset = t => {
  const ph = _F.lerp(10, 86, t);
  const C = [278, 50], sl = [C[0] - 10, C[1]], sr = [C[0] + 10, C[1]];
  const hr = _F.add(sr, _F.dir(-90 + ph, 24)), hl = _F.add(sl, _F.dir(-90 - ph, 24));
  return '<rect class="inset-bg" x="238" y="6" width="80" height="78" rx="10"></rect>' +
    '<path class="fx-band" d="' + _F.P([hl, hr]) + '"></path>' +
    '<path class="fg w-arm-s" d="' + _F.P([sl, hl]) + '"></path><path class="fg w-arm-s" d="' + _F.P([sr, hr]) + '"></path>' +
    '<ellipse class="fg" cx="' + C[0] + '" cy="' + (C[1] + 3) + '" rx="13" ry="5"></ellipse>' +
    '<circle class="fg" cx="' + C[0] + '" cy="' + (C[1] + 2) + '" r="6.5"></circle>' +
    '<text class="inset-t" x="278" y="78" text-anchor="middle">vue de dessus</text>';
};

const SQ_SEQ = [{ hold: 500, label: 'Départ : debout' }, { to: 1, dur: 1800, label: 'Descente contrôlée' }, { hold: 400, label: 'En bas' }, { to: 0, dur: 1100, label: 'Remontée' }];
const SQT_SEQ = [{ hold: 500, label: 'Départ : debout' }, { to: 1, dur: 3000, label: 'Descente en 3 secondes' }, { hold: 400, label: 'En bas' }, { to: 0, dur: 1100, label: 'Remontée' }];
const PUSH_SEQ = [{ hold: 500, label: 'Départ : bras tendus' }, { to: 1, dur: 1700, label: 'Descente' }, { hold: 300, label: 'Poitrine proche du sol' }, { to: 0, dur: 1100, label: 'Poussée' }];
const WALL_SEQ = [{ hold: 500, label: 'Départ : bras tendus' }, { to: 1, dur: 1700, label: 'Descente vers le mur' }, { hold: 300, label: 'Poitrine proche du mur' }, { to: 0, dur: 1100, label: 'Poussée' }];
const ROW_SEQ = [{ hold: 500, label: 'Départ : bras tendus' }, { to: 1, dur: 1200, label: 'Tirage vers le bas des côtes' }, { hold: 500, label: 'Omoplates serrées' }, { to: 0, dur: 1700, label: 'Retour lent' }];
const BRIDGE_SEQ = [{ hold: 600, label: 'Départ : allongé' }, { to: 1, dur: 1300, label: 'Montée des hanches' }, { hold: 700, label: 'Fessiers serrés en haut' }, { to: 0, dur: 1600, label: 'Descente lente' }];
const DB_SEQ = [{ hold: 500, label: 'Départ', side: 1 }, { to: 1, dur: 2000, label: 'Bras droit et jambe gauche s’éloignent', side: 1 }, { hold: 300, label: 'Bas du dos collé', side: 1 }, { to: 0, dur: 1600, label: 'Retour', side: 1 }, { hold: 500, label: 'Changement de côté', side: 2 }, { to: 1, dur: 2000, label: 'Bras gauche et jambe droite s’éloignent', side: 2 }, { hold: 300, label: 'Bas du dos collé', side: 2 }, { to: 0, dur: 1600, label: 'Retour', side: 2 }];
const ABD_SEQ = [{ hold: 500, label: 'Départ : jambes alignées' }, { to: 1, dur: 1300, label: 'Montée de la jambe du dessus' }, { hold: 400, label: 'En haut' }, { to: 0, dur: 1600, label: 'Descente lente' }];
const PULL_SEQ = [{ hold: 500, label: 'Départ : bras devant la poitrine' }, { to: 1, dur: 1300, label: 'Écartement' }, { hold: 500, label: 'Bande près de la poitrine' }, { to: 0, dur: 1700, label: 'Retour contrôlé' }];
const PLANK_SEQ = [{ hold: 600, label: 'Départ : hanches au sol' }, { to: 1, dur: 1100, label: 'Montée des hanches' }, { hold: 2600, label: 'Tenue : genoux, hanches, épaules alignés' }, { to: 0, dur: 1100, label: 'Descente' }];

const EX = {
  squat: {
    name: 'Squat au poids du corps', short: 'Squat', unit: 'reps', range: [8, 12], rest: [90, 120],
    view: 'Vue de profil', pose: squatPose, seq: SQ_SEQ,
    levels: ['Squat standard', 'Pause courte en bas (1 à 2 s)'],
    steps: [
      "Pieds à largeur de hanches ou un peu plus, pointes légèrement ouvertes, poids réparti sur tout le pied.",
      "Bras tendus devant toi pour l’équilibre, ventre gainé.",
      "Descends en poussant les hanches vers l’arrière et en pliant les genoux, genoux dans l’axe des pieds.",
      "Va jusqu’à la profondeur que tu contrôles, talons au sol et dos neutre ; cuisses proches de l’horizontale si c’est confortable.",
      "Remonte en poussant le sol avec tout le pied jusqu’à être debout."
    ],
    errors: ["Genoux qui rentrent vers l’intérieur", "Talons qui décollent ou poids sur les orteils", "Dos qui s’arrondit en bas du mouvement"],
    breath: "Inspire en descendant, expire en remontant. Ne bloque pas ta respiration.",
    easier: "Amplitude réduite : descends moins bas en gardant les talons au sol.",
    prog: "Pause courte en bas, sans relâcher la tension.",
    foot: "Garde le poids sur tout le pied et les talons au sol pour ne pas charger l’avant du pied gauche. Si tu sens une gêne sous les orteils, réduis l’amplitude ou arrête l’exercice."
  },
  squat_tempo: {
    name: 'Squat avec descente de 3 secondes', short: 'Squat 3 s', unit: 'reps', range: [8, 12], rest: [90, 120],
    view: 'Vue de profil', pose: squatPose, seq: SQT_SEQ,
    levels: ['Descente en 3 s', 'Descente en 3 s puis pause courte en bas'],
    steps: [
      "Même placement que le squat : pieds à largeur de hanches, poids sur tout le pied, bras devant.",
      "Descends lentement en comptant trois secondes, hanches vers l’arrière, genoux dans l’axe des pieds.",
      "Garde le dos neutre et les talons au sol jusqu’en bas.",
      "Remonte à vitesse normale en poussant le sol avec tout le pied."
    ],
    errors: ["Descente qui accélère à la fin", "Talons qui décollent ou poids sur les orteils", "Genoux qui rentrent vers l’intérieur"],
    breath: "Inspire pendant la descente lente, expire en remontant.",
    easier: "Descente en 2 secondes ou amplitude réduite.",
    prog: "Pause courte en bas après la descente de 3 secondes.",
    foot: "La descente lente garde le pied longtemps en charge : reste bien à plat, talons au sol. Gêne sous les orteils : réduis l’amplitude ou arrête."
  },
  pushup_knee: {
    name: 'Pompes sur les genoux', short: 'Pompes genoux', unit: 'reps', range: [6, 12], rest: [90, 120],
    view: 'Vue de profil', pose: pushKneePose, seq: PUSH_SEQ, variant: 'Genoux',
    levels: ['Genoux, descente contrôlée', 'Genoux, descente en 2 à 3 s', 'Genoux, descente en 2 à 3 s et pause courte en bas'],
    steps: [
      "Genoux sur le tapis, pieds relâchés posés sur le tapis : orteils non repliés, aucun appui dessus.",
      "Mains au sol un peu plus larges que les épaules, sous la poitrine.",
      "Aligne genoux, hanches, épaules et tête ; gaine le ventre et serre les fessiers.",
      "Descends la poitrine vers le sol, coudes à environ 45° du corps.",
      "Pousse le sol pour revenir bras tendus, sans verrouiller brutalement les coudes."
    ],
    errors: ["Hanches qui s’affaissent ou qui montent", "Coudes très écartés, à 90° du corps", "Tête qui tombe vers le sol"],
    breath: "Inspire en descendant, expire en poussant.",
    easier: "Pompes au mur (bouton « Mur » pendant la séance).",
    prog: "Descente plus lente, puis courte pause en bas. Les pompes classiques sur les pieds viendront ensuite.",
    foot: "Pieds relâchés : dessus du pied posé sur le tapis ou chevilles croisées en l’air. Ne replie pas les orteils et ne mets aucun appui dessus."
  },
  pushup_wall: {
    name: 'Pompes au mur', short: 'Pompes mur', unit: 'reps', range: [6, 12], rest: [90, 120],
    view: 'Vue de profil', pose: pushWallPose, seq: WALL_SEQ, wall: 232, variant: 'Mur',
    levels: ['Mur, pieds proches', 'Mur, pieds un demi-pas plus loin', 'Mur, pieds un pas plus loin'],
    steps: [
      "Debout face à un mur, pieds à environ un grand pas du mur, à largeur de hanches.",
      "Mains à plat sur le mur à hauteur d’épaules, un peu plus larges que les épaules.",
      "Corps aligné de la tête aux talons, ventre gainé.",
      "Plie les coudes pour approcher la poitrine du mur.",
      "Pousse le mur pour revenir bras tendus."
    ],
    errors: ["Hanches cassées vers l’arrière", "Épaules qui montent vers les oreilles", "Tête qui avance vers le mur avant la poitrine"],
    breath: "Inspire en approchant du mur, expire en poussant.",
    easier: "Pieds plus proches du mur.",
    prog: "Recule les pieds par petits pas, dans la variante au mur.",
    foot: "Pieds à plat, chaussures possibles. Plus les pieds sont loin du mur, plus l’avant du pied est chargé : si le pied gauche le ressent, rapproche-toi du mur."
  },
  row_band: {
    name: 'Tirage assis avec bande', short: 'Tirage bande', unit: 'reps', range: [10, 15], rest: [90, 120], band: true,
    view: 'Vue de profil', pose: rowPose, seq: ROW_SEQ, extras: rowExtras,
    steps: [
      "Assieds-toi sur le tapis, jambes allongées, genoux légèrement fléchis, chaussures aux pieds.",
      "Passe la bande autour du milieu des semelles, sous la voûte plantaire et non sous les orteils. Vérifie qu’elle est centrée.",
      "Tiens une extrémité dans chaque main, bras tendus, buste droit, épaules basses.",
      "Tire les mains vers le bas des côtes en ramenant les coudes vers l’arrière, près du corps ; serre les omoplates.",
      "Reviens lentement bras tendus en gardant la tension, sans pencher le buste."
    ],
    errors: ["Balancer le buste en arrière pour tirer", "Hausser les épaules", "Laisser la bande glisser vers la pointe des pieds"],
    breath: "Expire en tirant, inspire en revenant.",
    easier: "Prises plus loin des pieds (bande moins tendue) ou bande plus souple.",
    prog: "Légère augmentation de tension : prises un peu plus près des pieds, ou bande plus résistante.",
    foot: "Garde tes chaussures : la bande passe sous la semelle, jamais directement sur les orteils. Les pieds servent d’ancrage, ils ne poussent pas.",
    safety: "Avant chaque séance, vérifie la bande : ni entaille, ni zone blanchie ou collante. Elle doit rester au milieu des semelles : si elle glisse vers la pointe, elle peut s’échapper et revenir d’un coup. Tire vers le bas des côtes pour garder la trajectoire loin du visage. Bande abîmée ou doute : ne l’utilise pas."
  },
  glute_bridge: {
    name: 'Pont fessier à deux jambes', short: 'Pont fessier', unit: 'reps', range: [10, 15], rest: [60, 90],
    view: 'Vue de profil', pose: bridgePose, seq: BRIDGE_SEQ,
    levels: ['Pont standard', 'Pause de 2 s en haut'],
    steps: [
      "Allongé sur le dos, genoux fléchis, pieds à plat à largeur de hanches, bras le long du corps.",
      "Rentre légèrement le bassin pour poser le bas du dos sur le tapis.",
      "Pousse dans les talons et tout le pied pour monter les hanches jusqu’à aligner épaules, hanches et genoux.",
      "Serre les fessiers en haut sans cambrer le bas du dos.",
      "Redescends lentement jusqu’au tapis."
    ],
    errors: ["Cambrer le bas du dos en haut", "Pousser avec les orteils ou décoller les talons", "Genoux qui s’ouvrent ou se rapprochent"],
    breath: "Expire en montant, inspire en descendant.",
    easier: "Monte moins haut, en gardant les fessiers serrés.",
    prog: "Pause de 2 secondes en haut.",
    foot: "Pousse surtout dans les talons, orteils détendus. Chaussures possibles."
  },
  dead_bug: {
    name: 'Dead bug', short: 'Dead bug', unit: 'reps', range: [6, 10], rest: [60, 60], perSide: true,
    view: 'Vue de profil · un côté puis l’autre', pose: deadBugPose, seq: DB_SEQ,
    levels: ['Amplitude confortable', 'Amplitude accrue sans creuser le dos'],
    steps: [
      "Allongé sur le dos, bras tendus vers le plafond, hanches et genoux pliés à 90°.",
      "Expire et pose le bas du dos sur le tapis.",
      "Éloigne lentement un bras au-dessus de la tête et la jambe opposée vers l’avant, sans toucher le sol.",
      "Reviens au centre, puis change de côté. Les répétitions se comptent par côté.",
      "Arrête la série dès que le bas du dos se décolle."
    ],
    errors: ["Bas du dos qui se décolle du tapis", "Mouvement rapide ou par à-coups", "Respiration bloquée"],
    breath: "Expire pendant que le bras et la jambe s’éloignent, inspire en revenant.",
    easier: "Bouge seulement les jambes (genou plié, talon qui descend vers le sol) ou seulement les bras.",
    prog: "Amplitude accrue, bras et jambe plus près du sol, toujours sans creuser le dos.",
    foot: "Aucun appui sur les pieds. Cheville détendue ; si le pied effleure le sol, pose le talon, pas les orteils.",
    stopRule: "Arrête la série avant de perdre la posture : dès que le bas du dos se décolle, la série est finie."
  },
  side_abduction: {
    name: 'Abduction de hanche couché sur le côté', short: 'Abduction', unit: 'reps', range: [12, 20], rest: [60, 60], perSide: true,
    view: 'Vue de face', pose: abdPose, seq: ABD_SEQ,
    levels: ['Abduction standard', 'Pause en haut (1 à 2 s)'],
    steps: [
      "Allongé sur le côté, corps aligné, tête posée sur le bras du dessous.",
      "Jambe du dessous légèrement fléchie si tu as besoin de stabilité ; jambe du dessus tendue dans le prolongement du corps.",
      "Main du dessus posée au sol devant la poitrine.",
      "Monte la jambe du dessus d’environ 30 à 45°, pointe du pied orientée vers l’avant, sans basculer le bassin.",
      "Redescends lentement, puis change de côté après la série."
    ],
    errors: ["Bassin qui bascule vers l’arrière", "Jambe qui part vers l’avant au lieu de monter", "Monter trop haut en compensant avec le dos"],
    breath: "Expire en montant, inspire en descendant.",
    easier: "Amplitude plus petite.",
    prog: "Pause en haut.",
    foot: "Aucun appui sur les pieds. Pied relâché, sans crisper les orteils."
  },
  band_pull_apart: {
    name: 'Écartement de bande devant la poitrine', short: 'Écartement bande', unit: 'reps', range: [10, 15], rest: [60, 90], band: true,
    view: 'Vue de face et vue de dessus', pose: pullPose, seq: PULL_SEQ, extras: pullExtras, inset: pullInset,
    steps: [
      "Debout, pieds à largeur de hanches, genoux souples.",
      "Tiens la bande à deux mains, bras tendus devant la poitrine, mains à largeur d’épaules, paumes vers le bas.",
      "Écarte les mains en ouvrant les bras sur les côtés jusqu’à ce que la bande approche la poitrine.",
      "Serre les omoplates sans hausser les épaules.",
      "Reviens lentement en contrôlant la bande."
    ],
    errors: ["Plier fortement les coudes", "Hausser les épaules", "Cambrer le dos pour finir le mouvement"],
    breath: "Expire en écartant, inspire en revenant.",
    easier: "Mains plus écartées sur la bande, ou bande plus souple.",
    prog: "Légère augmentation de tension : mains un peu plus rapprochées, ou bande plus résistante.",
    foot: "Debout pieds à plat, poids réparti sur les deux pieds. Chaussures possibles.",
    safety: "Vérifie la bande avant la séance. Garde-la à hauteur de poitrine, jamais au niveau du visage."
  },
  side_plank_knee: {
    name: 'Gainage latéral sur les genoux', short: 'Gainage latéral', unit: 'sec', range: [15, 30], rest: [60, 60], perSide: true,
    view: 'Vue de face', pose: plankPose, seq: PLANK_SEQ,
    steps: [
      "Allongé sur le côté, avant-bras au sol, coude sous l’épaule.",
      "Genoux fléchis à 90°, pieds en arrière, dans le prolongement du corps.",
      "Monte les hanches pour aligner genoux, hanches, épaules et tête.",
      "Tiens la position en respirant normalement. Garde environ 5 secondes de tenue propre en réserve.",
      "Redescends, puis fais l’autre côté."
    ],
    errors: ["Hanches qui s’affaissent", "Hanches qui reculent, corps cassé en deux", "Épaule qui s’enfonce vers l’oreille"],
    breath: "Respiration lente et continue pendant toute la tenue.",
    easier: "Tenue plus courte, hanches un peu moins hautes.",
    prog: "Ajoute 5 secondes de tenue, jusqu’à 30 secondes.",
    foot: "Appui sur les genoux, pieds relâchés : aucun appui sur les orteils."
  }
};
