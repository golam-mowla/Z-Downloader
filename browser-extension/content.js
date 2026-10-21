// Download with Parrot - Intelligent Media Link Grabber (content.js)
(() => {
  let lastRightClickedElement = null;
  let lastDetectedMediaUrl = null;

  function isValidDownloadUrl(url) {
    if (!url || typeof url !== "string") return false;
    const clean = url.trim();
    if (
      clean.startsWith("blob:") ||
      clean.startsWith("data:") ||
      clean.startsWith("javascript:")
    ) {
      return false;
    }
    return clean.startsWith("http://") || clean.startsWith("https://");
  }

  // Listen to right-click / contextmenu events
  document.addEventListener(
    "contextmenu",
    (e) => {
      lastRightClickedElement = e.target;
      lastDetectedMediaUrl = extractMediaUrl(e.target);
    },
    true
  );

  document.addEventListener(
    "mousedown",
    (e) => {
      if (e.button === 2) {
        lastRightClickedElement = e.target;
        lastDetectedMediaUrl = extractMediaUrl(e.target);
      }
    },
    true
  );

  function extractMediaUrl(element) {
    if (!element) return window.location.href;

    const hostname = window.location.hostname;

    // 1. INSTAGRAM DETECTION
    if (hostname.includes("instagram.com")) {
      const path = window.location.pathname;
      if (
        path.startsWith("/reel/") ||
        path.startsWith("/p/") ||
        path.startsWith("/tv/")
      ) {
        return `${window.location.origin}${path}`;
      }

      // Check feed article or reel card
      const article =
        element.closest("article") ||
        element.closest('div[role="dialog"]') ||
        element.closest("div._aagv") ||
        element.closest("div._ab8w");

      if (article) {
        const link = article.querySelector(
          'a[href*="/reel/"], a[href*="/p/"], a[href*="/tv/"]'
        );
        if (link && link.getAttribute("href")) {
          return new URL(link.getAttribute("href"), window.location.origin).href;
        }

        const timeEl = article.querySelector("time");
        if (timeEl) {
          const timeLink = timeEl.closest("a");
          if (timeLink && timeLink.getAttribute("href")) {
            return new URL(timeLink.getAttribute("href"), window.location.origin).href;
          }
        }
      }

      const nearestAnchor = element.closest("a");
      if (nearestAnchor && nearestAnchor.getAttribute("href")) {
        const href = nearestAnchor.getAttribute("href");
        if (
          href.includes("/p/") ||
          href.includes("/reel/") ||
          href.includes("/tv/")
        ) {
          return new URL(href, window.location.origin).href;
        }
      }

      return window.location.href;
    }

    // 2. YOUTUBE DETECTION (Never use blob or video element src on YouTube)
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      if (hostname.includes("youtu.be")) {
        return window.location.href;
      }
      if (
        window.location.pathname.startsWith("/watch") ||
        window.location.pathname.startsWith("/shorts/")
      ) {
        return window.location.href;
      }

      // Thumbnail or card on feed/search
      const card = element.closest(
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-reel-video-renderer, ytd-rich-grid-media"
      );
      if (card) {
        const titleAnchor = card.querySelector(
          "a#video-title, a#thumbnail, a.ytd-thumbnail, a[href*='/watch'], a[href*='/shorts/']"
        );
        if (titleAnchor && titleAnchor.getAttribute("href")) {
          return new URL(titleAnchor.getAttribute("href"), "https://www.youtube.com").href;
        }
      }

      const ytAnchor = element.closest("a#thumbnail, a#video-title, a[href*='/watch'], a[href*='/shorts/']");
      if (ytAnchor && ytAnchor.getAttribute("href")) {
        return new URL(ytAnchor.getAttribute("href"), "https://www.youtube.com").href;
      }

      return window.location.href;
    }

    // 3. FACEBOOK DETECTION
    if (hostname.includes("facebook.com")) {
      const fbAnchor = element.closest(
        'a[href*="/videos/"], a[href*="/reel/"], a[href*="/watch/"], a[href*="fb.watch"]'
      );
      if (fbAnchor && fbAnchor.getAttribute("href")) {
        return new URL(fbAnchor.getAttribute("href"), window.location.origin).href;
      }

      const fbArticle = element.closest('[role="article"]');
      if (fbArticle) {
        const vidLink = fbArticle.querySelector(
          'a[href*="/videos/"], a[href*="/reel/"], a[href*="/watch/"]'
        );
        if (vidLink && vidLink.getAttribute("href")) {
          return new URL(vidLink.getAttribute("href"), window.location.origin).href;
        }
      }

      return window.location.href;
    }

    // 4. TIKTOK DETECTION
    if (hostname.includes("tiktok.com")) {
      if (window.location.pathname.includes("/video/")) {
        return window.location.href;
      }
      const ttAnchor = element.closest('a[href*="/video/"]');
      if (ttAnchor && ttAnchor.getAttribute("href")) {
        return new URL(ttAnchor.getAttribute("href"), window.location.origin).href;
      }
      return window.location.href;
    }

    // 5. TWITTER / X DETECTION
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      const tweetArticle = element.closest("article");
      if (tweetArticle) {
        const statusLink = tweetArticle.querySelector('a[href*="/status/"]');
        if (statusLink && statusLink.getAttribute("href")) {
          return new URL(statusLink.getAttribute("href"), window.location.origin).href;
        }
      }
      return window.location.href;
    }

    // 6. DIRECT HTML5 VIDEO OR AUDIO TAG (strictly NO blobs!)
    const video =
      element.tagName === "VIDEO"
        ? element
        : element.querySelector("video") || element.closest("video");
    if (video) {
      if (isValidDownloadUrl(video.src)) return video.src;
      if (isValidDownloadUrl(video.currentSrc)) return video.currentSrc;
      const source = video.querySelector("source");
      if (source && isValidDownloadUrl(source.src)) return source.src;
    }

    // 7. NEAREST HYPERLINK
    const anchor = element.closest("a[href]");
    if (anchor && isValidDownloadUrl(anchor.href)) {
      return anchor.href;
    }

    // 8. FALLBACK TO CURRENT TAB URL
    return window.location.href;
  }

  // Handle messages from background worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_LAST_CLICKED_MEDIA") {
      let resolved = lastDetectedMediaUrl;
      if (!isValidDownloadUrl(resolved) && lastRightClickedElement) {
        resolved = extractMediaUrl(lastRightClickedElement);
      }
      if (!isValidDownloadUrl(resolved)) {
        resolved = window.location.href;
      }
      sendResponse({ url: resolved, pageUrl: window.location.href });
      return true;
    }

    if (request.action === "SHOW_TOAST") {
      showZToast(
        request.title || "Z Downloader ⚡",
        request.message,
        request.status || "info"
      );
      sendResponse({ shown: true });
      return true;
    }
  });

  // Floating Cyberpunk Toast Notification
  function showZToast(title, message, status) {
    const existing = document.getElementById("z-floating-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "z-floating-toast";

    let borderCol = "#00f0ff";
    let glowCol = "rgba(0, 240, 255, 0.4)";
    let iconEmoji = "⚡";

    if (status === "success") {
      borderCol = "#00ff66";
      glowCol = "rgba(0, 255, 102, 0.4)";
      iconEmoji = "✔";
    } else if (status === "warning" || status === "error") {
      borderCol = "#ff007f";
      glowCol = "rgba(255, 0, 127, 0.4)";
      iconEmoji = "⚠";
    }

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px",
      borderRadius: "10px",
      background: "rgba(5, 7, 14, 0.95)",
      border: `1.5px solid ${borderCol}`,
      color: "#f8fafc",
      fontFamily:
        "'JetBrains Mono', Consolas, -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace",
      fontSize: "12px",
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 16px ${glowCol}`,
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      opacity: "0",
      transform: "translateY(20px) scale(0.95)",
      pointerEvents: "none",
    });

    toast.innerHTML = `
      <div style="font-size: 20px; line-height: 1;">${iconEmoji}</div>
      <div style="display: flex; flex-direction: column;">
        <span style="font-weight: 800; font-size: 12px; color: ${borderCol}; letter-spacing: 0.05em;">${title}</span>
        <span style="font-size: 11px; opacity: 0.9; margin-top: 2px;">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0) scale(1)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(15px) scale(0.95)";
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  // -------------------------------------------------------------------------
  // IDM-Style Floating Video Grabber Button
  // -------------------------------------------------------------------------
  let activeGrabber = null;

  function injectVideoGrabber(video) {
    if (!video || activeGrabber) return;

    const rect = video.getBoundingClientRect();
    if (rect.width < 160 || rect.height < 100) return;

    const grabber = document.createElement("div");
    grabber.id = "z-video-grabber-btn";
    Object.assign(grabber.style, {
      position: "fixed",
      top: `${Math.max(10, rect.top + 12)}px`,
      right: `${Math.max(10, window.innerWidth - rect.right + 14)}px`,
      zIndex: "2147483640",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "6px",
      background: "rgba(5, 7, 14, 0.92)",
      border: "1.5px solid #00f0ff",
      color: "#00f0ff",
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      fontSize: "11px",
      fontWeight: "800",
      letterSpacing: "0.04em",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 240, 255, 0.5)",
      transition: "all 0.2s ease",
      backdropFilter: "blur(6px)",
    });

    grabber.innerHTML = `<span>⚡</span><span>Download with Z Downloader</span>`;

    grabber.addEventListener("mouseenter", () => {
      grabber.style.transform = "scale(1.05)";
      grabber.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.9), 0 0 18px rgba(0, 240, 255, 0.8)";
    });

    grabber.addEventListener("mouseleave", () => {
      grabber.style.transform = "scale(1)";
    });

    grabber.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const mediaUrl = extractMediaUrl(video);
      chrome.runtime.sendMessage({ action: "DOWNLOAD_URL", url: mediaUrl });
      grabber.remove();
      activeGrabber = null;
    });

    document.body.appendChild(grabber);
    activeGrabber = grabber;

    const removeCheck = () => {
      if (activeGrabber) {
        activeGrabber.remove();
        activeGrabber = null;
      }
    };

    video.addEventListener("mouseleave", (e) => {
      setTimeout(() => {
        if (activeGrabber && !activeGrabber.matches(":hover")) {
          removeCheck();
        }
      }, 800);
    });
  }

  document.addEventListener(
    "mouseover",
    (e) => {
      const vid = e.target.tagName === "VIDEO" ? e.target : e.target.closest("video");
      if (vid) {
        injectVideoGrabber(vid);
      }
    },
    true
  );
})();
