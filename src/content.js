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

function shadeColumn(col) {
  const weekday = weekdayFromDatekey(col.dataset.datekey);
  if (weekday === null) return;
  const intervals = gshIntervalsFor(settings, weekday);
  const signature = bandsSignature(intervals);

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
      band.style.background = settings.color;
      band.style.opacity = settings.opacity;
      return band;
    })
  );
}

function render() {
  scheduled = false;
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
