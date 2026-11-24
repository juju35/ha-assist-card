// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

export const errText = (err) => String(err?.message || err?.code || err || "").trim() || "?";

export const sameDeps = (a, b) => !!a && a.length === b.length && a.every((d, i) => d === b[i]);

// The spoken answer of a conversation response.
export const speechOf = (response) => String(response?.speech?.plain?.speech ?? response?.speech?.ssml?.speech ?? "");

// ---------------------------------------------------------------------------
// Markdown-lite: paragraphs, line breaks, bold, italic, inline code, code blocks, lists, headings and http(s)
// links. Everything is escaped first; only the tags written here come out.
// ---------------------------------------------------------------------------

export const inline = (text) =>
  String(text)
    .split(/(`[^`\n]+`)/)
    .map((part, i) => {
      if (i % 2) return `<code>${esc(part.slice(1, -1))}</code>`;
      return esc(part)
        .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, "<strong>$1</strong>")
        .replace(/__(?=\S)([^_\n]*?\S)__/g, "<strong>$1</strong>")
        .replace(/(^|[^*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![*\w])/g, "$1<em>$2</em>")
        .replace(/(^|[^_\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?![_\w])/g, "$1<em>$2</em>");
    })
    .join("");

export const LIST_ITEM = /^\s*(?:([-*•+])|(\d+)[.)])\s+(.*)$/;

export const blocks = (text) => {
  const out = [];
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join("<br>")}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  for (const line of text.split("\n")) {
    const item = line.match(LIST_ITEM);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (item) {
      flushPara();
      const tag = item[1] ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      list ||= { tag, items: [] };
      list.items.push(item[3]);
    } else if (heading) {
      flushPara();
      flushList();
      out.push(`<p><strong>${inline(heading[1])}</strong></p>`);
    } else if (list && /^\s{2,}\S/.test(line)) {
      // A continuation line of the last item.
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return out.join("");
};

// A fence left open (an answer still streaming) holds code up to the end.
// Messages kept in the conversation shown: the oldest go past it, so a card left open for days stays light.
export const MAX_MESSAGES = 200;

export const md = (src) =>
  String(src ?? "")
    .replace(/\r\n?/g, "\n")
    .split("```")
    .map((part, i) => (i % 2 ? `<pre><code>${esc(part.replace(/^[\w+.#-]*\n/, "").replace(/\n$/, ""))}</code></pre>` : blocks(part)))
    .join("");

// ---------------------------------------------------------------------------
// DOM patching: brings `from`'s children in line with `to`'s, position by position. Nodes of the same kind are
// kept and updated (text, attributes, then their own children), so that animations do not restart, the text
// typed in the input stays and the chat keeps its scroll position.
// ---------------------------------------------------------------------------

// The width of an element's whole text in fractional pixels, even while an ellipsis cuts it.
export const textWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width || el.scrollWidth;
};

export const morph = (from, to) => {
  const a = Array.from(from.childNodes);
  const b = Array.from(to.childNodes);
  b.forEach((nb, i) => {
    const na = a[i];
    if (!na) {
      from.appendChild(nb);
      return;
    }
    if (na.nodeType !== nb.nodeType || na.nodeName !== nb.nodeName) {
      from.replaceChild(nb, na);
      return;
    }
    if (nb.nodeType !== 1) {
      if (na.nodeValue !== nb.nodeValue) na.nodeValue = nb.nodeValue;
      return;
    }
    for (const at of Array.from(na.attributes)) if (!nb.hasAttribute(at.name)) na.removeAttribute(at.name);
    for (const at of Array.from(nb.attributes)) if (na.getAttribute(at.name) !== at.value) na.setAttribute(at.name, at.value);
    morph(na, nb);
  });
  for (let i = a.length - 1; i >= b.length; i--) from.removeChild(a[i]);
};
