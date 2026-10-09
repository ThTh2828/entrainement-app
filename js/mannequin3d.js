/* ===== Mannequin 3D : Three.js chargé à la demande, poses identiques aux silhouettes 2D ===== */
const M3 = (() => {
  const SC = 0.01;
  let prom = null;
  const ok = (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();
  function load() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!prom) prom = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = FRAMED ? 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js' : 'vendor/three.min.js';
      s.async = true;
      s.onload = () => (window.THREE ? res(window.THREE) : rej(new Error('three')));
      s.onerror = () => { prom = null; s.remove(); rej(new Error('three')); };
      document.head.appendChild(s);
    });
    return prom;
  }
  const isFront = ex => ex === EX.side_abduction || ex === EX.band_pull_apart || ex === EX.side_plank_knee;
  const lerp = (a, b, t) => a + (b - a) * t;

  class View {
    constructor(host, ex) {
      const T = THREE;
      this.T = T; this.ex = ex; this.host = host; this.front = isFront(ex);
      const cs = getComputedStyle(host.querySelector('svg.fig') || host);
      const col = (v, d) => { const x = cs.getPropertyValue(v).trim(); return new T.Color(x && x[0] === '#' ? x : d); };
      const r = this.renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
      r.domElement.className = 'c3d';
      host.appendChild(r.domElement);
      const sc = this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(30, 1, 0.05, 40);
      sc.add(new T.HemisphereLight(0xffffff, 0xcfc2bd, 0.72));
      const key = new T.DirectionalLight(0xffffff, 0.78);
      key.position.set(1.6, 3.4, 2.6); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; key.shadow.bias = -0.0008;
      Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 9 });
      sc.add(key);
      const rim = new T.DirectionalLight(0xffffff, 0.28); rim.position.set(-2.5, 1.5, -2); sc.add(rim);
      const mats = this.mats = {
        skin: new T.MeshStandardMaterial({ color: col('--skin', '#D9A27E'), roughness: 0.55, metalness: 0 }),
        top: new T.MeshStandardMaterial({ color: col('--olive', '#2F2C30'), roughness: 0.82 }),
        white: new T.MeshStandardMaterial({ color: 0xf7f7f5, roughness: 0.72 }),
        sole: new T.MeshStandardMaterial({ color: col('--acc', '#E57A60'), roughness: 0.6 }),
        hair: new T.MeshStandardMaterial({ color: col('--hair', '#2B1E18'), roughness: 0.9 }),
        band: new T.MeshStandardMaterial({ color: col('--run', '#7C76E6'), roughness: 0.5 }),
        mat: new T.MeshStandardMaterial({ color: 0xe9e2df, roughness: 0.95 }),
        wall: new T.MeshStandardMaterial({ color: 0xe6e0dd, roughness: 0.95 })
      };
      const matBox = new T.Mesh(new T.BoxGeometry(2.84, 0.07, 0.95), mats.mat);
      matBox.position.set(0, -0.035, 0); matBox.receiveShadow = true; sc.add(matBox);
      const ground = new T.Mesh(new T.PlaneGeometry(10, 10), new T.ShadowMaterial({ opacity: 0.12 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.069; ground.receiveShadow = true; sc.add(ground);
      if (ex.wall) { const w = new T.Mesh(new T.BoxGeometry(0.08, 1.7, 1.5), mats.wall); w.position.set((ex.wall + 4 - 160) * SC, 0.85, 0); w.receiveShadow = true; sc.add(w); }
      this.parts = []; this.geos = [];
      this.Y = new T.Vector3(0, 1, 0); this.tmp = new T.Vector3(); this.tmp2 = new T.Vector3(); this.m4 = new T.Matrix4();
      this.build();
      this.fit();
      this.az0 = ex.wall ? -0.6 : 0.5; this.az = this.az0; this.el = 0.2;
      this.bindDrag();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
      this.resize();
    }
    /* points 3D d’une pose */
    lift(t, side) {
      const T = this.T, p = this.ex.pose(t, side), o = FIG.solve(p);
      const V = (pt, z) => new T.Vector3((pt[0] - 160) * SC, (172 - pt[1]) * SC, z * SC);
      const L = { o };
      if (!this.front) {
        const zs = 15, zh = 9;
        L.sN = V(o.sN, zs); L.sF = V(o.sF, -zs); L.hN = V(o.hN, zh); L.hF = V(o.hF, -zh);
        L.armN = o.armN.map((q, i) => V(q, i ? zs + 2 : zs)); L.armF = o.armF.map((q, i) => V(q, i ? -zs - 2 : -zs));
        L.legN = o.legN.map(q => V(q, zh)); L.legF = o.legF.map(q => V(q, -zh));
        L.footN = o.footN.map(q => V(q, zh)); L.footF = o.footF.map(q => V(q, -zh));
        L.zN = zh; L.zF = -zh;
        L.lat = new T.Vector3(0, 0, 1);
        const fd = FIG.dir(o.tA + 90); L.fd = new T.Vector3(fd[0], -fd[1], 0);
      } else {
        L.sN = V(o.sN, 2); L.sF = V(o.sF, -2); L.hN = V(o.hN, 2); L.hF = V(o.hF, -2);
        L.armN = o.armN.map(q => V(q, 3)); L.armF = o.armF.map(q => V(q, -3));
        L.legN = o.legN.map(q => V(q, 3)); L.legF = o.legF.map(q => V(q, -3));
        L.footN = o.footN.map((q, i) => V(q, 3 + i * 9)); L.footF = o.footF.map((q, i) => V(q, -3 + i * 9));
        L.zN = 3; L.zF = -3;
        const n = FIG.dir(o.tA + 90); L.lat = new T.Vector3(n[0], -n[1], 0);
        L.fd = new T.Vector3(0, 0, 1);
      }
      L.hip = V(o.hip, 0); L.S = V(o.S, 0); L.head = V(o.head, 0);
      L.up = new T.Vector3().subVectors(L.S, L.hip).normalize();
      if (this.ex === EX.band_pull_apart) {
        const ph = lerp(10, 86, t) * Math.PI / 180, k = Math.sin(ph), c = Math.cos(ph);
        const mk = (s, sg) => { const e = s.clone().add(new T.Vector3(sg * 28 * k * SC, -5 * SC, 27 * c * SC)); const h = s.clone().add(new T.Vector3(sg * 54 * k * SC, -6 * SC, 54 * c * SC)); return [s.clone(), e, h]; };
        L.armN = mk(L.sN, 1); L.armF = mk(L.sF, -1);
        L.band = [L.armF[2], L.armN[2]];
      }
      if (this.ex === EX.row_band) {
        const sole2 = side2 => { const an = o['leg' + side2][2]; return FIG.add(FIG.add(an, FIG.dir(-80, 6)), FIG.dir(10, 4.5)); };
        L.band = [V(sole2('N'), L.zN), L.armN[2]]; L.band2 = [V(sole2('F'), L.zF), L.armF[2]];
      }
      // semelles : décalées vers le dessous du pied
      const soleOf = (ft, z) => { const a = ft[0], b = ft[1]; const n = FIG.dir(FIG.ang(a, b) + 90); return [V(FIG.add(a, FIG.mul(n, 3)), z), V(FIG.add(b, FIG.mul(n, 3)), z)]; };
      const fz = (arr) => arr[0].z / SC;
      L.soleN = soleOf(o.footN, fz(L.footN)); L.soleF = soleOf(o.footF, fz(L.footF));
      if (this.front) { L.soleN[1].z += 9 * SC; L.soleF[1].z += 9 * SC; }
      return L;
    }
    build() {
      const T = this.T, L0 = this.lift(0, 1), M = this.mats;
      const add = (mesh) => { mesh.castShadow = true; this.scene.add(mesh); return mesh; };
      const seg = (mat, r, len0, get) => { const g = new T.CapsuleGeometry(r * SC, Math.max(len0, 0.002), 6, 14); this.geos.push(g); const m = add(new T.Mesh(g, mat)); this.parts.push({ type: 'seg', m, len0, get }); };
      const ball = (mat, r, get, sy = 1) => { const g = new T.SphereGeometry(r * SC, 22, 16); this.geos.push(g); const m = add(new T.Mesh(g, mat)); m.scale.y = sy; this.parts.push({ type: 'ball', m, get }); };
      const ell = (mat, rx, ry, rz, get) => { const g = new T.SphereGeometry(SC, 28, 20); this.geos.push(g); const m = add(new T.Mesh(g, mat)); m.matrixAutoUpdate = false; this.parts.push({ type: 'ell', m, rx, ry, rz, get }); };
      const lp = (a, b, t) => a.clone().lerp(b, t);
      const len = (a, b) => a.distanceTo(b);
      for (const sd of ['F', 'N']) {
        const A = 'arm' + sd, G = 'leg' + sd, F = 'foot' + sd, SO = 'sole' + sd, SH = 's' + sd;
        // jambe
        seg(M.top, 7.7, len(L0[G][0], lp(L0[G][0], L0[G][1], .52)), L => [L[G][0], lp(L[G][0], L[G][1], .52)]);
        seg(M.white, 7.1, len(L0[G][0], L0[G][1]) * .13, L => [lp(L[G][0], L[G][1], .5), lp(L[G][0], L[G][1], .63)]);
        seg(M.skin, 6.3, len(L0[G][0], L0[G][1]) * .37, L => [lp(L[G][0], L[G][1], .63), L[G][1]]);
        ball(M.skin, 5.7, L => L[G][1]);
        seg(M.skin, 5.3, len(L0[G][1], L0[G][2]) * .55, L => [L[G][1], lp(L[G][1], L[G][2], .55)]);
        seg(M.white, 5.1, len(L0[G][1], L0[G][2]) * .48, L => [lp(L[G][1], L[G][2], .52), L[G][2]]);
        seg(M.white, 4.5, len(L0[F][0], L0[F][1]), L => [L[F][0], L[F][1]]);
        seg(M.sole, 2.3, len(L0[SO][0], L0[SO][1]), L => [L[SO][0], L[SO][1]]);
        // bras
        ball(M.skin, 6.3, L => L[SH]);
        seg(M.skin, 5.2, len(L0[A][0], L0[A][1]), L => [L[A][0], L[A][1]]);
        seg(M.skin, 4.3, len(L0[A][1], L0[A][2]), L => [L[A][1], L[A][2]]);
        ball(M.skin, 4.7, L => L[A][2]);
      }
      // tronc
      ell(M.top, 13.2, 9.5, 10, L => ({ c: L.hip, up: L.up, lat: L.lat, fd: L.fd }));
      ell(M.top, 14.6, 25, 10.2, L => ({ c: lp(L.hip, L.S, .45), up: L.up, lat: L.lat, fd: L.fd }));
      ell(M.top, 16.2, 15, 11.4, L => ({ c: lp(L.hip, L.S, .78).add(L.fd.clone().multiplyScalar(1.2 * SC)), up: L.up, lat: L.lat, fd: L.fd }));
      seg(M.skin, 4.4, len(L0.S, lp(L0.S, L0.head, .7)), L => [L.S, lp(L.S, L.head, .7)]);
      ball(M.skin, 10, L => L.head.clone().add(L.fd.clone().multiplyScalar(0.8 * SC)), 1.08);
      ball(M.hair, 10.5, L => L.head.clone().add(L.fd.clone().multiplyScalar(-2.4 * SC)).add(L.up.clone().multiplyScalar(2.4 * SC)), 1.02);
      if (L0.band) seg(M.band, 1.5, len(L0.band[0], L0.band[1]), L => L.band);
      if (L0.band2) seg(M.band, 1.5, len(L0.band2[0], L0.band2[1]), L => L.band2);
    }
    set(t, side) {
      const L = this.lift(t, side), T = this.T, Y = this.Y;
      for (const p of this.parts) {
        const g = p.get(L);
        if (p.type === 'seg') {
          const [a, b] = g, d = this.tmp.subVectors(b, a), l = d.length();
          p.m.position.addVectors(a, b).multiplyScalar(0.5);
          if (l > 1e-6) p.m.quaternion.setFromUnitVectors(Y, d.normalize());
          p.m.scale.set(1, Math.max(0.05, l / Math.max(p.len0, 0.002)), 1);
        } else if (p.type === 'ball') p.m.position.copy(g);
        else {
          const up = g.up.clone().normalize();
          const lat = g.lat.clone().addScaledVector(up, -g.lat.dot(up)).normalize();
          const fd = new T.Vector3().crossVectors(lat, up).normalize();
          if (fd.dot(g.fd) < 0) fd.negate();
          this.m4.makeBasis(lat.multiplyScalar(p.rx), up.multiplyScalar(p.ry), fd.multiplyScalar(p.rz)).setPosition(g.c);
          p.m.matrix.copy(this.m4);
        }
      }
      this.render();
    }
    fit() {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const t of [0, .25, .5, .75, 1]) for (const sd of [1, 2]) {
        const o = FIG.solve(this.ex.pose(t, sd));
        const pts = [...o.armN, ...o.armF, ...o.legN, ...o.legF, ...o.footN, ...o.footF, o.hip, o.S];
        for (const q of pts) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        y0 = Math.min(y0, o.head[1] - 12); x0 = Math.min(x0, o.head[0] - 12); x1 = Math.max(x1, o.head[0] + 12);
      }
      y1 = Math.max(y1, 172);
      this.box = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 + 40, h: y1 - y0 + 20 };
      this.target = new this.T.Vector3((this.box.cx - 160) * SC, (172 - this.box.cy) * SC, 0);
    }
    resize() {
      const w = this.host.clientWidth, h = Math.max(120, this.host.clientHeight - 50);
      if (!w) return;
      this.renderer.setSize(w, h, false);
      this.renderer.domElement.style.width = w + 'px'; this.renderer.domElement.style.height = h + 'px';
      this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
      const tan = Math.tan(this.cam.fov * Math.PI / 360) * 2;
      this.dist = Math.max(this.box.h * SC * 1.12 / tan, this.box.w * SC * 1.0 / (tan * this.cam.aspect));
      this.render();
    }
    render() {
      if (!this.renderer) return;
      const d = this.dist || 4, c = this.cam, tg = this.target;
      c.position.set(tg.x + d * Math.sin(this.az) * Math.cos(this.el), tg.y + d * Math.sin(this.el), tg.z + d * Math.cos(this.az) * Math.cos(this.el));
      c.lookAt(tg);
      this.renderer.render(this.scene, c);
    }
    bindDrag() {
      const el = this.renderer.domElement;
      let px = null, py = null;
      this.onDown = e => { px = e.clientX; py = e.clientY; el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('drag'); };
      this.onMove = e => { if (px == null) return; this.az -= (e.clientX - px) * 0.009; if (e.pointerType === 'mouse') this.el = Math.max(-0.05, Math.min(1.1, this.el + (e.clientY - py) * 0.006)); px = e.clientX; py = e.clientY; this.render(); };
      this.onUp = () => { px = null; el.classList.remove('drag'); };
      el.addEventListener('pointerdown', this.onDown); el.addEventListener('pointermove', this.onMove);
      el.addEventListener('pointerup', this.onUp); el.addEventListener('pointercancel', this.onUp);
      el.addEventListener('dblclick', () => { this.az = this.az0; this.el = 0.2; this.render(); });
    }
    dispose() {
      if (!this.renderer) return;
      try { this.ro.disconnect(); } catch (e) { }
      this.geos.forEach(g => g.dispose()); Object.values(this.mats).forEach(m => m.dispose());
      this.renderer.dispose(); try { this.renderer.forceContextLoss(); } catch (e) { }
      this.renderer.domElement.remove(); this.renderer = null;
    }
  }
  return { ok, load, View };
})();
