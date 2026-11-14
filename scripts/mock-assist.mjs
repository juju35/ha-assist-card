// Mock Home Assistant for the screenshots and the tests: two Assist pipelines (Google Generative AI, the built-in
// agent), their conversation entities, an area, and scripted conversations. Neutral data only.
// mockHass() is self-contained (no reference to this module's scope): the screenshot script injects its source
// into the page as is.

export const PIPELINES = {
  pipelines: [
    {
      id: "01jgoogleai",
      name: "Google AI",
      language: "en",
      conversation_engine: "conversation.google_ai_conversation",
      conversation_language: "en",
      stt_engine: "stt.google_ai_stt",
      tts_engine: "tts.google_ai_tts",
    },
    {
      id: "01jhomeassistant",
      name: "Home Assistant",
      language: "en",
      conversation_engine: "conversation.home_assistant",
      conversation_language: "en",
      stt_engine: "stt.home_assistant_cloud",
      tts_engine: "tts.home_assistant_cloud",
    },
  ],
  preferred_pipeline: "01jgoogleai",
};

export const STATES = {
  "conversation.google_ai_conversation": { entity_id: "conversation.google_ai_conversation", state: "2026-11-10T08:00:00+00:00", attributes: { friendly_name: "Google AI Conversation", supported_features: 1 } },
  "conversation.home_assistant": { entity_id: "conversation.home_assistant", state: "2026-11-10T08:00:00+00:00", attributes: { friendly_name: "Home Assistant", supported_features: 1 } },
};

export const ENTITIES = {
  "conversation.google_ai_conversation": { entity_id: "conversation.google_ai_conversation", platform: "google_generative_ai_conversation" },
  "conversation.home_assistant": { entity_id: "conversation.home_assistant", platform: "conversation" },
};

export const AREAS = { living_room: { area_id: "living_room", name: "Living room" }, kitchen: { area_id: "kitchen", name: "Kitchen" } };

// Request → answer. `stream`: chunks of the streamed answer (AI agents), `tools`: tools the agent calls first,
// `error`: an error response of the agent, `hold`: the run never ends (the stills of a pending answer).
export const SCRIPT = {
  "Turn on the living room lights": { tools: ["HassTurnOn"], stream: ["Done, the ", "**living room** lights ", "are on."] },
  "What's the weather like this afternoon?": {
    tools: ["GetLiveContext"],
    stream: ["It is **12 °C** outside. This afternoon:\n", "- Light rain from 3 pm\n- Wind 20 km/h from the west\n\n", "Take an umbrella if you go out."],
  },
  "Which lights are still on?": { stream: ["Two lights are on:\n", "1. `light.kitchen_ceiling`: kitchen ceiling\n", "2. `light.hallway`: hallway"] },
  "Turn off the lights in the Kitchen": { speech: "Turned off the lights" },
  "Open the garage door": { error: "Sorry, I am not aware of any device called garage door" },
  "Summarize today's energy use": { hold: true },
  "Write a short note for the fridge": { stream: ["Here is a note:\n\n", "**Back at 7 pm.** Dinner is in the oven, "], hold: true },
  // Streamed frame by frame by the screenshot script (the streaming GIF).
  "Any ideas for a cosy evening?": { hold: true },
};

export function mockHass({ pipelines, states, entities, areas, script, dark = false, language = "en" }) {
  const log = [];
  const sent = [];
  let n = 0;
  // A request given with its area ("In the Living room: …") gets the answer of the bare request.
  const scripted = (text) => script[String(text).replace(/^In the [^:]+: /, "")] || {};
  const answer = (text) => {
    const s = scripted(text);
    if (s.error) return { response: { response_type: "error", speech: { plain: { speech: s.error } }, data: { code: "no_valid_targets" } } };
    const speech = s.speech ?? (s.stream ? s.stream.join("") : "Sorry, I didn't understand that.");
    return { response: { response_type: "action_done", speech: { plain: { speech } }, data: {} } };
  };
  const hass = {
    language,
    locale: { language },
    themes: { darkMode: dark },
    states,
    entities,
    areas,
    log,
    sent,
    hassUrl: (p) => p,
    callWS: async (msg) => {
      log.push(msg);
      if (msg.type === "assist_pipeline/pipeline/list") return pipelines;
      if (msg.type === "conversation/process") {
        const r = answer(msg.text);
        return { ...r, conversation_id: msg.conversation_id || `conv-${++n}`, continue_conversation: false };
      }
      throw new Error(`unknown command ${msg.type}`);
    },
    connection: {
      socket: { send: (data) => sent.push(data) },
      subscribeMessage(cb, msg) {
        log.push(msg);
        const events = [];
        const ev = (type, data = {}) => events.push({ type, data });
        const pipe = pipelines.pipelines.find((p) => p.id === (msg.pipeline || pipelines.preferred_pipeline));
        ev("run-start", { pipeline: pipe?.id, language: "en", runner_data: { stt_binary_handler_id: msg.start_stage === "stt" ? 1 : null, timeout: 300 } });
        let hold = false;
        if (msg.start_stage === "stt") {
          ev("stt-start", {});
          hold = true;
        } else if (msg.start_stage === "intent") {
          const text = msg.input.text;
          const s = scripted(text);
          const ai = pipe && pipe.conversation_engine !== "conversation.home_assistant";
          ev("intent-start", { engine: pipe?.conversation_engine, intent_input: text, conversation_id: msg.conversation_id || null });
          if (ai && (s.tools || s.stream)) {
            ev("intent-progress", { chat_log_delta: { role: "assistant" } });
            if (s.tools) {
              ev("intent-progress", { chat_log_delta: { tool_calls: s.tools.map((tool_name, i) => ({ id: `t${i}`, tool_name, tool_args: {} })) } });
              ev("intent-progress", { chat_log_delta: { role: "tool_result", tool_name: s.tools[0], tool_result: {} } });
              ev("intent-progress", { chat_log_delta: { role: "assistant" } });
            }
            for (const content of s.stream || []) ev("intent-progress", { chat_log_delta: { content } });
          }
          if (s.hold) hold = true;
          else {
            ev("intent-end", { intent_output: { ...answer(text), conversation_id: msg.conversation_id || `conv-${++n}`, continue_conversation: false } });
            if (msg.end_stage === "tts") {
              ev("tts-start", {});
              ev("tts-end", { tts_output: { url: "/api/tts_proxy/answer.mp3", mime_type: "audio/mpeg" } });
            }
          }
        } else if (msg.start_stage === "tts") {
          ev("tts-end", { tts_output: { url: "/api/tts_proxy/answer.mp3", mime_type: "audio/mpeg" } });
        }
        if (!hold) ev("run-end", {});
        let live = true;
        // Events are sent one after another, as the websocket would.
        (async () => {
          for (const e of events) {
            await new Promise((r) => setTimeout(r, 0));
            if (live) cb(e);
          }
        })();
        hass.lastRun = { msg, push: (e) => live && cb(e) };
        return Promise.resolve(() => {
          live = false;
        });
      },
    },
  };
  return hass;
}
