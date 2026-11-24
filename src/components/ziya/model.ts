// Loads the baked model (scripts/ziya/bake-model.mjs): gzip, then a small JSON header, then quantised parts.
export interface PartData { n: string; pos: Float32Array; nor: Float32Array; idx: Uint16Array }
export type ModelData = Record<string, PartData>;

export async function loadModel(url: string): Promise<ModelData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("model " + res.status);
  let buf = await res.arrayBuffer();
  const b = new Uint8Array(buf, 0, 2);
  if (b[0] === 0x1f && b[1] === 0x8b) {   // still gzipped (a server that already unzipped it is fine too)
    if (typeof DecompressionStream === "undefined") throw new Error("no DecompressionStream");
    buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
  }
  const hl = new DataView(buf).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, hl))) as { parts: { n: string; nv: number; ni: number; mn: number[]; mx: number[]; o: number }[] };
  const base = 4 + hl, pad = (x: number) => (4 - (x % 4)) % 4;
  const out: ModelData = {};
  for (const p of head.parts) {
    const pb = p.nv * 6, nb = p.nv * 3, ib = p.ni * 2;
    const q = new Int16Array(buf.slice(base + p.o, base + p.o + pb));
    const qn = new Int8Array(buf.slice(base + p.o + pb + pad(pb), base + p.o + pb + pad(pb) + nb));
    const io = base + p.o + pb + pad(pb) + nb + pad(nb);
    const idx = new Uint16Array(buf.slice(io, io + ib));
    const pos = new Float32Array(p.nv * 3), nor = new Float32Array(p.nv * 3);
    for (let i = 0; i < p.nv; i++) {
      for (let k = 0; k < 3; k++) pos[i * 3 + k] = p.mn[k] + ((q[i * 3 + k] + 32768) / 65535) * (p.mx[k] - p.mn[k]);
      const x = qn[i * 3] / 127, y = qn[i * 3 + 1] / 127, z = qn[i * 3 + 2] / 127, l = Math.hypot(x, y, z) || 1;
      nor[i * 3] = x / l; nor[i * 3 + 1] = y / l; nor[i * 3 + 2] = z / l;
    }
    out[p.n] = { n: p.n, pos, nor, idx };
  }
  return out;
}
