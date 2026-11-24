// ---------------------------------------------------------------------------
// Assist pipelines and conversation agents
// ---------------------------------------------------------------------------
import { BUILTIN_AGENTS, SUGGESTION_KEYS } from "./icons.js";
import { errText, t } from "./helpers.js";

// The pipelines, read once per connection: { list, preferred, error }.
export const PIPELINES = new WeakMap();
export const loadPipelines = (hass) => {
  const key = hass?.connection && typeof hass.connection === "object" ? hass.connection : hass;
  if (!key || typeof hass.callWS !== "function") return Promise.resolve({ list: [], preferred: null, error: "no connection" });
  if (!PIPELINES.has(key)) {
    PIPELINES.set(
      key,
      hass.callWS({ type: "assist_pipeline/pipeline/list" }).then(
        (r) => ({ list: Array.isArray(r?.pipelines) ? r.pipelines : [], preferred: r?.preferred_pipeline ?? null }),
        (err) => ({ list: [], preferred: null, error: errText(err) }),
      ),
    );
  }
  return PIPELINES.get(key);
};

export const isPreferred = (id) => !id || id === "preferred" || id === "last_used";

// The pipeline of the config: undefined while the list is not read yet, null when it is not there.
export const pickPipeline = (data, id) => {
  if (!data) return undefined;
  const want = isPreferred(id) ? data.preferred : id;
  return data.list.find((p) => p.id === want) || (isPreferred(id) ? data.list[0] || null : null);
};

export const isBuiltin = (hass, agentId) => !agentId || BUILTIN_AGENTS.has(agentId) || hass?.entities?.[agentId]?.platform === "conversation";

export const agentName = (hass, agentId) => {
  if (!agentId) return "";
  if (agentId === "homeassistant") return "Home Assistant";
  return hass?.states?.[agentId]?.attributes?.friendly_name || agentId;
};

// The integration of an agent entity (its logo), none for the built-in agent.
export const agentPlatform = (hass, agentId) => {
  if (isBuiltin(hass, agentId)) return null;
  return hass?.entities?.[agentId]?.platform || null;
};

// Integrations whose logo did not load (offline, unknown brand): not asked for again on every render.
export const BROKEN_LOGOS = new Set();
export const brandIcon = (domain, dark) => `https://brands.home-assistant.io/_/${encodeURIComponent(domain)}/${dark ? "dark_" : ""}icon.png`;

// Voice input needs the microphone (a secure context: https or localhost) and the Web Audio API.
export const voiceSupported = () => !!(globalThis.navigator?.mediaDevices?.getUserMedia && (globalThis.AudioContext || globalThis.webkitAudioContext));

// The suggestion chips: the list of the config, else a few requests about its area.
export const suggestionsOf = (hass, config) => {
  if (config.show_suggestions === false) return [];
  if (Array.isArray(config.suggestions)) return config.suggestions.map((s) => String(s ?? "").trim()).filter(Boolean);
  const area = areaName(hass, config);
  return area ? SUGGESTION_KEYS.map((k) => t(hass, config, k, { area })) : [];
};

export const areaName = (hass, config) => {
  const id = config?.area;
  if (!id) return "";
  return hass?.areas?.[id]?.name || String(id);
};

// ---------------------------------------------------------------------------
// Microphone: 16-bit PCM mono, the format the pipeline's speech-to-text stage takes over the websocket. A
// MediaRecorder gives compressed audio (WebM/Opus), which the binary handler does not accept: the raw samples
// come from an AudioWorklet (a ScriptProcessor on older browsers) instead.
// ---------------------------------------------------------------------------

export const WORKLET = `class AssistCardRecorder extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch && ch.length) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor("assist-card-recorder", AssistCardRecorder);`;

export const toPcm16 = (f32) => {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
};

export class VoiceRecorder {
  constructor(onChunk) {
    this._onChunk = onChunk;
  }

  get sampleRate() {
    return this._ctx?.sampleRate ?? 16000;
  }

  async start() {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
      // 16 kHz when the browser resamples itself; Home Assistant resamples any other rate it is told.
      try {
        this._ctx = new AC({ sampleRate: 16000 });
      } catch (_err) {
        this._ctx = new AC();
      }
      this._src = this._ctx.createMediaStreamSource(this._stream);
      if (this._ctx.audioWorklet && globalThis.AudioWorkletNode) {
        const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
        try {
          await this._ctx.audioWorklet.addModule(url);
        } finally {
          URL.revokeObjectURL(url);
        }
        this._node = new AudioWorkletNode(this._ctx, "assist-card-recorder");
        this._node.port.onmessage = (ev) => this._onChunk(toPcm16(ev.data));
      } else {
        this._node = this._ctx.createScriptProcessor(4096, 1, 1);
        this._node.onaudioprocess = (ev) => this._onChunk(toPcm16(ev.inputBuffer.getChannelData(0)));
      }
      this._src.connect(this._node);
      this._node.connect(this._ctx.destination);
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  stop() {
    try {
      this._src?.disconnect();
      this._node?.disconnect();
    } catch (_err) {
      /* already disconnected */
    }
    if (this._node?.port) this._node.port.onmessage = null;
    for (const track of this._stream?.getTracks?.() || []) track.stop();
    this._ctx?.close?.().catch?.(() => {});
    this._src = this._node = this._stream = this._ctx = null;
  }
}

// ---------------------------------------------------------------------------
// The illustrated header: a living room at the right of the banner (window, sofa, sideboard) with a smart speaker
// on the sideboard, drawn in a 200 × 80 picture whose bottom (y 80) sits on the 10 px parquet strip that runs
// under the whole banner. The speaker shows the state: its light ring in the state's color, sound waves coming in
// while it listens, going out while it speaks, a speech bubble with the dots while it thinks, a « ! » on an error.
// ---------------------------------------------------------------------------

// The scene of each status of the card (_status()).
export const SCENE_STATES = { ready: "idle", listening: "listening", transcribing: "thinking", thinking: "thinking", speaking: "speaking", error: "error", unavailable: "off" };

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// Three sound arcs beside the speaker: on its left (side -1) or its right (side 1).
export const waves = (side) =>
  [0, 1, 2]
    .map((i) => {
      const x = 170 + side * (13 + i * 5.5);
      const h = 6 + i * 3.2;
      return `<path class="as-wave w${i} ${side < 0 ? "l" : "r"}" d="M${x} ${46 - h}Q${x + side * (2.6 + i)} 46 ${x} ${46 + h}"/>`;
    })
    .join("");

// The picture. `uid` keeps the ids of each card's gradients apart on a page with several cards.
export const assistScene = (uid, state) => {
  const bubble = {
    listening: `<g class="as-bars">${[0, 1, 2, 3, 4].map((i) => `<rect class="b${i}" x="${125.5 + i * 5}" y="12" width="2.4" height="10" rx="1.2"/>`).join("")}</g>`,
    thinking: `<g class="as-dots"><circle class="d1" cx="129" cy="17" r="2"/><circle class="d2" cx="137" cy="17" r="2"/><circle class="d3" cx="145" cy="17" r="2"/></g>`,
    speaking: `<g class="as-lines"><rect class="l1" x="124" y="12.5" width="26" height="2.2" rx="1.1"/><rect class="l2" x="124" y="18.3" width="18" height="2.2" rx="1.1"/></g>`,
    error: `<g class="as-bang"><rect x="135.8" y="10.5" width="2.4" height="8" rx="1.2"/><circle cx="137" cy="22" r="1.4"/></g>`,
  }[state];
  const sound = state === "listening" ? `<g class="as-in">${waves(-1)}</g>` : state === "speaking" ? `<g class="as-out">${waves(-1)}${waves(1)}</g>` : "";
  return `<div class="as-ground" aria-hidden="true"></div><svg class="as-scene ${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="as-glow-${uid}"><stop offset="0" stop-color="var(--as-ring)" stop-opacity=".55"/><stop offset="1" stop-color="var(--as-ring)" stop-opacity="0"/></radialGradient>
      <clipPath id="as-win-${uid}"><rect x="12" y="10" width="30" height="30" rx="1.5"/></clipPath>
    </defs>
    <g class="as-window">
      <rect class="as-pane" x="12" y="10" width="30" height="30" rx="1.5"/>
      <g clip-path="url(#as-win-${uid})">
        <path class="as-cloud" d="M17 25a3 3 0 0 1 4.6-2.6 3.8 3.8 0 0 1 7.2 1 2.3 2.3 0 0 1 .4 4.6H18.6A2.3 2.3 0 0 1 17 25Z"/>
        <path class="as-moon" d="M33 15.5a4.2 4.2 0 1 0 3.7 6.3 3.4 3.4 0 1 1-3.7-6.3Z"/>
        <circle class="as-star" cx="19" cy="16" r=".7"/><circle class="as-star" cx="25" cy="31" r=".6"/><circle class="as-star" cx="38" cy="33" r=".5"/>
      </g>
      <rect class="as-frame" x="12" y="10" width="30" height="30" rx="1.5"/><path class="as-frame" d="M27 10V40M12 25H42"/>
      <rect class="as-sill" x="9.5" y="40" width="35" height="2.4" rx="1"/>
    </g>
    <g class="as-sofa">
      <rect class="as-sofa-back" x="58" y="47" width="68" height="15" rx="5"/>
      <rect class="as-sofa-seat" x="56" y="58" width="72" height="14" rx="4"/>
      <rect class="as-sofa-arm" x="52" y="52" width="11" height="22" rx="4.5"/><rect class="as-sofa-arm" x="121" y="52" width="11" height="22" rx="4.5"/>
      <rect class="as-cushion" x="66" y="51" width="16" height="10" rx="4" transform="rotate(-8 74 56)"/>
      <path class="as-leg" d="M57 74v6M127 74v6"/>
    </g>
    <g class="as-sideboard">
      <rect class="as-board" x="146" y="62" width="48" height="16" rx="1.6"/><rect class="as-top" x="144.5" y="60.4" width="51" height="2.6" rx="1"/>
      <path class="as-door" d="M170 64.5v11"/><circle class="as-knob" cx="167" cy="70" r=".8"/><circle class="as-knob" cx="173" cy="70" r=".8"/>
      <path class="as-leg" d="M149 78v2M191 78v2"/>
    </g>
    <circle class="as-glow" cx="170" cy="36" r="17" fill="url(#as-glow-${uid})"/>
    ${sound}
    <g class="as-speaker">
      <rect class="as-body" x="161" y="35" width="18" height="25.4" rx="7"/>
      <path class="as-mesh" d="M163.4 44H176.6M163 48.5H177M163.4 53H176.6"/>
      <ellipse class="as-cap" cx="170" cy="35.6" rx="9" ry="2.8"/>
      <ellipse class="as-ring" cx="170" cy="35.6" rx="6.4" ry="1.8"/>
    </g>
    ${bubble ? `<g transform="translate(-24 0)"><g class="as-bubble"><rect x="118" y="6" width="38" height="22" rx="11"/><path d="M147 27l6 6 .4-7.4z"/>${bubble}</g></g>` : ""}
  </svg>`;
};

// The scene's colors and animations, day and night (only in the card's styles when the illustration is shown).
export const SCENE_STYLE = `
  .banner { position: relative; overflow: hidden; height: var(--as-banner-h, 90px); color: #2b2a33; background: #f4ede3;
            --as-ground-h: 10px; --as-scene-w: calc((var(--as-banner-h, 90px) - var(--as-ground-h)) * 2.5); }
  .banner.night { color: #fff; background: #2a2f3d; }
  .as-scene { position: absolute; right: 0; bottom: var(--as-ground-h); height: calc(100% - var(--as-ground-h)); width: min(var(--as-scene-w), 62%, 100cqw - 250px); overflow: hidden; }
  .as-ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--as-ground-h);
               background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .night .as-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5a4634; }
  .as-pane { fill: #bfe0f7; } .night .as-pane { fill: #1b2f52; }
  .as-frame { fill: none; stroke: #fff; stroke-width: 1.6; } .night .as-frame { stroke: #4a5568; }
  .as-sill { fill: #e4d9c8; } .night .as-sill { fill: #3f4757; }
  .as-cloud { fill: #fff; opacity: .95; animation: as-drift 6s ease-in-out infinite alternate; }
  .as-moon, .as-star { fill: #f4f1dc; display: none; }
  .night .as-moon, .night .as-star { display: inline; } .night .as-cloud { display: none; }
  .as-sofa-back, .as-sofa-arm { fill: #8f88db; } .as-sofa-seat { fill: #9d97e0; } .as-cushion { fill: #f2c46d; }
  .night .as-sofa-back, .night .as-sofa-arm { fill: #433d68; } .night .as-sofa-seat { fill: #4a4470; } .night .as-cushion { fill: #8a6f3e; }
  .as-leg { stroke: #6e5a45; stroke-width: 1.6; stroke-linecap: round; } .night .as-leg { stroke: #2a2420; }
  .as-board { fill: #c9b79c; } .as-top { fill: #b49f80; } .as-door { stroke: #b19c7d; stroke-width: .7; } .as-knob { fill: #8a7658; }
  .night .as-board { fill: #3c4558; } .night .as-top { fill: #4a5468; } .night .as-door { stroke: #2f3746; } .night .as-knob { fill: #6c7890; }
  /* The speaker: a dark fabric cylinder by day, a lighter one at night so that it stays visible on the dark room. */
  .as-body { fill: #2f3540; } .as-cap { fill: #444c5a; } .as-mesh { stroke: #404754; stroke-width: .6; stroke-linecap: round; }
  .night .as-body { fill: #5a6476; } .night .as-cap { fill: #707b8f; } .night .as-mesh { stroke: #6b7588; }
  .as-scene { --as-ring: var(--c, var(--ac-accent)); }
  .as-ring { fill: none; stroke: var(--as-ring); stroke-width: 1.4; }
  .as-glow { opacity: .6; transform-box: fill-box; transform-origin: center; }
  .idle .as-glow { animation: as-breathe 3.2s ease-in-out infinite; }
  .off .as-glow { display: none; } .off .as-ring { stroke: #8b93a1; opacity: .7; } .off .as-speaker { opacity: .75; }
  .listening .as-glow, .speaking .as-glow { opacity: .9; animation: as-breathe 1.2s ease-in-out infinite; }
  .thinking .as-ring { stroke-dasharray: 6 4; animation: as-spin 1s linear infinite; }
  .as-wave { fill: none; stroke: var(--as-ring); stroke-width: 1.5; stroke-linecap: round; opacity: 0; transform-box: fill-box; transform-origin: center; }
  .as-out .as-wave.l { animation: as-out-l 1.5s ease-out infinite; } .as-out .as-wave.r { animation: as-out-r 1.5s ease-out infinite; }
  .as-in .as-wave { animation: as-in 1.5s ease-in infinite; }
  .as-wave.w1 { animation-delay: -.5s !important; } .as-wave.w2 { animation-delay: -1s !important; }
  .as-bubble > rect, .as-bubble > path { fill: #ece9ff; } .night .as-bubble > rect, .night .as-bubble > path { fill: #3a3f60; }
  .as-bubble { animation: as-pop .35s ease-out both; transform-box: fill-box; transform-origin: 80% 100%; }
  .as-dots circle { fill: #7f77dd; animation: as-bounce 1.2s ease-in-out infinite; transform-box: fill-box; }
  .night .as-dots circle { fill: #a9a3ff; }
  .as-dots .d2 { animation-delay: .15s; } .as-dots .d3 { animation-delay: .3s; }
  .as-bars rect { fill: var(--as-ring); transform-box: fill-box; transform-origin: center; animation: as-bar .9s ease-in-out infinite; }
  .as-bars .b1 { animation-delay: -.3s; } .as-bars .b2 { animation-delay: -.6s; } .as-bars .b3 { animation-delay: -.15s; } .as-bars .b4 { animation-delay: -.45s; }
  .as-lines rect { fill: var(--as-ring); opacity: .85; transform-box: fill-box; transform-origin: left center; animation: as-type 2.4s ease-out infinite; }
  .as-lines .l2 { animation-delay: .4s; }
  .as-bang * { fill: var(--as-ring); }
  .error .as-speaker { animation: as-shake 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  @keyframes as-drift { to { transform: translateX(3px); } }
  @keyframes as-breathe { 0%, 100% { transform: scale(.85); opacity: .45; } 50% { transform: scale(1.1); opacity: .95; } }
  @keyframes as-spin { to { stroke-dashoffset: -20; } }
  @keyframes as-out-l { 0% { opacity: 0; transform: translateX(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateX(-4px); } }
  @keyframes as-out-r { 0% { opacity: 0; transform: translateX(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateX(4px); } }
  @keyframes as-in { 0% { opacity: 0; transform: translateX(-5px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateX(2px); } }
  @keyframes as-pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes as-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-2.5px); opacity: 1; } }
  @keyframes as-bar { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  @keyframes as-type { 0% { transform: scaleX(0); } 40%, 85% { transform: scaleX(1); } 100% { transform: scaleX(1); opacity: 0; } }
  @keyframes as-shake { 0%, 80%, 100% { transform: rotate(0); } 84% { transform: rotate(-4deg); } 88% { transform: rotate(4deg); } 92% { transform: rotate(-2deg); } 96% { transform: rotate(2deg); } }
  @media (prefers-reduced-motion: reduce) {
    .as-scene *, .as-scene { animation: none !important; }
    .as-wave { opacity: .8; } .as-bubble { opacity: 1; }
  }
`;
