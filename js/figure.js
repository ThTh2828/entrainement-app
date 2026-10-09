/* ===== Silhouette articulée : cinématique simple (2 segments par membre) ===== */
const FIG = (() => {
  const L = { torso: 50, neck: 14, head: 10.5, ua: 28, fa: 26, th: 42, sh: 40, foot: 15 };
  const R = Math.PI / 180;
  const dir = (a, l = 1) => [Math.cos(a * R) * l, Math.sin(a * R) * l];
  const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
  const mul = (v, k) => [v[0] * k, v[1] * k];
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) / R;
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const ease = t => 0.5 - Math.cos(Math.PI * t) / 2;

  function ik(root, target, l1, l2, bend) {
    let d = dist(root, target);
    const base = ang(root, target);
    d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, d));
    const c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const a = Math.acos(Math.max(-1, Math.min(1, c))) / R;
    const j = add(root, dir(base + bend * a, l1));
    const e = add(j, dir(ang(j, target), l2));
    return [root, j, e];
  }
  function chain(root, s, l1, l2) {
    const k1 = s.s1 ?? 1, k2 = s.s2 ?? 1;
    if (s.ik) return ik(root, s.ik, l1 * k1, l2 * k2, s.bend ?? 1);
    const j = add(root, dir(s.a[0], l1 * k1));
    return [root, j, add(j, dir(s.a[1], l2 * k2))];
  }
  function solve(p) {
    const hip = p.hip;
    const S = p.shoulder || add(hip, dir(p.torso, L.torso));
    const tA = p.shoulder ? ang(hip, S) : p.torso;
    const n = dir(tA + 90);
    const sw = (p.sw ?? 3) / 2, hw = (p.hw ?? 3) / 2;
    const sN = add(S, mul(n, sw)), sF = add(S, mul(n, -sw));
    const hN = add(hip, mul(n, hw)), hF = add(hip, mul(n, -hw));
    const head = add(S, dir(p.headAbs ?? (tA + (p.headTilt || 0)), L.neck));
    const o = { hip, S, sN, sF, hN, hF, head, tA };
    o.armN = chain(sN, p.armN, L.ua, L.fa);
    o.armF = chain(sF, p.armF || p.armN, L.ua, L.fa);
    o.legN = chain(hN, p.legN, L.th, L.sh);
    o.legF = chain(hF, p.legF || p.legN, L.th, L.sh);
    const foot = (leg, a, k) => { const an = leg[2]; return [add(an, dir(a + 180, 4 * k)), add(an, dir(a, L.foot * k))]; };
    o.footN = foot(o.legN, p.footN ?? 0, p.footS ?? 1);
    o.footF = foot(o.legF, p.footF ?? p.footN ?? 0, p.footS ?? 1);
    return o;
  }
  const P = pts => pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');

  // Athlète illustré : peau, débardeur et short olive, cuissard et chaussettes blancs, baskets à semelle corail.
  const lp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  function parts(p, o, ex) {
    const front = !!p.front, L2 = [];
    const fdir = dir(o.tA + 90), up = dir(o.tA);
    const path = (k, c, pts, sw, close) => L2.push({ k, t: 'path', c, d: P(pts) + (close ? ' Z' : ''), sw });
    const circ = (k, c, pt, r) => L2.push({ k, t: 'circle', c, cx: pt[0], cy: pt[1], r });
    const arm = (side, a) => {
      const f = side === 'F' && !front ? '2' : '';
      path('ua' + side, 'a-sk' + f, [a[0], a[1]], 10.5);
      path('fa' + side, 'a-sk' + f, [a[1], a[2]], 8.6);
      circ('hd' + side, 'a-sk' + f, a[2], p.handR ?? 4.4);
    };
    const leg = (side, g, ft) => {
      const f = side === 'F' && !front ? '2' : '';
      path('sh' + side, 'a-ol' + f, [g[0], lp2(g[0], g[1], .52)], 15);
      path('cuO' + side, 'a-ln', [lp2(g[0], g[1], .5), lp2(g[0], g[1], .64)], 15);
      path('cu' + side, 'a-wh' + f, [lp2(g[0], g[1], .5), lp2(g[0], g[1], .64)], 13.2);
      path('th' + side, 'a-sk' + f, [lp2(g[0], g[1], .63), g[1]], 12);
      path('sn' + side, 'a-sk' + f, [g[1], lp2(g[1], g[2], .55)], 10.6);
      path('soO' + side, 'a-ln', [lp2(g[1], g[2], .52), g[2]], 12);
      path('so' + side, 'a-wh' + f, [lp2(g[1], g[2], .52), g[2]], 10.2);
      path('shoO' + side, 'a-ln', ft, 10.8);
      path('sho' + side, 'a-shoe' + f, ft, 8.8);
      const n = dir(ang(ft[0], ft[1]) + 90);
      path('sol' + side, 'a-sole', [add(ft[0], mul(n, 3)), add(ft[1], mul(n, 3))], 2.8);
    };
    L2.push({ k: 'bx', t: 'path', c: 'fx-band', d: '' });
    arm('F', o.armF); leg('F', o.legF, o.footF);
    if (front) path('torso', 'a-top', [o.sN, o.sF, o.hF, o.hN], p.torsoW ?? 9, true);
    else {
      const H = o.hip, S = o.S, m = lp2(H, S, .66), w = lp2(H, S, .42);
      path('torso', 'a-top', [add(H, mul(fdir, 8.5)), add(w, mul(fdir, 10)), add(m, mul(fdir, 12.8)), add(S, mul(fdir, 9.5)), add(S, mul(fdir, -10.5)), add(m, mul(fdir, -10.5)), add(w, mul(fdir, -8.6)), add(H, mul(fdir, -9.5))], 4, true);
      circ('hipb', 'a-ol', H, 9.6);
    }
    path('neck', 'a-sk', [o.S, lp2(o.S, o.head, .75)], 8);
    if (front) { circ('hair', 'a-hair', add(o.head, mul(up, 2.6)), 10.9); circ('face', 'a-sk', add(o.head, mul(up, -1)), 10.1); }
    else { circ('hair', 'a-hair', add(add(o.head, mul(fdir, -2.6)), mul(up, 2.2)), 11); circ('face', 'a-sk', add(o.head, mul(fdir, 1)), 10.1); }
    leg('N', o.legN, o.footN); arm('N', o.armN);
    L2.push({ k: 'fx', t: 'path', c: 'fx-band', d: '' }, { k: 'fx2', t: 'path', c: 'fx-line', d: '' });
    if (ex.extras) { const e = ex.extras(o, p) || {}; for (const it of L2) if (e[it.k] != null) it.d = e[it.k]; }
    return L2;
  }

  const VB = '0 0 320 190';
  function bg(ex) {
    let s = '<rect class="mat" x="18" y="172" width="284" height="7" rx="3.5"></rect>';
    if (ex.wall) s += '<rect class="wall" x="' + ex.wall + '" y="10" width="8" height="162"></rect>';
    if (ex.bgx) s += ex.bgx;
    return s;
  }
  function el(it) {
    if (it.t === 'circle') return '<circle data-p="' + it.k + '" class="' + it.c + '" cx="' + it.cx.toFixed(1) + '" cy="' + it.cy.toFixed(1) + '" r="' + it.r + '"></circle>';
    return '<path data-p="' + it.k + '" class="' + it.c + '" d="' + it.d + '"' + (it.sw ? ' style="stroke-width:' + it.sw + 'px"' : '') + '></path>';
  }
  function svg(ex, t = 0, side = 1, extraCls = '') {
    const p = ex.pose(t, side);
    const o = solve(p);
    const inset = ex.inset ? '<g data-inset>' + ex.inset(t, side) + '</g>' : '';
    return '<svg class="fig ' + extraCls + '" viewBox="' + VB + '" role="img" aria-label="' + ex.name + '">' + bg(ex) + parts(p, o, ex).map(el).join('') + inset + '</svg>';
  }
  function update(svgEl, ex, t, side) {
    const p = ex.pose(t, side), o = solve(p);
    for (const it of parts(p, o, ex)) {
      const n = svgEl.querySelector('[data-p="' + it.k + '"]');
      if (!n) continue;
      if (it.t === 'circle') { n.setAttribute('cx', it.cx.toFixed(1)); n.setAttribute('cy', it.cy.toFixed(1)); }
      else n.setAttribute('d', it.d);
    }
    if (ex.inset) { const g = svgEl.querySelector('[data-inset]'); if (g) g.innerHTML = ex.inset(t, side); }
  }

  // Lecture d'une séquence : [{to, dur, label, side}, {hold, label}]
  function sample(seq, ms) {
    const total = seq.reduce((a, s) => a + (s.dur || s.hold || 0), 0);
    let tm = ((ms % total) + total) % total, cur = 0, side = 1;
    for (const s of seq) {
      if (s.side) side = s.side;
      const d = s.dur || s.hold;
      if (tm <= d) {
        if (s.hold) return { t: cur, side, label: s.label, total };
        const t = lerp(cur, s.to, ease(tm / d));
        return { t, side, label: s.label, total };
      }
      tm -= d;
      if (!s.hold) cur = s.to;
    }
    return { t: cur, side, label: '', total };
  }

  return { L, dir, add, mul, ang, dist, lerp, lp, ease, solve, svg, update, sample, P };
})();
