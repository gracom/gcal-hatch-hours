const msg = (key) => chrome.i18n.getMessage(key) || key;

for (const el of document.querySelectorAll("[data-i18n]")) {
  el.textContent = msg(el.dataset.i18n);
}
for (const el of document.querySelectorAll("[data-i18n-title]")) {
  el.title = msg(el.dataset.i18nTitle);
}

// Weekday order shown to the user: Monday first. Values are getDay() indices.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

let settings;
let saveTimer;

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const status = document.getElementById("status");
    try {
      await gshSaveSettings(settings);
      status.textContent = msg("saved");
      setTimeout(() => (status.textContent = ""), 1500);
    } catch (e) {
      // Most likely the chrome.storage.sync per-item quota.
      status.textContent = `${msg("saveFailed")} (${e.message})`;
    }
  }, 300);
}

// Renders an editable list of ranges into `container`. `ranges` is mutated in place.
function renderRanges(container, ranges) {
  container.replaceChildren();
  const template = document.getElementById("range-row");

  ranges.forEach((range, i) => {
    const row = template.content.firstElementChild.cloneNode(true);
    const start = row.querySelector(".start");
    const end = row.querySelector(".end");
    start.value = gshFormatTime(range.start % 1440);
    end.value = gshFormatTime(range.end % 1440);

    const update = () => {
      const s = gshParseTime(start.value);
      const e = gshParseTime(end.value);
      if (s === null || e === null) return;
      range.start = s;
      // 00:00 as an end means midnight at the end of the day.
      range.end = e === 0 ? 1440 : e;
      scheduleSave();
    };
    start.addEventListener("change", update);
    end.addEventListener("change", update);

    const remove = row.querySelector(".remove");
    remove.title = msg("removeRange");
    remove.addEventListener("click", () => {
      ranges.splice(i, 1);
      renderRanges(container, ranges);
      scheduleSave();
    });
    container.append(row);
  });

  const actions = document.createElement("div");
  actions.className = "actions";
  const add = document.createElement("button");
  add.type = "button";
  add.textContent = msg("addRange");
  add.addEventListener("click", () => {
    ranges.push({ start: 22 * 60, end: 1440 });
    renderRanges(container, ranges);
    scheduleSave();
  });
  actions.append(add);
  container.append(actions);
  return actions;
}

function renderWeekly() {
  const root = document.getElementById("weekly");
  root.replaceChildren();
  for (const day of WEEK_ORDER) {
    const box = document.createElement("div");
    box.className = "day";
    const name = document.createElement("p");
    name.className = "day-name";
    name.textContent = msg(DAY_KEYS[day]);
    const list = document.createElement("div");
    box.append(name, list);
    root.append(box);

    const actions = renderRanges(list, settings.weekly[day]);
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = msg("copyToAll");
    copy.addEventListener("click", () => {
      const src = settings.weekly[day];
      settings.weekly = settings.weekly.map(() => src.map((r) => ({ ...r })));
      renderWeekly();
      scheduleSave();
    });
    actions.append(copy);
  }
}

function renderMode() {
  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.checked = radio.value === settings.mode;
  }
  document.getElementById("daily-section").hidden = settings.mode !== "daily";
  document.getElementById("weekly-section").hidden = settings.mode !== "weekly";
}

async function init() {
  settings = await gshLoadSettings();

  renderMode();
  renderRanges(document.getElementById("daily"), settings.daily);
  renderWeekly();

  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener("change", () => {
      settings.mode = radio.value;
      renderMode();
      scheduleSave();
    });
  }

  for (const radio of document.querySelectorAll('input[name="pattern"]')) {
    radio.checked = radio.value === settings.pattern;
    radio.addEventListener("change", () => {
      settings.pattern = radio.value;
      scheduleSave();
    });
  }

  const color = document.getElementById("color");
  color.value = settings.color;
  color.addEventListener("input", () => {
    settings.color = color.value;
    scheduleSave();
  });

  const opacity = document.getElementById("opacity");
  const opacityValue = document.getElementById("opacity-value");
  opacity.value = settings.opacity;
  opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
  opacity.addEventListener("input", () => {
    settings.opacity = Number(opacity.value);
    opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
    scheduleSave();
  });
}

init();
