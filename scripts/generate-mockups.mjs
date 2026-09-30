/**
 * BLANC WEDDINGS — product preview generator.
 *
 * Writes on-brand SVG mockups of fictional wedding websites into
 * `public/images/<slug>/`. They stand in for real screenshots: swap the files
 * for JPG/PNG captures later and nothing in the app has to change.
 *
 *   npm run mockups
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outRoot = join(rootDir, "public", "images");

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rect = (x, y, w, h, fill, attrs = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${attrs ? ` ${attrs}` : ""}/>`;

const txt = (x, y, content, o = {}) => {
  const {
    size = 16,
    fill = "#111111",
    weight = 400,
    anchor = "start",
    family = SERIF,
    letter = 0,
    italic = false,
    opacity = 1,
  } = o;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}"${
    italic ? ' font-style="italic"' : ""
  } text-anchor="${anchor}" letter-spacing="${letter}" opacity="${opacity}">${esc(content)}</text>`;
};

/** Stacked bars stand in for body copy. */
const bars = (x, y, w, count, o = {}) => {
  const { h = 7, gap = 17, fill, opacity = 0.42, last = 0.66 } = o;
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const width = i === count - 1 ? Math.round(w * last) : w;
    out += rect(x, y + i * (h + gap), width, h, fill, `rx="4" opacity="${opacity}"`);
  }
  return out;
};

/** A tinted "photograph" block with a quiet motif. */
const photo = (x, y, w, h, tints, id, radius = 0) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${tints[0]}"/>
      <stop offset="1" stop-color="${tints[1]}"/>
    </linearGradient>
  </defs>
  ${rect(x, y, w, h, `url(#${id})`, radius ? `rx="${radius}"` : "")}
  <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.round(
    Math.min(w, h) * 0.13,
  )}" fill="none" stroke="${tints[2]}" stroke-width="1.5" opacity="0.6"/>`;

const svg = (w, h, inner, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(
    label,
  )}">${inner}</svg>`;

/** Website header shared by every desktop mockup. */
const chrome = (p, w, c) => `
  ${rect(0, 0, w, 5, p.accent, 'opacity="0.9"')}
  ${txt(72, 96, c.monogram, { size: 30, letter: 8, fill: p.ink })}
  ${txt(w - 72, 96, "OUR STORY   DETAILS   GALLERY   RSVP", {
    family: SANS,
    size: 15,
    letter: 3,
    fill: p.muted,
    anchor: "end",
  })}
  ${rect(0, 132, w, 1, p.line)}`;

/* -------------------------------------------------------------------------- */
/* Desktop views — 1600 × 1000                                                */
/* -------------------------------------------------------------------------- */

const desktopHero = (p, c) => {
  const W = 1600;
  const H = 1000;
  const strips = ["THE DATE", "CEREMONY", "RECEPTION"];
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${chrome(p, W, c)}
     ${photo(0, 133, W, 700, p.photos, "hero")}
     ${txt(W / 2, 440, c.names, { size: 104, anchor: "middle", fill: p.ink })}
     ${txt(W / 2, 496, c.date, {
       family: SANS,
       size: 22,
       letter: 7,
       anchor: "middle",
       fill: p.ink,
     })}
     ${txt(W / 2, 540, c.place, { size: 30, italic: true, anchor: "middle", fill: p.ink })}
     ${rect(0, 833, W, 1, p.line)}
     ${strips
       .map((label, i) => {
         const x = 160 + i * 440;
         return `${txt(x, 892, label, { family: SANS, size: 14, letter: 4, fill: p.muted })}
                 ${bars(x, 918, 250, 1, { h: 10, fill: p.ink, opacity: 0.45, last: 1 })}`;
       })
       .join("")}`,
    `${c.names} wedding website homepage`,
  );
};

const desktopStory = (p, c) => {
  const W = 1600;
  const H = 1000;
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${chrome(p, W, c)}
     ${photo(0, 133, 720, 867, p.photos, "story")}
     ${txt(820, 300, "OUR STORY", { family: SANS, size: 15, letter: 5, fill: p.muted })}
     ${txt(820, 396, "How we found", { size: 62, fill: p.ink })}
     ${txt(820, 466, "each other", { size: 62, fill: p.ink })}
     ${bars(820, 530, 620, 4, { fill: p.ink })}
     ${txt(820, 724, `“${c.quote}”`, { size: 30, italic: true, fill: p.accent })}
     ${rect(820, 790, 90, 1, p.line)}`,
    `${c.names} our story page`,
  );
};

const desktopDetails = (p, c) => {
  const W = 1600;
  const H = 1000;
  const cards = ["CEREMONY", "RECEPTION", "DRESS CODE"];
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${chrome(p, W, c)}
     ${txt(W / 2, 262, "WEDDING DETAILS", { size: 54, anchor: "middle", fill: p.ink })}
     ${txt(W / 2, 306, c.date, {
       family: SANS,
       size: 16,
       letter: 6,
       anchor: "middle",
       fill: p.muted,
     })}
     ${cards
       .map((label, i) => {
         const x = 130 + i * 460;
         return `${rect(x, 400, 400, 420, p.surface, `rx="2" stroke="${p.line}"`)}
                 ${rect(x, 400, 400, 4, p.accent, 'opacity="0.8"')}
                 ${txt(x + 48, 496, label, { family: SANS, size: 15, letter: 4, fill: p.muted })}
                 ${bars(x + 48, 536, 300, 2, { fill: p.ink })}
                 ${rect(x + 48, 622, 300, 1, p.line)}
                 ${bars(x + 48, 666, 300, 3, { fill: p.ink, opacity: 0.3 })}`;
       })
       .join("")}`,
    `${c.names} wedding details page`,
  );
};

const desktopGallery = (p, c) => {
  const W = 1600;
  const H = 1000;
  const pairs = [
    [0, 0],
    [1, 1],
    [2, 0],
    [1, 2],
    [2, 1],
    [0, 2],
  ];
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${chrome(p, W, c)}
     ${txt(72, 232, "GALLERY", { family: SANS, size: 15, letter: 5, fill: p.muted })}
     ${txt(72, 296, "Moments together", { size: 52, fill: p.ink })}
     ${pairs
       .map(([a, b], i) => {
         const x = 72 + (i % 3) * 496;
         const y = 360 + Math.floor(i / 3) * 300;
         return photo(x, y, 464, 268, [p.photos[a], p.photos[b], p.photos[2]], `g${i}`, 2);
       })
       .join("")}`,
    `${c.names} gallery page`,
  );
};

const desktopRsvp = (p, c, cta = "SEND RSVP") => {
  const W = 1600;
  const H = 1000;
  const fields = [
    ["FULL NAME", 430],
    ["EMAIL", 530],
  ];
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${chrome(p, W, c)}
     ${rect(512, 240, 576, 660, p.surface, `rx="2" stroke="${p.line}"`)}
     ${txt(800, 332, "RSVP", { size: 46, anchor: "middle", fill: p.ink })}
     ${txt(800, 372, "Kindly reply by 01.08.2026", {
       size: 22,
       italic: true,
       anchor: "middle",
       fill: p.muted,
     })}
     ${fields
       .map(
         ([label, y]) =>
           `${txt(560, y, label, { family: SANS, size: 13, letter: 4, fill: p.muted })}
            ${rect(560, y + 18, 480, 1, p.line)}`,
       )
       .join("")}
     ${txt(560, 630, "WILL YOU JOIN US?", { family: SANS, size: 13, letter: 4, fill: p.muted })}
     ${rect(560, 650, 228, 56, p.bg, `rx="2" stroke="${p.line}"`)}
     ${txt(674, 686, "JOYFULLY ACCEPTS", {
       family: SANS,
       size: 12,
       letter: 2,
       anchor: "middle",
       fill: p.ink,
     })}
     ${rect(812, 650, 228, 56, p.bg, `rx="2" stroke="${p.line}"`)}
     ${txt(926, 686, "REGRETFULLY DECLINES", {
       family: SANS,
       size: 12,
       letter: 2,
       anchor: "middle",
       fill: p.ink,
     })}
     ${rect(560, 742, 480, 1, p.line)}
     ${rect(560, 782, 480, 60, p.ink, 'rx="2"')}
     ${txt(800, 819, cta, {
       family: SANS,
       size: 14,
       letter: 4,
       anchor: "middle",
       fill: p.bg,
     })}`,
    `${c.names} RSVP page`,
  );
};

/* -------------------------------------------------------------------------- */
/* Mobile composition — authored at 1200px wide, cropped by each view          */
/* -------------------------------------------------------------------------- */

const phoneBody = (p, c, { w = 1200, h = 1500, kind = "wedding" } = {}) => {
  const isSave = kind === "save-the-date";
  const pad = 60;
  const inner = w - pad * 2;
  const parts = [
    rect(0, 0, w, h, p.bg),
    rect(0, 0, w, 6, p.accent, 'opacity="0.9"'),
    txt(pad, 96, c.monogram, { size: 34, letter: 8, fill: p.ink }),
    txt(w - pad, 96, "MENU", {
      family: SANS,
      size: 15,
      letter: 3,
      fill: p.muted,
      anchor: "end",
    }),
  ];

  let y = 140;
  const heroH = Math.round(h * 0.44);
  parts.push(photo(0, y, w, heroH, p.photos, "phero"));
  const mid = y + heroH / 2;
  if (isSave) {
    parts.push(
      txt(w / 2, mid - 66, "SAVE THE DATE", {
        family: SANS,
        size: 16,
        letter: 6,
        anchor: "middle",
        fill: p.ink,
      }),
    );
  }
  parts.push(txt(w / 2, mid + 26, c.names, { size: 100, anchor: "middle", fill: p.ink }));
  parts.push(
    txt(w / 2, mid + 82, c.date, {
      family: SANS,
      size: 22,
      letter: 6,
      anchor: "middle",
      fill: p.ink,
    }),
  );
  if (!isSave) {
    parts.push(txt(w / 2, mid + 126, c.place, { size: 28, italic: true, anchor: "middle", fill: p.ink }));
  }
  y += heroH + 48;

  const columns = isSave ? ["THE DATE", "THE PLACE", "REPLY BY"] : ["THE DATE", "CEREMONY", "RECEPTION"];
  columns.forEach((label, i) => {
    const x = pad + i * (inner / 3);
    parts.push(txt(x, y, label, { family: SANS, size: 13, letter: 3, fill: p.muted }));
    parts.push(bars(x, y + 16, inner / 3 - 44, 1, { h: 9, fill: p.ink, opacity: 0.45, last: 1 }));
  });
  y += 92;
  parts.push(rect(pad, y, inner, 1, p.line));
  y += 68;

  parts.push(
    txt(pad, y, isSave ? "THE BEGINNING" : "OUR STORY", {
      family: SANS,
      size: 14,
      letter: 5,
      fill: p.muted,
    }),
  );
  parts.push(txt(pad, y + 68, isSave ? "We are getting" : "How we found", { size: 64, fill: p.ink }));
  parts.push(txt(pad, y + 134, isSave ? "married" : "each other", { size: 64, fill: p.ink }));
  parts.push(bars(pad, y + 200, inner, 4, { fill: p.ink }));
  y += 200 + 4 * 24 + 44;

  const cellW = (inner - 20) / 2;
  const cellH = Math.round(cellW * 0.74);
  let row = 0;
  while (y < h - 60) {
    parts.push(photo(pad, y, cellW, cellH, p.photos, `pg${row}a`, 2));
    parts.push(
      photo(pad + cellW + 20, y, cellW, cellH, [p.photos[1], p.photos[2], p.photos[0]], `pg${row}b`, 2),
    );
    y += cellH + 20;
    row += 1;
  }

  return parts.join("");
};

const cardView = (p, c, kind) =>
  svg(
    1200,
    1500,
    phoneBody(p, c, { w: 1200, h: 1500, kind }),
    `${c.names} ${kind === "save-the-date" ? "save the date" : "wedding website"} preview`,
  );

const deviceView = (p, c, kind) => {
  const screenW = 676;
  const screenH = 1396;
  const scale = screenW / 1200;
  const bodyHeight = Math.ceil(screenH / scale) + 140;
  return svg(
    860,
    1500,
    `<defs>
       <clipPath id="screenClip">
         <rect x="0" y="0" width="${screenW}" height="${screenH}" rx="48"/>
       </clipPath>
     </defs>
     ${rect(0, 0, 860, 1500, p.surface)}
     ${rect(80, 40, 700, 1420, p.ink, 'rx="60"')}
     ${rect(92, 52, screenW, screenH, p.bg, 'rx="48"')}
     ${rect(378, 66, 104, 10, p.ink, 'rx="5" opacity="0.85"')}
     <g clip-path="url(#screenClip)" transform="translate(92,52) scale(${scale})">
       ${phoneBody(p, c, { w: 1200, h: bodyHeight, kind })}
     </g>`,
    `${c.names} wedding website mobile version`,
  );
};

/** Two-device composition used for bundle products. */
const bundleCard = (p, c) => {
  const W = 1200;
  const H = 1500;
  const dx = 90;
  const dy = 320;
  const dw = 1020;
  const dh = 640;
  const px = 700;
  const py = 780;
  const pw = 400;
  const ph = 660;
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${rect(0, 0, W, 6, p.accent, 'opacity="0.9"')}
     ${txt(60, 108, c.monogram, { size: 34, letter: 8, fill: p.ink })}
     ${txt(W - 60, 108, "SAVE THE DATE + WEBSITE", {
       family: SANS,
       size: 15,
       letter: 4,
       fill: p.muted,
       anchor: "end",
     })}
     ${txt(W / 2, 232, "Two websites,", { size: 58, anchor: "middle", fill: p.ink })}
     ${txt(W / 2, 296, "one celebration", { size: 58, italic: true, anchor: "middle", fill: p.accent })}
     ${rect(dx, dy, dw, dh, p.surface, `rx="6" stroke="${p.line}"`)}
     ${rect(dx + 1, dy + 36, dw - 2, dh - 37, p.bg)}
     ${rect(dx + 70, dy + 60, 300, 10, p.line, 'rx="5"')}
     ${photo(dx + 40, dy + 96, dw - 80, dh - 160, p.photos, "bd", 2)}
     ${txt(dx + dw / 2, dy + dh / 2 - 6, c.names, { size: 58, anchor: "middle", fill: p.ink })}
     ${txt(dx + dw / 2, dy + dh / 2 + 40, c.date, {
       family: SANS,
       size: 16,
       letter: 5,
       anchor: "middle",
       fill: p.ink,
     })}
     ${rect(px, py, pw, ph, p.ink, 'rx="42"')}
     ${rect(px + 12, py + 12, pw - 24, ph - 24, p.bg, 'rx="32"')}
     ${photo(px + 36, py + 56, pw - 72, 300, p.photos, "bp", 2)}
     ${txt(px + pw / 2, py + 420, "SAVE", {
       family: SANS,
       size: 15,
       letter: 5,
       anchor: "middle",
       fill: p.muted,
     })}
     ${txt(px + pw / 2, py + 486, c.names, { size: 44, anchor: "middle", fill: p.ink })}
     ${bars(px + 60, py + 520, pw - 120, 3, { fill: p.ink, last: 0.7 })}
     ${rect(px + 60, py + 600, pw - 120, 34, p.ink, 'rx="2"')}`,
    `${c.names} wedding website and save the date bundle`,
  );
};

/** Editorial collage used for the custom design service. */
const customCard = (p, c) => {
  const W = 1200;
  const H = 1500;
  return svg(
    W,
    H,
    `${rect(0, 0, W, H, p.bg)}
     ${txt(60, 108, "BLANC WEDDINGS", { family: SANS, size: 15, letter: 5, fill: p.muted })}
     ${txt(60, 330, "Designed", { size: 108, fill: p.ink })}
     ${txt(60, 442, "around you", { size: 108, italic: true, fill: p.accent })}
     ${bars(60, 510, 620, 3, { fill: p.ink })}
     ${rect(60, 610, 90, 1, p.line)}
     ${photo(60, 680, 1080, 380, p.photos, "cu1", 2)}
     ${photo(60, 1092, 520, 320, [p.photos[1], p.photos[2], p.photos[0]], "cu2", 2)}
     ${photo(620, 1092, 520, 320, p.photos, "cu3", 2)}
     ${txt(60, 1470, c.monogram, { family: SANS, size: 15, letter: 5, fill: p.muted })}`,
    "Custom wedding website design",
  );
};

/** Large editorial plates for banners and the about page. */
const editorialPlate = (p, { eyebrow, word, wordItalic }) =>
  svg(
    1600,
    1000,
    `${rect(0, 0, 1600, 1000, p.bg)}
     ${photo(0, 0, 640, 1000, p.photos, "ed1")}
     ${txt(760, 250, eyebrow, { family: SANS, size: 15, letter: 5, fill: p.muted })}
     ${txt(760, 400, word, { size: 92, fill: p.ink })}
     ${txt(760, 500, wordItalic, { size: 92, italic: true, fill: p.accent })}
     ${bars(760, 580, 620, 3, { fill: p.ink })}
     ${rect(760, 740, 90, 1, p.line)}
     ${photo(760, 800, 320, 160, [p.photos[1], p.photos[2], p.photos[0]], "ed2", 2)}
     ${photo(1100, 800, 320, 160, p.photos, "ed3", 2)}`,
    `${eyebrow} editorial image`,
  );

/* -------------------------------------------------------------------------- */
/* Art direction                                                              */
/* -------------------------------------------------------------------------- */

/** One accent colour per collection — never all colours at once. */
const palettes = {
  ivory: {
    bg: "#fbf8f4",
    surface: "#f2ede6",
    ink: "#23201c",
    muted: "#8b8479",
    line: "#e2dad0",
    accent: "#6f6a61",
    photos: ["#e8e0d4", "#ded4c6", "#f1eae0"],
  },
  olive: {
    bg: "#f4f2ea",
    surface: "#eaeade",
    ink: "#2c3126",
    muted: "#7d8271",
    line: "#dddccd",
    accent: "#5d6146",
    photos: ["#dfe0cf", "#cdd2bc", "#e9e8da"],
  },
  burgundy: {
    bg: "#f7f2f1",
    surface: "#efe4e4",
    ink: "#2a1c1e",
    muted: "#8a7576",
    line: "#e3d5d5",
    accent: "#6c2b33",
    photos: ["#e6d3d4", "#d8bcbe", "#efe2e2"],
  },
  dusty: {
    bg: "#f4f6f8",
    surface: "#e9eef2",
    ink: "#22282e",
    muted: "#77828d",
    line: "#d8dee4",
    accent: "#6f8497",
    photos: ["#dae2e8", "#c6d2dc", "#e8eef2"],
  },
  brown: {
    bg: "#f8f4ef",
    surface: "#efe6da",
    ink: "#33261d",
    muted: "#8b7a6b",
    line: "#e0d3c6",
    accent: "#3a2c22",
    photos: ["#e3d5c6", "#d3c0ad", "#eee3d6"],
  },
  mono: {
    bg: "#f7f7f6",
    surface: "#eeeeec",
    ink: "#141414",
    muted: "#7c7c7a",
    line: "#e0e0de",
    accent: "#141414",
    photos: ["#e6e6e4", "#d2d2d0", "#f0f0ee"],
  },
  garden: {
    bg: "#f3f5ef",
    surface: "#e8ede0",
    ink: "#26301f",
    muted: "#78836c",
    line: "#d9e0d0",
    accent: "#4f6b45",
    photos: ["#dde6d4", "#c9d8bf", "#eaf0e4"],
  },
  classic: {
    bg: "#faf7f1",
    surface: "#f2ebdd",
    ink: "#2b2620",
    muted: "#8d8471",
    line: "#e4dbc9",
    accent: "#8a7448",
    photos: ["#e9e1d1", "#dccfb7", "#f1ebdf"],
  },
  stone: {
    bg: "#f5f4f2",
    surface: "#ebebe8",
    ink: "#1f1e1c",
    muted: "#7e7b75",
    line: "#e0deda",
    accent: "#5c5a55",
    photos: ["#e4e2de", "#d3d0cb", "#efeeec"],
  },
  pearl: {
    bg: "#fcfaf8",
    surface: "#f3efeb",
    ink: "#2a2724",
    muted: "#918a82",
    line: "#eae2da",
    accent: "#9c9188",
    photos: ["#f0eae4", "#e4dbd2", "#f6f2ee"],
  },
  sage: {
    bg: "#f7f8f3",
    surface: "#eaefe1",
    ink: "#2a2f25",
    muted: "#7f8874",
    line: "#e0e4d6",
    accent: "#8a9781",
    photos: ["#e6ebdc", "#d5ddc8", "#f0f3ea"],
  },
  blush: {
    bg: "#faf5f2",
    surface: "#f4e6e0",
    ink: "#2e2723",
    muted: "#96817a",
    line: "#ecdcd5",
    accent: "#b98878",
    photos: ["#f0dcd4", "#e3c8bd", "#f6ebe6"],
  },
  terracotta: {
    bg: "#fdf8f2",
    surface: "#f6ebe1",
    ink: "#2f2620",
    muted: "#8b7a6b",
    line: "#ecdccf",
    accent: "#c25f3c",
    photos: ["#f0d6c0", "#e6c6ad", "#f7e6d8"],
  },
};

/** Fictional couples — one per template, so previews never look duplicated. */
const couples = {
  amelia: {
    monogram: "A & J",
    names: "Amelia & Julien",
    date: "12 . 09 . 2026",
    place: "Aix-en-Provence",
    quote: "We met in the rain and never really left.",
  },
  noor: {
    monogram: "N & E",
    names: "Noor & Elias",
    date: "03 . 06 . 2026",
    place: "Tuscany",
    quote: "Two families, one long table.",
  },
  camille: {
    monogram: "C & A",
    names: "Camille & Antoine",
    date: "20 . 05 . 2026",
    place: "Bordeaux",
    quote: "Eight years, one question, one yes.",
  },
  sofia: {
    monogram: "S & M",
    names: "Sofia & Marco",
    date: "18 . 07 . 2026",
    place: "Lake Como",
    quote: "We said yes long before the ceremony.",
  },
  ines: {
    monogram: "I & T",
    names: "Ines & Tomas",
    date: "05 . 09 . 2026",
    place: "Lisbon",
    quote: "We fell in love over coffee and maps.",
  },
  yuki: {
    monogram: "Y & R",
    names: "Yuki & Ren",
    date: "22 . 11 . 2026",
    place: "Kyoto",
    quote: "Quiet mornings, loud laughter.",
  },
  freya: {
    monogram: "F & O",
    names: "Freya & Oskar",
    date: "27 . 06 . 2026",
    place: "Copenhagen",
    quote: "A garden, a long summer, a promise.",
  },
  charlotte: {
    monogram: "C & H",
    names: "Charlotte & Henry",
    date: "14 . 08 . 2026",
    place: "Bath",
    quote: "The same room, the same laugh, always.",
  },
  margot: {
    monogram: "M & L",
    names: "Margot & Louis",
    date: "09 . 10 . 2026",
    place: "Paris",
    quote: "Signed on paper, celebrated in person.",
  },
  elise: {
    monogram: "E & N",
    names: "Elise & Noah",
    date: "01 . 05 . 2026",
    place: "Annecy",
    quote: "The lake, the mountains, the two of us.",
  },
  mila: {
    monogram: "M & T",
    names: "Mila & Theo",
    date: "13 . 06 . 2026",
    place: "Provence",
    quote: "Lavender, linen and a very long lunch.",
  },
  anna: {
    monogram: "A & R",
    names: "Anna & Ravi",
    date: "30 . 04 . 2026",
    place: "Santorini",
    quote: "Sunset, sea and a hundred of our people.",
  },
  wren: {
    monogram: "B & S",
    names: "Bea & Sam",
    date: "11 . 07 . 2026",
    place: "Verona",
    quote: "Confetti, sunlight and a very loud band.",
  },
};

const viewSets = {
  wedding: ["card", "home", "story", "details", "gallery", "rsvp", "mobile"],
  "save-the-date": ["card", "home", "details", "gallery", "rsvp", "mobile"],
  bundle: ["card", "home", "story", "details", "gallery", "rsvp", "mobile"],
  custom: ["card", "home", "story", "details", "gallery", "mobile"],
};

const renderers = {
  card: (p, c, kind) =>
    kind === "bundle"
      ? bundleCard(p, c)
      : kind === "custom"
        ? customCard(p, c)
        : cardView(p, c, kind),
  home: (p, c) => desktopHero(p, c),
  story: (p, c) => desktopStory(p, c),
  details: (p, c) => desktopDetails(p, c),
  gallery: (p, c) => desktopGallery(p, c),
  rsvp: (p, c, kind) =>
    desktopRsvp(p, c, kind === "save-the-date" ? "SAVE THE DATE" : "SEND RSVP"),
  mobile: (p, c, kind) => deviceView(p, c, kind),
};

/** Slugs must mirror `src/data/templates.ts`. */
const catalogue = [
  ["modern-ivory", "wedding", "ivory", "amelia"],
  ["olive-green", "wedding", "olive", "noor"],
  ["burgundy", "wedding", "burgundy", "camille"],
  ["brown-and-ivory", "wedding", "brown", "ines"],
  ["dusty-blue", "wedding", "dusty", "sofia"],
  ["black-and-white", "wedding", "mono", "yuki"],
  ["garden-party", "wedding", "garden", "freya"],
  ["classic-ivory", "wedding", "classic", "charlotte"],
  ["editorial-stone", "wedding", "stone", "margot"],
  ["plein-air", "wedding", "terracotta", "wren"],
  ["pearl-and-ivory", "save-the-date", "pearl", "elise"],
  ["sage-and-ivory", "save-the-date", "sage", "mila"],
  ["blush-and-sage", "save-the-date", "blush", "anna"],
  ["modern-ivory-save-the-date", "save-the-date", "ivory", "amelia"],
  ["burgundy-save-the-date", "save-the-date", "burgundy", "camille"],
  ["dusty-blue-save-the-date", "save-the-date", "dusty", "sofia"],
  ["brown-and-ivory-save-the-date", "save-the-date", "brown", "ines"],
  ["black-and-white-save-the-date", "save-the-date", "mono", "yuki"],
  ["modern-ivory-bundle", "bundle", "ivory", "amelia"],
  ["garden-party-bundle", "bundle", "garden", "freya"],
  ["custom-wedding-website", "custom", "stone", "margot"],
];

/** One preview per "shop by style" category. */
const stylePlates = [
  ["modern", "mono", "yuki"],
  ["romantic", "blush", "anna"],
  ["editorial", "stone", "margot"],
  ["minimal", "ivory", "amelia"],
  ["garden", "garden", "freya"],
  ["classic", "classic", "charlotte"],
  ["black-white", "mono", "camille"],
  ["colorful", "terracotta", "sofia"],
];

/** Editorial plates for the banner and the about page. */
const editorialPlates = [
  ["plate-01", "ivory", { eyebrow: "THE STUDIO", word: "Quietly,", wordItalic: "modern" }],
  ["plate-02", "garden", { eyebrow: "THE COLLECTION", word: "Made for", wordItalic: "celebrations" }],
  ["plate-03", "brown", { eyebrow: "THE PROCESS", word: "You choose,", wordItalic: "we prepare" }],
];

const written = [];

const write = (dir, name, contents) => {
  const target = join(outRoot, dir);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, `${name}.svg`), contents, "utf8");
  written.push(`${dir}/${name}.svg`);
};

for (const [slug, kind, paletteKey, coupleKey] of catalogue) {
  for (const viewName of viewSets[kind]) {
    write(slug, viewName, renderers[viewName](palettes[paletteKey], couples[coupleKey], kind));
  }
}

for (const [style, paletteKey, coupleKey] of stylePlates) {
  write("styles", style, cardView(palettes[paletteKey], couples[coupleKey], "wedding"));
}

for (const [name, paletteKey, copy] of editorialPlates) {
  write("editorial", name, editorialPlate(palettes[paletteKey], copy));
}

console.log(`✓ ${written.length} mockups written for ${catalogue.length} templates`);
console.log(`  → public/images/  (+ ${stylePlates.length} style plates, ${editorialPlates.length} editorial plates)`);





