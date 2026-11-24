// Bakes Ziya.glb into a compact model file for the website (run once, or when the model changes).
//   node bake-model.mjs <Ziya.glb> <out.zm.gz>
// Units: millimetres. Drops the parts the site draws itself (screen, Z letter). Quantised positions (int16 per part),
// int8 normals, uint16 indices. The loader is src/components/ziya/model.ts.
import { NodeIO } from "@gltf-transform/core";
import { weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import fs from "node:fs"; import zlib from "node:zlib";

const [, , inp, out] = process.argv;
await MeshoptSimplifier.ready;
const io = new NodeIO(); const doc = await io.read(inp);
await doc.transform(weld({ tolerance: 0.00001 }));
const DROP = new Set(["screen", "z_letter"]);
const SIMPLIFY = { antenna_tip: 0.18, arm_L: 0.22, arm_R: 0.22, hand_L: 0.2, hand_R: 0.2, z_dial: 0.35, eye_L: 0.5, eye_R: 0.5, mouth: 0.5, cheek_L: 0.5, cheek_R: 0.5, body: 0.6, chest_plate: 0.6 };   // parts with far more triangles than they need
const parts = []; const chunks = []; let off = 0;
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const name = node.getName() || mesh.getName(); if (DROP.has(name)) continue;
  const prim = mesh.listPrimitives()[0];
  const pos = prim.getAttribute("POSITION").getArray(), nor = prim.getAttribute("NORMAL").getArray();
  let idx = prim.getIndices().getArray(); let P = Float32Array.from(pos), N = Float32Array.from(nor);
  if (SIMPLIFY[name]) {
    const target = Math.max(60, Math.floor((idx.length * SIMPLIFY[name]) / 3) * 3);
    const [ni] = MeshoptSimplifier.simplifyWithAttributes(Uint32Array.from(idx), P, 3, N, 3, [2, 2, 2], null, target, 0.01, []);
    idx = ni;
    // compact unused vertices
    const map = new Map(); const P2 = [], N2 = [], I2 = [];
    for (const i of idx) { if (!map.has(i)) { map.set(i, P2.length / 3); P2.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); N2.push(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]); } I2.push(map.get(i)); }
    P = Float32Array.from(P2); N = Float32Array.from(N2); idx = Uint32Array.from(I2);
  }
  // metres -> mm
  for (let i = 0; i < P.length; i++) P[i] *= 1000;
  const nv = P.length / 3; if (nv > 65535) throw new Error(name + " has too many vertices");
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[i * 3 + k]); mx[k] = Math.max(mx[k], P[i * 3 + k]); }
  const q = new Int16Array(nv * 3), qn = new Int8Array(nv * 3), qi = new Uint16Array(idx.length);
  for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) {
    const span = mx[k] - mn[k] || 1; q[i * 3 + k] = Math.round(((P[i * 3 + k] - mn[k]) / span) * 65535 - 32768);
    qn[i * 3 + k] = Math.round(Math.max(-1, Math.min(1, N[i * 3 + k])) * 127);
  }
  qi.set(idx);
  const a = Buffer.from(q.buffer), b = Buffer.from(qn.buffer), c = Buffer.from(qi.buffer);
  const pad = (x) => (4 - (x % 4)) % 4;
  parts.push({ n: name, nv, ni: idx.length, mn, mx, o: off });
  const buf = Buffer.concat([a, Buffer.alloc(pad(a.length)), b, Buffer.alloc(pad(b.length)), c, Buffer.alloc(pad(c.length))]);
  chunks.push(buf); off += buf.length;
}
const head = Buffer.from(JSON.stringify({ v: 1, parts }));
const hl = Buffer.alloc(4); hl.writeUInt32LE(head.length);
const all = Buffer.concat([hl, head, ...chunks]);
const gz = zlib.gzipSync(all, { level: 9 });
fs.writeFileSync(out, gz);
console.log("parts", parts.length, "raw", all.length, "gzip", gz.length);
for (const p of parts) console.log(p.n.padEnd(14), p.nv, p.ni / 3);
