(function installGaietyRichTelemetryPreview() {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const richPreview =
    params.get("ct_tracker_preview") === "1" ||
    params.get("ct_rich_telemetry") === "1";

  if (!richPreview || window.__gaietyTrackingBridgeInstalled) return;
  window.__gaietyTrackingBridgeInstalled = true;

  const previewOverride = params.get("ct_tracker_url");
  const defaultPreviewTracker =
    "https://analise-de-dados-fbads-git-agent-iter-84dbcd-otavioays-projects.vercel.app/tracker.js";

  function validTrackerUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol !== "https:") return null;
      if (
        url.hostname !== "analise-de-dados-fbads.vercel.app" &&
        !url.hostname.endsWith("-otavioays-projects.vercel.app")
      ) {
        return null;
      }
      return url.toString();
    } catch (_error) {
      return null;
    }
  }

  const trackerSource =
    validTrackerUrl(previewOverride) || defaultPreviewTracker;
  const V2_ATTRIBUTION_KEY = "fbads_conversion_tracker_session_attribution_v2";
  const LEGACY_ATTRIBUTION_KEY = "fbads_conversion_tracker_session_attribution";
  const IMPRESSION_STORAGE_KEY = "gaiety_ritual_cta_impressions_v2";
  const PAGE_STARTED_AT = Date.now();
  const CTA_THRESHOLD_MS = 750;
  const PRODUCT = {
    product_id: "ritual-nitido",
    product_name: "Ritual Nítido (pré-lançamento)",
    offer_stage: "validation_waitlist",
    price: null,
    currency: "BRL",
    landing_version:
      params.get("landing_version") || "ritual-nitido-prelaunch-v1",
    offer_version:
      params.get("offer_version") || "validation-waitlist-v1",
  };

  let trackerWrapper = null;
  const ctaStates = new Map();

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

  function compactObject(object) {
    return Object.fromEntries(
      Object.entries(object).filter(
        ([, value]) => value !== null && value !== undefined && value !== "",
      ),
    );
  }

  function creativeContext() {
    return compactObject({
      concept: params.get("concept") || params.get("ct_concept"),
      hook: params.get("hook") || params.get("ct_hook"),
      sales_message:
        params.get("sales_message") || params.get("ct_sales_message"),
      format: params.get("format") || params.get("ct_format"),
      angle: params.get("angle") || params.get("ct_angle"),
      awareness_level:
        params.get("awareness_level") || params.get("ct_awareness_level"),
      landing_version: PRODUCT.landing_version,
      offer_version: PRODUCT.offer_version,
    });
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

  function readPageInstanceId(tracker) {
    if (!tracker || typeof tracker.getPageInstanceId !== "function") return null;
    return tracker.getPageInstanceId();
  }

  function wrapTracker(tracker) {
    if (!tracker) return null;
    if (tracker.__gaietyCompatibleTracker) return tracker;

    const wrapper = {
      __gaietyCompatibleTracker: true,
      __rawTracker: tracker,
      track(eventName, properties, options) {
        syncAttributionToLegacyStorage();
        return tracker.track(eventName, properties, options);
      },
      getVisitorId() {
        return readVisitorId(tracker);
      },
      getSessionId() {
        return readSessionId(tracker);
      },
      getPageInstanceId() {
        return readPageInstanceId(tracker);
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
      flush:
        typeof tracker.flush === "function" ? tracker.flush.bind(tracker) : undefined,
      endpoint: tracker.endpoint,
      version: tracker.version || 1,
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
      script.dataset.debug = params.get("ct_debug") === "1" ? "true" : "false";
      script.dataset.sessionTimeoutMinutes = "30";
      script.dataset.autoBehavior = "true";
      script.dataset.autoPageView = "true";

      let attempts = 0;
      const finishWhenReady = () => {
        if (trackerWrapper) {
          resolve(trackerWrapper);
          return;
        }
        attempts += 1;
        if (attempts >= 100) {
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
    if (link.dataset.cta) return link.dataset.cta;
    if (link.classList.contains("header-buy")) return "header";
    if (link.classList.contains("hero-buy-primary")) return "hero";
    if (link.classList.contains("buy-button")) return "offer";
    if (link.closest(".mobile-buy")) return "mobile_sticky";
    if (link.classList.contains("desktop-buy-dock")) return "desktop_dock";
    if (link.closest(".menu-panel")) return "menu";
    return "unknown";
  }

  function isTrackedCta(element) {
    return element instanceof HTMLElement && element.matches("[data-cta]");
  }

  function scrollDepth() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return 100;
    return Math.max(
      0,
      Math.min(100, Math.round((window.scrollY / scrollable) * 100)),
    );
  }

  function rectContext(link) {
    const rect = link.getBoundingClientRect();
    return {
      viewport_top: Math.round(rect.top),
      viewport_left: Math.round(rect.left),
      element_width: Math.round(rect.width),
      element_height: Math.round(rect.height),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };
  }

  function ctaId(link, index) {
    return [placementFor(link), link.id || "no-id", index].join(":");
  }

  function impressionKey(tracker, state) {
    return [
      readSessionId(tracker) || "unknown-session",
      readPageInstanceId(tracker) || window.location.pathname,
      state.ctaId,
    ].join(":");
  }

  function readSentImpressions() {
    const parsed = parseJson(readStorage(window.sessionStorage, IMPRESSION_STORAGE_KEY));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  }

  function writeSentImpressions(value) {
    writeStorage(
      window.sessionStorage,
      IMPRESSION_STORAGE_KEY,
      JSON.stringify(value),
    );
  }

  function stateProperties(state) {
    const now = Date.now();
    const activeVisibleMs = state.visibleStartedAt
      ? now - state.visibleStartedAt
      : 0;
    return Object.assign({}, PRODUCT, creativeContext(), rectContext(state.link), {
      placement: state.placement,
      cta_id: state.ctaId,
      element_text:
        (state.link.textContent || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 200) || null,
      element_class: state.link.className || null,
      seconds_elapsed: Math.max(
        0,
        Math.round((now - PAGE_STARTED_AT) / 1000),
      ),
      scroll_depth: scrollDepth(),
      total_visible_ms: Math.round(state.totalVisibleMs + activeVisibleMs),
      max_intersection_ratio: Number(state.maxRatio.toFixed(4)),
      impression_threshold_ms: CTA_THRESHOLD_MS,
      impression_sent: state.impressionSent,
      integration_version: "ritual-nitido-rich-preview-v1",
      tracker_channel: "preview",
    });
  }

  function installCreativeContext(tracker) {
    if (!tracker || typeof tracker.track !== "function") return;
    tracker.track(
      "creative_context",
      Object.assign({}, PRODUCT, creativeContext(), {
        integration_version: "ritual-nitido-rich-preview-v1",
        tracker_channel: "preview",
      }),
    );
  }

  function installCtaExposure(tracker) {
    if (!tracker || typeof tracker.track !== "function") return;

    const links = Array.from(document.querySelectorAll("[data-cta]")).filter(
      isTrackedCta,
    );
    if (links.length === 0) return;
    const sent = readSentImpressions();

    links.forEach((link, index) => {
      const state = {
        link,
        ctaId: ctaId(link, index),
        placement: placementFor(link),
        visibleStartedAt: null,
        totalVisibleMs: 0,
        maxRatio: 0,
        impressionSent: false,
        impressionTimer: null,
      };
      ctaStates.set(link, state);
      link.dataset.trackSection = `cta-${state.placement}`;
      link.dataset.ctaId = state.ctaId;
    });

    function stopVisibility(state, reason) {
      if (state.visibleStartedAt) {
        state.totalVisibleMs += Date.now() - state.visibleStartedAt;
        state.visibleStartedAt = null;
      }
      if (state.impressionTimer) {
        window.clearTimeout(state.impressionTimer);
        state.impressionTimer = null;
      }
      if (reason === "pagehide" && state.totalVisibleMs > 0) {
        tracker.track(
          "cta_visibility_summary",
          Object.assign(stateProperties(state), { reason }),
          { beacon: true, queue: false },
        );
      }
    }

    function startVisibility(state, ratio) {
      state.maxRatio = Math.max(state.maxRatio, ratio);
      if (!state.visibleStartedAt) state.visibleStartedAt = Date.now();
      if (state.impressionTimer || state.impressionSent) return;

      state.impressionTimer = window.setTimeout(() => {
        state.impressionTimer = null;
        if (!state.visibleStartedAt || state.impressionSent) return;
        const key = impressionKey(tracker, state);
        if (sent[key]) {
          state.impressionSent = true;
          return;
        }
        state.impressionSent = true;
        sent[key] = new Date().toISOString();
        writeSentImpressions(sent);
        tracker.track("cta_impression", stateProperties(state));
      }, CTA_THRESHOLD_MS);
    }

    if (!("IntersectionObserver" in window)) {
      ctaStates.forEach((state) => startVisibility(state, 1));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const state = ctaStates.get(entry.target);
            if (!state) return;
            state.maxRatio = Math.max(state.maxRatio, entry.intersectionRatio);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              startVisibility(state, entry.intersectionRatio);
            } else {
              stopVisibility(state, "intersection_exit");
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] },
      );
      ctaStates.forEach((state) => observer.observe(state.link));
    }

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const link = target.closest("[data-cta]");
        const state = ctaStates.get(link);
        if (!state) return;
        tracker.track("cta_click_context", stateProperties(state));
      },
      true,
    );

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        ctaStates.forEach((state) =>
          stopVisibility(state, "visibility_hidden"),
        );
      }
    });
    window.addEventListener("pagehide", () => {
      ctaStates.forEach((state) => stopVisibility(state, "pagehide"));
    });
  }

  document.addEventListener("pointerdown", syncAttributionToLegacyStorage, true);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncAttributionToLegacyStorage();
    }
  });

  const startTracking = () => {
    window.__gaietyConversionTrackerPromise
      .then((tracker) => {
        syncAttributionToLegacyStorage();
        installCreativeContext(tracker);
        installCtaExposure(tracker);
      })
      .catch(() => null);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startTracking, { once: true });
  } else {
    startTracking();
  }
})();
