(function installGaietyTrackingBridge() {
  "use strict";

  const bootstrapParams = new URLSearchParams(window.location.search);
  if (
    bootstrapParams.get("ct_tracker_preview") === "1" ||
    bootstrapParams.get("ct_rich_telemetry") === "1"
  ) {
    if (window.__gaietyRichPreviewLoading) return;
    window.__gaietyRichPreviewLoading = true;
    const richScript = document.createElement("script");
    richScript.src = "tracking-rich-preview.js?v=iteration-12-1";
    richScript.async = false;
    document.head.appendChild(richScript);
    return;
  }

  if (window.__gaietyTrackingBridgeInstalled) return;
  window.__gaietyTrackingBridgeInstalled = true;

  const params = new URLSearchParams(window.location.search);
  const usePreviewTracker = params.get("ct_tracker_preview") === "1";
  const trackerSource = usePreviewTracker
    ? "https://analise-de-dados-fbads-git-agent-iter-2df228-otavioays-projects.vercel.app/tracker.js"
    : "https://analise-de-dados-fbads.vercel.app/tracker.js";

  const V2_ATTRIBUTION_KEY = "fbads_conversion_tracker_session_attribution_v2";
  const LEGACY_ATTRIBUTION_KEY = "fbads_conversion_tracker_session_attribution";
  const IMPRESSION_STORAGE_KEY = "gaiety_cta_impressions_v1";

  let trackerWrapper = null;

  function parseJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  function readStorage(storage, key) {
    try {
      return storage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorage(storage, key, value) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function syncAttributionToLegacyStorage() {
    const stored = parseJson(readStorage(window.localStorage, V2_ATTRIBUTION_KEY));
    const attribution = stored && stored.attribution;
    if (!attribution || typeof attribution !== "object" || Array.isArray(attribution)) {
      return false;
    }

    return writeStorage(
      window.sessionStorage,
      LEGACY_ATTRIBUTION_KEY,
      JSON.stringify(attribution),
    );
  }

  function readVisitorId(tracker) {
    if (!tracker) return null;
    if (typeof tracker.getVisitorId === "function") return tracker.getVisitorId();
    return tracker.visitorId || null;
  }

  function readSessionId(tracker) {
    if (!tracker) return null;
    if (typeof tracker.getSessionId === "function") return tracker.getSessionId();
    return tracker.sessionId || null;
  }

  function wrapTracker(tracker) {
    if (!tracker) return null;
    if (tracker.__gaietyCompatibleTracker) return tracker;

    const wrapper = {
      __gaietyCompatibleTracker: true,
      __rawTracker: tracker,
      track(eventName, properties) {
        syncAttributionToLegacyStorage();
        return tracker.track(eventName, properties);
      },
      getVisitorId() {
        return readVisitorId(tracker);
      },
      getSessionId() {
        return readSessionId(tracker);
      },
      forceNewSession:
        typeof tracker.forceNewSession === "function"
          ? tracker.forceNewSession.bind(tracker)
          : undefined,
      setInternalTraffic:
        typeof tracker.setInternalTraffic === "function"
          ? tracker.setInternalTraffic.bind(tracker)
          : undefined,
      isInternalTraffic:
        typeof tracker.isInternalTraffic === "function"
          ? tracker.isInternalTraffic.bind(tracker)
          : () => false,
      endpoint: tracker.endpoint,
    };

    Object.defineProperties(wrapper, {
      visitorId: {
        enumerable: true,
        get() {
          return readVisitorId(tracker);
        },
      },
      sessionId: {
        enumerable: true,
        get() {
          return readSessionId(tracker);
        },
      },
    });

    return Object.freeze(wrapper);
  }

  try {
    Object.defineProperty(window, "ConversionTracker", {
      configurable: true,
      enumerable: true,
      get() {
        return trackerWrapper;
      },
      set(value) {
        trackerWrapper = wrapTracker(value);
        window.setTimeout(syncAttributionToLegacyStorage, 0);
        window.setTimeout(syncAttributionToLegacyStorage, 150);
        window.setTimeout(syncAttributionToLegacyStorage, 600);
      },
    });
  } catch (_error) {
    trackerWrapper = wrapTracker(window.ConversionTracker || null);
  }

  function loadSelectedTracker() {
    if (trackerWrapper) return Promise.resolve(trackerWrapper);

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = trackerSource;
      script.async = true;
      script.dataset.debug = "false";
      script.dataset.sessionTimeoutMinutes = "30";

      let attempts = 0;
      const finishWhenReady = () => {
        if (trackerWrapper) {
          resolve(trackerWrapper);
          return;
        }
        attempts += 1;
        if (attempts >= 60) {
          resolve(null);
          return;
        }
        window.setTimeout(finishWhenReady, 50);
      };

      script.addEventListener("load", finishWhenReady, { once: true });
      script.addEventListener("error", () => resolve(null), { once: true });
      document.head.appendChild(script);
    });
  }

  window.__gaietyConversionTrackerPromise = loadSelectedTracker();

  function placementFor(link) {
    if (link.classList.contains("header-buy")) return "header";
    if (link.classList.contains("hero-buy-primary")) return "hero";
    if (link.classList.contains("buy-button")) return "offer";
    if (link.closest(".mobile-buy")) return "mobile_sticky";
    if (link.classList.contains("desktop-buy-dock")) return "desktop_dock";
    if (link.closest(".menu-panel")) return "menu";
    return "unknown";
  }

  function isCheckoutLink(link) {
    if (!(link instanceof HTMLAnchorElement)) return false;
    try {
      const url = new URL(link.href, window.location.href);
      return (
        url.hostname === "gaiety-6507.myshopify.com" &&
        url.pathname.startsWith("/cart/64213500100977:1")
      );
    } catch (_error) {
      return false;
    }
  }

  function impressionKey(tracker, placement) {
    return [
      readSessionId(tracker) || "unknown-session",
      window.location.pathname,
      placement,
    ].join(":");
  }

  function readSentImpressions() {
    const parsed = parseJson(readStorage(window.sessionStorage, IMPRESSION_STORAGE_KEY));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  }

  function writeSentImpressions(value) {
    writeStorage(window.sessionStorage, IMPRESSION_STORAGE_KEY, JSON.stringify(value));
  }

  function installCtaImpressions(tracker) {
    if (!tracker || typeof tracker.track !== "function") return;

    const links = Array.from(document.querySelectorAll("a")).filter(isCheckoutLink);
    if (links.length === 0) return;

    const sent = readSentImpressions();

    const sendImpression = (link) => {
      const placement = placementFor(link);
      const key = impressionKey(tracker, placement);
      if (sent[key]) return;

      sent[key] = new Date().toISOString();
      writeSentImpressions(sent);

      tracker.track("cta_impression", {
        product_id: "gaiety-classic",
        variant_id: "64213500100977",
        product_name: "GAIETY Classic",
        price: 169,
        currency: "BRL",
        placement,
        element_text: (link.textContent || "").trim().slice(0, 200) || null,
        integration_version: "gaiety-bridge-v1",
        tracker_channel: usePreviewTracker ? "preview" : "production",
      });
    };

    if (!("IntersectionObserver" in window)) {
      links.forEach(sendImpression);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          sendImpression(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: [0.5] },
    );

    links.forEach((link) => observer.observe(link));
  }

  document.addEventListener(
    "pointerdown",
    () => {
      syncAttributionToLegacyStorage();
    },
    true,
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncAttributionToLegacyStorage();
  });

  const startImpressionTracking = () => {
    window.__gaietyConversionTrackerPromise
      .then((tracker) => {
        syncAttributionToLegacyStorage();
        installCtaImpressions(tracker);
      })
      .catch(() => null);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startImpressionTracking, { once: true });
  } else {
    startImpressionTracking();
  }
})();
