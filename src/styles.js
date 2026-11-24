// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const BASE_STYLE = `
  :host { --ac-accent: #7e57c2; --ac-ok: var(--success-color, #43a047); --ac-warn: var(--warning-color, #ffa600);
          --ac-crit: var(--error-color, #db4437); --ac-idle: var(--disabled-text-color, #9e9e9e); --ac-active: var(--info-color, #039be5); }
  ha-card { overflow: hidden; container: as-card / inline-size; }
  /* A size container has no width of its own: this zero-height grid gives the card a natural width without a minimum. */
  :host { display: block; min-width: 0; --ac-natural-width: 400px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--ac-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--ac-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .ok { --c: var(--ac-ok); } .warn { --c: var(--ac-warn); } .crit { --c: var(--ac-crit); } .idle { --c: var(--ac-idle); }
  .active { --c: var(--ac-active); } .accent { --c: var(--ac-accent); }
  /* Title row: icon, titles, status pill (aligned on the title line), new conversation and detail buttons. */
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .header:has(.sub) > .hbtn { margin-bottom: 14.4px; }
  .titles { flex: 1 1 0; min-width: 5ch; }
  /* The status pill right after the title, its whole label on one line, while the title stays whole beside it
     (measured by the card, see _fitPill); otherwise on its own line under a one-line subtitle, and with its dot alone
     when even that does not fit the header. */
  .tline { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tline > .name { flex: 0 1 auto; min-width: 0; }
  .tline > .pill { flex: none; max-width: none; }
  .tline > .pill .pill-text { white-space: nowrap; overflow: visible; }
  .titles.below { display: grid; grid-template-columns: minmax(0, 1fr); align-content: center; }
  .titles.below > .tline { display: contents; }
  .titles.below > .tline > .pill { order: 3; justify-self: start; align-self: start; margin-top: 3px; }
  .titles.below > .sub { order: 2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.dot-only > .tline { display: flex; }
  .titles.dot-only > .tline > .pill { order: 0; margin-top: 0; align-self: center; padding: 4px; }
  .titles.dot-only > .tline > .pill .pill-text { display: none; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* The badge in the color of the status, like the pill: accent when ready, red listening, blue thinking, green speaking,
     amber on an error, grey when unavailable. */
  .badge { display: flex; flex: none; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center;
           background: color-mix(in srgb, var(--c) 16%, transparent); transition: background-color .2s ease; }
  .badge.clickable { cursor: pointer; }
  .badge .icon.type { width: 24px; height: 24px; fill: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  /* The agent's integration logo, small, before its name in the subtitle. */
  .sub .logo { width: 14px; height: 14px; margin-inline-end: 4px; vertical-align: -2px; border-radius: 3px; object-fit: contain; }
  .pill { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 45%; overflow: hidden; box-sizing: border-box; }
  .pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }
  .pill-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  /* Smoked-glass and outline buttons: never filled, the accent color for an active one. */
  .hbtn, .ibtn, .chip { all: unset; box-sizing: border-box; cursor: pointer; color: var(--secondary-text-color);
          transition: background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease; }
  .hbtn { flex: none; width: 24px; height: 24px; margin: -2px -4px 0 0; border-radius: 50%; display: grid; place-items: center;
          background: color-mix(in srgb, var(--ac-idle) 10%, transparent); border: 1px solid color-mix(in srgb, var(--ac-idle) 28%, transparent); }
  .hbtn:hover { background: color-mix(in srgb, var(--ac-idle) 18%, transparent); color: var(--primary-text-color); }
  .hbtn + .hbtn { margin-left: -4px; }
  .hbtn .icon { width: 14px; height: 14px; }
  /* The main button of the input bar: a round outline ring in the accent color (the microphone, or send once there is text). */
  .ibtn { flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; position: relative; background: transparent;
          border: 2px solid color-mix(in srgb, var(--ac-accent) 70%, transparent); color: color-mix(in srgb, var(--ac-accent) 75%, var(--primary-text-color)); }
  .ibtn .icon { width: 22px; height: 22px; }
  .ibtn:hover:not([disabled]) { border-color: var(--ac-accent); background: color-mix(in srgb, var(--ac-accent) 8%, transparent); }
  .ibtn[disabled] { cursor: default; opacity: .4; }
  .ibtn.big { width: 68px; height: 68px; border-width: 2px; }
  .ibtn.big .icon { width: 30px; height: 30px; }
  /* Listening: the ring pulses outwards (two waves), the icon turns to stop. */
  .ibtn.on { border-color: var(--ac-accent); }
  .ibtn.on::before, .ibtn.on::after { content: ""; position: absolute; inset: -2px; border-radius: 50%; border: 2px solid var(--ac-accent);
             animation: ac-pulse 1.6s ease-out infinite; pointer-events: none; }
  .ibtn.on::after { animation-delay: -.8s; }
  @keyframes ac-pulse { from { transform: scale(1); opacity: .75; } to { transform: scale(1.4); opacity: 0; } }
  .inputbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px 12px; }
  .text { flex: 1 1 auto; min-width: 0; height: 44px; box-sizing: border-box; padding: 0 16px; border-radius: 22px; font: inherit; font-size: 14px;
          color: var(--primary-text-color); background: color-mix(in srgb, var(--ac-idle) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--ac-idle) 30%, transparent); outline: none; transition: border-color .2s ease; text-overflow: ellipsis; }
  .text::placeholder { color: var(--secondary-text-color); opacity: 1; }
  .text:focus { border-color: color-mix(in srgb, var(--ac-accent) 70%, transparent); }
  .text[disabled] { opacity: .6; }
  /* Suggestion chips: outline pills on one line, scrolled sideways when they do not fit. */
  .chips { display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; scrollbar-width: none; max-width: 100%; box-sizing: border-box;
           -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent); }
  .chips::-webkit-scrollbar { display: none; }
  .chip { flex: none; padding: 5px 12px; border-radius: 16px; font-size: 12px; line-height: 1.3; max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          border: 1px solid color-mix(in srgb, var(--ac-accent) 45%, transparent); color: color-mix(in srgb, var(--ac-accent) 55%, var(--primary-text-color)); }
  .chip:hover { border-color: var(--ac-accent); background: color-mix(in srgb, var(--ac-accent) 8%, transparent); }
  .bubble { padding: 8px 12px; border-radius: 16px; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; max-width: 85%; box-sizing: border-box; }
  .user .bubble { white-space: pre-wrap; border-bottom-right-radius: 5px; color: var(--primary-text-color);
                  background: color-mix(in srgb, var(--ac-accent) 16%, transparent); border: 1px solid color-mix(in srgb, var(--ac-accent) 26%, transparent); }
  .assistant .bubble { border-bottom-left-radius: 5px; background: var(--secondary-background-color, rgba(127,127,127,.1)); }
  .error .bubble { display: flex; gap: 8px; align-items: flex-start; border-bottom-left-radius: 5px; --c: var(--ac-crit);
                   background: color-mix(in srgb, var(--c) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c) 32%, transparent);
                   color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .error .bubble .icon { color: var(--c); margin-top: 1px; }
  .md > :first-child { margin-top: 0; } .md > :last-child { margin-bottom: 0; }
  .md p { margin: 0 0 6px; } .md ul, .md ol { margin: 0 0 6px; padding-left: 20px; } .md li { margin: 2px 0; }
  .md code { font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: .88em; padding: 1px 5px; border-radius: 5px;
             background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .md pre { margin: 0 0 6px; padding: 8px 10px; border-radius: 8px; overflow-x: auto; background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
  .md pre code { padding: 0; background: none; font-size: 12px; white-space: pre; }
  .md a { color: var(--primary-color, var(--ac-accent)); }
  /* The caret at the end of the text being streamed: after the last paragraph, or in the last item of a list. */
  .streaming > :is(p, pre):last-child::after, .streaming > :is(ul, ol):last-child > li:last-child::after { content: ""; display: inline-block; width: .5em; height: 1.05em; margin-left: 2px; vertical-align: text-bottom;
                                    border-radius: 2px; background: color-mix(in srgb, var(--ac-accent) 70%, var(--primary-text-color)); animation: ac-caret 1s steps(1) infinite; }
  @keyframes ac-caret { 50% { opacity: 0; } }
  .typing { display: inline-flex; gap: 4px; align-items: center; padding: 12px 14px; }
  .typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--secondary-text-color); animation: ac-bounce 1.2s ease-in-out infinite; }
  .typing span:nth-child(2) { animation-delay: .15s; } .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes ac-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-5px); opacity: 1; } }
  .tools { display: flex; flex-wrap: wrap; gap: 4px; }
  .tool { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 1px 8px; border-radius: 10px; color: var(--secondary-text-color);
          border: 1px dashed color-mix(in srgb, var(--ac-idle) 45%, transparent); }
  .tool .icon { width: 12px; height: 12px; }
  .warning { padding: 10px 12px; border-radius: 10px; font-size: 13px; --c: var(--ac-warn); color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color));
             background: color-mix(in srgb, var(--c) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); }
  @container as-card (max-width: 200px) {
    .pill { padding: 4px; flex: none; }
    .pill-text { display: none; }
  }
  @container as-card (max-width: 260px) {
    .header { gap: 6px; }
    .bubble { max-width: 92%; }
  }
`;

export const FULL_STYLE = `
  /* The chat grows with the conversation up to its height (the height option), then scrolls: a short one leaves no
     empty block above the suggestions and the input bar, which stay at the bottom of the card. */
  .chat { max-height: var(--ac-height, 360px); overflow-y: auto; overscroll-behavior: contain; padding: 12px; box-sizing: border-box;
          display: flex; flex-direction: column; gap: 8px; scrollbar-width: thin; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
  .msg { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .msg.user { align-items: flex-end; }
  .empty { margin: auto 0; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 12px 4px; }
  .empty .big { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: color-mix(in srgb, var(--ac-accent) 12%, transparent); }
  .empty .big .icon { width: 28px; height: 28px; color: color-mix(in srgb, var(--ac-accent) 60%, var(--primary-text-color)); }
  .empty .t { font-size: 16px; font-weight: 500; }
  .empty .h { font-size: 13px; color: var(--secondary-text-color); }
  .suggest { padding: 10px 12px 0; }
  .suggest + .inputbar { padding-top: 8px; }
`;

export const MINI_STYLE = `
  :host { --ac-natural-width: 320px; }
  /* Voice first: the big microphone in the middle, the last question in quotes and its answer under it, the chips. */
  .voice { padding: 14px 12px 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; min-width: 0; }
  .voice .ibtn.big { margin: 8px 0 12px; }
  .voice .h { font-size: 13px; color: var(--secondary-text-color); }
  .voice .q { font-size: 13px; font-style: italic; color: var(--secondary-text-color); max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .voice .q::before { content: "“"; } .voice .q::after { content: "”"; }
  .voice .msg { display: flex; flex-direction: column; align-items: center; gap: 4px; max-width: 100%; }
  .voice .bubble { max-width: 100%; text-align: start; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; }
  .voice .error .bubble, .voice .bubble.typing { display: flex; }
  .voice .tools { justify-content: center; }
  .voice .chips { width: 100%; }
  .voice .chips > :first-child { margin-inline-start: auto; } .voice .chips > :last-child { margin-inline-end: auto; }
  .voice + .inputbar { padding-top: 0; }
`;

// The illustrated header's layout: the round icon, the title, the status and the subtitle on the room's wall at the
// left, the scene at the right (at most 62 % of the card), the buttons on frosted circles at the top right.
export const BANNER_STYLE = `
  .htext { position: absolute; z-index: 1; left: 12px; top: 0; bottom: var(--as-ground-h); right: calc(min(var(--as-scene-w), 62%, 100cqw - 250px) + 4px);
           display: flex; align-items: center; gap: 10px; min-width: 0; }
  .htext .titles { container: as-titles / inline-size; align-self: stretch; display: grid; grid-template-columns: minmax(0, 1fr); align-content: center; row-gap: 1px; min-width: 0; flex: 1 1 0; }
  /* The status pill right after the title, centred on it, in the icon's color (placed by _fitPill); below 200 px, its
     dot alone. */
  .banner .name { font-size: 16px; font-weight: 500; }
  .banner .badge { position: relative; background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .banner.night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner .badge .icon.type { fill: var(--c); }
  .banner.night .badge .icon.type { fill: color-mix(in srgb, var(--c) 72%, #fff); }
  /* The agent's integration logo on a white tile at the bottom right of the icon, readable on any theme. */
  .blogo { position: absolute; right: -4px; bottom: -4px; width: 18px; height: 18px; border-radius: 5px; padding: 2px; box-sizing: border-box;
           display: grid; place-items: center; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.18); }
  .blogo img { width: 100%; height: 100%; object-fit: contain; }
  .banner .pill { gap: 4px; padding: 1px 8px;
                  background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .pill { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .banner .pill .dot { width: 7px; height: 7px; }
  .banner .sub { color: #77707a; }
  .banner.night .sub { color: rgba(255,255,255,.62); }
  /* The header buttons on 24 px glass discs on the banner's top line: the detail button in the top-right corner, the
     new conversation button at its left; the scene keeps clear of them. */
  .hbtns { position: absolute; z-index: 2; top: 5px; right: 5px; display: flex; gap: 4px; }
  .banner .hbtn { margin: 0; width: 24px; height: 24px; border: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner.night .hbtn { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .hbtn:hover { background: rgba(255,255,255,.75); }
  .banner.night .hbtn:hover { background: rgba(255,255,255,.22); }
  .banner .hbtn .icon { width: 16px; height: 16px; }
  .banner .hbtn + .hbtn { margin-left: 0; }
  .banner.has-btns .as-scene { right: 30px; }
  .banner.has-btns .htext { right: calc(min(var(--as-scene-w), 62%, 100cqw - 250px) + 34px); }
  /* Narrow card: no room for the scene beside the text, the room's wall and floor alone stay. */
  @container (max-width: 300px) { .as-scene { display: none; } .htext, .banner.has-btns .htext { right: 40px; } .banner.btns-2 .htext { right: 64px; } }
  @container as-card (max-width: 200px) { .banner .pill { padding: 4px; } .banner .pill-text { display: none; } }
`;

// Element names of Home Assistant dialogs (more-info opened from the card, among others).
export const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
export const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS a tap on something that is not
// clickable sends no click to the page. It counts when the press and the release are both outside the card; a
// scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click event.
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
