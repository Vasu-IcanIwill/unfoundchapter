// Line drawings for the itinerary walk: one long riverside panorama, one scene per stop, drawn in the
// same gold line style as the group trip hero. Pure functions returning SVG markup (deterministic, so the
// prerendered page and the browser agree). Strokes use currentColor-like CSS variables set by the page:
//   --ink   line colour (gold by day, pale gold at night)
//   --fill  paper colour behind buildings
//   --flame lamp colour; lamps (.lp) brighten with --night
export const SW = 900; // width of one scene
export const H = 520; // panorama height
export const G = 330; // ground / river edge

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const line = (x1, y1, x2, y2, w = 1, o = 1) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke-width="${w}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const path = (d, w = 1, extra = '') => `<path d="${d}" stroke-width="${w}"${extra}/>`;
const rect = (x, y, w, h, sw = 1) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" class="bf" stroke-width="${sw}"/>`;
const circle = (cx, cy, r, w = 1, cls = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" stroke-width="${w}"${cls ? ` class="${cls}"` : ''}/>`;
const arch = (x, y, w, h, sw = 0.8) => path(`M${f(x)} ${f(y)} V${f(y - h + w / 2)} A${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(x + w)} ${f(y - h + w / 2)} V${f(y)}`, sw);
// a small oil lamp: dish + flame; the flame glows at night
const lamp = (x, y, s = 1) => `<path d="M${f(x - 5 * s)} ${f(y)} Q${f(x)} ${f(y + 5 * s)} ${f(x + 5 * s)} ${f(y)} Z" stroke-width="0.8"/><path class="lp" d="M${f(x)} ${f(y - 1 * s)} C${f(x - 3 * s)} ${f(y - 5 * s)} ${f(x - 1 * s)} ${f(y - 9 * s)} ${f(x)} ${f(y - 12 * s)} C${f(x + 1 * s)} ${f(y - 9 * s)} ${f(x + 3 * s)} ${f(y - 5 * s)} ${f(x)} ${f(y - 1 * s)} Z" stroke-width="0.6"/>`;
const dot = (x, y, r = 1.6) => `<circle class="lp" cx="${f(x)}" cy="${f(y)}" r="${r}" stroke-width="0.4"/>`;
const star = (x, y, r) => `<path class="st" d="M${f(x)} ${f(y - r)} L${f(x + r * 0.25)} ${f(y - r * 0.25)} L${f(x + r)} ${f(y)} L${f(x + r * 0.25)} ${f(y + r * 0.25)} L${f(x)} ${f(y + r)} L${f(x - r * 0.25)} ${f(y + r * 0.25)} L${f(x - r)} ${f(y)} L${f(x - r * 0.25)} ${f(y - r * 0.25)} Z" stroke-width="0.5"/>`;

function steps(x, w, n = 7, top = G - 40) {
  let s = '';
  for (let i = 0; i <= n; i += 1) {
    const y = top + ((G - top) * i) / n;
    s += line(x + i * 8, y, x + w - i * 4, y, 0.7, 0.75);
  }
  return s;
}
function shikhara(x, base, w, h, flag = true) {
  // curved temple spire with ribs, on a plinth
  const top = base - h;
  let s = rect(x - w * 0.15, base, w * 1.3, G - base);
  s += path(`M${f(x)} ${f(base)} C${f(x)} ${f(base - h * 0.55)} ${f(x + w * 0.3)} ${f(top + h * 0.12)} ${f(x + w / 2)} ${f(top)} C${f(x + w * 0.7)} ${f(top + h * 0.12)} ${f(x + w)} ${f(base - h * 0.55)} ${f(x + w)} ${f(base)} Z`, 1, ' class="bf"');
  for (let i = 1; i < 5; i += 1) {
    const t = i / 5;
    s += path(`M${f(x + w * t)} ${f(base)} Q${f(x + w * (0.5 + (t - 0.5) * 0.5))} ${f(base - h * 0.55)} ${f(x + w / 2)} ${f(top + 4)}`, 0.5);
  }
  for (let i = 1; i < 4; i += 1) s += line(x + w * 0.04 * i, base - h * 0.18 * i, x + w - w * 0.04 * i, base - h * 0.18 * i, 0.5, 0.7);
  s += circle(x + w / 2, top - 4, 3, 0.8);
  if (flag) s += line(x + w / 2, top - 7, x + w / 2, top - 26, 0.8) + path(`M${f(x + w / 2)} ${f(top - 26)} L${f(x + w / 2 + 14)} ${f(top - 22)} L${f(x + w / 2)} ${f(top - 18)}`, 0.8);
  s += arch(x + w / 2 - 7, G, 14, 26);
  return s;
}
function tent(x, w, h) {
  const top = G - h;
  let s = path(`M${f(x)} ${f(G - h * 0.35)} L${f(x + w / 2)} ${f(top)} L${f(x + w)} ${f(G - h * 0.35)} Z`, 1, ' class="bf"');
  s += rect(x + w * 0.08, G - h * 0.35, w * 0.84, h * 0.35);
  s += path(`M${f(x + w * 0.08)} ${f(G - h * 0.35)} Q${f(x + w * 0.29)} ${f(G - h * 0.25)} ${f(x + w * 0.5)} ${f(G - h * 0.35)} Q${f(x + w * 0.71)} ${f(G - h * 0.25)} ${f(x + w * 0.92)} ${f(G - h * 0.35)}`, 0.7);
  s += path(`M${f(x + w * 0.42)} ${f(G)} L${f(x + w * 0.5)} ${f(G - h * 0.3)} L${f(x + w * 0.58)} ${f(G)}`, 0.7);
  s += line(x + w / 2, top, x + w / 2, top - 12, 0.8) + path(`M${f(x + w / 2)} ${f(top - 12)} L${f(x + w / 2 + 9)} ${f(top - 9)} L${f(x + w / 2)} ${f(top - 6)}`, 0.7);
  return s;
}
function lanternPost(x, h = 60) {
  return line(x, G, x, G - h, 0.9) + line(x, G - h, x + 10, G - h, 0.9) + path(`M${f(x + 6)} ${f(G - h + 2)} h8 l-1 12 h-6 Z`, 0.7) + dot(x + 10, G - h + 9, 2.4);
}
function tree(x, r, rnd) {
  let s = line(x, G, x, G - r * 1.6, 1);
  for (let i = 0; i < 5; i += 1) s += circle(x + (rnd() - 0.5) * r, G - r * 1.6 - rnd() * r * 0.9, r * (0.45 + rnd() * 0.3), 0.7);
  return s;
}
function boat(x, y, w, canopy = false) {
  let s = path(`M${f(x)} ${f(y)} Q${f(x + w / 2)} ${f(y + w * 0.14)} ${f(x + w)} ${f(y)} L${f(x + w * 0.92)} ${f(y + 3)} Q${f(x + w / 2)} ${f(y + w * 0.16)} ${f(x + w * 0.08)} ${f(y + 3)} Z`, 1, ' class="bf"');
  if (canopy) s += rect(x + w * 0.3, y - w * 0.12, w * 0.4, w * 0.12, 0.8) + line(x + w * 0.28, y - w * 0.12, x + w * 0.72, y - w * 0.12, 1);
  return s;
}
function water(ox, rnd, n = 26) {
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const x = ox + rnd() * SW;
    const y = G + 18 + rnd() * (H - G - 40);
    const w = 14 + rnd() * 46;
    s += line(x, y, x + w, y, 0.6, 0.45);
  }
  return s;
}
function bunting(x1, x2, y, rnd) {
  let s = path(`M${f(x1)} ${f(y)} Q${f((x1 + x2) / 2)} ${f(y + 18)} ${f(x2)} ${f(y)}`, 0.6);
  const n = Math.floor((x2 - x1) / 16);
  for (let i = 1; i < n; i += 1) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t;
    const yy = y + 18 * 4 * t * (1 - t) * 0.5 * 2;
    s += path(`M${f(x - 4)} ${f(yy)} L${f(x)} ${f(yy + 8 + rnd() * 2)} L${f(x + 4)} ${f(yy)}`, 0.5);
  }
  return s;
}

const SCENES = {
  arrival(ox, rnd) {
    let s = '';
    // station canopy with pillars and a clock
    s += path(`M${ox + 60} ${G - 120} L${ox + 120} ${G - 160} H${ox + 440} L${ox + 500} ${G - 120} Z`, 1, ' class="bf"');
    for (let i = 0; i < 8; i += 1) s += line(ox + 80 + i * 57, G - 120, ox + 80 + i * 57, G, 1);
    s += rect(ox + 70, G - 90, 420, 90, 0.8);
    for (let i = 0; i < 7; i += 1) s += arch(ox + 94 + i * 57, G, 30, 64);
    s += circle(ox + 280, G - 140, 12, 0.9) + line(ox + 280, G - 140, ox + 280, G - 148, 0.8) + line(ox + 280, G - 140, ox + 286, G - 137, 0.8);
    s += line(ox + 520, G - 6, ox + SW, G - 6, 0.8, 0.6);
    // the car, ready
    s += path(`M${ox + 600} ${G - 8} h120 l-6 -18 l-22 -2 l-14 -14 h-44 l-18 16 l-14 2 Z`, 1, ' class="bf"');
    s += circle(ox + 620, G - 6, 8, 1, 'bf') + circle(ox + 700, G - 6, 8, 1, 'bf');
    s += path(`M${ox + 650} ${G - 26} l12 -11 h34 l10 11 Z`, 0.7);
    s += tree(ox + 800, 26, rnd) + tree(ox + 860, 20, rnd);
    return s;
  },
  resort(ox, rnd) {
    let s = tree(ox + 40, 28, rnd);
    s += tent(ox + 90, 170, 140) + tent(ox + 300, 190, 156) + tent(ox + 530, 170, 140);
    s += lanternPost(ox + 275) + lanternPost(ox + 505) + lanternPost(ox + 720);
    s += tree(ox + 790, 30, rnd) + tree(ox + 860, 22, rnd);
    for (let i = 0; i < 40; i += 1) s += line(ox + i * 22, G - 2, ox + i * 22 + 8, G - 2, 0.6, 0.6);
    return s;
  },
  henna(ox, rnd) {
    let s = '';
    // reception pavilion with scalloped roof, pillars and hanging lamps
    s += path(`M${ox + 90} ${G - 170} L${ox + 450} ${G - 230} L${ox + 810} ${G - 170} Z`, 1, ' class="bf"');
    let sc = `M${ox + 90} ${G - 170}`;
    for (let i = 0; i < 18; i += 1) sc += ` q10 14 20 0`;
    s += path(sc, 0.8);
    for (let i = 0; i < 7; i += 1) {
      const x = ox + 110 + i * 113;
      s += line(x, G - 160, x, G, 1.2) + rect(x - 7, G - 12, 14, 12, 0.8);
      if (i < 6) s += line(x + 56, G - 160, x + 56, G - 120, 0.6) + lamp(x + 56, G - 110, 1.2);
    }
    // a henna motif at the centre
    const cx = ox + 450; const cy = G - 70;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      s += path(`M${f(cx)} ${f(cy)} Q${f(cx + Math.cos(a - 0.3) * 30)} ${f(cy + Math.sin(a - 0.3) * 30)} ${f(cx + Math.cos(a) * 44)} ${f(cy + Math.sin(a) * 44)} Q${f(cx + Math.cos(a + 0.3) * 30)} ${f(cy + Math.sin(a + 0.3) * 30)} ${f(cx)} ${f(cy)}`, 0.6);
    }
    s += circle(cx, cy, 12, 0.8) + circle(cx, cy, 52, 0.5);
    return s;
  },
  temple(ox, rnd) {
    let s = steps(ox, SW, 6, G - 30);
    s += rect(ox + 20, G - 110, 120, 80) + arch(ox + 40, G - 30, 22, 44) + arch(ox + 98, G - 30, 22, 44);
    s += shikhara(ox + 180, G - 70, 120, 210) + shikhara(ox + 360, G - 60, 90, 160) + shikhara(ox + 500, G - 80, 150, 250);
    s += rect(ox + 700, G - 130, 150, 100) + arch(ox + 722, G - 30, 26, 56) + arch(ox + 792, G - 30, 26, 56);
    // temple bells
    for (let i = 0; i < 4; i += 1) s += line(ox + 690 + i * 10, G - 150, ox + 690 + i * 10, G - 140, 0.6) + path(`M${ox + 686 + i * 10} ${G - 132} q4 -10 8 0 Z`, 0.7);
    return s;
  },
  lanes(ox, rnd) {
    let s = '';
    let x = ox + 10;
    while (x < ox + SW - 60) {
      const w = 60 + rnd() * 50;
      const h = 150 + rnd() * 120;
      s += rect(x, G - h, w, h);
      s += arch(x + w / 2 - 10, G, 20, 40);
      for (let r = 0; r < Math.floor((h - 60) / 44); r += 1) {
        const y = G - 70 - r * 44;
        s += arch(x + 10, y, 12, 24, 0.6) + arch(x + w - 22, y, 12, 24, 0.6);
      }
      if (rnd() > 0.5) s += path(`M${f(x + w * 0.2)} ${f(G - h + 50)} h${f(w * 0.6)} v18 q${f(-w * 0.3)} 14 ${f(-w * 0.6)} 0 Z`, 0.7);
      x += w + 4;
    }
    s += bunting(ox + 30, ox + 450, G - 230, rnd) + bunting(ox + 440, ox + 870, G - 220, rnd);
    s += lanternPost(ox + 430, 90);
    return s;
  },
  observatory(ox, rnd) {
    let s = '';
    // the great sundial: a stair-ramp triangle with quadrant arcs
    s += path(`M${ox + 260} ${G} L${ox + 450} ${G - 230} L${ox + 450} ${G} Z`, 1.1, ' class="bf"');
    for (let i = 1; i < 14; i += 1) s += line(ox + 260 + i * 13.5, G - i * 16.4, ox + 260 + (i + 1) * 13.5, G - i * 16.4, 0.6);
    s += path(`M${ox + 450} ${G - 120} A120 120 0 0 1 ${ox + 570} ${G}`, 0.9) + path(`M${ox + 450} ${G - 120} A120 120 0 0 0 ${ox + 330} ${G}`, 0.6);
    s += path(`M${ox + 610} ${G - 60} A70 70 0 0 0 ${ox + 750} ${G - 60} Z`, 1, ' class="bf"');
    for (let i = 1; i < 6; i += 1) s += line(ox + 610 + i * 23, G - 60, ox + 610 + i * 23, G - 60 + Math.sin((i / 6) * Math.PI) * 66, 0.5);
    s += rect(ox + 600, G - 60, 160, 60) + rect(ox + 40, G - 150, 160, 150) + arch(ox + 70, G, 30, 70) + arch(ox + 140, G, 30, 70);
    // light beams for the show
    for (let i = 0; i < 9; i += 1) {
      const a = -Math.PI / 2 + (i - 4) * 0.16;
      s += line(ox + 450, G - 230, ox + 450 + Math.cos(a) * 320, G - 230 + Math.sin(a) * 320, 1.2, 1).replace('<line', '<line class="bm"');
    }
    return s;
  },
  aarti(ox, rnd) {
    let s = steps(ox, SW, 8, G - 56);
    for (let i = 0; i < 5; i += 1) {
      const x = ox + 70 + i * 170;
      // platform with a parasol and a tiered lamp
      s += rect(x, G - 74, 90, 18, 0.8);
      s += line(x + 45, G - 74, x + 45, G - 150, 0.9) + path(`M${x} ${G - 140} Q${x + 45} ${G - 196} ${x + 90} ${G - 140} Z`, 1, ' class="bf"');
      s += line(x + 45, G - 74, x + 45, G - 104, 0.8);
      for (let k = 0; k < 3; k += 1) s += line(x + 33 + k * 4, G - 104 - k * 9, x + 57 - k * 4, G - 104 - k * 9, 0.7);
      for (let k = 0; k < 7; k += 1) s += dot(x + 31 + k * 4.7 - (k > 3 ? 0 : 0), G - 108 - Math.floor(k / 3) * 9, 1.8);
    }
    s += boat(ox + 120, G + 40, 150) + boat(ox + 420, G + 70, 120) + boat(ox + 640, G + 46, 170, true);
    for (let i = 0; i < 18; i += 1) s += lamp(ox + 40 + rnd() * (SW - 80), G + 24 + rnd() * 120, 0.7);
    return s;
  },
  palace(ox, rnd) {
    let s = steps(ox, SW, 6, G - 34);
    s += rect(ox + 110, G - 250, 680, 216);
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 14; c += 1) {
        const x = ox + 130 + c * 47; const y = G - 52 - r * 52;
        s += `<path class="wn" d="M${x} ${y} V${y - 22} A8 8 0 0 1 ${x + 16} ${y - 22} V${y} Z" stroke-width="0.7"/>`;
      }
    }
    for (const x of [ox + 90, ox + 750]) {
      s += rect(x, G - 300, 60, 266) + path(`M${x} ${G - 300} Q${x + 30} ${G - 350} ${x + 60} ${G - 300} Z`, 1, ' class="bf"') + line(x + 30, G - 332, x + 30, G - 352, 0.8);
    }
    for (let i = 0; i < 6; i += 1) s += path(`M${ox + 200 + i * 100} ${G - 250} q20 -26 40 0 Z`, 0.8, ' class="bf"');
    s += boat(ox + 330, G + 60, 140);
    return s;
  },
  night(ox, rnd) {
    let s = '';
    s += shikhara(ox + 380, G - 70, 140, 230);
    s += rect(ox + 200, G - 120, 150, 120) + rect(ox + 550, G - 110, 170, 110);
    s += arch(ox + 230, G, 26, 60) + arch(ox + 290, G, 26, 60) + arch(ox + 590, G, 26, 60) + arch(ox + 660, G, 26, 60);
    for (let i = 0; i < 6; i += 1) s += lamp(ox + 395 + i * 22, G - 6, 1);
    // the 800 m walk, a dotted path
    for (let i = 0; i < 26; i += 1) s += circle(ox + 20 + i * 7, G - 4, 0.9, 0.6);
    s += circle(ox + 760, 70, 26, 1, 'mn');
    return s;
  },
  morning(ox, rnd) {
    let s = circle(ox + 450, G - 190, 40, 1, 'sn');
    for (let i = 0; i < 16; i += 1) {
      const a = (i / 16) * Math.PI * 2;
      s += line(ox + 450 + Math.cos(a) * 52, G - 190 + Math.sin(a) * 52, ox + 450 + Math.cos(a) * 72, G - 190 + Math.sin(a) * 72, 0.8);
    }
    s += tent(ox + 70, 170, 140) + tent(ox + 650, 170, 140);
    s += tree(ox + 290, 26, rnd) + tree(ox + 600, 22, rnd);
    // a cup of chai, steaming
    s += line(ox + 400, G - 40, ox + 500, G - 40, 1) + line(ox + 412, G - 40, ox + 412, G, 0.8) + line(ox + 488, G - 40, ox + 488, G, 0.8);
    s += path(`M${ox + 436} ${G - 62} h28 l-4 22 h-20 Z`, 1, ' class="bf"') + path(`M${ox + 464} ${G - 56} q9 3 0 11`, 0.8);
    for (let i = 0; i < 3; i += 1) s += path(`M${ox + 442 + i * 8} ${G - 68} q-4 -8 0 -14 q4 -6 0 -12`, 0.6, ' class="smk"');
    return s;
  },
  board(ox, rnd) {
    let s = steps(ox, SW * 0.55, 8, G - 60);
    s += rect(ox + 40, G - 170, 110, 110) + shikhara(ox + 200, G - 60, 80, 140) + rect(ox + 330, G - 140, 120, 80);
    // the boat waiting, garlanded
    const bx = ox + 470; const by = G + 30;
    s += path(`M${bx} ${by} Q${bx + 200} ${by + 50} ${bx + 400} ${by} L${bx + 384} ${by + 12} Q${bx + 200} ${by + 56} ${bx + 16} ${by + 12} Z`, 1.1, ' class="bf"');
    s += line(bx + 30, by - 4, bx + 370, by - 4, 1);
    for (let i = 0; i < 8; i += 1) s += line(bx + 40 + i * 46, by - 4, bx + 40 + i * 46, by - 70, 0.9);
    s += line(bx + 30, by - 70, bx + 370, by - 70, 1);
    let sw = `M${bx + 40} ${by - 66}`;
    for (let i = 0; i < 7; i += 1) sw += ` q23 16 46 0`;
    s += path(sw, 0.7);
    for (let i = 0; i < 7; i += 1) s += circle(bx + 63 + i * 46, by - 56, 2, 0.6);
    s += line(bx + 210, by - 4, bx + 190, G - 4, 0.8, 0.8);
    return s;
  },
  deck(ox, rnd) {
    let s = '';
    for (let i = 0; i < 7; i += 1) {
      const x = ox + i * 130; const h = 70 + rnd() * 80;
      s += rect(x, G - h, 120, h, 0.7) + arch(x + 50, G, 20, 34, 0.6);
    }
    const bx = ox + 160; const by = G + 70;
    s += path(`M${bx} ${by} Q${bx + 290} ${by + 60} ${bx + 580} ${by} L${bx + 560} ${by + 14} Q${bx + 290} ${by + 68} ${bx + 20} ${by + 14} Z`, 1.2, ' class="bf"');
    s += line(bx + 40, by - 4, bx + 540, by - 4, 1);
    for (let i = 0; i < 11; i += 1) s += line(bx + 50 + i * 48, by - 4, bx + 50 + i * 48, by - 84, 0.9);
    s += line(bx + 40, by - 84, bx + 540, by - 84, 1.1);
    let sw = `M${bx + 50} ${by - 80}`;
    for (let i = 0; i < 10; i += 1) sw += ` q24 18 48 0`;
    s += path(sw, 0.7);
    // tea on the long tables
    for (let i = 0; i < 9; i += 1) s += path(`M${bx + 70 + i * 52} ${by - 26} h12 l-2 10 h-8 Z`, 0.7) + path(`M${bx + 82 + i * 52} ${by - 23} q5 2 0 6`, 0.6);
    s += line(bx + 60, by - 16, bx + 520, by - 16, 0.8);
    s += circle(ox + 780, G - 120, 40, 1, 'sn');
    return s;
  },
  lamps(ox, rnd) {
    let s = steps(ox, SW, 9, G - 80);
    for (let r = 0; r < 9; r += 1) {
      const y = G - 80 + (80 * r) / 9 - 2;
      for (let x = ox + 10 + r * 8; x < ox + SW - r * 4 - 6; x += 9 + rnd() * 4) s += dot(x, y, 1.5);
    }
    s += shikhara(ox + 120, G - 80, 90, 150) + rect(ox + 300, G - 200, 140, 120) + shikhara(ox + 520, G - 80, 110, 190) + rect(ox + 700, G - 170, 150, 90);
    for (let i = 0; i < 5; i += 1) s += dot(ox + 320 + i * 25, G - 182, 1.8) + dot(ox + 720 + i * 28, G - 152, 1.8);
    for (let i = 0; i < 46; i += 1) s += lamp(ox + 20 + rnd() * (SW - 40), G + 20 + rnd() * 150, 0.6 + rnd() * 0.4);
    // fireworks
    for (const [cx, cy, r] of [[ox + 230, 70, 46], [ox + 610, 40, 58], [ox + 800, 110, 36]]) {
      let fw = '';
      for (let i = 0; i < 16; i += 1) {
        const a = (i / 16) * Math.PI * 2;
        fw += line(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1);
      }
      s += `<g class="fw" style="transform-origin:${f(cx)}px ${f(cy)}px">${fw}</g>`;
    }
    return s;
  },
  resortNight(ox, rnd) {
    let s = tent(ox + 110, 170, 140) + tent(ox + 340, 190, 156) + tent(ox + 590, 170, 140);
    s += lanternPost(ox + 80) + lanternPost(ox + 315) + lanternPost(ox + 565) + lanternPost(ox + 800);
    for (let i = 0; i < 10; i += 1) s += lamp(ox + 60 + i * 82, G - 4, 0.9);
    return s;
  },
  market(ox, rnd) {
    let s = '';
    for (let i = 0; i < 6; i += 1) {
      const x = ox + 20 + i * 146;
      s += rect(x, G - 210, 136, 210) + path(`M${x + 14} ${G} V${G - 120} A54 54 0 0 1 ${x + 122} ${G - 120} V${G}`, 0.9);
      s += rect(x + 18, G - 196, 100, 24, 0.7);
      // silks hung in the doorway
      for (let k = 0; k < 4; k += 1) {
        const sx = x + 28 + k * 22;
        s += path(`M${sx} ${G - 150} q8 40 0 80 q-4 30 6 52`, 0.7);
        for (let d = 0; d < 4; d += 1) s += circle(sx + 3, G - 136 + d * 24, 1.2, 0.5);
      }
      s += path(`M${x - 4} ${G - 168} h144 l-12 16 h-120 Z`, 0.8, ' class="bf"');
    }
    s += bunting(ox + 10, ox + 880, G - 236, rnd);
    return s;
  },
  farewell(ox, rnd) {
    let s = line(ox, G - 6, ox + SW, G - 6, 0.8, 0.6);
    s += path(`M${ox + 200} ${G - 8} h120 l-6 -18 l-22 -2 l-14 -14 h-44 l-18 16 l-14 2 Z`, 1, ' class="bf"');
    s += circle(ox + 220, G - 6, 8, 1, 'bf') + circle(ox + 300, G - 6, 8, 1, 'bf');
    // airport tower and a plane leaving
    s += rect(ox + 620, G - 150, 26, 150) + path(`M${ox + 600} ${G - 150} h66 l-8 -30 h-50 Z`, 1, ' class="bf"');
    s += rect(ox + 680, G - 60, 200, 60) + line(ox + 680, G - 40, ox + 880, G - 40, 0.6);
    s += path(`M${ox + 420} 120 l60 -10 l30 -26 h10 l-14 30 l40 -6 l10 -12 h8 l-6 18 l-90 18 Z`, 1, ' class="bf"');
    for (let i = 0; i < 5; i += 1) s += line(ox + 300 - i * 30, 150 + i * 6, ox + 330 - i * 30, 146 + i * 6, 0.6, 0.6);
    return s;
  },
};

// far skyline: faint domes and spires behind everything (moves slower than the scene)
function farLayer(width, rnd) {
  let s = '';
  let x = 0;
  while (x < width) {
    const w = 40 + rnd() * 90;
    const h = 30 + rnd() * 70;
    if (rnd() > 0.65) s += path(`M${f(x)} ${G - 20} C${f(x)} ${f(G - 20 - h)} ${f(x + w / 2)} ${f(G - 40 - h * 1.3)} ${f(x + w / 2)} ${f(G - 40 - h * 1.3)} C${f(x + w / 2)} ${f(G - 40 - h * 1.3)} ${f(x + w)} ${f(G - 20 - h)} ${f(x + w)} ${G - 20}`, 0.6);
    else s += path(`M${f(x)} ${G - 20} V${f(G - 20 - h)} H${f(x + w)} V${G - 20}`, 0.6);
    x += w + 6 + rnd() * 20;
  }
  return s;
}

/** Build the panorama for the given stops. Returns { width, far, near } as SVG inner markup. */
export function buildPanorama(stops) {
  const width = stops.length * SW;
  const rnd = rng(23112026);
  let near = '';
  stops.forEach((stop, i) => {
    const ox = i * SW;
    const draw = SCENES[stop.scene];
    near += `<g data-scene="${stop.scene}">${water(ox, rnd)}${draw ? draw(ox, rnd) : ''}</g>`;
  });
  near += line(0, G, width, G, 1);
  let stars = '';
  for (let i = 0; i < stops.length * 14; i += 1) stars += star(rnd() * width, 14 + rnd() * 180, 1.5 + rnd() * 2.5);
  return { width, far: farLayer(width * 0.6 + SW * 2, rng(9)), near, stars };
}
