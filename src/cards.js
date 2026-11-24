// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { DEFAULTS, ICONS, LISTEN_MAX_MS, RUN_TIMEOUT_MS } from "./icons.js";
import { MAX_MESSAGES, errText, esc, md, morph, sameDeps, speechOf, svgIcon, t, textWidth } from "./helpers.js";
import { BROKEN_LOGOS, SCENE_STATES, SCENE_STYLE, VoiceRecorder, agentName, agentPlatform, areaName, assistScene, brandIcon, isBuiltin, isNight, isPreferred, loadPipelines, pickPipeline, suggestionsOf, voiceSupported } from "./assist-pipelines-conversation.js";
import { BANNER_STYLE, BASE_STYLE, FULL_STYLE, MINI_STYLE, watchOutside } from "./styles.js";

// Numbers the cards of a page: the ids of each card's illustration stay apart.
export let cardUid = 0;

export class AssistCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // The conversation, kept while the card lives: { role: user | assistant | error, text, tools, streaming, run }.
    this._messages = [];
    this._conversationId = null;
    this._busy = false;
    this._voice = null;
    this._speaking = false;
    this._run = 0;
    this._stick = true;
    this._uid = ++cardUid;
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("keydown", (ev) => this._onKey(ev));
    // The main button turns from the microphone to send once there is text (a render only when that flips).
    root.addEventListener("input", (ev) => {
      if (!ev.target?.classList?.contains("text")) return;
      const has = !!ev.target.value?.trim();
      if (has !== !!this._hasText) {
        this._hasText = has;
        this._update();
      }
    });
    root.addEventListener?.(
      "error",
      (ev) => {
        const p = ev.target?.dataset?.platform;
        if (!p) return;
        BROKEN_LOGOS.add(p);
        (ev.target.parentElement?.classList?.contains("blogo") ? ev.target.parentElement : ev.target).remove();
      },
      true,
    );
    // Following the conversation: the chat scrolls down with new messages unless it was scrolled up to read.
    root.addEventListener?.(
      "scroll",
      (ev) => {
        const el = ev.target;
        if (el?.classList?.contains("chat")) this._stick = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      },
      true,
    );
  }

  static getConfigElement() {
    return document.createElement("assist-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first || !this._pipelines) this._loadPipelines();
    const deps = this._deps();
    if (sameDeps(this._lastDeps, deps)) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // What a render reads from hass: the language, the theme (also the illustration's night), the agent's state and
  // registry entry, the area.
  _deps() {
    const h = this._hass;
    const agent = this._agentId();
    return [
      h.language,
      h.locale,
      h.themes?.darkMode,
      h.entities?.[agent],
      h.states?.[agent],
      this._config?.area && h.areas?.[this._config.area],
      this._pipelines,
    ];
  }

  _loadPipelines() {
    if (this._pipelinesLoading || !this._hass) return;
    this._pipelinesLoading = true;
    loadPipelines(this._hass).then((data) => {
      this._pipelinesLoading = false;
      this._pipelines = data;
      this._update();
    });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.suggestions !== undefined && !Array.isArray(config.suggestions)) throw new Error("suggestions must be a list of texts");
    const prev = this._config;
    // Another pipeline or agent: another conversation.
    if (prev && ((prev.pipeline || "") !== (config.pipeline || "") || (prev.agent_id || "") !== (config.agent_id || ""))) this._newConversation();
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._lastDeps = null;
    this._update();
  }

  connectedCallback() {
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._resize?.disconnect();
    this._fitWidth = null;
    // Off the page: the microphone is released and the speech stopped; the conversation stays for the next visit.
    if (this._voice) this._cancelVoice();
    this._stopAudio();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  // ---- Pipeline and agent --------------------------------------------------

  _pipeline() {
    return pickPipeline(this._pipelines, this._config?.pipeline);
  }

  // The pipeline id sent with a run: none for the preferred one (Home Assistant picks it).
  _pipelineArg() {
    const id = this._config.pipeline;
    return isPreferred(id) ? {} : { pipeline: id };
  }

  _agentId() {
    return this._config?.agent_id || this._pipeline()?.conversation_engine || "";
  }

  _problem() {
    const c = this._config;
    if (!c.agent_id && !isPreferred(c.pipeline) && this._pipelines && !this._pipelines.error && this._pipeline() === null) {
      return this._t("err_pipeline", { id: c.pipeline });
    }
    return "";
  }

  _unavailable() {
    const s = this._hass?.states?.[this._agentId()];
    return !!this._problem() || s?.state === "unavailable";
  }

  _micAvailable() {
    if (this._config.voice === false || !voiceSupported()) return false;
    const p = this._pipeline();
    return !!p?.stt_engine;
  }

  // ---- Rendering -----------------------------------------------------------

  // The header's status pill goes right after the title, on its row, only while the title stays whole and the
  // pill's whole label fits beside it; otherwise it takes a line of its own under the subtitle (.below), the title
  // whole on its row (cut only when it does not fit alone). There, in the banner, the subtitle keeps one line; if the
  // text still does not fit above the ground strip, the pill keeps its dot alone (.dot-only, its label in its tooltip
  // and for screen readers). Measured after each render and on each new width, whatever the language: no fixed
  // width threshold.
  _fitPill() {
    if (!this.isConnected) return;
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector(".tline");
      const pills = row ? [...row.children].filter((n) => n.matches(".pill")) : [];
      if (!pills.length || !pills[0].getBoundingClientRect) continue;
      t.classList.remove("below", "dot-only");
      const name = row.querySelector(".name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const title = name && getComputedStyle(name).display !== "none" ? textWidth(name) + gap : 0;
      const need = pills.reduce((w, p) => w + p.getBoundingClientRect().width + gap, title - gap);
      if (need > t.getBoundingClientRect().width - 0.5) {
        t.classList.add("below");
        const banner = t.closest(".banner");
        if (banner) {
          const b = banner.getBoundingClientRect();
          // Each element as it shows: its box cut by its ancestors that hide their overflow (a clamped line).
          const out = [...t.querySelectorAll("*")].some((n) => {
            let { top, bottom } = n.getBoundingClientRect();
            for (let p = n.parentElement; p && p !== t; p = p.parentElement) {
              if (getComputedStyle(p).overflowY === "visible") continue;
              top = Math.max(top, p.getBoundingClientRect().top);
              bottom = Math.min(bottom, p.getBoundingClientRect().bottom);
            }
            return bottom - top > 0.5 && (top < b.top - 0.5 || bottom > b.bottom - (parseFloat(getComputedStyle(banner).getPropertyValue("--as-ground-h")) || 10) + 0.5);
          });
          if (out) t.classList.add("dot-only");
        }
      }
      // A subtitle cut by its ellipsis keeps its whole text in its tooltip.
      const s = t.querySelector(".sub");
      if (s && (!s.hasAttribute("title") || s.dataset.fit)) {
        const cut = s.scrollWidth > s.clientWidth + 1;
        s.toggleAttribute("data-fit", cut);
        if (cut) s.title = s.textContent.trim();
        else s.removeAttribute("title");
      }
    }
  }


  _update() {
    if (!this._hass || !this._config) return;
    const html = this._render();
    const root = this.shadowRoot;
    if (html === this._html) return;
    this._html = html;
    if (!root.firstChild || typeof document.createElement("template").content === "undefined") root.innerHTML = html;
    else {
      const tpl = document.createElement("template");
      tpl.innerHTML = html;
      morph(root, tpl.content);
    }
    this._fitPill();
    const chat = root.querySelector?.(".chat");
    if (chat && this._stick) chat.scrollTop = chat.scrollHeight;
  }

  _status() {
    if (this._voice === "listening") return ["listening", "crit"];
    if (this._voice === "transcribing") return ["transcribing", "active"];
    if (this._busy) return ["thinking", "active"];
    if (this._speaking) return ["speaking", "ok"];
    if (this._unavailable()) return ["unavailable", "idle"];
    if (this._messages.at(-1)?.role === "error") return ["error", "warn"];
    return ["ready", "accent"];
  }

  // The subtitle (HTML): the pipeline, then the agent with its integration's logo before its name (on the icon instead
  // in the illustrated header).
  _subtitle() {
    const c = this._config;
    const id = this._agentId();
    const agent = agentName(this._hass, id);
    const platform = agentPlatform(this._hass, id);
    const dark = !!this._hass.themes?.darkMode;
    const logo = platform && !BROKEN_LOGOS.has(platform) && !this._illustrated() ? `<img data-platform="${esc(platform)}" class="logo" src="${esc(brandIcon(platform, dark))}" alt="">` : "";
    const withLogo = agent ? `${logo}${esc(agent)}` : "";
    if (c.agent_id) return withLogo;
    const p = this._pipeline();
    const name = p?.name || (isPreferred(c.pipeline) ? this._t("preferred") : c.pipeline);
    return [esc(name), agent && agent !== name ? withLogo : ""].filter(Boolean).join(" · ");
  }

  _illustrated() {
    return this._config?.illustration !== false;
  }

  // The round icon, in the color of the status: the chatbot in the classic header, the microphone in the illustrated
  // one, with the agent's integration logo on it.
  _badge(cls) {
    const agent = this._agentId();
    const entity = agent && this._hass.states?.[agent] ? agent : "";
    const attrs = entity ? ` clickable" role="button" tabindex="0" data-action="more" data-entity="${esc(entity)}" title="${esc(agentName(this._hass, agent))}"` : '"';
    if (!this._illustrated()) return `<span class="badge ${cls}${attrs}>${svgIcon(ICONS.bot, "type")}</span>`;
    const platform = agentPlatform(this._hass, agent);
    const logo =
      platform && !BROKEN_LOGOS.has(platform)
        ? `<span class="blogo"><img data-platform="${esc(platform)}" src="${esc(brandIcon(platform, false))}" alt=""></span>`
        : "";
    return `<span class="badge ${cls}${attrs}>${svgIcon(ICONS.mic, "type")}${logo}</span>`;
  }

  _header(sub, compact = false) {
    const [key, cls] = this._status();
    const text = this._t(`status_${key}`);
    const fresh = this._messages.length && !compact;
    const newChat = fresh
      ? `<button class="hbtn" data-action="new" title="${esc(this._t("new_chat"))}" aria-label="${esc(this._t("new_chat"))}">${svgIcon(ICONS.new_chat)}</button>`
      : "";
    const pill = `<span class="pill ${cls}" role="status" title="${esc(text)}" aria-label="${esc(text)}"><span class="dot"></span><span class="pill-text">${esc(text)}</span></span>`;
    const name = `<div class="name">${esc(this._config.title || this._t("default_title"))}</div>`;
    if (this._illustrated()) {
      const night = isNight(this._hass, this._config) ? " night" : "";
      const buttons = newChat + this._zoomButton();
      return `<div class="banner ${cls}${night}${buttons ? " has-btns" : ""}${newChat && this._zoomButton() ? " btns-2" : ""}">${assistScene(this._uid, SCENE_STATES[key] || "idle")}
        <div class="htext">${this._badge(cls)}<div class="titles"><div class="tline">${name}${pill}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div></div>
        ${buttons ? `<div class="hbtns">${buttons}</div>` : ""}
      </div>`;
    }
    return `<div class="header">
        ${this._badge(cls)}
        <div class="titles">
          <div class="tline">${name}${pill}</div>
          ${sub ? `<div class="sub">${sub}</div>` : ""}
        </div>
        ${newChat}${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _message(m) {
    if (m.role === "user") return `<div class="msg user"><div class="bubble">${esc(m.text)}</div></div>`;
    if (m.role === "error") return `<div class="msg error"><div class="bubble">${svgIcon(ICONS.alert)}<span>${esc(m.text)}</span></div></div>`;
    const tools = m.tools?.length
      ? `<div class="tools" title="${esc(this._t("tools_used"))}">${m.tools.map((n) => `<span class="tool">${svgIcon(ICONS.wrench)}${esc(n)}</span>`).join("")}</div>`
      : "";
    // md() once per text: each streamed frame re-renders the conversation, only the growing answer is parsed again.
    if (m.text && m._mdSrc !== m.text) {
      m._mdSrc = m.text;
      m._md = md(m.text);
    }
    const body = m.text ? `<div class="bubble md${m.streaming ? " streaming" : ""}">${m._md}</div>` : "";
    return `<div class="msg assistant">${tools}${body}</div>`;
  }

  // The dots while an answer is awaited (before its first streamed word).
  _typing() {
    if (!this._busy || this._messages.some((m) => m.run === this._run && m.role === "assistant" && m.streaming && m.text)) return "";
    return `<div class="msg assistant"><div class="bubble typing" aria-label="${esc(this._t("status_thinking"))}"><span></span><span></span><span></span></div></div>`;
  }

  _chips() {
    const list = suggestionsOf(this._hass, this._config);
    if (!list.length) return "";
    return `<div class="chips">${list.map((s) => `<button class="chip" data-action="suggest" data-text="${esc(s)}" title="${esc(s)}">${esc(s)}</button>`).join("")}</div>`;
  }

  _placeholder() {
    const area = areaName(this._hass, this._config);
    return area ? this._t("placeholder_area", { area }) : this._t("placeholder");
  }

  // The microphone button: `big` in the mini card's voice view; disabled while a request is in progress.
  _micButton(big = false) {
    const listening = this._voice === "listening";
    const label = this._t(listening ? "mic_stop" : "mic_start");
    const off = !!this._problem() || this._busy || this._voice === "transcribing";
    return `<button class="ibtn mic${big ? " big" : ""}${listening ? " on" : ""}" data-action="mic" title="${esc(label)}" aria-label="${esc(label)}" aria-pressed="${listening}"${
      off ? " disabled" : ""
    }>${svgIcon(listening ? ICONS.stop : ICONS.mic)}</button>`;
  }

  // Text field and one round button: the microphone while the field is empty (when the pipeline has speech-to-text
  // and the browser a microphone), else send; listening, it stops the recording.
  _inputBar() {
    const blocked = !!this._problem();
    const ph = this._placeholder();
    const voice = this._micAvailable() && (this._voice || !this._hasText);
    const can = !!this._hasText && !this._busy && !this._voice && !blocked;
    const send = `<button class="ibtn send" data-action="send" title="${esc(this._t("send"))}" aria-label="${esc(this._t("send"))}"${can ? "" : " disabled"}>${svgIcon(ICONS.send)}</button>`;
    return `<div class="inputbar">
        <input class="text" type="text" enterkeyhint="send" autocomplete="off" placeholder="${esc(ph)}" aria-label="${esc(ph)}"${blocked ? " disabled" : ""}>
        ${voice ? this._micButton() : send}
      </div>`;
  }

  _style() {
    const h = Math.max(160, Math.min(1200, Math.round(Number(this._config.height) || DEFAULTS.height)));
    return `<style>${BASE_STYLE}${FULL_STYLE}${this._bannerStyle()}:host { --ac-height: ${h}px; }</style>`;
  }

  // The illustration's styles, only when it is shown.
  _bannerStyle() {
    return this._illustrated() ? BANNER_STYLE + SCENE_STYLE : "";
  }

  _render() {
    const problem = this._problem();
    const empty = this._messages.length
      ? ""
      : `<div class="empty"><div class="big">${svgIcon(ICONS.bot)}</div><div class="t">${esc(this._t("empty_title"))}</div>
          <div class="h">${esc(this._t(this._micAvailable() ? "empty_hint_voice" : "empty_hint"))}</div></div>`;
    const chips = this._chips();
    return `${this._style()}
      <ha-card>
        ${this._header(this._subtitle())}
        <div class="chat" role="log" aria-live="polite">${problem ? `<div class="warning">${esc(problem)}</div>` : ""}${empty}${this._messages.map((m) => this._message(m)).join("")}${this._typing()}</div>
        ${chips ? `<div class="suggest">${chips}</div>` : ""}
        ${this._inputBar()}
      </ha-card>`;
  }

  // ---- Interaction -----------------------------------------------------------

  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset?.action);
    if (!el) return;
    ev.stopPropagation();
    const action = el.dataset.action;
    if (action === "send") this._sendInput();
    else if (action === "suggest") this._send(el.dataset.text, { raw: true });
    else if (action === "mic") this._toggleMic();
    else if (action === "new") this._newConversation(true);
    else if (action === "zoom") this._toggleZoom(ev);
    else if (action === "more") this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
  }

  _onKey(ev) {
    if (ev.key === "Enter" && ev.target?.classList?.contains("text") && !ev.isComposing) {
      ev.preventDefault();
      this._sendInput();
      return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && ev.target?.getAttribute?.("role") === "button") {
      ev.preventDefault();
      ev.target.click();
    }
  }

  _sendInput() {
    const input = this.shadowRoot.querySelector(".text");
    const text = input?.value ?? "";
    if (!text.trim() || this._busy || this._voice) return;
    input.value = "";
    this._hasText = false;
    this._send(text);
  }

  _toggleZoom() {}

  _newConversation(render = false) {
    this._run++;
    this._cancelRun?.();
    if (this._voice) this._cancelVoice();
    this._stopAudio();
    this._messages = [];
    this._conversationId = null;
    this._busy = false;
    this._cur = null;
    this._stick = true;
    if (render) this._update();
  }

  // The request as the agent gets it: with its area for the AI agents (the built-in one matches set sentences).
  _withArea(text) {
    const area = areaName(this._hass, this._config);
    if (!area || this._config.area_context === false || isBuiltin(this._hass, this._agentId())) return text;
    return this._t("area_prefix", { area, text });
  }

  _error(text) {
    this._messages.push({ role: "error", text, run: this._run });
  }

  // Sends one request and shows its answer; resolves once it is in (or failed).
  async _send(text, { raw = false } = {}) {
    const q = String(text ?? "").trim();
    if (!q || this._busy || !this._hass || this._problem()) return;
    this._stopAudio();
    const run = ++this._run;
    // The conversation shown keeps its last MAX_MESSAGES messages (the agent keeps its own context).
    if (this._messages.length >= MAX_MESSAGES) this._messages = this._messages.slice(-(MAX_MESSAGES - 1));
    this._messages.push({ role: "user", text: q, run });
    this._busy = true;
    this._stick = true;
    this._cur = null;
    this._update();
    const payload = raw ? q : this._withArea(q);
    try {
      if (this._config.agent_id) await this._viaAgent(payload, run);
      else await this._viaPipeline(payload, run);
    } catch (err) {
      if (run === this._run && !err?.cancelled) this._error(this._errorText(err));
    } finally {
      if (run === this._run) {
        this._busy = false;
        this._cur = null;
        // Streamed bubbles left empty (an agent that only called tools) are dropped; none stays "streaming".
        this._messages = this._messages.filter((m) => !(m.run === run && m.role === "assistant" && !m.text && !m.tools?.length));
        for (const m of this._messages) m.streaming = false;
        this._update();
      }
    }
  }

  _errorText(err) {
    const code = err?.code;
    if (code === "stt-no-text-recognized") return this._t("err_no_speech");
    if (code === "pipeline-not-found") return this._t("err_pipeline", { id: this._config.pipeline || "" });
    if (code === "timeout") return this._t("err_timeout");
    return this._t("err_generic", { message: errText(err) });
  }

  async _viaAgent(text, run) {
    const msg = { type: "conversation/process", text, agent_id: this._config.agent_id };
    if (this._conversationId) msg.conversation_id = this._conversationId;
    const result = await this._hass.callWS(msg);
    if (run !== this._run) return;
    const speech = this._answer(result, run);
    if (speech && this._config.speak) this._speakText(speech, run);
  }

  async _viaPipeline(text, run) {
    const p = this._pipeline();
    const tts = !!this._config.speak && (p === undefined || !!p?.tts_engine);
    const msg = { start_stage: "intent", end_stage: tts ? "tts" : "intent", input: { text }, ...this._pipelineArg() };
    if (this._conversationId) msg.conversation_id = this._conversationId;
    await this._runPipeline(msg, (ev) => this._onEvent(ev, run));
  }

  // One assist_pipeline/run subscription: every event goes to `onEvent`; resolves at run-end, rejects on an
  // error event (with its code), a failed subscription or after RUN_TIMEOUT_MS.
  _runPipeline(msg, onEvent) {
    const conn = this._hass.connection;
    return new Promise((resolve, reject) => {
      let done = false;
      let unsub = null;
      const finish = (err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (this._cancelRun === cancel) this._cancelRun = null;
        Promise.resolve(unsub)
          .then((u) => typeof u === "function" && u())
          .catch(() => {});
        if (err) reject(err);
        else resolve();
      };
      const cancel = () => finish(Object.assign(new Error("cancelled"), { cancelled: true }));
      const timer = setTimeout(() => finish(Object.assign(new Error(this._t("err_timeout")), { code: "timeout" })), RUN_TIMEOUT_MS);
      this._cancelRun = cancel;
      if (!conn?.subscribeMessage) {
        finish(new Error("no websocket connection"));
        return;
      }
      try {
        unsub = conn.subscribeMessage(
          (ev) => {
            if (done) return;
            try {
              onEvent(ev);
            } catch (err) {
              console.warn("assist-card:", err);
            }
            if (ev?.type === "run-end") finish();
            else if (ev?.type === "error") finish(Object.assign(new Error(ev.data?.message || ev.data?.code || "error"), { code: ev.data?.code }));
          },
          { type: "assist_pipeline/run", ...msg },
        );
        Promise.resolve(unsub).catch((err) => finish(err));
      } catch (err) {
        finish(err);
      }
    });
  }

  // The events of a text run: streamed deltas, the final answer and the speech.
  _onEvent(ev, run) {
    if (run !== this._run) return;
    const d = ev?.data || {};
    if (ev.type === "intent-progress" && d.chat_log_delta) {
      const delta = d.chat_log_delta;
      // A new assistant message (after a tool result) gets its own bubble.
      if (delta.role) this._cur = null;
      const names = (delta.tool_calls || []).map((c) => c?.tool_name || c?.name).filter(Boolean);
      if (!delta.content && !names.length) return;
      if (!this._cur) {
        this._cur = { role: "assistant", text: "", tools: [], streaming: true, run };
        this._messages.push(this._cur);
      }
      if (delta.content) this._cur.text += delta.content;
      for (const n of names) if (!this._cur.tools.includes(n)) this._cur.tools.push(n);
      this._scheduleUpdate();
    } else if (ev.type === "intent-end") {
      this._answer(d.intent_output || {}, run);
      this._update();
    } else if (ev.type === "tts-end" && d.tts_output?.url) {
      this._play(d.tts_output.url);
    }
  }

  // Many deltas a second: one render per frame.
  _scheduleUpdate() {
    if (this._pending) return;
    this._pending = true;
    const later = globalThis.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
    later(() => {
      this._pending = false;
      this._update();
    });
  }

  // The final answer of a run (conversation/process result or intent output); returns its speech.
  _answer(output, run) {
    if (output?.conversation_id) this._conversationId = output.conversation_id;
    const resp = output?.response || {};
    const speech = speechOf(resp).trim();
    const mine = this._messages.filter((m) => m.run === run && m.role === "assistant");
    if (resp.response_type === "error") {
      this._messages = this._messages.filter((m) => !(m.run === run && m.role === "assistant" && !m.tools?.length));
      this._error(speech || this._t("err_generic", { message: resp.data?.code || "?" }));
      return "";
    }
    // The streamed bubble (or one that only shows tools) takes the final text; else the answer gets its own.
    const last = mine.at(-1);
    if (last && (last === this._cur || !last.text)) {
      if (speech) last.text = speech;
      else if (!last.text && !last.tools?.length) last.text = this._t("err_empty");
    } else if (!last || (speech && last.text.trim() !== speech)) {
      this._messages.push({ role: "assistant", text: speech || this._t("err_empty"), tools: [], run });
    }
    for (const m of mine) m.streaming = false;
    this._cur = null;
    return speech;
  }

  // ---- Speech --------------------------------------------------------------------

  _play(url) {
    this._stopAudio();
    let audio;
    try {
      audio = new Audio(typeof this._hass.hassUrl === "function" ? this._hass.hassUrl(url) : url);
    } catch (_err) {
      return;
    }
    this._audio = audio;
    this._speaking = true;
    const end = () => {
      if (this._audio !== audio) return;
      this._audio = null;
      this._speaking = false;
      this._update();
    };
    audio.addEventListener?.("ended", end);
    audio.addEventListener?.("error", end);
    Promise.resolve(audio.play?.()).catch(end);
    this._update();
  }

  _stopAudio() {
    const a = this._audio;
    this._audio = null;
    if (a) {
      try {
        a.pause();
      } catch (_err) {
        /* already stopped */
      }
    }
    if (this._speaking) {
      this._speaking = false;
      this._update();
    }
  }

  // An agent's answer read by the pipeline's text-to-speech (conversation/process has no speech of its own).
  _speakText(text, run) {
    const p = this._pipeline();
    if (p && !p.tts_engine) return;
    this._runPipeline({ start_stage: "tts", end_stage: "tts", input: { text }, ...this._pipelineArg() }, (ev) => {
      if (run === this._run && ev.type === "tts-end" && ev.data?.tts_output?.url) this._play(ev.data.tts_output.url);
    }).catch((err) => console.warn("assist-card: speech failed:", errText(err)));
  }

  // ---- Voice input -----------------------------------------------------------------

  // Speech-to-text of the pipeline, its text then sent like a typed request (with its area, to the card's agent).
  async _toggleMic() {
    if (this._voice === "listening") {
      this._stopListening();
      return;
    }
    if (this._voice || this._busy || !this._micAvailable()) return;
    this._stopAudio();
    this._handler = null;
    const pending = [];
    const rec = new VoiceRecorder((chunk) => {
      if (this._handler === null) pending.push(chunk);
      else this._sendAudio(chunk);
    });
    this._recorder = rec;
    this._voice = "listening";
    this._update();
    try {
      await rec.start();
    } catch (err) {
      this._recorder = null;
      this._voice = null;
      this._error(this._t("err_mic", { message: errText(err) }));
      this._update();
      return;
    }
    if (this._voice !== "listening") {
      rec.stop();
      return;
    }
    this._listenTimer = setTimeout(() => this._stopListening(), LISTEN_MAX_MS);
    let text = "";
    let failed = null;
    try {
      await this._runPipeline({ start_stage: "stt", end_stage: "stt", input: { sample_rate: rec.sampleRate }, ...this._pipelineArg() }, (ev) => {
        if (ev.type === "run-start") {
          this._handler = ev.data?.runner_data?.stt_binary_handler_id ?? null;
          for (const c of pending.splice(0)) this._sendAudio(c);
          // Stopped before the pipeline was ready: the audio ends right away.
          if (this._voice !== "listening") this._sendAudio(null);
        } else if (ev.type === "stt-vad-end") this._stopListening();
        else if (ev.type === "stt-end") text = String(ev.data?.stt_output?.text ?? "");
      });
    } catch (err) {
      failed = err;
    } finally {
      clearTimeout(this._listenTimer);
      this._stopRecorder();
      this._handler = null;
    }
    if (failed?.cancelled) return;
    this._voice = null;
    if (failed) this._error(this._errorText(failed));
    else if (!text.trim()) this._error(this._t("err_no_speech"));
    this._update();
    if (!failed && text.trim()) this._send(text);
  }

  _stopRecorder() {
    this._recorder?.stop();
    this._recorder = null;
  }

  _stopListening() {
    if (this._voice !== "listening") return;
    clearTimeout(this._listenTimer);
    this._stopRecorder();
    this._voice = "transcribing";
    // An empty chunk ends the audio stream.
    if (this._handler !== null) this._sendAudio(null);
    this._update();
  }

  _cancelVoice() {
    clearTimeout(this._listenTimer);
    this._stopRecorder();
    this._voice = null;
    this._cancelRun?.();
  }

  // One binary websocket message: the handler id, then the 16-bit samples (none: end of the audio).
  _sendAudio(chunk) {
    const sock = this._hass?.connection?.socket;
    if (!sock || this._handler === null || this._handler === undefined) return;
    const bytes = chunk ? new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength) : new Uint8Array(0);
    const data = new Uint8Array(1 + bytes.length);
    data[0] = this._handler;
    data.set(bytes, 1);
    try {
      sock.send(data);
    } catch (err) {
      console.warn("assist-card: audio not sent:", errText(err));
    }
  }
}

// The mini card: one input line and the last answer; its detail button (top right, `zoom: false` removes it)
// unfolds the full chat, and a click anywhere else on the page folds it back.
export class AssistMiniCard extends AssistCard {
  constructor() {
    super();
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  static getConfigElement() {
    return document.createElement("assist-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    // Back to the compact view once off the screen.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = !!this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="hbtn zoom" data-action="zoom" title="${label}" aria-label="${label}" aria-pressed="${z}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    this._stick = true;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
  }

  _render() {
    if (this._zoomed) return super._render();
    const problem = this._problem();
    const mic = this._micAvailable();
    const lastQ = [...this._messages].reverse().find((m) => m.role === "user");
    const lastA = [...this._messages].reverse().find((m) => m.role !== "user" && (m.text || m.role === "error"));
    let body;
    if (problem) body = `<div class="warning">${esc(problem)}</div>`;
    else if (!this._messages.length) body = `<div class="h">${esc(this._t(mic ? "empty_hint_voice" : "empty_hint"))}</div>`;
    else {
      const answer = this._typing() || (lastA && this._messages.indexOf(lastA) > this._messages.indexOf(lastQ) ? this._message(lastA) : "");
      body = `${lastQ ? `<div class="q" title="${esc(lastQ.text)}">${esc(lastQ.text)}</div>` : ""}${answer}`;
    }
    // Without a microphone (no speech-to-text in the pipeline, `voice: false`, no secure context) a text field instead.
    return `<style>${BASE_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._header("", true)}
        <div class="voice" aria-live="polite">${mic ? this._micButton(true) : ""}${body}${problem ? "" : this._chips()}</div>
        ${mic ? "" : this._inputBar()}
      </ha-card>`;
  }
}
