// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture, "-light" for a dark one)
// that shows exactly the same state: only the theme differs (checked by test/screenshots.test.mjs).
// `requests`: sent one after another before the capture (answers from scripts/mock-assist.mjs), `clicks`: elements
// clicked then, `listening`: the microphone left listening.

const pair = (file, type, width, config = {}, extra = {}, first = "light") => {
  const second = first === "light" ? "dark" : "light";
  return [
    { file, type, theme: first, width, config, ...extra },
    { file: `${file}-${second}`, type, theme: second, width, config, ...extra },
  ];
};

const AREA = { area: "living_room" };

export const shots = [
  ...pair("card", "assist-card", 460, { ...AREA, height: 400 }, { requests: ["Turn on the living room lights", "What's the weather like this afternoon?"] }),
  ...pair("card-empty", "assist-card", 460, { ...AREA, height: 260 }, {}, "dark"),
  ...pair(
    "card-builtin",
    "assist-card",
    460,
    { pipeline: "01jhomeassistant", height: 260, suggestions: ["Good night", "Turn off the lights in the Kitchen", "Lock the front door"] },
    { requests: ["Turn off the lights in the Kitchen", "Open the garage door"] },
    "dark",
  ),
  ...pair("mini-card", "assist-mini-card", 380, AREA, { requests: ["Which lights are still on?"] }),
  ...pair("mini-card-empty", "assist-mini-card", 380, AREA, {}, "dark"),
  ...pair("mini-card-zoom", "assist-mini-card", 460, { ...AREA, height: 320 }, { requests: ["Which lights are still on?"], clicks: [".zoom"] }),
];

// One looping GIF per distinct animation:
//   listening — the microphone ring of the mini card pulsing outwards while it records
//   streaming — the typing dots while the agent thinks, then its answer written as it streams in, with a caret
export const gifs = [
  ...pair("listening", "assist-mini-card", 380, AREA, { listening: true }),
  ...pair(
    "streaming",
    "assist-card",
    460,
    { ...AREA, height: 300, show_suggestions: false },
    {
      requests: ["Turn on the living room lights"],
      stream: {
        request: "Any ideas for a cosy evening?",
        text: "Here are a few ideas:\n- Dim the **living room** lights to 30 %\n- Set the heating to **20 °C**\n- Play some quiet music\n\nShall I start the *Evening* scene?",
      },
    },
    "dark",
  ),
];
