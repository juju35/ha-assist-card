// Renders the cards with a mock Home Assistant (scripts/mock-assist.mjs) and saves the README screenshots.
// Usage: npm run build && npm run screenshots   (CHROMIUM_PATH=/path/to/chrome to use an installed browser)
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { AREAS, ENTITIES, mockHass, PIPELINES, SCRIPT, STATES } from "./mock-assist.mjs";
import { unchanged } from "./pixels.mjs";
import { gifs, shots } from "./screenshot-list.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
mkdirSync(`${root}screenshots`, { recursive: true });

// Every capture is rendered to a temporary file and copied over screenshots/<file> only when its decoded pixels
// differ (scripts/pixels.mjs): a run that draws the same pictures changes no file, so the workflow commits nothing.
const work = mkdtempSync(join(tmpdir(), "ac-shots-"));
const keep = (fresh, name) => {
  const target = `${root}screenshots/${name}`;
  if (unchanged(fresh, target)) return console.log(`screenshots/${name} (unchanged)`);
  copyFileSync(fresh, target);
  console.log(`screenshots/${name}`);
};
const cardJs = readFileSync(`${root}dist/assist-card.js`, "utf8");

// Every uncaught page error is collected here; the script exits non-zero when any occurred.
const pageErrors = [];

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

// The page has no microphone to ask for: the card only checks that the browser has one.
const MIC = `if (!navigator.mediaDevices) Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia: async () => { throw new Error("no microphone"); } } });`;

const pageHtml = (theme, width) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme])
    .map(([k, v]) => `${k}:${v};`)
    .join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// The agents' logos come from images/ instead of the brands CDN: the same pictures offline and on every run.
const routeLogos = (page) =>
  page.route("https://brands.home-assistant.io/**", (route) => {
    const domain = new URL(route.request().url()).pathname.split("/")[2];
    const file = `${root}images/${domain}.png`;
    return existsSync(file) ? route.fulfill({ path: file, contentType: "image/png" }) : route.fulfill({ status: 404, body: "" });
  });

// Opens a card on a fresh page with the mock hass, sends its requests one after another and clicks its clicks.
async function openCard(browser, { file, type, config, theme, width, requests, clicks, listening }) {
  const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 }, timezoneId: "UTC", locale: "en-US" });
  await context.addInitScript({ content: MIC });
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    console.error(`pageerror (${file}): ${err.message}`);
    pageErrors.push(`${file}: ${err.message}`);
  });
  await routeLogos(page);
  await page.setContent(pageHtml(theme, width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.addScriptTag({ content: `window.mockHass = ${mockHass.toString()};` });
  await page.evaluate(
    async ({ type, config, theme, data, requests, clicks, listening }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = window.mockHass({ ...data, dark: theme === "dark" });
      window.card = el;
      document.getElementById("root").appendChild(el);
      await new Promise((r) => setTimeout(r, 50));
      for (const q of requests || []) await el._send(q);
      // A mouse click (detail 1), not .click(): a keyboard-like click would move the focus and show its ring.
      for (const sel of clicks || []) el.shadowRoot.querySelector(sel).dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
      if (listening) {
        el._voice = "listening";
        el._update();
      }
    },
    { type, config, theme, data: { pipelines: PIPELINES, states: STATES, entities: ENTITIES, areas: AREAS, script: SCRIPT }, requests, clicks, listening },
  );
  // The logo loaded, the fonts settled.
  await page.waitForTimeout(400);
  return { page, context };
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

const animations = () => {
  const card = window.card.shadowRoot;
  return [document, card].flatMap((r) => r.getAnimations());
};

const clipOf = async (page, width) => {
  const box = await page.locator("#root").boundingBox();
  return { x: 0, y: 0, width: width + 32, height: Math.ceil(box.height) + 32 };
};

for (const s of shots) {
  const { page, context } = await openCard(browser, s);
  // Every animation at its start, then paused: the still capture is the same on every run.
  await page.evaluate(`(${animations.toString()})().forEach((a) => { a.pause(); a.currentTime = 0; })`);
  await page.screenshot({ path: join(work, `${s.file}.png`), clip: await clipOf(page, s.width) });
  keep(join(work, `${s.file}.png`), `${s.file}.png`);
  await context.close();
}

// Lets a pending render happen (a streamed delta is drawn on the next animation frame, its new caret starting
// then), pauses every animation at `ms` and waits two animation frames, so that the screenshot never catches the
// frame before it is painted; returns how many animations there are.
const seek = (page, ms) =>
  page.evaluate(
    `(async () => { const frames = async () => { for (let k = 0; k < 2; k++) await new Promise((r) => requestAnimationFrame(() => r())); };
      await frames();
      const all = (${animations.toString()})(); for (const a of all) { a.pause(); a.currentTime = ${ms}; }
      await frames();
      return all.length; })()`,
  );

// The streamed answer of a GIF: the request is sent (its run stays open), then each frame pushes a few more
// characters as `intent-progress` deltas, then the final answer; the typing dots and the caret are stepped meanwhile.
const STREAM = {
  WAIT: 14,
  CHARS: 4,
  HOLD: 30,
};
async function streamFrames(page, gif, fps, shoot) {
  const { request, text } = gif.stream;
  await page.evaluate((q) => {
    window.card._send(q);
  }, request);
  await page.waitForTimeout(100);
  const push = (e) => page.evaluate((e) => window.card._hass.lastRun.push(e), e);
  let i = 0;
  for (; i < STREAM.WAIT; i++) await shoot(i, await seek(page, (i * 1000) / fps));
  await push({ type: "intent-progress", data: { chat_log_delta: { role: "assistant" } } });
  for (let at = 0; at < text.length; at += STREAM.CHARS, i++) {
    await push({ type: "intent-progress", data: { chat_log_delta: { content: text.slice(at, at + STREAM.CHARS) } } });
    await shoot(i, await seek(page, (i * 1000) / fps));
  }
  const speech = { response: { response_type: "action_done", speech: { plain: { speech: text } }, data: {} }, conversation_id: "conv-9" };
  await push({ type: "intent-end", data: { intent_output: speech } });
  await push({ type: "run-end", data: {} });
  // The run settles (the card back to Ready), then its color transitions are taken to their end: no animation is
  // left running, and the last frames do not depend on when the run ended.
  await page.waitForTimeout(300);
  for (let k = 0; k < STREAM.HOLD; k++, i++) {
    await seek(page, 10000);
    await shoot(i, 1);
  }
}

// Records one animated state as a looping GIF (screenshots/<gif.file>.gif) — needs ffmpeg on PATH.
// Every animation is paused and stepped frame by frame, so the GIF is identical whatever the machine's speed.
async function makeGif(gif, { fps = 20, seconds = 1.6 } = {}) {
  const { page, context } = await openCard(browser, gif);
  const dir = mkdtempSync(join(tmpdir(), "ac-frames-"));
  // The clip of the tallest state: the chat grows with the conversation up to its maximum height.
  const clip = await clipOf(page, gif.width);
  clip.height += await page.evaluate(() => {
    const chat = window.card.shadowRoot.querySelector(".chat");
    return chat ? Math.max(0, Math.ceil(Number.parseFloat(getComputedStyle(chat).maxHeight) - chat.offsetHeight)) : 0;
  });
  const shoot = async (i, n) => {
    if (!n) throw new Error(`${gif.file}: no animation found to step`);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  };
  if (gif.stream) await streamFrames(page, gif, fps, shoot);
  else for (let i = 0; i < Math.round(fps * seconds); i++) await shoot(i, await seek(page, (i * 1000) / fps));
  await context.close();
  const out = join(work, `${gif.file}.gif`);
  // Halve the retina capture and build a per-clip palette with ordered (Bayer) dithering: deterministic and small.
  execFileSync("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-framerate",
    String(fps),
    "-i",
    join(dir, "f%03d.png"),
    "-vf",
    `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop",
    "0",
    out,
  ]);
  rmSync(dir, { recursive: true });
  keep(out, `${gif.file}.gif`);
}

for (const g of gifs) await makeGif(g);
await browser.close();
rmSync(work, { recursive: true });

if (pageErrors.length) {
  console.error(`\n${pageErrors.length} page error(s) while rendering:`);
  for (const e of pageErrors) console.error(`  ${e}`);
  process.exitCode = 1;
}
