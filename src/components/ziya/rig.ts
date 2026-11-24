import * as THREE from "three";
import type { ModelData } from "./model";
import type { Pose } from "./pose";
import { MARK_POLYS } from "./mark";
import { D } from "./util";

// The canvas shows x -60..60 mm and y -6..165 mm of Ziya's world, so one canvas pixel at scale 1 is 1/3 mm.
export const VIEW = { w: 360, h: 513 };
export const PX_PER_MM = 3;          // at scale 1
export const FIGURE_MM = 150;

export interface Rig {
  apply(p: Pose, time: number): void;
  render(): void;
  setStyle(s: "smooth" | "toon"): void;
  setSize(w: number, h: number, pixelRatio: number): void;
  dispose(): void;
}

const COL: Record<string, string[]> = {
  "#1E46DC": ["head", "hand_L", "hand_R", "foot_L", "foot_R"],
  "#0E1B40": ["screen", "antenna_base", "neck", "body", "z_dial", "arm_L", "arm_R", "leg_L", "leg_R"],
  "#FF9A1F": ["antenna_tip", "ear_L", "ear_R", "cheek_L", "cheek_R", "z_dial_ring"],
  "#F5F6FA": ["eye_L", "eye_R", "mouth", "chest_plate", "back_plate", "logo"],
};

export function createRig(canvas: HTMLCanvasElement, data: ModelData, opts: { pixelRatio: number; style?: "smooth" | "toon"; preserve?: boolean }): Rig {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve, powerPreference: "low-power" });
  renderer.setPixelRatio(opts.pixelRatio); renderer.setSize(VIEW.w, VIEW.h, false); renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(20, VIEW.w / VIEW.h, 10, 3000);
  const dist = 85.5 / Math.tan(10 * D); cam.position.set(0, 79.5, dist); cam.lookAt(0, 79.5, 0);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xb9c8ee, 1.25); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(-160, 260, 300); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.7); fill.position.set(220, 80, 200); scene.add(fill);

  // materials, in two looks: shaded (3D) and cel-shaded (the 2D sprites)
  const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const mats: Record<"smooth" | "toon", Record<string, THREE.Material>> = { smooth: {}, toon: {} };
  for (const hex of Object.keys(COL)) {
    mats.smooth[hex] = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: 0.5, metalness: 0 });
    mats.toon[hex] = new THREE.MeshToonMaterial({ color: new THREE.Color(hex), gradientMap: grad });
  }
  const hexOf = (name: string) => Object.keys(COL).find((h) => COL[h].includes(name)) || "#F5F6FA";
  const meshes: THREE.Mesh[] = []; let style: "smooth" | "toon" = opts.style || "smooth";
  const mk = (geo: THREE.BufferGeometry, hex: string) => { const m = new THREE.Mesh(geo, mats[style][hex]); m.userData.hex = hex; meshes.push(m); return m; };

  const M: Record<string, THREE.Mesh> = {};
  for (const name of Object.keys(data)) {
    const d = data[name], g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(d.pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(d.nor, 3)); g.setIndex(new THREE.BufferAttribute(d.idx, 1));
    g.computeBoundingBox(); M[name] = mk(g, hexOf(name));
  }
  { // plain rounded screen
    const sh = new THREE.Shape(); const w = 23.3, y0 = 83.5, y1 = 114.4, r = 5.5;
    sh.moveTo(-w + r, y0); sh.lineTo(w - r, y0); sh.quadraticCurveTo(w, y0, w, y0 + r); sh.lineTo(w, y1 - r); sh.quadraticCurveTo(w, y1, w - r, y1);
    sh.lineTo(-w + r, y1); sh.quadraticCurveTo(-w, y1, -w, y1 - r); sh.lineTo(-w, y0 + r); sh.quadraticCurveTo(-w, y0, -w + r, y0);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, 17); geo.computeBoundingBox();
    M.screen = mk(geo, "#0E1B40");
  }
  const center = (m: THREE.Mesh) => { const b = m.geometry.boundingBox!; return [(b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2]; };

  // soft shadow
  const sc = document.createElement("canvas"); sc.width = sc.height = 64;
  { const x = sc.getContext("2d")!; const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, "rgba(14,27,64,.38)"); g.addColorStop(1, "rgba(14,27,64,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.2; scene.add(shadow);

  type G = THREE.Group & { userData: { wp: number[]; base: THREE.Vector3 } };
  const group = (parent: THREE.Object3D, wp: number[]): G => {
    const g = new THREE.Group() as G; const pp = (parent.userData.wp as number[]) || [0, 0, 0];
    g.position.set(wp[0] - pp[0], wp[1] - pp[1], wp[2] - pp[2]); g.userData.wp = wp; g.userData.base = g.position.clone(); parent.add(g); return g;
  };
  const attach = (mesh: THREE.Mesh, g: G) => { const wp = g.userData.wp; mesh.position.set(-wp[0], -wp[1], -wp[2]); g.add(mesh); };

  const root = new THREE.Group(); root.userData.wp = [0, 0, 0]; scene.add(root);
  const bodyG = group(root, [0, 20, 0]);
  for (const n of ["body", "neck", "chest_plate", "back_plate", "z_dial"]) attach(M[n], bodyG);

  // Z2H hexagon mark in the middle of the dial
  const logoG = group(bodyG, [0, 39.15, 0]);
  {
    const k = 12.4 / 751, cxp = 320, cyp = 384.5, holder = new THREE.Group();
    for (const poly of MARK_POLYS) {
      const sh = new THREE.Shape(); poly.forEach(([px, py], i) => { const X = (px - cxp) * k, Y = 39.15 - (py - cyp) * k; if (i) sh.lineTo(X, Y); else sh.moveTo(X, Y); });
      const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: false }); g.translate(0, 0, 14.4); holder.add(mk(g, "#F5F6FA"));
    }
    holder.position.set(0, -39.15, 0); logoG.add(holder);
  }

  // legs and feet
  const leg: Record<string, G> = {}, foot: Record<string, G> = {};
  for (const s of ["L", "R"]) {
    const hx = s === "L" ? 10.35 : -10.35;
    const lg = group(bodyG, [hx, 26, 0]); attach(M["leg_" + s], lg);
    const ft = group(lg, [hx, 9, 0]); attach(M["foot_" + s], ft); leg[s] = lg; foot[s] = ft;
  }
  const armL = group(bodyG, [23, 51.5, 0]); attach(M.arm_L, armL); attach(M.hand_L, armL);
  const armR = group(bodyG, [-23, 51.5, 0]); attach(M.arm_R, armR); attach(M.hand_R, armR);
  armL.rotation.order = "ZXY"; armR.rotation.order = "ZXY";   // flip about the shoulder first, then swing outwards

  const head = group(bodyG, [0, 62, 0]);
  for (const n of ["head", "screen", "ear_L", "ear_R", "antenna_base", "antenna_tip"]) attach(M[n], head);
  const face = group(head, [0, 99, 0]), faceMouth = group(face, [0, 99, 0]);

  // faces
  const expr: Record<string, G[]> = { happy: [], neutral: [], surprised: [], worried: [], sleepy: [] }; const eyes: G[] = [], mouths: G[] = [];
  const slot = (set: string, mesh: THREE.Mesh, c: number[], isEye: boolean, parent: G) => { const g = group(parent, c); attach(mesh, g); g.visible = false; expr[set].push(g); (isEye ? eyes : mouths).push(g); };
  slot("happy", M.eye_L, center(M.eye_L), true, face); slot("happy", M.eye_R, center(M.eye_R), true, face); slot("happy", M.mouth, center(M.mouth), false, faceMouth);
  const cheeks: G[] = [];
  for (const n of ["cheek_L", "cheek_R"]) { const g = group(faceMouth, center(M[n])); attach(M[n], g); g.visible = false; expr.happy.push(g); cheeks.push(g); }
  const rrect = (w: number, h: number, r: number) => { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const circ = (r: number) => { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; };
  const ring = (ro: number, ri: number) => { const s = circ(ro); const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); return s; };
  const sector = (ro: number, ri: number, a0: number, a1: number) => { const s = new THREE.Shape(); s.absarc(0, 0, ro, a0, a1, false); s.absarc(0, 0, ri, a1, a0, true); s.closePath(); return s; };
  const alt = (set: string, shape: THREE.Shape, cx: number, cy: number, isEye: boolean) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.18, bevelThickness: 0.18, bevelSegments: 2, curveSegments: 20 }); geo.translate(0, 0, 20.2);
    const g = group(isEye ? face : faceMouth, [cx, cy, 0]); g.add(mk(geo, "#F5F6FA")); g.visible = false; expr[set].push(g); (isEye ? eyes : mouths).push(g);
  };
  alt("neutral", rrect(11, 3.2, 0.9), 9.6, 100, true); alt("neutral", rrect(11, 3.2, 0.9), -9.6, 100, true); alt("neutral", rrect(7, 1.5, 0.7), 0, 91.2, false);
  alt("surprised", circ(4.2), 9.8, 100.2, true); alt("surprised", circ(4.2), -9.8, 100.2, true); alt("surprised", ring(2.5, 1.25), 0, 90.8, false);
  alt("worried", rrect(5.4, 8.4, 2.7), 9.8, 100, true); alt("worried", rrect(5.4, 8.4, 2.7), -9.8, 100, true); alt("worried", sector(5, 3.5, 0.55, Math.PI - 0.55), 0, 87.4, false);
  alt("sleepy", rrect(9.5, 1.5, 0.7), 9.6, 99.2, true); alt("sleepy", rrect(9.5, 1.5, 0.7), -9.6, 99.2, true); alt("sleepy", ring(2.1, 1.0), 0, 90.6, false);

  // dial ring in 12 segments, lit one by one
  const dial: THREE.Mesh[] = [];
  {
    const src = M.z_dial_ring.geometry; const geo = src.index ? src.toNonIndexed() : src; const pos = geo.attributes.position, nor = geo.attributes.normal; const cx = 0, cy = 39.15;
    const ang = (i: number) => { const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3; let a = Math.atan2(x - cx, y - cy); if (a < 0) a += Math.PI * 2; return a; };
    const tris: { i: number; a: number }[] = []; for (let i = 0; i < pos.count; i += 3) tris.push({ i, a: ang(i) });
    const sorted = tris.map((t) => t.a).sort((p, q) => p - q);
    const gaps: { g: number; end: number }[] = []; for (let k = 0; k < sorted.length; k++) { const nx = k + 1 < sorted.length ? sorted[k + 1] : sorted[0] + Math.PI * 2; gaps.push({ g: nx - sorted[k], end: sorted[k] }); }
    gaps.sort((p, q) => q.g - p.g); const cuts = gaps.slice(0, 12).map((o) => o.end).sort((p, q) => p - q);
    const segOf = (a: number) => { let c = 0; for (const cut of cuts) if (a > cut + 1e-9) c++; return c % 12; };
    const buckets: number[][] = Array.from({ length: 12 }, () => []); for (const t of tris) buckets[segOf(t.a)].push(t.i);
    const info = buckets.map((idx) => ({ idx, mid: idx.map(ang).reduce((p, q) => p + q, 0) / (idx.length || 1) })); info.sort((p, q) => p.mid - q.mid);
    for (const o of info) {
      const arr = new Float32Array(o.idx.length * 9), narr = new Float32Array(o.idx.length * 9);
      o.idx.forEach((i, j) => { for (let v = 0; v < 3; v++) { arr.set([pos.getX(i + v), pos.getY(i + v), pos.getZ(i + v)], j * 9 + v * 3); narr.set([nor.getX(i + v), nor.getY(i + v), nor.getZ(i + v)], j * 9 + v * 3); } });
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3)); g.setAttribute("normal", new THREE.BufferAttribute(narr, 3));
      const m = mk(g, "#FF9A1F"); bodyG.add(m); m.position.set(0, -20, 0); dial.push(m);
    }
    M.z_dial_ring.visible = false; // the whole ring is replaced by its segments
  }

  const setStyle = (s: "smooth" | "toon") => { style = s; for (const m of meshes) m.material = mats[s][m.userData.hex as string]; };
  setStyle(style);

  const ARM_SWAY = (t: number, k: number) => Math.sin(t * 1.6 + k) * 1.2;
  function apply(p: Pose, t: number) {
    const f = Math.sin(2 * Math.PI * p.phase), ps = 2 * Math.PI * p.phase, wa = p.walk;
    const bob = 2.0 * wa * (1 - Math.cos(2 * ps)) / 2, br = 0.004 * Math.sin((2 * Math.PI * t) / 2.4);
    root.position.y = p.y + bob;
    root.scale.set(p.pop * p.sx, p.pop * (p.sy + br), p.pop * p.sx * p.zs);
    bodyG.rotation.y = p.yaw + p.lx * 0.16 * (1 - wa); bodyG.rotation.x = p.pitch + 0.07 * wa; bodyG.rotation.z = p.roll + 0.035 * wa * f;
    head.rotation.y = p.lx * 0.55 - p.yaw * (0.5 + 0.5 * p.face); head.rotation.x = -p.ly * 0.3 + p.hPitch - 0.05 * wa; head.rotation.z = p.hRoll + Math.sin(t * 1.3) * 0.012 - p.lx * 0.04;
    face.position.set(p.lx * 4.4, 37 + p.ly * 2.4, 0); faceMouth.position.set(p.lx * -2.2, p.ly * -1.2, 0);
    const A = 34 * D * wa;
    for (const [s, sg] of [["L", 1], ["R", -1]] as const) {
      const fs = sg * f, lift = 2.4 * wa * Math.max(0, sg * Math.cos(ps));
      leg[s].rotation.x = -A * fs; leg[s].position.y = leg[s].userData.base.y + lift;
      foot[s].rotation.x = A * fs * 0.8 - (lift > 0.2 ? 0.25 * wa : 0);
    }
    const swing = 26 * D * wa * f;
    armL.rotation.x = Math.PI * p.aL.f + (swing + p.aL.sw) * (1 - p.aL.f);
    armL.rotation.z = D * (p.aL.out + ARM_SWAY(t, 0) * (1 - p.aL.f)) * (1 - 2 * p.aL.f);
    armR.rotation.x = Math.PI * p.aR.f + (-swing + p.aR.sw) * (1 - p.aR.f);
    armR.rotation.z = -D * (p.aR.out + ARM_SWAY(t, 1) * (1 - p.aR.f)) * (1 - 2 * p.aR.f);
    for (const k of Object.keys(expr)) for (const g of expr[k]) g.visible = k === p.expr;
    for (const g of eyes) g.scale.y = 1 - 0.94 * p.blink;
    for (const g of mouths) g.scale.setScalar(p.mouthS);
    dial.forEach((m, i) => (m.visible = i < Math.floor(p.dial + 1e-6)));
    logoG.scale.setScalar(Math.max(0.0001, p.logo)); logoG.rotation.y = p.spin;
    const lift = Math.max(0, p.y) * 0.02;
    shadow.scale.set(64 * p.pop * p.sx * (1 - lift), 30 * p.pop * p.sx * (1 - lift), 1); (shadow.material as THREE.MeshBasicMaterial).opacity = Math.min(1, Math.max(0, 1 - lift * 2.5));
  }

  return {
    apply, render: () => renderer.render(scene, cam), setStyle,
    setSize(w, h, pr) { renderer.setPixelRatio(pr); renderer.setSize(w, h, false); },
    dispose() {
      for (const m of meshes) m.geometry.dispose();
      for (const k of ["smooth", "toon"] as const) for (const h of Object.keys(mats[k])) mats[k][h].dispose();
      grad.dispose(); renderer.dispose(); renderer.forceContextLoss();
    },
  };
}
