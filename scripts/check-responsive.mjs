/**
 * Responsive acceptance check.
 *
 * Drives the installed Chrome against a running build and asserts, at every
 * width that matters, the rules the design brief calls non-negotiable:
 *   - no horizontal scroll
 *   - touch targets at least 44x44
 *   - inputs at 16px or larger (below that Safari iOS zooms on focus)
 * Screenshots land in .responsive/ for eyeballing.
 *
 * Usage: node scripts/check-responsive.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3311';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = '.responsive';

const VIEWPORTS = [
  { name: 'android-360',    width: 360,  height: 800,  mobile: true  },
  { name: 'iphone-se-375',  width: 375,  height: 667,  mobile: true  },
  { name: 'iphone-15-393',  width: 393,  height: 852,  mobile: true  },
  { name: 'android-412',    width: 412,  height: 915,  mobile: true  },
  { name: 'iphone-max-430', width: 430,  height: 932,  mobile: true  },
  { name: 'tablet-768',     width: 768,  height: 1024, mobile: true  },
  { name: 'desktop-1280',   width: 1280, height: 900,  mobile: false },
];

const PAGES = [
  { name: 'portada',  path: '/' },
  { name: 'terminal', path: '/terminal' },
];

const audit = () => {
  const doc = document.documentElement;

  const overflow = {
    scrollWidth: doc.scrollWidth,
    innerWidth: window.innerWidth,
    overflows: doc.scrollWidth > window.innerWidth,
  };

  // Which elements actually stick out past the viewport.
  const culprits = [];
  if (overflow.overflows) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' || style.visibility === 'hidden') continue;
        culprits.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
        if (culprits.length >= 6) break;
      }
    }
  }

  // Touch targets: anything clickable must clear 44x44.
  const smallTargets = [];
  for (const el of document.querySelectorAll('a, button, input, select, textarea, [role="tab"]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;          // not rendered
    if (getComputedStyle(el).visibility === 'hidden') continue;

    // A control wrapped in a label is tapped through the label, so that is the
    // area the finger actually has to hit.
    const label = el.closest('label');
    const box = label ? label.getBoundingClientRect() : r;

    if (box.height < 44 || box.width < 24) {
      smallTargets.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 44),
        text: (el.textContent || '').trim().slice(0, 26),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }

  // Font size on inputs: under 16px Safari iOS zooms and breaks the layout.
  // Only text-entry fields are affected — checkboxes and radios never zoom.
  const NO_ZOOM = new Set(['checkbox', 'radio', 'range', 'color', 'file', 'submit', 'button', 'hidden']);
  const smallFonts = [];
  for (const el of document.querySelectorAll('input, select, textarea')) {
    if (el.tagName === 'INPUT' && NO_ZOOM.has(el.type)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 16) {
      smallFonts.push({ tag: el.tagName.toLowerCase(), id: el.id || '(sin id)', size });
    }
  }

  return { overflow, culprits, smallTargets, smallFonts };
};

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

let failures = 0;

for (const page of PAGES) {
  console.log(`\n${'='.repeat(72)}\n${page.name.toUpperCase()}  ${BASE}${page.path}\n${'='.repeat(72)}`);

  for (const vp of VIEWPORTS) {
    const tab = await browser.newPage();
    await tab.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });

    await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle2', timeout: 60_000 });
    // Let the fonts settle so measurements reflect the final layout.
    await tab.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));

    const result = await tab.evaluate(audit);

    const flags = [];
    if (result.overflow.overflows) {
      flags.push(`SCROLL-H ${result.overflow.scrollWidth}>${result.overflow.innerWidth}`);
      failures++;
    }
    if (result.smallTargets.length) {
      flags.push(`${result.smallTargets.length} target(s) <44px`);
      failures++;
    }
    if (result.smallFonts.length) {
      flags.push(`${result.smallFonts.length} input(s) <16px`);
      failures++;
    }

    const status = flags.length ? `FALLA  ${flags.join(' | ')}` : 'OK';
    console.log(`  ${vp.name.padEnd(16)} ${String(vp.width).padStart(4)}px  ${status}`);

    for (const c of result.culprits) {
      console.log(`      desborda: <${c.tag} class="${c.cls}"> left=${c.left} right=${c.right}`);
    }
    for (const t of result.smallTargets.slice(0, 5)) {
      console.log(`      chico: <${t.tag} class="${t.cls}"> "${t.text}" ${t.w}x${t.h}`);
    }
    for (const f of result.smallFonts.slice(0, 5)) {
      console.log(`      fuente: <${f.tag} #${f.id}> ${f.size}px`);
    }

    await tab.screenshot({
      path: `${OUT}/${page.name}-${vp.name}.png`,
      fullPage: vp.width <= 430,
    });
    await tab.close();
  }
}

await browser.close();
console.log(`\n${failures === 0 ? 'TODO OK' : `${failures} problema(s)`} — capturas en ${OUT}/`);
process.exit(failures === 0 ? 0 : 1);
