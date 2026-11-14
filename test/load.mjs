// Evaluates src/assist-card.js (a classic script, bundled as is by scripts/build.mjs) in a sandbox with
// minimal DOM stand-ins and returns the names the tests need. No dependency, no browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/assist-card.js", import.meta.url), "utf8");

// Shadow root stand-in: keeps the HTML it is given and the listeners it gets; `input` stands for the text field.
const fakeRoot = () => {
  const input = { value: "", classList: { contains: (c) => c === "text" } };
  return {
    innerHTML: "",
    listeners: {},
    input,
    addEventListener(type, fn) {
      (this.listeners[type] ||= []).push(fn);
    },
    querySelector(sel) {
      return sel === ".text" ? input : null;
    },
    querySelectorAll() {
      return [];
    },
  };
};

const fakeNode = (tag) => ({
  tagName: String(tag).toUpperCase(),
  style: {},
  dataset: {},
  children: [],
  appendChild(child) {
    this.children.push(child);
    return child;
  },
  addEventListener() {},
});

export const load = () => {
  const registry = new Map();
  class HTMLElement {
    attachShadow() {
      this.shadowRoot = fakeRoot();
      return this.shadowRoot;
    }
    dispatchEvent(ev) {
      (this.events ||= []).push(ev);
    }
    toggleAttribute(name, on) {
      (this.attrs ||= {})[name] = !!on;
    }
    appendChild() {}
  }
  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }
  const docListeners = {};
  const sandbox = {
    HTMLElement,
    CustomEvent,
    Intl,
    Promise,
    console: { info() {}, warn() {} },
    customElements: { get: (t) => registry.get(t), define: (t, c) => registry.set(t, c) },
    document: {
      createElement: (t) => (registry.has(t) ? new (registry.get(t))() : fakeNode(t)),
      addEventListener: (type, fn) => (docListeners[type] ||= new Set()).add(fn),
      removeEventListener: (type, fn) => docListeners[type]?.delete(fn),
    },
    docListeners,
    setTimeout,
    clearTimeout,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  return vm.runInContext(
    `${source}
    ({ STRINGS, ICONS, LANGUAGES, esc, md, lang, t, speechOf, pickPipeline, isBuiltin, agentName, agentPlatform, suggestionsOf, toPcm16, cleanConfig,
       AssistCard: customElements.get("assist-card"), AssistMiniCard: customElements.get("assist-mini-card"),
       AssistCardEditor: customElements.get("assist-card-editor"), AssistMiniCardEditor: customElements.get("assist-mini-card-editor"), window, document, docListeners })`,
    sandbox,
  );
};
