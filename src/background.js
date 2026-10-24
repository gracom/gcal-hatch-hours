chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Chrome injects content scripts only into pages loaded after the extension
// is installed or updated, so calendar tabs that are already open would stay
// unshaded until reloaded. Inject into them directly instead.
chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: "https://calendar.google.com/*" });
  for (const tab of tabs) {
    const target = { tabId: tab.id };
    try {
      await chrome.scripting.insertCSS({ target, files: ["content.css"] });
      await chrome.scripting.executeScript({ target, files: ["settings.js", "content.js"] });
    } catch {
      // The tab may be discarded or still loading; it gets the content script on its next load.
    }
  }
});
