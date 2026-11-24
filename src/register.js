// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { AssistCard, AssistMiniCard } from "./cards.js";
import { AssistCardEditor, AssistMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("assist-card", AssistCard);
define("assist-mini-card", AssistMiniCard);
define("assist-card-editor", AssistCardEditor);
define("assist-mini-card-editor", AssistMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "assist-card",
    name: "Assist Card",
    description: "Chat with an Assist pipeline or any conversation agent: streamed answers, voice input, spoken answers and suggestions.",
  },
  { type: "assist-mini-card", name: "Assist Mini Card", description: "One input line and the last answer of Assist, unfolding to the full chat." },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-assist-card" });
}

console.info(`%c ASSIST-CARD %c ${VERSION} `, "color:#fff;background:#7e57c2;font-weight:700", "color:#7e57c2;background:transparent");
