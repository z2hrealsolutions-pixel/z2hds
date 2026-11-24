// Renders the 2D sprite frames (cel-shaded, transparent) from the lab page, then scripts/ziya/pack-sprites.py packs them.
//   1) NEXT_PUBLIC_ZIYA_LAB=1 npx next dev -p 3100     2) node scripts/ziya/render-sprites.js <outdir> [pixelRatio]
const { chromium } = require("playwright"); const fs = require("fs");
const OUT = process.argv[2], PR = process.argv[3] || "0.4";
// clip -> frames per second in the sprite strip
const CLIPFPS = { welcomeLite: 10, welcomeBack: 10, goodbye: 10, hopHappy: 10, curious: 8, lookAround: 8, yawn: 8, sleep: 5, wake: 10, wow: 10, cheer: 10, worried: 8, sorry: 8, thanks: 8, peek: 8 };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 420, height: 560 }, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => console.log("pageerror:", e.message));
  await p.goto(`http://127.0.0.1:3100/ziya-lab?pr=${PR}&style=toon`);
  await p.waitForFunction(() => window.ziyaLab && window.ziyaLab.ready, null, { timeout: 120000 });
  const dur = await p.evaluate(() => window.ziyaLab.dur);
  const meta = { size: await p.evaluate(() => window.ziyaLab.size), strips: {} };
  const save = async (strip, i, js, arg) => { const url = await p.evaluate(js, arg); fs.mkdirSync(`${OUT}/${strip}`, { recursive: true }); fs.writeFileSync(`${OUT}/${strip}/${String(i).padStart(3, "0")}.png`, Buffer.from(url.split(",")[1], "base64")); };
  const draw = (o) => window.ziyaLab.draw(o);
  // ONLY=walkFR,walkFL renders just those strips (to add or redo a few strips without redoing all of them)
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null; const want = (n) => !only || only.includes(n);
  // faces (centre) + blink
  const faces = ["happy", "neutral", "surprised", "worried", "sleepy"]; let i = 0;
  if (want("faces")) { for (const f of faces) await save("faces", i++, draw, { expr: f }); await save("faces", i++, draw, { expr: "happy", blink: 1 }); meta.strips.faces = { n: i, fps: 0 }; }
  // 3x3 look grid, happy face. index = (ly+1)*3 + (lx+1)
  if (want("look")) { i = 0; for (const ly of [-1, 0, 1]) for (const lx of [-1, 0, 1]) await save("look", i++, draw, { lx, ly }); meta.strips.look = { n: i, fps: 0 }; }
  // walking, 8 frames per cycle, both directions
  for (const [nm, yaw] of [["walkR", 0.84], ["walkL", -0.84]]) { if (!want(nm)) continue; for (let k = 0; k < 8; k++) await save(nm, k, draw, { walk: 1, phase: k / 8, yaw, lx: 0.2 * Math.sign(yaw) }); meta.strips[nm] = { n: 8, fps: 0 }; }
  // walking while a message shows: three-quarter body (yaw x 0.45) and the head turned fully back to the visitor
  for (const [nm, yaw] of [["walkFR", 0.84 * 0.45], ["walkFL", -0.84 * 0.45]]) { if (!want(nm)) continue; for (let k = 0; k < 8; k++) await save(nm, k, draw, { walk: 1, phase: k / 8, yaw, lx: 0, face: 1 }); meta.strips[nm] = { n: 8, fps: 0 }; }
  for (const [name, fps] of Object.entries(CLIPFPS)) {
    if (!want("c_" + name)) continue;
    const d = dur[name], n = Math.floor(d * fps) + 1;
    for (let k = 0; k < n; k++) await save("c_" + name, k, ([nm, u]) => window.ziyaLab.clip(nm, u), [name, Math.min(d, k / fps)]);
    meta.strips["c_" + name] = { n, fps };
  }
  fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta));
  await b.close(); console.log("rendered", Object.entries(meta.strips).map(([k, v]) => k + ":" + v.n).join(" "));
})();
