// Z Downloader - Popup Script

document.addEventListener("DOMContentLoaded", async () => {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const currentUrlBox = document.getElementById("current-url");
  const btnDownloadCurrent = document.getElementById("btn-download-current");
  const customUrlInput = document.getElementById("custom-url-input");
  const btnDownloadCustom = document.getElementById("btn-download-custom");
  const toggleIdm = document.getElementById("toggle-idm");
  const toggleTorrent = document.getElementById("toggle-torrent");
  const modeBadge = document.getElementById("mode-badge");

  let activeTabUrl = "";

  // Load toggle settings
  chrome.storage.local.get(["idmInterception", "magnetInterception"], (data) => {
    toggleIdm.checked = data.idmInterception !== false;
    toggleTorrent.checked = data.magnetInterception !== false;
    updateModeBadge();
  });

  toggleIdm.addEventListener("change", () => {
    chrome.storage.local.set({ idmInterception: toggleIdm.checked });
    updateModeBadge();
  });

  toggleTorrent.addEventListener("change", () => {
    chrome.storage.local.set({ magnetInterception: toggleTorrent.checked });
  });

  function updateModeBadge() {
    if (toggleIdm.checked) {
      modeBadge.textContent = "IDM // ACTIVE";
      modeBadge.style.color = "#00ff66";
      modeBadge.style.borderColor = "rgba(0, 255, 102, 0.4)";
    } else {
      modeBadge.textContent = "IDM // PAUSED";
      modeBadge.style.color = "#94a3b8";
      modeBadge.style.borderColor = "rgba(148, 163, 184, 0.3)";
    }
  }

  // Check Local Bridge Connection
  chrome.runtime.sendMessage({ action: "CHECK_BRIDGE" }, (res) => {
    if (res && res.connected) {
      statusDot.className = "status-dot online";
      statusText.textContent = `SYSTEM ONLINE (PORT ${res.port})`;
      statusText.style.color = "#00ff66";
    } else {
      statusDot.className = "status-dot";
      statusText.textContent = "STANDBY // PROTOCOL READY";
      statusText.style.color = "#ffe600";
    }
  });

  // Get active tab URL or media element
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      activeTabUrl = tab.url;
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, {
          action: "GET_LAST_CLICKED_MEDIA",
        });
        if (resp && resp.url) {
          activeTabUrl = resp.url;
        }
      } catch (e) {
        // use tab.url
      }
      currentUrlBox.textContent = activeTabUrl;
    } else {
      currentUrlBox.textContent = "No active web page detected";
    }
  } catch (err) {
    currentUrlBox.textContent = "Unable to read current page";
  }

  // Download Current
  btnDownloadCurrent.addEventListener("click", () => {
    if (!activeTabUrl) return;
    btnDownloadCurrent.textContent = "INJECTING TARGET...";
    chrome.runtime.sendMessage(
      { action: "DOWNLOAD_URL", url: activeTabUrl },
      (res) => {
        btnDownloadCurrent.textContent = "TARGET SENT ⚡";
        setTimeout(() => {
          window.close();
        }, 600);
      }
    );
  });

  // Download Custom
  btnDownloadCustom.addEventListener("click", () => {
    const val = customUrlInput.value.trim();
    if (!val) return;
    btnDownloadCustom.textContent = "...";
    chrome.runtime.sendMessage(
      { action: "DOWNLOAD_URL", url: val },
      (res) => {
        btnDownloadCustom.textContent = "SENT ⚡";
        setTimeout(() => {
          window.close();
        }, 600);
      }
    );
  });

  customUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnDownloadCustom.click();
    }
  });
});
