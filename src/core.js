/*
 * Assist Card for Home Assistant
 * https://github.com/juju35/ha-assist-card
 *
 * Lovelace cards to chat with a Home Assistant Assist pipeline or any conversation agent (the built-in Assist,
 * Google Generative AI, OpenAI, Anthropic, Ollama…) from a dashboard. Requests go through the
 * `assist_pipeline/run` websocket subscription (streamed answers, voice input, spoken answers), or
 * `conversation/process` when an agent is given; the conversation id is kept for follow-ups while the card lives.
 */

export const VERSION = "__VERSION__";
