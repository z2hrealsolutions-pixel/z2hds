// usage: NODE_PATH=$(npm root -g) node scripts/shots.js <baseUrl> <outDir>
const { chromium } = require("playwright");
const [base, out] = process.argv.slice(2);
const pages = [["home", "/"], ["services", "/services"], ["gallery", "/gallery"], ["estimate", "/estimate"], ["contact", "/contact"], ["blog", "/blog"], ["post", "/blog/how-much-does-3d-printing-cost-in-sri-lanka"]];
(async () => {
  const b = await chromium.launch();
  const report = [];
  for (const [mode, ctxOpts] of [["desk", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }], ["phone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true }]]) {
    const ctx = await b.newContext(ctxOpts);
    for (const [name, path] of pages) {
      const p = await ctx.newPage();
      const errs = [];
      p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
      p.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160)); });
      p.on("requestfailed", (r) => errs.push("failed: " + r.url().slice(0, 100)));
      const resp = await p.goto(base + path, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => ({ status: () => "ERR " + e.message }));
      await p.waitForTimeout(500);
      // scroll to trigger lazy images
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(400);
      const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, imgs: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length }));
      report.push(`${mode} ${name} status=${resp.status()} scrollW=${sw.sw}/${sw.cw} brokenImgs=${sw.imgs} errs=${errs.length ? errs.join(" | ") : "none"}`);
      await p.screenshot({ path: `${out}/${name}-${mode}.png`, fullPage: true });
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
  console.log(report.join("\n"));
})();
