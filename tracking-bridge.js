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
    richScript.src = "tracking-rich-preview.js?v=ritual-nitido-1";
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

  const OFFER = Object.freeze({
    product_id: "ritual-nitido",
    product_name: "Ritual Nítido (pré-lançamento)",
    offer_stage: "validation_waitlist",
    page_version: "ritual-nitido-prelaunch-v1",
    currency: "BRL",
    price: null,
  });

  const IMPRESSION_KEY = "gaiety_ritual_cta_impressions_v1";

  function loadTracker() {
    if (window.ConversionTracker && typeof window.ConversionTracker.track === "function") {
      return Promise.resolve(window.ConversionTracker);
    }

    if (window.__gaietyConversionTrackerPromise) return window.__gaietyConversionTrackerPromise;

    window.__gaietyConversionTrackerPromise = new Promise((resolve) => {
      const existing = document.querySelector("script[data-gaiety-conversion-tracker]");
      const script = existing || document.createElement("script");
      let attempts = 0;

      const finishWhenReady = () => {
        if (window.ConversionTracker && typeof window.ConversionTracker.track === "function") {
          resolve(window.ConversionTracker);
          return;
        }

        attempts += 1;
        if (attempts >= 60) {
          resolve(null);
          return;
        }
        window.setTimeout(finishWhenReady, 50);
      };

      if (!existing) {
        script.src = trackerSource;
        script.async = true;
        script.dataset.gaietyConversionTracker = "true";
        script.dataset.debug = "false";
        script.dataset.sessionTimeoutMinutes = "30";
        script.addEventListener("load", finishWhenReady, { once: true });
        script.addEventListener("error", () => resolve(null), { once: true });
        document.head.appendChild(script);
      } else {
        finishWhenReady();
      }
    });

    return window.__gaietyConversionTrackerPromise;
  }

  function track(name, properties) {
    return loadTracker()
      .then((tracker) => {
        if (!tracker) return null;
        return tracker.track(name, Object.assign({}, OFFER, properties || {}));
      })
      .catch(() => null);
  }

  function ctaProperties(element) {
    return {
      placement: element.dataset.cta || "unknown",
      element_text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180) || null,
      destination: element.getAttribute("href") || null,
      cta_goal: "validation_waitlist",
      pii_included: false,
      tracker_channel: usePreviewTracker ? "preview" : "production",
    };
  }

  function readImpressions() {
    try {
      return JSON.parse(window.sessionStorage.getItem(IMPRESSION_KEY) || "{}") || {};
    } catch (_error) {
      return {};
    }
  }

  function writeImpressions(value) {
    try {
      window.sessionStorage.setItem(IMPRESSION_KEY, JSON.stringify(value));
    } catch (_error) {
      // Storage can be unavailable in privacy modes; tracking still proceeds.
    }
  }

  function installCtaTracking() {
    const ctas = Array.from(document.querySelectorAll("[data-cta]"));
    if (!ctas.length) return;

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const cta = target.closest("[data-cta]");
        if (!cta) return;
        track("waitlist_cta_click", ctaProperties(cta));
      },
      true,
    );

    const sent = readImpressions();
    const sendImpression = (cta) => {
      const placement = cta.dataset.cta || "unknown";
      const key = [window.location.pathname, placement].join(":");
      if (sent[key]) return;
      sent[key] = new Date().toISOString();
      writeImpressions(sent);
      track("cta_impression", ctaProperties(cta));
    };

    if (!("IntersectionObserver" in window)) {
      ctas.forEach(sendImpression);
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

    ctas.forEach((cta) => observer.observe(cta));
  }

  window.GaietyTracking = Object.freeze({ track, offer: OFFER });
  loadTracker();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installCtaTracking, { once: true });
  } else {
    installCtaTracking();
  }
})();
