// Z Downloader - Background Service Worker (Manifest V3)
// IDM-Style Download Interceptor & Media Bridge

const Z_BRIDGE_PORTS = [9777, 9666];

// Setup context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "download-with-zdownloader",
      title: "Download with Z Downloader ⚡",
      contexts: ["all"],
    });
  });

  // Default settings
  chrome.storage.local.get(["idmInterception", "magnetInterception"], (data) => {
    if (data.idmInterception === undefined) {
      chrome.storage.local.set({ idmInterception: true });
    }
    if (data.magnetInterception === undefined) {
      chrome.storage.local.set({ magnetInterception: true });
    }
  });
});

// Context Menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "download-with-zdownloader") {
    let candidateUrl = "";

    // 1. Try detected media element from content script
    if (tab && tab.id) {
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, {
          action: "GET_LAST_CLICKED_MEDIA",
        });
        if (resp && resp.url) {
          candidateUrl = resp.url;
        }
      } catch (e) {
        // Content script might not be active on chrome:// or protected page
      }
    }

    const isClean = (u) =>
      u &&
      typeof u === "string" &&
      !u.startsWith("blob:") &&
      !u.startsWith("data:") &&
      (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("magnet:"));

    if (!isClean(candidateUrl)) {
      if (isClean(info.linkUrl)) {
        candidateUrl = info.linkUrl;
      } else if (isClean(info.srcUrl)) {
        candidateUrl = info.srcUrl;
      } else if (info.selectionText && isClean(info.selectionText.trim())) {
        candidateUrl = info.selectionText.trim();
      } else if (isClean(info.pageUrl)) {
        candidateUrl = info.pageUrl;
      } else if (tab && isClean(tab.url)) {
        candidateUrl = tab.url;
      }
    }

    if (!isClean(candidateUrl)) {
      if (tab && isClean(tab.url)) {
        candidateUrl = tab.url;
      } else {
        return;
      }
    }

    await sendUrlToZDownloader(candidateUrl, tab ? tab.id : null);
  }
});

// ---------------------------------------------------------------------------
// IDM-Style Automatic Browser Download Interceptor
// ---------------------------------------------------------------------------

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  chrome.storage.local.get(["idmInterception"], async (data) => {
    const isInterceptionEnabled = data.idmInterception !== false;

    // Filter out extensions, data, blob, or internal browser items
    const url = item.url || "";
    const isDirectDownload =
      url.startsWith("http://") || url.startsWith("https://");

    if (isInterceptionEnabled && isDirectDownload) {
      // Cancel native browser download
      chrome.downloads.cancel(item.id, () => {
        chrome.downloads.erase({ id: item.id }, () => {});
      });

      // Send to Z Downloader
      await sendUrlToZDownloader(url, null);

      // Show native notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Z Downloader ⚡ [IDM INTERCEPTOR]",
        message: `Intercepted: ${item.filename || "Direct File"} -> Sent to Z Downloader`,
        priority: 1,
      });
    } else {
      suggest();
    }
  });
  return true;
});

// ---------------------------------------------------------------------------
// Bridge Sender: Local Port HTTP Bridge + Windows Protocol Fallback
// ---------------------------------------------------------------------------

async function sendUrlToZDownloader(mediaUrl, tabId) {
  let cleanUrl = (mediaUrl || "").trim();
  if (!cleanUrl) return;

  let effectiveTabId = tabId;
  if (!effectiveTabId) {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.id) {
        effectiveTabId = activeTab.id;
      }
    } catch {}
  }

  if (effectiveTabId) {
    try {
      await chrome.tabs.sendMessage(effectiveTabId, {
        action: "SHOW_TOAST",
        title: "Z Downloader ⚡",
        message: "Sending link to Z Downloader...",
        status: "info",
      });
    } catch {}
  }

  // 1. Try sending via local HTTP bridge (try 9777, then 9666)
  for (const port of Z_BRIDGE_PORTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const resp = await fetch(
        `http://127.0.0.1:${port}/open?url=${encodeURIComponent(cleanUrl)}`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (resp.ok) {
        if (effectiveTabId) {
          try {
            await chrome.tabs.sendMessage(effectiveTabId, {
              action: "SHOW_TOAST",
              title: "Z Downloader ⚡",
              message: "Link intercepted & sent to Z Downloader!",
              status: "success",
            });
          } catch {}
        }
        return { success: true, method: "bridge" };
      }
    } catch (err) {
      // Continue to next port or protocol
    }
  }

  // 2. Protocol fallback: zdownloader://
  const protocolUrl = `zdownloader://open?url=${encodeURIComponent(cleanUrl)}`;

  if (effectiveTabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: effectiveTabId },
        func: (proto, raw) => {
          navigator.clipboard.writeText(raw).catch(() => {});
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = proto;
          document.body.appendChild(iframe);
          setTimeout(() => iframe.remove(), 2000);
        },
        args: [protocolUrl, cleanUrl],
      });

      await chrome.tabs.sendMessage(effectiveTabId, {
        action: "SHOW_TOAST",
        title: "Z Downloader ⚡",
        message: "Launched Z Downloader via Windows Protocol!",
        status: "success",
      });
      return { success: true, method: "protocol" };
    } catch (e) {
      // Final fallback
    }
  }

  return { success: false };
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "DOWNLOAD_URL") {
    sendUrlToZDownloader(req.url, sender.tab ? sender.tab.id : null).then(
      (res) => sendResponse(res)
    );
    return true;
  }
  if (req.action === "CHECK_BRIDGE") {
    (async () => {
      for (const port of Z_BRIDGE_PORTS) {
        try {
          const r = await fetch(`http://127.0.0.1:${port}/ping`, {
            signal: AbortSignal.timeout(600),
          });
          if (r.ok) {
            const data = await r.json();
            sendResponse({ connected: true, port, app: data.app });
            return;
          }
        } catch {}
      }
      sendResponse({ connected: false });
    })();
    return true;
  }
});
