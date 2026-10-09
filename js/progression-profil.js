/* ===== Progression et Profil ===== */
function weightChart() {
  const ws = weeklyWeights();
  if (ws.length < 2) return '<p class="note">Le graphique apparaît dès deux semaines de pesées.</p>';
  const W = 320, H = 150, L = 34, Rr = 10, T = 26, B = 24;
  const first = ws[0].week, span = Math.max(1, diffD(first, ws[ws.length - 1].week) / 7);
  const g = S.profile, gl = g.gainLowG / 1000, gh = g.gainHighG / 1000;
  const vals = ws.map(w => w.avg).concat([ws[0].avg + gh * span]);
  let lo = Math.min(...vals) - 0.3, hi = Math.max(...vals) + 0.3;
  if (hi - lo < 1.2) { const m = (hi + lo) / 2; lo = m - 0.6; hi = m + 0.6; }
  const x = w => L + (diffD(first, w) / 7) / span * (W - L - Rr);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  const x0 = x(first), xN = x(ws[ws.length - 1].week), y0 = ws[0].avg;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Moyennes hebdomadaires du poids"><defs><linearGradient id="wgrad" x1="0" x2="0" y1="0" y2="1"><stop class="g0" offset="0"/><stop class="g1" offset="1"/></linearGradient></defs>';
  [lo + 0.15 * (hi - lo), (lo + hi) / 2, hi - 0.15 * (hi - lo)].forEach(v => { s += '<line class="gl" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"></line><text x="' + (L - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + num(v, 1) + '</text>'; });
  s += '<polygon class="band" points="' + x0 + ',' + y(y0) + ' ' + xN + ',' + y(y0 + gh * span) + ' ' + xN + ',' + y(y0 + gl * span) + '"></polygon>';
  const pts = ws.map(w => [x(w.week), y(w.avg)]);
  const d = pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  s += '<path class="ar" d="M' + d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - B) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - B) + ' Z"></path><path class="ln" d="M' + d + '"></path>';
  pts.forEach((p, i) => { s += '<circle class="pt' + (i === pts.length - 1 ? ' last' : '') + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (ws[i].n >= 2 ? 4.5 : 3) + '"></circle>'; });
  const lp = pts[pts.length - 1], lab = num(ws[ws.length - 1].avg, 1), tw = lab.length * 6.4 + 12, tx = Math.min(W - tw - 2, Math.max(L, lp[0] - tw / 2)), ty = Math.max(0, lp[1] - 30);
  s += '<g class="tag"><rect x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" width="' + tw.toFixed(1) + '" height="19" rx="9.5"></rect><text x="' + (tx + tw / 2).toFixed(1) + '" y="' + (ty + 13).toFixed(1) + '" text-anchor="middle">' + lab + '</text></g>';
  s += '<text x="' + x0 + '" y="' + (H - 6) + '">' + fmtShort(first) + '</text><text x="' + xN + '" y="' + (H - 6) + '" text-anchor="end">' + fmtShort(ws[ws.length - 1].week) + '</text></svg>';
  return '<div class="chart">' + s + '</div><p class="note">Moyennes par semaine. Zone colorée : repère ' + g.gainLowG + '–' + g.gainHighG + ' g/sem., sans promesse.</p>';
}
const PTABS = [['poids', 'Poids'], ['force', 'Force'], ['course', 'Course'], ['seances', 'Séances']];
function scrProgress() {
  const ci = calInfo(today());
  const ready = progressIds().filter(id => suggestion(id).state === 'ready').length;
  let h = '<section class="screen' + stg() + '"><header class="top"><div><div class="eyebrow">Progression</div><h1 class="title-xl">Ton <em>suivi</em></h1></div></header>';
  if (!ci.noStart && (ci.after || (!ci.before && ci.pw === 8 && ci.idx === S.plan.seq.length - 1))) h += bilanCard();
  h += '<div class="seg" role="tablist">' + PTABS.map(([k, l]) => '<button role="tab" class="' + (ui.ptab === k ? 'on' : '') + '" data-act="setPtab" data-v="' + k + '" aria-selected="' + (ui.ptab === k) + '">' + l + (k === 'force' && ready ? ' <span class="pill solid" style="padding:2px 6px;font-size:11px">' + ready + '</span>' : '') + '</button>').join('') + '</div>';
  h += '<div class="stack' + (ANIM ? ' stagger' : '') + '" style="gap:12px">' + ({ poids: tabWeight, force: tabForce, course: tabRuns, seances: tabSessions })[ui.ptab]() + '</div>';
  return h + '</section>';
}
function tabWeight() {
  const ws = weeklyWeights(), thisW = ws.find(w => w.week === mondayOf(today())), tr = weightTrend();
  let h = '<section class="card"><div class="row between" style="align-items:flex-end"><div><div class="eyebrow">Moyenne cette semaine</div><div class="bignum" style="margin-top:4px">' + (thisW ? num(thisW.avg, 1) : '—') + '<small>kg</small></div></div>' +
    '<div style="text-align:right">' + (tr ? '<div class="bignum" style="font-size:26px;color:' + (tr.perWeekG > 0 ? 'var(--acc)' : 'var(--fg)') + '">' + (tr.perWeekG >= 0 ? '+' : '') + Math.round(tr.perWeekG) + '<small>g/sem.</small></div>' : '') + '<div class="note">' + (thisW ? plural(thisW.n, 'mesure') : 'aucune pesée') + '</div></div></div>';
  if (thisW && thisW.n === 1) h += '<p class="note">Une seule pesée : trop tôt pour conclure.</p>';
  h += weightChart();
  h += '<div class="grid2"><input class="input" type="date" id="wDate" value="' + (ui.weightDate || today()) + '" max="' + today() + '" aria-label="Date de la pesée"><input class="input" type="text" inputmode="decimal" autocomplete="off" id="wKg" placeholder="Poids (kg)" aria-label="Poids en kg"></div><button class="btn primary block" data-act="addWeight">Enregistrer la pesée</button></section>';
  if (S.weights.length) h += '<div class="group">' + listRow('weightsSheet', 'scale', 'n', 'Historique des pesées', plural(S.weights.length, 'pesée') + ' · ' + plural(ws.length, 'semaine')) + '</div>';
  const ks = kcalSuggestion(), m = mondayOf(today());
  const kc = Object.keys(S.shakes).filter(d => d >= m && S.shakes[d].taken && typeof S.shakes[d].kcal === 'number').map(d => S.shakes[d].kcal);
  h += '<section class="card"><div class="eyebrow">Alimentation</div><div class="mini3"><div><b>' + shakeDaysInWeek(m) + '/7</b><span>shakers</span></div><div><b>' + (kc.length ? Math.round(kc.reduce((a, b) => a + b, 0) / kc.length) : '—') + '</b><span>kcal / shaker</span></div><div><b>' + S.profile.proteinG + ' g</b><span>protéines / jour</span></div></div>';
  if (ks) h += alertBox('acc', 'info', '<b>À confirmer :</b> moyenne stable depuis le ' + fmtD(ks.weeks[0].week) + ' malgré le shaker. Si tu manges régulièrement, envisage environ 100 à 150 kcal de plus par jour.<div class="btns" style="margin-top:10px"><button class="btn sm primary" data-act="kcalYes">J’ajoute 100–150 kcal</button><button class="btn sm" data-act="kcalNo">Pas maintenant</button></div>');
  if (S.profile.nutritionNotes.length) h += '<div class="list">' + S.profile.nutritionNotes.slice().reverse().map(n => '<div class="li"><div><div class="t">' + esc(n.text) + '</div><div class="s">' + fmtDL(n.date) + '</div></div></div>').join('') + '</div>';
  return h + '</section>';
}
function weightsSheet() {
  const fn = () => {
    const ws = weeklyWeights();
    return sheetHead('Pesées') + (ws.length ? '<div class="tablewrap"><table class="t"><thead><tr><th>Semaine du</th><th class="r">Moyenne</th><th class="r">Mesures</th></tr></thead><tbody>' + ws.slice().reverse().map(w => '<tr><td>' + fmtD(w.week) + '</td><td class="r">' + num(w.avg, 2) + ' kg</td><td class="r">' + w.n + '</td></tr>').join('') + '</tbody></table></div>' : '') +
      '<div class="list">' + S.weights.slice().sort((a, b) => b.date.localeCompare(a.date)).map(w => '<div class="li"><div><div class="t tnum">' + num(w.kg, 1) + ' kg</div><div class="s">' + fmtDL(w.date) + '</div></div><button class="btn sm ghost" data-act="delWeight" data-date="' + w.date + '">Supprimer</button></div>').join('') + '</div>';
  };
  openSheet(fn(), fn);
}
/* ---- courbe de force : meilleure série par séance, niveaux, première séance contre maintenant ---- */
function exHistory(id) {
  return Object.values(S.sessions).filter(x => x.status === 'done').sort((a, b) => a.date.localeCompare(b.date))
    .map(x => { const e = x.ex.find(y => y.id === id && !y.skipped && y.sets.length); return e ? { date: x.date, wk: x.idx != null ? x.idx + 1 : null, best: Math.max(...e.sets.map(z => z.reps)), total: e.sets.reduce((a, z) => a + z.reps, 0), level: e.level || 0, reduced: !!x.reduced } : null; })
    .filter(Boolean);
}
function lvlShort(id, l) { const ex = EX[id]; if (ex.unit === 'sec') return 'cible ' + targetSec(id, l) + ' s'; if (ex.band) return l ? 'tension +' + l : 'tension de départ'; return ex.levels[Math.min(l, ex.levels.length - 1)]; }
function forceDelta(id) {
  const hs = exHistory(id); if (hs.length < 2) return null;
  const a = hs[0], b = hs[hs.length - 1], dl = b.level - a.level, d = b.best - a.best;
  return { a, b, dl, d, pct: a.best ? Math.round(d / a.best * 100) : 0 };
}
function deltaPill(fd, ex) {
  if (!fd) return '';
  if (fd.dl > 0) return pill('+' + fd.dl + ' niv.', 'solid');
  return pill((fd.d >= 0 ? '+' : '') + fd.d + (ex.unit === 'sec' ? ' s' : ' rép.'), fd.d > 0 ? 'acc' : '');
}
function sparkSVG(hs) {
  if (hs.length < 2) return '';
  const W = 76, H = 26, vals = hs.map(h => h.best + h.level * 1000), lo = Math.min(...vals), hi = Math.max(...vals), r = hi - lo || 1;
  const pts = hs.map((h, i) => [(i / (hs.length - 1) * (W - 6) + 3).toFixed(1), (H - 4 - (vals[i] - lo) / r * (H - 8)).toFixed(1)]);
  return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="M' + pts.map(p => p.join(' ')).join(' L') + '"/><circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="2.6"/></svg>';
}
function forceChart(id) {
  const hs = exHistory(id), ex = EX[id], u = ex.unit === 'sec' ? ' s' : '';
  if (!hs.length) return '<p class="note">La courbe apparaît après ta première séance avec cet exercice.</p>';
  const W = 320, H = 168, L = 30, Rr = 12, T = 30, B = 26, n = hs.length;
  const vals = hs.map(h => h.best); let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi - lo < 4) { lo -= 2; hi += 2; } lo = Math.max(0, Math.floor(lo - 1)); hi = Math.ceil(hi + 1);
  const x = i => n === 1 ? (L + W - Rr) / 2 : L + i / (n - 1) * (W - L - Rr), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let g = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Meilleure série par séance"><defs><linearGradient id="fgrad" x1="0" x2="0" y1="0" y2="1"><stop class="g0" offset="0"/><stop class="g1" offset="1"/></linearGradient></defs>';
  [lo, (lo + hi) / 2, hi].forEach(v => { g += '<line class="gl" x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"></line><text x="' + (L - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + Math.round(v) + '</text>'; });
  hs.forEach((h, i) => { if (i && h.level !== hs[i - 1].level) { const xx = ((x(i - 1) + x(i)) / 2).toFixed(1); g += '<line class="lvl" x1="' + xx + '" x2="' + xx + '" y1="' + (T - 14) + '" y2="' + (H - B) + '"></line><text class="lvlt" x="' + xx + '" y="' + (T - 18) + '" text-anchor="middle">Niv. ' + (h.level + 1) + '</text>'; } });
  const pts = hs.map((h, i) => [x(i), y(h.best)]), d = pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  if (n > 1) g += '<path class="ar" style="fill:url(#fgrad)" d="M' + d + ' L' + pts[n - 1][0].toFixed(1) + ' ' + (H - B) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - B) + ' Z"></path><path class="ln" d="M' + d + '"></path>';
  pts.forEach((p, i) => { g += '<circle class="pt' + (i === n - 1 ? ' last' : '') + (hs[i].reduced ? ' red' : '') + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"></circle>'; });
  const lp = pts[n - 1], lab = hs[n - 1].best + u, tw = lab.length * 6.4 + 12, tx = Math.min(W - tw - 2, Math.max(L, lp[0] - tw / 2)), ty = Math.max(0, lp[1] - 30);
  g += '<g class="tag"><rect x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" width="' + tw.toFixed(1) + '" height="19" rx="9.5"></rect><text x="' + (tx + tw / 2).toFixed(1) + '" y="' + (ty + 13).toFixed(1) + '" text-anchor="middle">' + lab + '</text></g>';
  const wl = h => h.wk ? 'S' + h.wk : fmtShort(h.date);
  g += '<text x="' + x(0).toFixed(1) + '" y="' + (H - 6) + '"' + (n === 1 ? ' text-anchor="middle"' : '') + '>' + wl(hs[0]) + '</text>' + (n > 1 ? '<text x="' + x(n - 1).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="end">' + wl(hs[n - 1]) + '</text>' : '') + '</svg>';
  let h = '<div class="chart">' + g + '</div>';
  const fd = forceDelta(id);
  if (fd) {
    const side = (t, r) => '<div><span class="eyebrow">' + t + (r.wk ? ' · S' + r.wk : '') + '</span><b class="tnum">' + r.best + '<small>' + unitShort(ex) + '</small></b><span class="note">' + esc(lvlShort(id, r.level)) + '</span></div>';
    h += '<div class="vs">' + side('Première séance', fd.a) + '<span class="vs-arrow">' + I.fwd + '</span>' + side('Dernière séance', fd.b) + '</div>';
    h += '<p class="note">' + (fd.dl > 0 ? 'Tu as monté ' + plural(fd.dl, 'niveau') + ' : à chaque niveau, tu repars en bas de la fourchette, c’est normal que les répétitions redescendent.' : fd.d > 0 ? '+' + fd.d + (ex.unit === 'sec' ? ' s' : ' répétitions') + ' sur ta meilleure série (' + (fd.pct > 0 ? '+' + fd.pct + ' %' : '') + ').' : 'Même niveau, même meilleure série : la régularité finit par payer.') + '</p>';
  }
  return h + '<p class="note">Meilleure série de chaque séance. Les points creux sont des séances allégées.</p>';
}
function forceOverview() {
  const ids = progressIds().filter(id => exHistory(id).length);
  if (!ids.length) return '';
  return '<section class="card"><div class="row between"><h2>Depuis le début</h2><span class="note">meilleure série</span></div><div class="list">' + ids.map(id => {
    const hs = exHistory(id), ex = EX[id], fd = forceDelta(id), a = hs[0], b = hs[hs.length - 1];
    return '<button class="li fo" data-act="exSheet" data-id="' + id + '"><div><div class="t">' + ex.short + '</div><div class="s tnum">' + (hs.length > 1 ? a.best + ' → ' + b.best + unitShort(ex) : b.best + unitShort(ex)) + '</div></div>' + sparkSVG(hs) + (deltaPill(fd, ex) || '<span></span>') + '</button>';
  }).join('') + '</div></section>';
}
function tabForce() {
  const ids = progressIds();
  let h = forceOverview();
  for (const id of ids.filter(id => suggestion(id).state === 'ready')) h += '<section class="card" style="box-shadow:inset 0 0 0 1px var(--acc-line)"><div class="daily"><span class="ic">' + I.up + '</span><div><div class="t">' + EX[id].name + '</div><div class="s">Critères remplis deux séances de suite</div></div><span></span></div><p class="small">Proposition : <b>' + nextLevelText(id) + '</b>, puis repartir en bas de la fourchette.</p><div class="btns"><button class="btn primary" data-act="acceptLevel" data-id="' + id + '">Valider</button><button class="btn" data-act="laterLevel" data-id="' + id + '">Plus tard</button></div></section>';
  h += '<div class="group">' + ids.map(id => {
    const last = doneLogs(id)[0] || lastLogOf(id), sg = suggestion(id), ex = EX[id];
    const perf = last ? last.e.sets.map(x => x.reps).join(' · ') + (ex.unit === 'sec' ? ' s' : '') : 'Pas encore fait';
    const st = sg.state === 'ready' ? pill('Prête', 'solid') : sg.state === 'max' ? pill('Max') : sg.state === 'hold8' ? pill('S8') : last ? pill((sg.ok || 0) + '/2', sg.ok ? 'acc' : '') : '';
    return '<button class="listrow" data-act="exSheet" data-id="' + id + '"><span class="ic' + (last ? '' : ' n') + '">' + I.dumbbell + '</span><div><div class="t">' + ex.short + '</div><div class="s tnum">' + perf + ' · ' + levelLabel(id) + '</div></div>' + st + CHEV + '</button>';
  }).join('') + '</div>';
  return h + '<p class="note" style="padding:0 4px">« 2/2 » : deux séances au haut de la fourchette, technique propre et réserve respectée. Les séances allégées ne comptent pas.</p>';
}
function tabRuns() {
  const runs = Object.values(S.runs).sort((a, b) => b.date.localeCompare(a.date)), flag = lastPainFlag();
  let h = '';
  if (flag) h += '<section class="card">' + alertBox('bad', 'warn', 'Douleur notée le ' + fmtD(flag) + ' : course en pause.') + '<button class="btn block" data-act="clearFlag">La douleur a disparu</button></section>';
  const mins = runs.filter(r => ['run', 'runwalk'].includes(r.kind)).reduce((a, r) => a + (r.minutes || 0), 0);
  const nr = runs.filter(r => ['run', 'runwalk'].includes(r.kind)).length;
  h += '<section class="card"><div class="mini3"><div><b>' + nr + '</b><span>sortie' + (nr > 1 ? 's' : '') + '</span></div><div><b>' + mins + '</b><span>minute' + (mins > 1 ? 's' : '') + '</span></div><div><b>' + runs.filter(r => r.kind === 'badminton').length + '</b><span>badminton</span></div></div></section>';
  if (!runs.length) return h + '<p class="note" style="padding:0 4px">Aucune sortie saisie pour l’instant.</p>';
  return h + '<div class="group">' + runs.map(r => listRow('runSheet', r.kind === 'badminton' ? 'spark' : 'run', runFlag(r) ? 'bad' : 'run', r.kind === 'skipped' ? 'Non faite' : r.minutes + ' min · ' + ({ run: 'course', runwalk: 'course et marche', walk: 'marche', badminton: 'badminton' })[r.kind], fmtDL(r.date) + (r.km ? ' · ' + num(r.km, 1) + ' km' : '') + (r.effort ? ' · ' + r.effort + '/10' : ''), runFlag(r) ? pill('Signal', 'bad') : '', 'data-date="' + r.date + '"')).join('') + '</div>';
}
function tabSessions() {
  const ss = Object.values(S.sessions).sort((a, b) => b.date.localeCompare(a.date));
  if (!ss.length) return '<p class="note" style="padding:0 4px">Aucune séance enregistrée pour l’instant.</p>';
  return '<div class="group">' + ss.map(s => listRow('viewSession', 'dumbbell', s.status === 'done' ? '' : 'warn', 'Séance ' + s.kind + ' · S' + s.pw + (s.reduced ? ' · allégée' : ''), fmtDL(s.date) + ' · ' + plural(doneSetsCount(s), 'série') + (s.status === 'done' ? ' · ' + Math.round(sessDuration(s) / 60000) + ' min' : ''), s.status === 'done' ? '' : pill('En cours', 'warn'), 'data-date="' + s.date + '"')).join('') + '</div>';
}
function bilanCard() {
  const ss = Object.values(S.sessions).filter(s => s.status === 'done');
  const runs = Object.values(S.runs).filter(r => ['run', 'runwalk'].includes(r.kind));
  const ws = weeklyWeights().filter(w => w.n >= 2);
  let h = '<section class="hero"><div class="eyebrow">Bilan · sans test maximal</div><div class="mini3"><div><b>' + ss.length + '/' + (S.plan.seq.length * 3) + '</b><span>séances</span></div><div><b>' + runs.length + '</b><span>sorties</span></div><div><b>' + runs.reduce((a, r) => a + (r.minutes || 0), 0) + '</b><span>min courues</span></div></div>';
  if (ws.length >= 2) h += '<p class="small">Poids moyen : ' + num(ws[0].avg, 1) + ' → ' + num(ws[ws.length - 1].avg, 1) + ' kg.</p>';
  const rows = [];
  for (const id of ['squat', 'squat_tempo', 'pushup_knee', 'pushup_wall', 'row_band']) {
    const l = doneLogs(id); if (l.length < 2) continue;
    rows.push('<tr><td>' + EX[id].short + '</td><td>' + l[l.length - 1].e.sets.map(x => x.reps).join('·') + '</td><td>' + l[0].e.sets.map(x => x.reps).join('·') + '</td></tr>');
  }
  if (rows.length) h += '<div class="tablewrap"><table class="t"><thead><tr><th>Exercice</th><th>Première</th><th>Dernière</th></tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  return h + '</section>';
}

/* ---------- Profil ---------- */
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (route === 'profile') render(); });
function scrProfile() {
  const p = S.profile, m = p.medical;
  let h = '<section class="screen' + stg() + '"><header class="top" style="justify-content:flex-start;gap:14px"><span class="avatar" style="width:60px;height:60px;font-size:26px">' + esc((p.name || 'É')[0].toUpperCase()) + '</span><div><h1 class="title-xl">' + esc(p.name || 'Mon profil') + '</h1><div class="note">' + (bodyLine(p, 'départ') || 'Taille et poids à compléter') + '</div></div></header>';
  if (!storageOK) h += alertBox('bad', 'warn', 'Stockage local indisponible : tes saisies seront perdues à la fermeture. Exporte une sauvegarde.');
  h += '<div class="group">' + listRow('profSheet', 'user', '', 'Mes informations', 'Prénom, taille, poids de départ', '', 'data-k="me"') +
    listRow('profSheet', 'target', '', 'Repères', p.gainLowG + '–' + p.gainHighG + ' g/sem. · ' + p.proteinG + ' g de protéines', '', 'data-k="targets"') +
    listRow('profSheet', 'bowl', '', 'Recette du shaker', p.recipe.text ? (p.recipe.kcal ? p.recipe.kcal + ' kcal' : 'Recette notée') : 'À compléter', '', 'data-k="recipe"') + '</div>';
  h += '<div class="group">' + listRow('profSheet', 'band', 'n', 'Mes bandes', p.bands.length ? plural(p.bands.length, 'bande') : 'Aucune bande notée', '', 'data-k="bands"') +
    listRow('profSheet', 'bell', 'n', 'Affichage et son', ({ nuit: 'Thème Nuit', peche: 'Thème Pêche', menthe: 'Thème Menthe', dark: 'Thème sombre' })[S.profile.theme] + (S.profile.voice ? ' · mains libres' : ' · fin du repos'), '', 'data-k="session"') + '</div>';
  h += '<div class="group">' + listRow('badgesOpen', 'medal', 'warn', 'Série et badges', badgeList().filter(b => b.done).length + ' / ' + BADGES.length + ' badges · série de ' + streakInfo().cur) + '</div>';
  h += '<div class="group">' + listRow('profSheet', 'save', CLOUD && CLOUD.on && !(CLOUD.err && CLOUD.err !== 'net') ? '' : 'warn', 'Sauvegarde cloud', cloudStatus(), '', 'data-k="cloud"') + listRow('profSheet', 'save', 'run', 'Sauvegarde', 'Exporter, restaurer, effacer', '', 'data-k="data"') +
    listRow('profSheet', 'phone', 'n', 'Installation', STANDALONE ? 'Installée' : FRAMED ? 'Version en ligne' : 'Écran d’accueil', '', 'data-k="install"') +
    listRow('profSheet', 'info', 'n', 'À propos', 'Données, limites') + '</div>';
  return h + '</section>';
}
function fld(label, type, path, val, extra = '') {
  return '<label class="field"><span>' + label + '</span><input class="input" type="' + (type === 'number' ? 'text' : type) + '" ' + (type === 'number' ? 'inputmode="decimal" autocomplete="off" data-num="1" ' : '') + 'id="f-' + path.replace(/\./g, '-') + '" data-chg="path" data-path="' + path + '" value="' + esc(val ?? '') + '" ' + extra + '></label>';
}
const PROF = {
  me: () => sheetHead('Mes informations') + '<div class="grid2">' + fld('Prénom', 'text', 'profile.name', S.profile.name) + fld('Taille (cm)', 'number', 'profile.heightCm', S.profile.heightCm) + fld('Poids de départ (kg)', 'number', 'profile.startWeightKg', S.profile.startWeightKg) + '</div><p class="note">Volontairement non renseignés : âge, allure, fréquence cardiaque maximale, besoins caloriques, résistance des bandes.</p>',
  targets: () => sheetHead('Repères') + '<div class="grid2">' + fld('Prise min (g/sem.)', 'number', 'profile.gainLowG', S.profile.gainLowG) + fld('Prise max (g/sem.)', 'number', 'profile.gainHighG', S.profile.gainHighG) + fld('Protéines (g/jour)', 'number', 'profile.proteinG', S.profile.proteinG) + '</div><p class="note">Repères de départ ajustables, sans promesse de résultat.</p>',
  recipe: () => sheetHead('Recette du shaker') + '<label class="field"><span>Ingrédients et quantités</span><textarea class="input" data-chg="path" data-path="profile.recipe.text" id="recipeText" maxlength="2000" placeholder="Ta recette réelle">' + esc(S.profile.recipe.text) + '</textarea></label><div class="grid2">' + fld('Calories (kcal)', 'number', 'profile.recipe.kcal', S.profile.recipe.kcal ?? '') + fld('Protéines (g)', 'number', 'profile.recipe.protein', S.profile.recipe.protein ?? '') + '</div><p class="note">Renseigne les valeurs de tes emballages : rien n’est inventé.</p>',
  bands: () => sheetHead('Mes bandes') + (S.profile.bands.length ? '<div class="list">' + S.profile.bands.map(b => '<div class="li"><div><div class="t">' + esc(b.name) + '</div><div class="s">' + (b.note ? esc(b.note) : 'Résistance non indiquée') + '</div></div><button class="btn sm ghost" data-act="delBand" data-id="' + b.id + '">Retirer</button></div>').join('') + '</div>' : '<p class="note">Note tes bandes pour les choisir en un geste pendant la séance. Aucune charge en kilos.</p>') +
    '<div class="grid2"><input class="input" id="bandName" maxlength="40" placeholder="Nom ou couleur" aria-label="Nom de la bande"><input class="input" id="bandNote" maxlength="120" placeholder="Note (facultatif)" aria-label="Note"></div><button class="btn primary block" data-act="addBand">Ajouter</button>',
  session: () => sheetHead('Affichage et son') + '<div class="field"><span>Thème</span><div class="seg flat">' + [['nuit', 'Nuit'], ['peche', 'Pêche'], ['menthe', 'Menthe'], ['dark', 'Sombre']].map(([k, l]) => '<button class="' + (S.profile.theme === k ? 'on' : '') + '" data-act="setTheme" data-v="' + k + '">' + l + '</button>').join('') + '</div></div>' + (M3.ok ? '<label class="toggle"><span>Animations en 3D<br><span class="note">Mannequin à faire tourner au doigt</span></span><input type="checkbox" data-chg="bool" data-path="profile.anim3d"' + (S.profile.anim3d !== false ? ' checked' : '') + '></label>' : '') + '<label class="toggle"><span>Son en fin de repos<br><span class="note">Application ouverte à l’écran</span></span><input type="checkbox" data-chg="bool" data-path="profile.sound"' + (S.profile.sound ? ' checked' : '') + '></label>' + (VOICE.ok ? '<label class="toggle"><span>Mode mains libres<br><span class="note">Une voix annonce l’exercice, la série et la fin du repos</span></span><input type="checkbox" data-chg="bool" data-path="profile.voice"' + (S.profile.voice ? ' checked' : '') + '></label>' : '') + '<label class="toggle"><span>Vibration<br><span class="note">Fin de repos et validations</span></span><input type="checkbox" data-chg="bool" data-path="profile.vibrate"' + (S.profile.vibrate ? ' checked' : '') + '></label><p class="note">Le minuteur garde son heure de fin même en arrière-plan. Aucune alarme n’est garantie écran éteint.</p>',
  data: () => dataSheet(),
  cloud: () => cloudSheetHTML(),
  install: () => installSheet(),
  about: () => sheetHead('Élan', 'Force · course · 8 semaines') + '<div class="cues"><p>Élan, c’est l’élan qu’on prend semaine après semaine. Application personnelle, sans compte ni publicité. Tes saisies restent dans ce navigateur, sur ce téléphone, et ne sont envoyées nulle part.</p><p class="note">' + FIG_LIMIT + '</p><p class="note">Ce programme ne remplace pas un avis médical.</p></div>'
};
function dataSheet() {
  const canFile = !FRAMED || !!DL;
  let h = sheetHead('Sauvegarde') + (CLOUD && CLOUD.on ? '<p class="small muted">Sauvegarde cloud active (' + agoLabel(CLOUD.last) + '). Tu peux aussi garder un fichier de temps en temps.</p>' : '<p class="small muted">Tout est stocké sur ce téléphone. Active la sauvegarde cloud dans Profil, ou exporte une fois par semaine.</p>');
  h += '<div class="btns">' + (canFile ? '<button class="btn primary" data-act="exportFile">' + I.save + 'Télécharger</button>' : '') + '<button class="btn' + (canFile ? '' : ' primary') + '" data-act="exportCopy">Copier le texte</button></div>';
  if (ui.exportText) h += '<textarea class="input" id="exportBox" readonly style="min-height:100px;font-size:12px" aria-label="Sauvegarde">' + esc(ui.exportText) + '</textarea>';
  h += '<hr class="sep"><div class="eyebrow">Restaurer</div><label class="btn block" style="position:relative;overflow:hidden">Choisir un fichier .json<input type="file" accept="application/json,.json" id="importFile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>' +
    '<textarea class="input" id="importText" style="min-height:64px;font-size:12px" placeholder="ou colle le texte d’une sauvegarde" aria-label="Texte de sauvegarde"></textarea><button class="btn block" data-act="importPaste">Vérifier le texte collé</button>';
  if (ui.importPreview) {
    const v = ui.importPreview;
    h += v.ok ? alertBox('acc', 'check', 'Sauvegarde valide du ' + esc(v.when) + ' : ' + v.sum + '. Elle remplacera tes données actuelles (une copie est gardée).<div class="btns" style="margin-top:8px"><button class="btn sm primary" data-act="importApply">Remplacer mes données</button><button class="btn sm" data-act="importCancel">Annuler</button></div>') : alertBox('bad', 'warn', '<b>Fichier refusé.</b> ' + v.errors.map(esc).join(' '));
  }
  let bk = null; try { bk = JSON.parse(localStorage.getItem(BKEY) || 'null'); } catch (e) { }
  if (bk && bk.at) h += '<button class="btn ghost block" data-act="restoreBackup">Revenir à la copie du ' + new Date(bk.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) + '</button>';
  if (!FRAMED && navigator.storage && navigator.storage.persist) h += '<button class="btn ghost block" data-act="persist">Demander un stockage durable</button>';
  h += '<hr class="sep">' + (ui.confirmReset ? '<p class="small">Tout effacer ? Une copie de sécurité est faite juste avant.</p><div class="btns"><button class="btn" data-act="resetCancel">Annuler</button><button class="btn danger" data-act="resetDo">Effacer</button></div>' : '<button class="btn danger block" data-act="resetAsk">Effacer toutes mes données</button>');
  return h;
}
function installSheet() {
  let h = sheetHead('Installation');
  if (FRAMED) h += '<p class="small">Tu utilises la version affichée dans Claude. Elle garde tes données sur cet appareil, mais ne s’installe pas et ne fonctionne pas hors connexion.</p><p class="note">La version installable a ses propres données : passe-les avec Sauvegarde puis Restaurer.</p>';
  else if (STANDALONE) h += alertBox('acc', 'check', 'Application installée' + ('serviceWorker' in navigator && navigator.serviceWorker.controller ? ', disponible hors connexion.' : '.'));
  else {
    if (installEvt) h += '<button class="btn primary xl block" data-act="install">Installer</button>';
    h += IOS ? '<p class="small">Safari, bouton Partager, puis « Sur l’écran d’accueil ».</p>' : '<p class="small">Chrome, menu ⋮, puis « Installer l’application ».</p>';
    h += '<p class="note">Hors connexion après une première ouverture en ligne.' + (IOS ? ' Sur iPhone, l’application installée a un stockage séparé de Safari.' : '') + '</p>';
  }
  return h;
}
function profSheet(k) { const fn = PROF[k]; if (fn) openSheet(fn(), fn); }
