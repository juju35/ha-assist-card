# Changelog

## 1.1.4 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.1.3 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.1.2 - 2026-11-20

### Performance
- Streaming answers: each frame parsed the Markdown of the whole conversation again; every message is now parsed once per text, only the answer being streamed is parsed again. The conversation shown keeps its last 200 messages, so a card left open for days stays light (the agent keeps its own context).

### Maintenance
- Tests: the streaming test waits for the streamed answer instead of a fixed 80 ms delay, which failed under load (coverage run).
- CI: the branch cleanup recognises the commits of the `juju35-screenshots` app (it only knew the former `github-actions[bot]` `[skip ci]` ones), so a branch whose only leftover is the bot's screenshots commit is deleted after the merge.

## 1.1.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.1.0 - 2026-11-17

### Features
- Illustrated header on the full and the mini card (90 px): a living room with a smart speaker on a sideboard, on a 10 px parquet strip edge to edge, the title, the status and the subtitle on the wall at the left. The speaker shows the state: its light ring breathing when ready, sound waves coming in and a voice level bubble while it listens, a spinning ring and thinking dots while it transcribes or thinks, sound waves going out while it speaks, a « ! » and a shake on an error, its light off when unavailable.
- The header icon (a microphone in the illustrated header, the chatbot in the classic one) is now in the color of the status, day and night; the agent's integration logo sits on it in the illustrated header.
- Night picture after sunset (`sun.sun`) or with the dark theme, forced with `illustration_theme: day | night`; `illustration: false` keeps the classic header. Both options in the visual editors, translated in every language; `prefers-reduced-motion` honoured.
- The status pill is back on the title row, right after the title and in the icon's status color, with or without the illustration, as long as the title stays whole and the pill keeps its whole label beside it (measured by the card in every language, no fixed width threshold); otherwise it takes its own line under a one-line subtitle, and keeps its dot alone when even that does not fit the banner, and below 200 px. The mini card's expand / collapse button and the new conversation button are 24 px frosted discs on the banner's top-right line.
- **Night picture with the dark theme even while the sun is up**: in `auto`, the banner shows the night picture when the sun is below the horizon or Home Assistant's theme is dark.

### Fixes
- **No empty block under a short conversation**: the full card's chat grows with the conversation up to its `height` (now a maximum), then scrolls, so the suggestions and the input bar follow the last message instead of leaving a large gap; the input's placeholder ends with an ellipsis on a narrow card.

## 1.0.0 - 2026-11-14

### Features
- **Assist Card** (`custom:assist-card`): chat with an Assist pipeline (`assist_pipeline/run`, the preferred pipeline by default or `pipeline`) or directly with a conversation agent (`agent_id`, `conversation/process`). Chat bubbles, typing indicator, answers of AI agents streamed as they are written (`chat_log_delta`) with a caret, the tools they call, safe markdown-lite rendering (paragraphs, bold, italic, code, lists, headings, `http(s)` links; everything else escaped). The conversation id is kept for follow-ups; a header button starts a new conversation.
- Voice: a large round outline microphone button next to the text field records in the browser (16-bit PCM over the websocket) for the pipeline's speech-to-text, its ring pulsing while it listens; it turns into a send button once text is typed. Optional spoken answers (`speak`) through the pipeline's text-to-speech.
- Suggestion chips above the text field: a list of one's own (`suggestions`, YAML only) or requests about the card's `area`, which is also given as context to AI agents (`area_context`).
- Header: round tinted badge with a chatbot icon, title and pipeline/agent subtitle (the agent's integration logo small before its name), status chip (ready, listening, transcribing, thinking, speaking, error, unavailable).
- **Assist Mini Card** (`custom:assist-mini-card`): voice first, a big centred microphone, the last question in quotes and its answer, the suggestion chips; its detail button unfolds the full chat, folded back by a click elsewhere or when the card leaves the page. A text field replaces the microphone when there is none.
- Visual editor for both cards, Sections view sizes, light and dark themes, `prefers-reduced-motion`, 22 languages (English in the bundle, the others loaded on demand).
