# Changelog

## 1.0.0 - 2026-11-14

### Features
- **Assist Card** (`custom:assist-card`): chat with an Assist pipeline (`assist_pipeline/run`, the preferred pipeline by default or `pipeline`) or directly with a conversation agent (`agent_id`, `conversation/process`). Chat bubbles, typing indicator, answers of AI agents streamed as they are written (`chat_log_delta`) with a caret, the tools they call, safe markdown-lite rendering (paragraphs, bold, italic, code, lists, headings, `http(s)` links; everything else escaped). The conversation id is kept for follow-ups; a header button starts a new conversation.
- Voice: a large round outline microphone button next to the text field records in the browser (16-bit PCM over the websocket) for the pipeline's speech-to-text, its ring pulsing while it listens; it turns into a send button once text is typed. Optional spoken answers (`speak`) through the pipeline's text-to-speech.
- Suggestion chips above the text field: a list of one's own (`suggestions`, YAML only) or requests about the card's `area`, which is also given as context to AI agents (`area_context`).
- Header: round tinted badge with a chatbot icon, title and pipeline/agent subtitle (the agent's integration logo small before its name), status chip (ready, listening, transcribing, thinking, speaking, error, unavailable).
- **Assist Mini Card** (`custom:assist-mini-card`): voice first, a big centred microphone, the last question in quotes and its answer, the suggestion chips; its detail button unfolds the full chat, folded back by a click elsewhere or when the card leaves the page. A text field replaces the microphone when there is none.
- Visual editor for both cards, Sections view sizes, light and dark themes, `prefers-reduced-motion`, 22 languages (English in the bundle, the others loaded on demand).
