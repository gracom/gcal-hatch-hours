// Shared by content.js and options.js.
// Times are minutes from midnight (0-1440). A range whose end is not after
// its start runs past midnight into the next day.

const GSH_DEFAULTS = {
  mode: "daily", // "daily" | "weekly"
  daily: [{ start: 0, end: 7 * 60 }],
  // Index 0 = Sunday, matching Date.prototype.getDay().
  weekly: Array.from({ length: 7 }, () => [{ start: 0, end: 7 * 60 }]),
  color: "#7f7f7f",
  opacity: 0.25,
};

function gshLoadSettings() {
  return chrome.storage.sync.get(GSH_DEFAULTS);
}

function gshSaveSettings(settings) {
  return chrome.storage.sync.set(settings);
}

// Ranges set for a weekday, without the spill-over from the previous day.
function gshRangesFor(settings, weekday) {
  return settings.mode === "weekly" ? settings.weekly[weekday] || [] : settings.daily;
}

// Shaded [start, end) intervals that fall on the given weekday, including
// the part of the previous day's ranges that runs past midnight.
function gshIntervalsFor(settings, weekday) {
  const out = [];
  for (const r of gshRangesFor(settings, weekday)) {
    if (r.end > r.start) out.push([r.start, r.end]);
    else out.push([r.start, 1440]);
  }
  for (const r of gshRangesFor(settings, (weekday + 6) % 7)) {
    if (r.end <= r.start && r.end > 0) out.push([0, r.end]);
  }
  // Merge overlaps so that overlapping bands don't stack into a darker shade.
  out.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of out) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

function gshParseTime(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!m) return null;
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  return minutes <= 1440 ? minutes : null;
}

function gshFormatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}
