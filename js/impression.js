/* ===== Version A4 imprimable ===== */
function renderPrint() {
  const el = document.getElementById('print');
  const st = S.plan.startDate, n = S.plan.seq.length, p = S.profile;
  let h = '<div class="pr-bar"><a class="btn" href="#program">' + I.back + ' Retour</a>' +
    (FRAMED ? '<p>Aperçu A4. L’impression est bloquée dans la version affichée dans Claude : ouvre la version installable pour « Imprimer » puis « Enregistrer en PDF », ou utilise le PDF fourni avec l’application.</p>'
      : '<button class="btn primary" data-act="doPrint">Imprimer ou enregistrer en PDF</button><p>Dans la fenêtre d’impression, choisis « Enregistrer en PDF », format A4, échelle 100 %, et active « Graphiques d’arrière-plan » pour garder les couleurs des tableaux.</p>') + '</div>';
  h += '<div class="pr">';
  h += '<h1>Élan · Programme 8 semaines' + (p.name ? ' · ' + esc(p.name) : '') + '</h1>';
  h += '<p class="lead">' + (bodyLine(p, 'poids de départ') ? bodyLine(p, 'poids de départ') + '. ' : '') + 'Objectif : prendre progressivement du poids et du muscle, gagner en force, améliorer la condition physique. Débutant en musculation, entraînement à domicile avec un tapis et de grandes bandes élastiques (résistance non indiquée). Disponibilité : 35 à 50 minutes par séance.</p>';
  h += '<p class="lead"><b>' + (st ? 'Du ' + fmtDl(st) + ' ' + pd(st).getFullYear() + ' au ' + fmtDl(addD(st, n * 7 - 1)) + ' ' + pd(addD(st, n * 7 - 1)).getFullYear() : 'Date de départ à choisir : la semaine 1 commence un lundi.') + '</b>' + (n > 8 ? ' (' + (n - 8) + ' semaine' + (n > 9 ? 's' : '') + ' répétée' + (n > 9 ? 's' : '') + ')' : '') + '</p>';

  // calendrier
  h += '<h2>Calendrier</h2><div class="tw"><table class="cal"><thead><tr><th>Semaine</th><th>Dates</th>' + DOWS.map(d => '<th>' + d + '</th>').join('') + '</tr></thead><tbody>';
  for (let i = 0; i < n; i++) {
    const pw = S.plan.seq[i], rep = S.plan.seq.slice(0, i).includes(pw);
    h += '<tr><td><b>S' + pw + (rep ? ' bis' : '') + '</b></td><td>' + (st ? fmtShort(weekStart(i)) + '–' + fmtShort(addD(weekStart(i), 6)) : '') + '</td>';
    for (let d = 0; d < 7; d++) {
      const t = DAYTYPE[d];
      if (t === 'strength') { const k = { 0: 0, 2: 1, 4: 2 }[d]; h += '<td class="s">' + (pw % 2 ? ['A', 'B', 'A'] : ['B', 'A', 'B'])[k] + '</td>'; }
      else if (t === 'run') h += '<td class="c">' + S.plan.runs[pw][d === 1 ? 'tue' : 'sat'] + ' min</td>';
      else if (t === 'mobility') h += '<td>Repos / mob.</td>';
      else h += '<td>Repos</td>';
    }
    h += '</tr>';
  }
  h += '</tbody></table></div><p class="meta">A, B : séances de musculation. Durées de course : footing facile, hors 5 min de marche au début et à la fin. Le badminton occasionnel remplace une sortie, il ne s’ajoute pas.</p>';

  // paramètres
  h += '<h2>Séries, réserve et course par semaine</h2><div class="tw"><table><thead><tr><th>Semaine</th><th>Séries principaux</th><th>Séries complém.</th><th>En réserve</th><th>Course mar. / sam.</th><th>Remarque</th></tr></thead><tbody>' +
    WEEKS.map(w => '<tr><td><b>S' + w.n + '</b></td><td>' + w.setsMain + '</td><td>' + w.setsComp + '</td><td>' + rirLabel(w.rir[0], w.rir[1]) + '</td><td>' + S.plan.runs[w.n].tue + ' / ' + S.plan.runs[w.n].sat + ' min</td><td>' + w.note + '</td></tr>').join('') + '</tbody></table></div>';
  h += '<p class="meta"><b>Répétitions en réserve.</b> ' + RIR_TEXT + '</p>';

  // séances
  h += '<div class="cols pb">' + ['A', 'B'].map(k => '<div><h2>Séance ' + k + '</h2><table><thead><tr><th>#</th><th>Exercice</th><th>Fourchette</th><th>Repos</th></tr></thead><tbody>' +
    SESSIONS[k].map((sl, i) => '<tr><td>' + (i + 1) + '</td><td>' + EX[sl.ex].name + (sl.alt ? ' <span class="meta">(ou au mur)</span>' : '') + '<br><span class="meta">' + (i < 3 ? 'Principal' : 'Complémentaire') + '</span></td><td>' + rangeLabel(sl.ex) + '</td><td>' + restLabel(sl.ex) + '</td></tr>').join('') + '</tbody></table></div>').join('') + '</div>';
  h += '<div class="box" style="margin-top:10px"><h3>Échauffement 6 à 8 min, avant chaque séance</h3><ul style="margin:0;padding-left:16px">' + WARMUP.map(w => '<li>' + w + '</li>').join('') + '</ul></div>';

  // règles
  h += '<h2>Règles de progression</h2><div class="cols"><div class="box"><h3>Musculation</h3><ul style="margin:0;padding-left:16px">' +
    '<li>Quand un exercice atteint le haut de sa fourchette sur toutes les séries pendant deux séances, avec une technique propre et la réserve prévue, une petite augmentation de difficulté est proposée. Ensuite, repartir en bas de la fourchette.</li>' +
    '<li>Aucune augmentation n’est appliquée sans ta validation. Les séances allégées ne comptent pas.</li>' +
    '<li>La technique prime sur les chiffres. Dead bug : arrêter avant la perte de posture.</li>' +
    '<li>Bandes : noter la bande et le réglage des prises, jamais de charge en kilogrammes.</li>' +
    '<li>Fatigue : version allégée (une série de moins, une répétition de plus en réserve) ou semaine répétée. Une séance manquée ne se rattrape pas en double.</li></ul></div>' +
    '<div class="box"><h3>Course</h3><ul style="margin:0;padding-left:16px">' + RUN_RULES.map(r => '<li>' + r + '</li>').join('') + '</ul></div></div>';

  // fiches
  h += '<h2 class="pb">Fiches exercices</h2><p class="meta">' + FIG_LIMIT + ' Personnage clair : côté visible. Personnage gris : côté opposé.</p><div class="exs">';
  for (const id of ['squat', 'squat_tempo', 'pushup_knee', 'pushup_wall', 'row_band', 'glute_bridge', 'dead_bug', 'side_abduction', 'band_pull_apart', 'side_plank_knee']) {
    const ex = EX[id];
    h += '<div class="exc"><h3>' + ex.name + '</h3><p class="meta">' + ex.view + ' · ' + rangeLabel(id) + ' · repos ' + restLabel(id) + '</p>' + pairHTML(id) +
      '<div><span class="k">Étapes</span><ol>' + ex.steps.map(s => '<li>' + s + '</li>').join('') + '</ol></div>' +
      '<div><span class="k">Erreurs fréquentes :</span> ' + ex.errors.join(' ; ') + '.</div>' +
      '<div><span class="k">Respiration :</span> ' + ex.breath + '</div>' +
      '<div><span class="k">Plus facile :</span> ' + ex.easier + '</div>' +
      '<div><span class="k">Progression :</span> ' + ex.prog + '</div>' +
      (ex.stopRule ? '<div><span class="k">Arrêt :</span> ' + ex.stopRule + '</div>' : '') +
      (ex.safety ? '<div><span class="k">Bande :</span> ' + ex.safety + '</div>' : '') + '</div>';
  }
  h += '</div>';

  // suivi
  h += '<h2 class="pb">Suivi</h2><p class="meta">Les cases déjà remplies viennent de tes saisies dans l’application' + (Object.keys(S.sessions).length || S.weights.length ? '' : ' (aucune pour l’instant)') + '. Les autres sont à compléter à la main.</p>';
  h += '<div class="tw"><table class="blank"><thead><tr><th>Semaine</th><th>Lun</th><th>Mar (course)</th><th>Mer</th><th>Ven</th><th>Sam (course)</th><th>Pesée 1</th><th>Pesée 2</th><th>Pesée 3</th><th>Moyenne</th><th>Shakers</th></tr></thead><tbody>';
  const ww = weeklyWeights();
  for (let i = 0; i < n; i++) {
    const pw = S.plan.seq[i], rep = S.plan.seq.slice(0, i).includes(pw);
    const ws = st ? weekStart(i) : null;
    const cell = d => { if (!ws) return ''; const date = addD(ws, d), t = DAYTYPE[d]; if (t === 'strength') { const s = S.sessions[date]; return s && s.status === 'done' ? '✓ ' + s.kind : ''; } const r = S.runs[date]; return r ? (r.kind === 'skipped' ? '—' : r.minutes + ' min') : ''; };
    const wl = ws ? S.weights.filter(w => w.date >= ws && w.date <= addD(ws, 6)).sort((a, b) => a.date.localeCompare(b.date)) : [];
    const avg = ws ? ww.find(w => w.week === ws) : null;
    h += '<tr><td><b>S' + pw + (rep ? ' bis' : '') + '</b></td><td>' + cell(0) + '</td><td>' + cell(1) + '</td><td>' + cell(2) + '</td><td>' + cell(4) + '</td><td>' + cell(5) + '</td>' +
      [0, 1, 2].map(k => '<td>' + (wl[k] ? num(wl[k].kg, 1) : '') + '</td>').join('') + '<td>' + (avg ? num(avg.avg, 2) : '') + '</td><td>' + (ws ? shakeDaysInWeek(ws) + '/7' : '') + '</td></tr>';
  }
  h += '</tbody></table></div>';
  h += '<div class="box" style="margin-top:10px"><h3>Poids et alimentation</h3><ul style="margin:0;padding-left:16px"><li>Pesée trois matins par semaine, après les toilettes et avant de manger. On regarde la moyenne de la semaine, jamais une pesée seule.</li><li>Repère de départ : environ ' + p.gainLowG + ' à ' + p.gainHighG + ' g par semaine, ajustable, sans promesse de résultat.</li><li>Shaker du matin de 400 à 500 kcal en plus de l’alimentation habituelle. Repère protéines : environ ' + p.proteinG + ' g par jour, shaker compris.</li><li>Si la moyenne ne monte pas pendant deux à trois semaines avec une alimentation régulière : envisager environ 100 à 150 kcal de plus par jour, à confirmer.</li></ul>' +
    (p.recipe.text ? '<p style="margin-top:6px"><b>Ma recette :</b> ' + esc(p.recipe.text).replace(/\n/g, '<br>') + (p.recipe.kcal ? ' · ' + p.recipe.kcal + ' kcal' : '') + (p.recipe.protein ? ' · ' + p.recipe.protein + ' g de protéines' : '') + '</p>' : '<p style="margin-top:6px"><b>Ma recette :</b> ______________________________________________ kcal : ______ protéines : ______ g</p>') + '</div>';
  h += '<h3 style="margin-top:14px">Niveaux actuels</h3><div class="tw"><table><thead><tr><th>Exercice</th><th>Niveau</th><th>Dernières séries</th><th>Bande / réglage</th></tr></thead><tbody>' +
    ['squat', 'squat_tempo', 'pushup_knee', 'pushup_wall', 'row_band', 'glute_bridge', 'dead_bug', 'side_abduction', 'band_pull_apart', 'side_plank_knee'].map(id => { const l = lastLogOf(id); return '<tr><td>' + EX[id].name + '</td><td>' + levelLabel(id) + '</td><td>' + (l ? l.e.sets.map(x => x.reps).join(' · ') + unitShort(EX[id]) + ' (' + fmtShort(l.s.date) + ')' : '') + '</td><td>' + (l && l.e.band ? esc(l.e.band) + (l.e.grip ? ', ' + esc(l.e.grip) : '') : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  h += '<p class="meta" style="margin-top:14px">Version imprimable générée le ' + new Date().toLocaleDateString('fr-FR') + '. Ce programme ne remplace pas un avis médical.</p></div>';
  el.innerHTML = h;
}
