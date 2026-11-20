import assert from "node:assert/strict";
import { test } from "node:test";
import { AREAS, ENTITIES, mockHass, PIPELINES, SCRIPT, STATES } from "../scripts/mock-assist.mjs";
import { load } from "./load.mjs";

const ac = load();
const ticks = (n = 20) => new Promise((r) => setTimeout(r, n));
// Waits until `ok()` holds (a streamed run sends its events one timer tick apart: under load a fixed wait is too short).
const until = async (ok, ms = 2000) => {
  for (const end = Date.now() + ms; !ok() && Date.now() < end; ) await ticks(5);
};

// A fresh connection each time: the pipelines are read once per connection.
const makeHass = (extra = {}) => mockHass({ pipelines: structuredClone(PIPELINES), states: STATES, entities: ENTITIES, areas: AREAS, script: SCRIPT, ...extra });
const newCard = async (config = {}, hass = makeHass(), Card = ac.AssistCard) => {
  const card = new Card();
  card.setConfig(config);
  card.hass = hass;
  await ticks();
  return card;
};
const html = (card) => card.shadowRoot.innerHTML;
const runs = (hass) => hass.log.filter((m) => m.type === "assist_pipeline/run");
const plain = (o) => JSON.parse(JSON.stringify(o));
const PL = { list: PIPELINES.pipelines, preferred: PIPELINES.preferred_pipeline };

test("markdown-lite: escaped first, then bold, italic, code, lists, headings and http(s) links only", () => {
  assert.equal(ac.md("<script>alert(1)</script>"), "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
  assert.equal(ac.md("**Bold** and *italic* and `a<b>`"), "<p><strong>Bold</strong> and <em>italic</em> and <code>a&lt;b&gt;</code></p>");
  assert.equal(ac.md("Two:\n- one\n- two\n\nEnd"), "<p>Two:</p><ul><li>one</li><li>two</li></ul><p>End</p>");
  assert.equal(ac.md("1. first\n2. **second**"), "<ol><li>first</li><li><strong>second</strong></li></ol>");
  assert.equal(ac.md("line one\nline two"), "<p>line one<br>line two</p>");
  assert.equal(ac.md("## Title"), "<p><strong>Title</strong></p>");
  assert.equal(ac.md("```yaml\nkey: <v>\n```"), "<pre><code>key: &lt;v&gt;</code></pre>");
  // A fence still open while the answer streams holds code up to the end.
  assert.equal(ac.md("See:\n```\nx = 1"), "<p>See:</p><pre><code>x = 1</code></pre>");
  assert.equal(ac.md("[docs](https://example.org/a?b=1&c=2)"), '<p><a href="https://example.org/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">docs</a></p>');
  assert.equal(ac.md("[x](javascript:alert(1))"), "<p>[x](javascript:alert(1))</p>");
  assert.equal(ac.md('**"quoted"**'), "<p><strong>&quot;quoted&quot;</strong></p>");
  // Asterisks in arithmetic or snake_case words stay as they are.
  assert.equal(ac.md("2 * 3 * 4 and snake_case_name"), "<p>2 * 3 * 4 and snake_case_name</p>");
  assert.equal(ac.md("`**not bold**`"), "<p><code>**not bold**</code></p>");
  assert.equal(ac.md(""), "");
});

test("the pipeline of the config: the preferred one by default, null when it does not exist", () => {
  assert.equal(ac.pickPipeline(undefined, "x"), undefined);
  assert.equal(ac.pickPipeline(PL, undefined).name, "Google AI");
  assert.equal(ac.pickPipeline(PL, "preferred").name, "Google AI");
  assert.equal(ac.pickPipeline(PL, "01jhomeassistant").name, "Home Assistant");
  assert.equal(ac.pickPipeline({ list: PIPELINES.pipelines, preferred: "01jhomeassistant" }, "").name, "Home Assistant");
  assert.equal(ac.pickPipeline({ list: PIPELINES.pipelines, preferred: null }, "nope"), null);
});

test("agents: the built-in one has no logo and is not given the area, the others show their integration", () => {
  const hass = makeHass();
  assert.ok(ac.isBuiltin(hass, "conversation.home_assistant"));
  assert.ok(ac.isBuiltin(hass, "homeassistant"));
  assert.ok(!ac.isBuiltin(hass, "conversation.google_ai_conversation"));
  assert.equal(ac.agentPlatform(hass, "conversation.google_ai_conversation"), "google_generative_ai_conversation");
  assert.equal(ac.agentPlatform(hass, "conversation.home_assistant"), null);
  assert.equal(ac.agentName(hass, "conversation.google_ai_conversation"), "Google AI Conversation");
  assert.equal(ac.agentName(hass, "homeassistant"), "Home Assistant");
  assert.equal(ac.speechOf({ speech: { plain: { speech: "Hi" } } }), "Hi");
  assert.equal(ac.speechOf({}), "");
});

test("empty card: title, pipeline and agent as subtitle, ready, the agent's logo, no suggestion without an area", async () => {
  const card = await newCard({ illustration: false });
  const h = html(card);
  assert.match(h, /<div class="name">Assist<\/div>/);
  // Classic header: the agent's logo sits before its name in the subtitle, the badge is the robot in the status color.
  assert.match(h, /<div class="sub">Google AI · <img data-platform="google_generative_ai_conversation" class="logo" src="[^"]+" alt="">Google AI Conversation<\/div>/);
  assert.match(h, /<span class="badge accent clickable"[^>]*><svg class="icon type"[^>]*><path d="[^"]+"\/><\/svg><\/span>/);
  assert.doesNotMatch(h, /class="banner/);
  assert.match(h, /pill accent/);
  assert.match(h, />Ready</);
  assert.match(h, /How can I help\?/);
  assert.match(h, /brands\.home-assistant\.io\/_\/google_generative_ai_conversation\/icon\.png/);
  assert.doesNotMatch(h, /class="chip"/);
  assert.doesNotMatch(h, /data-action="new"/);
  assert.equal(card._hass.log.filter((m) => m.type === "assist_pipeline/pipeline/list").length, 1);
});

test("a request runs the pipeline from intent to intent, streams the answer and keeps the conversation id", async () => {
  const hass = makeHass();
  const card = await newCard({}, hass);
  await card._send("Turn on the living room lights");
  const [run] = runs(hass);
  assert.deepEqual(plain(run), { type: "assist_pipeline/run", start_stage: "intent", end_stage: "intent", input: { text: "Turn on the living room lights" } });
  const msgs = card._messages.map((m) => [m.role, m.text, (m.tools || []).join()]);
  assert.deepEqual(plain(msgs), [
    ["user", "Turn on the living room lights", ""],
    ["assistant", "", "HassTurnOn"],
    ["assistant", "Done, the **living room** lights are on.", ""],
  ]);
  const h = html(card);
  assert.match(h, /<span class="tool">.*HassTurnOn<\/span>/);
  assert.match(h, /Done, the <strong>living room<\/strong> lights are on\./);
  assert.doesNotMatch(h, /class="bubble[^"]*(streaming|typing)/);
  assert.match(h, /data-action="new"/);
  await card._send("Which lights are still on?");
  assert.equal(runs(hass)[1].conversation_id, "conv-1");
  assert.match(html(card), /<ol><li><code>light\.kitchen_ceiling<\/code>: kitchen ceiling<\/li>/);
});

test("while an answer streams: the typing dots first, then the partial text with its caret, the card busy", async () => {
  const hass = makeHass();
  const card = await newCard({}, hass);
  card._send("Summarize today's energy use");
  await ticks();
  assert.match(html(card), /class="bubble typing/);
  assert.match(html(card), />Thinking…</);
  assert.ok(card._busy);
  // A second request waits for the first one.
  await card._send("Which lights are still on?");
  assert.equal(runs(hass).length, 1);
  card._newConversation(true);
  card._send("Write a short note for the fridge");
  await until(() => /bubble md streaming/.test(html(card)) && /Dinner is in the oven,/.test(html(card)));
  const h = html(card);
  assert.match(h, /bubble md streaming/);
  assert.match(h, /<strong>Back at 7 pm\.<\/strong> Dinner is in the oven,/);
  assert.doesNotMatch(h, /class="bubble typing/);
  // Dropped: no run left waiting.
  card._newConversation();
});

test("a new conversation drops the messages, the conversation id and a run in progress", async () => {
  const hass = makeHass();
  const card = await newCard({}, hass);
  await card._send("Which lights are still on?");
  card._send("Summarize today's energy use");
  await ticks();
  card._onClick({ composedPath: () => [{ dataset: { action: "new" } }], stopPropagation() {} });
  assert.equal(card._messages.length, 0);
  assert.equal(card._conversationId, null);
  assert.equal(card._busy, false);
  await card._send("Which lights are still on?");
  assert.equal(runs(hass).at(-1).conversation_id, undefined);
});

test("user text is escaped, never rendered as markdown or HTML", async () => {
  const card = await newCard();
  await card._send("<img src=x onerror=alert(1)> **hi**");
  const h = html(card);
  assert.match(h, /&lt;img src=x onerror=alert\(1\)&gt; \*\*hi\*\*/);
  assert.doesNotMatch(h, /<img src=x/);
});

test("area: default suggestions for it, the area given to AI agents but not to the built-in one", async () => {
  const hass = makeHass();
  const card = await newCard({ area: "living_room" }, hass);
  const h = html(card);
  assert.match(h, /data-text="Turn on the lights in the Living room"/);
  assert.match(h, /placeholder="Ask about Living room…"/);
  await card._send("Is it warm enough?");
  assert.equal(runs(hass)[0].input.text, "In the Living room: Is it warm enough?");
  // The user's bubble shows what was typed.
  assert.match(html(card), /<div class="bubble">Is it warm enough\?<\/div>/);
  // A suggestion already names its area.
  card._onClick({ composedPath: () => [{ dataset: { action: "suggest", text: "Turn off the lights in the Living room" } }], stopPropagation() {} });
  await ticks();
  assert.equal(runs(hass)[1].input.text, "Turn off the lights in the Living room");
  // The built-in agent matches set sentences: no prefix.
  const h2 = makeHass();
  const builtin = await newCard({ area: "kitchen", pipeline: "01jhomeassistant" }, h2);
  await builtin._send("Turn off the lights in the Kitchen");
  assert.deepEqual(plain(runs(h2)[0]), {
    type: "assist_pipeline/run",
    start_stage: "intent",
    end_stage: "intent",
    input: { text: "Turn off the lights in the Kitchen" },
    pipeline: "01jhomeassistant",
  });
  // area_context: false, or a list of suggestions of one's own.
  const h3 = makeHass();
  const own = await newCard({ area: "living_room", area_context: false, suggestions: ["Good night", " "] }, h3);
  assert.match(html(own), /data-text="Good night"/);
  assert.doesNotMatch(html(own), /Turn on the lights/);
  await own._send("Hello");
  assert.equal(runs(h3)[0].input.text, "Hello");
  const none = await newCard({ area: "living_room", show_suggestions: false });
  assert.doesNotMatch(html(none), /class="chip"/);
});

test("agent_id: conversation/process with the agent, the conversation id for follow-ups, speech through the pipeline", async () => {
  const hass = makeHass();
  const card = await newCard({ agent_id: "conversation.google_ai_conversation", speak: true, illustration: false }, hass);
  assert.match(html(card), /<div class="sub"><img data-platform="google_generative_ai_conversation" class="logo"[^>]*>Google AI Conversation<\/div>/);
  await card._send("Which lights are still on?");
  await card._send("Turn on the living room lights");
  const conv = hass.log.filter((m) => m.type === "conversation/process");
  assert.deepEqual(plain(conv[0]), { type: "conversation/process", text: "Which lights are still on?", agent_id: "conversation.google_ai_conversation" });
  assert.equal(conv[1].conversation_id, "conv-1");
  const tts = runs(hass);
  assert.deepEqual(plain(tts[0]), { type: "assist_pipeline/run", start_stage: "tts", end_stage: "tts", input: { text: SCRIPT["Which lights are still on?"].stream.join("") } });
  assert.equal(card._messages.at(-1).text, "Done, the **living room** lights are on.");
});

test("speak: the pipeline run goes on to the speech stage", async () => {
  const hass = makeHass();
  const card = await newCard({ speak: true }, hass);
  await card._send("Which lights are still on?");
  assert.equal(runs(hass)[0].end_stage, "tts");
});

test("errors: an error answer of the agent, an error event of the pipeline, a failed command", async () => {
  const card = await newCard({ pipeline: "01jhomeassistant" });
  await card._send("Open the garage door");
  assert.equal(card._messages.at(-1).role, "error");
  assert.match(html(card), /msg error.*Sorry, I am not aware of any device called garage door/s);
  assert.match(html(card), /pill warn/);
  const hass = makeHass();
  hass.connection.subscribeMessage = (cb) => {
    setTimeout(() => cb({ type: "error", data: { code: "intent-failed", message: "Unexpected error during intent recognition" } }), 0);
    return Promise.resolve(() => {});
  };
  const c2 = await newCard({}, hass);
  await c2._send("Hello");
  assert.equal(c2._messages.at(-1).text, "Something went wrong: Unexpected error during intent recognition");
  assert.equal(c2._busy, false);
  const h3 = makeHass();
  h3.callWS = async (msg) => {
    if (msg.type === "assist_pipeline/pipeline/list") return structuredClone(PIPELINES);
    throw { code: "unknown_error", message: "Agent unavailable" };
  };
  const c3 = await newCard({ agent_id: "conversation.google_ai_conversation" }, h3);
  await c3._send("Hello");
  assert.equal(c3._messages.at(-1).text, "Something went wrong: Agent unavailable");
  assert.equal(c3._errorText({ code: "stt-no-text-recognized" }), "I didn't catch that, please try again.");
});

test("a pipeline that does not exist: a warning and the input disabled", async () => {
  const card = await newCard({ pipeline: "01jgone" });
  const h = html(card);
  assert.match(h, /class="warning">Assist pipeline not found: 01jgone/);
  assert.match(h, /class="text"[^>]* disabled/);
  assert.match(h, /pill idle/);
  await card._send("Hello");
  assert.equal(card._messages.length, 0);
});

test("an unavailable agent reads Unavailable", async () => {
  const states = { ...STATES, "conversation.google_ai_conversation": { ...STATES["conversation.google_ai_conversation"], state: "unavailable" } };
  const card = await newCard({}, makeHass({ states }));
  assert.match(html(card), />Unavailable</);
});

test("voice: the samples go as 16-bit PCM after the handler id; the end of the audio is the handler id alone", async () => {
  const pcm = ac.toPcm16(Float32Array.from([0, 1, -1, 0.5, 2]));
  assert.deepEqual([...pcm], [0, 32767, -32768, 16383, 32767]);
  const hass = makeHass();
  const card = await newCard({}, hass);
  card._handler = 7;
  card._sendAudio(Int16Array.from([1, -2]));
  card._sendAudio(null);
  assert.deepEqual([...hass.sent[0]], [7, 1, 0, 254, 255]);
  assert.deepEqual([...hass.sent[1]], [7]);
  // No microphone in this sandbox: no mic button.
  assert.doesNotMatch(html(card), /data-action="mic"/);
});

test("mini card: the last question and answer, the detail button unfolds the chat, a tap elsewhere folds it", async () => {
  const card = await newCard({}, makeHass(), ac.AssistMiniCard);
  assert.match(html(card), /Type a request or pick a suggestion\./);
  assert.match(html(card), /data-action="zoom"/);
  await card._send("Which lights are still on?");
  let h = html(card);
  assert.match(h, /<div class="q" title="Which lights are still on\?">/);
  assert.match(h, /Two lights are on:/);
  assert.doesNotMatch(h, /class="chat"/);
  assert.doesNotMatch(h, /data-action="new"/);
  assert.deepEqual(plain(card.getGridOptions()), { columns: 6, min_columns: 6, rows: "auto" });
  card._onClick({ composedPath: () => [{ dataset: { action: "zoom" } }], stopPropagation() {} });
  h = html(card);
  assert.match(h, /class="chat"/);
  assert.match(h, /data-action="new"/);
  assert.equal(card.getCardSize(), 8);
  card.connectedCallback();
  card._unzoom.tap({ composedPath: () => [{ tagName: "DIV" }] });
  assert.doesNotMatch(html(card), /class="chat"/);
  card._setZoom(true);
  card.disconnectedCallback();
  assert.equal(card._zoomed, false);
  const noZoom = await newCard({ zoom: false }, makeHass(), ac.AssistMiniCard);
  assert.doesNotMatch(html(noZoom), /data-action="zoom"/);
});

test("input bar: one round button, the microphone while the field is empty, send once there is text", async () => {
  // A browser with a microphone (the sandbox has none).
  ac.window.navigator = { mediaDevices: { getUserMedia() {} } };
  ac.window.AudioContext = class {};
  try {
    const card = await newCard({ area: "living_room" });
    let h = html(card);
    assert.match(h, /class="ibtn mic"[^>]*data-action="mic"/);
    assert.doesNotMatch(h, /data-action="send"/);
    assert.match(h, /Type or say a request\./);
    // The suggestions sit above the input bar, not in the empty state.
    assert.match(h, /<div class="suggest"><div class="chips">.*<\/div><\/div>\s*<div class="inputbar">/s);
    assert.doesNotMatch(h.slice(h.indexOf('class="empty"'), h.indexOf('class="suggest"')), /class="chip"/);
    const input = card.shadowRoot.input;
    input.value = "Hello";
    card.shadowRoot.listeners.input[0]({ target: input });
    h = html(card);
    assert.match(h, /class="ibtn send" data-action="send"[^>]*>/);
    assert.doesNotMatch(h, /class="ibtn send"[^>]* disabled/);
    assert.doesNotMatch(h, /data-action="mic"/);
    card._sendInput();
    await ticks();
    assert.equal(input.value, "");
    assert.match(html(card), /data-action="mic"/);
    // Listening: the ring pulses (class "on"), the button stops the recording.
    card._voice = "listening";
    card._update();
    h = html(card);
    assert.match(h, /class="ibtn mic on" data-action="mic" title="Stop listening"[^>]*aria-pressed="true"/);
    assert.match(h, />Listening…</);
    card._voice = null;
    // The mini card is voice first: the big microphone in the middle, the last question in quotes, no text field.
    const mini = await newCard({ area: "living_room" }, makeHass(), ac.AssistMiniCard);
    assert.match(html(mini), /<div class="voice"[^>]*><button class="ibtn mic big"/);
    assert.doesNotMatch(html(mini), /class="text"/);
    assert.match(html(mini), /data-text="Turn on the lights in the Living room"/);
    await mini._send("Which lights are still on?");
    assert.match(html(mini), /<div class="q" title="Which lights are still on\?">Which lights are still on\?<\/div><div class="msg assistant">/);
    mini._voice = "listening";
    mini._update();
    assert.match(html(mini), /class="ibtn mic big on"/);
    mini._voice = null;
  } finally {
    delete ac.window.navigator;
    delete ac.window.AudioContext;
  }
});

test("changing the pipeline or the agent starts another conversation; other options keep it", async () => {
  const card = await newCard();
  await card._send("Which lights are still on?");
  card.setConfig({ title: "Home" });
  assert.equal(card._messages.length, 2);
  card.setConfig({ title: "Home", pipeline: "01jhomeassistant" });
  assert.equal(card._messages.length, 0);
  assert.throws(() => card.setConfig({ suggestions: "nope" }), /suggestions must be a list/);
});

test("editors: pipeline, agent and area pickers; options at their default are not written", () => {
  const ed = new ac.AssistCardEditor();
  ed._config = {};
  const names = ed._schema().flatMap((s) => (s.schema ? s.schema.map((x) => x.name) : [s.name]));
  assert.deepEqual(plain(names), ["pipeline", "agent_id", "title", "area", "illustration", "show_title", "show_subtitle", "show_suggestions", "area_context", "voice", "speak", "illustration_theme", "height", "language"]);
  assert.ok(ed._schema()[0].selector.assist_pipeline);
  assert.ok(ed._schema()[1].selector.conversation_agent);
  const defaults = { ...Object.fromEntries(ac.AssistCardEditor.toggles), pipeline: "preferred", height: 360, illustration_theme: "auto" };
  assert.deepEqual(plain(ac.cleanConfig({ type: "custom:assist-card", pipeline: "preferred", height: 360, illustration: true, illustration_theme: "auto", voice: true, speak: false, agent_id: "", area: "kitchen" }, defaults)), {
    type: "custom:assist-card",
    area: "kitchen",
  });
  assert.deepEqual(plain(ac.cleanConfig({ speak: true, height: 500, suggestions: ["a"] }, defaults)), { speak: true, height: 500, suggestions: ["a"] });
  assert.ok(ac.AssistMiniCardEditor.toggles.some(([n]) => n === "zoom"));
});

test("illustrated header: the room at the right, the microphone in the status color with the agent's logo on it", async () => {
  const card = await newCard();
  const h = html(card);
  assert.match(h, /<div class="banner accent">/);
  assert.match(h, /<div class="as-ground"/);
  assert.match(h, /<svg class="as-scene idle"/);
  assert.match(h, new RegExp(`<span class="badge accent clickable"[^>]*><svg class="icon type"[^>]*><path d="${ac.ICONS.mic}"/></svg><span class="blogo"><img data-platform="google_generative_ai_conversation"`));
  // The logo moved to the icon: the subtitle keeps the names.
  assert.match(h, /<div class="sub">Google AI · Google AI Conversation<\/div>/);
  assert.match(h, /pill accent/);
  // Ids of one card's picture apart from another card's.
  const other = await newCard();
  assert.notEqual(card._uid, other._uid);
  assert.match(html(other), new RegExp(`id="as-glow-${other._uid}"`));
});

test("illustrated header: the scene follows the status", async () => {
  const card = await newCard({}, makeHass(), ac.AssistMiniCard);
  card._voice = "listening";
  card._update();
  assert.match(html(card), /<div class="banner crit[ "]/);
  assert.match(html(card), /as-scene listening[\s\S]*class="as-in"[\s\S]*class="as-bars"/);
  card._voice = "transcribing";
  card._update();
  assert.match(html(card), /as-scene thinking[\s\S]*class="as-dots"/);
  card._voice = null;
  card._speaking = true;
  card._update();
  assert.match(html(card), /<div class="banner ok[ "][^>]*>[\s\S]*as-scene speaking[\s\S]*class="as-out"/);
  card._speaking = false;
  card._messages.push({ role: "error", text: "x" });
  card._update();
  assert.match(html(card), /<div class="banner warn[ "][^>]*>[\s\S]*as-scene error[\s\S]*class="as-bang"/);
  assert.equal(ac.SCENE_STATES.unavailable, "off");
});

test("illustration night: illustration_theme, else the dark theme alone", () => {
  const sun = (state, dark = false) => ({ states: { "sun.sun": { state } }, themes: { darkMode: dark } });
  assert.equal(ac.isNight(sun("below_horizon"), {}), false, "light theme after sunset: day");
  assert.equal(ac.isNight(sun("below_horizon", true), {}), true, "dark theme after sunset: night");
  assert.equal(ac.isNight(sun("above_horizon", true), {}), true, "dark theme while the sun is up: night");
  assert.equal(ac.isNight(sun("above_horizon", false), {}), false, "light theme while the sun is up: day");
  assert.equal(ac.isNight(sun("above_horizon", true), { illustration_theme: "day" }), false);
  assert.equal(ac.isNight(sun("unavailable", true), {}), true);
  assert.equal(ac.isNight(sun("above_horizon"), { illustration_theme: "night" }), true);
  assert.equal(ac.isNight(sun("below_horizon"), { illustration_theme: "day" }), false);
  assert.equal(ac.isNight({ states: {}, themes: { darkMode: true } }, { illustration_theme: "auto" }), true);
  assert.equal(ac.isNight({ states: {} }, {}), false);
});

test("every language has every text, with the same placeholders", () => {
  const en = ac.STRINGS.en;
  assert.equal(ac.LANGUAGES.length, 22);
  for (const [code] of ac.LANGUAGES) {
    const tr = ac.STRINGS[code];
    assert.ok(tr, code);
    assert.deepEqual(Object.keys(tr).sort(), Object.keys(en).sort(), code);
    for (const [k, v] of Object.entries(en)) {
      const ph = (s) => (s.match(/\{\w+\}/g) || []).sort();
      assert.deepEqual(ph(tr[k]), ph(v), `${code}.${k}`);
    }
  }
  assert.equal(ac.t({ language: "fr" }, {}, "status_ready"), ac.STRINGS.fr.status_ready);
  assert.equal(ac.lang({ language: "pt-BR" }, {}), "pt");
  assert.equal(ac.lang({ language: "sr-Latn" }, {}), "sr-Latn");
});

test("full card: the chat grows with the conversation up to its height, then scrolls (no empty block above the input)", async () => {
  const h = html(await newCard({ height: 400 }));
  assert.match(h, /\.chat \{ max-height: var\(--ac-height, 360px\); overflow-y: auto;/);
  assert.doesNotMatch(h, /\.chat \{ height:/);
  assert.match(h, /--ac-height: 400px;/);
});
