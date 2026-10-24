// Draws shaded bands over the day columns of Google Calendar's time grid.
//
// Google Calendar's class names are obfuscated and change between releases,
// so this relies only on ARIA roles and the data-datekey attribute, and works
// out each band's position as a fraction of the column's 24-hour height.

let settings = null;
let scheduled = false;

// data-datekey packs a date as ((year - 1970) << 9) | (month << 5) | day.
function weekdayFromDatekey(key) {
  const n = Number(key);
  if (!Number.isFinite(n)) return null;
  const day = n & 31;
  const month = (n >> 5) & 15;
  const year = (n >> 9) + 1970;
  return new Date(year, month - 1, day).getDay();
}

// Day columns of the time grid. All-day cells also carry data-datekey but
// are short, so only columns tall enough to hold 24 hours are kept.
function timeGridColumns() {
  return [...document.querySelectorAll('[role="gridcell"][data-datekey]')].filter(
    (el) => el.offsetHeight > 300
  );
}

function bandsSignature(intervals) {
  return `${settings.color}|${settings.opacity}|${intervals.map((i) => i.join("-")).join(",")}`;
}

// Size in px of one repeat of the diagonal-stripe tile.
const HATCH_TILE = 12;

function styleBand(band, col, start) {
  const { color, opacity } = settings;
  band.style.opacity = opacity;
  if (settings.pattern === "solid") {
    band.style.background = color;
    return;
  }
  // A light fill under darker stripes. The tile is offset by the band's
  // position in the grid so that stripes line up across days and bands.
  const x = col.offsetLeft;
  const y = Math.round((col.offsetHeight * start) / 1440);
  band.style.backgroundColor = `color-mix(in srgb, ${color} 35%, transparent)`;
  band.style.backgroundImage = `linear-gradient(135deg, ${color} 25%, transparent 25%, transparent 50%, ${color} 50%, ${color} 75%, transparent 75%)`;
  band.style.backgroundSize = `${HATCH_TILE}px ${HATCH_TILE}px`;
  band.style.backgroundPosition = `${-x}px ${-y}px`;
}

function shadeColumn(col) {
  const weekday = weekdayFromDatekey(col.dataset.datekey);
  if (weekday === null) return;
  const intervals = gshIntervalsFor(settings, weekday);
  // Geometry is part of the signature because the hatch offset depends on it.
  const signature = `${bandsSignature(intervals)}|${settings.pattern}|${col.offsetLeft}x${col.offsetHeight}`;

  let layer = col.querySelector(":scope > .gsh-layer");
  if (layer && layer.dataset.signature === signature) return;
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "gsh-layer";
    // First child so that events, which come later in the DOM, paint over it.
    col.prepend(layer);
    if (getComputedStyle(col).position === "static") col.style.position = "relative";
  }
  layer.dataset.signature = signature;

  layer.replaceChildren(
    ...intervals.map(([start, end]) => {
      const band = document.createElement("div");
      band.className = "gsh-band";
      band.style.top = `${(start / 1440) * 100}%`;
      band.style.height = `${((end - start) / 1440) * 100}%`;
      styleBand(band, col, start);
      return band;
    })
  );
}

function render() {
  scheduled = false;
  // After the extension is reloaded or updated, the copy of this script left
  // in an open tab is orphaned; stop it so it doesn't fight the new copy.
  if (!chrome.runtime?.id) {
    observer.disconnect();
    window.removeEventListener("resize", scheduleRender);
    return;
  }
  if (!settings) return;
  for (const col of timeGridColumns()) shadeColumn(col);
}

function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(render);
}

// Calendar re-renders the grid on navigation and view changes, dropping our
// layers. Mutations caused by our own layers are ignored to avoid a loop.
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    const target = m.target instanceof Element ? m.target : m.target.parentElement;
    if (target && target.closest(".gsh-layer")) continue;
    const ours = [...m.addedNodes, ...m.removedNodes].every(
      (n) => n instanceof Element && n.classList.contains("gsh-layer")
    );
    if (ours && (m.addedNodes.length || m.removedNodes.length)) continue;
    scheduleRender();
    return;
  }
});

// Column widths change with the window, which moves the hatch offsets.
window.addEventListener("resize", scheduleRender);

chrome.storage.onChanged.addListener(async (_changes, area) => {
  if (area !== "sync") return;
  settings = await gshLoadSettings();
  scheduleRender();
});

(async () => {
  settings = await gshLoadSettings();
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleRender();
})();
