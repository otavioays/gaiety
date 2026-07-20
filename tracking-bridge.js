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
    product_id: "15917657129329",
    product_name: "Mushroom Complex",
    product_category: "Foco e bem-estar",
    offer_stage: "direct_sale",
    page_version: "gaiety-mushroom-complex-v1",
    currency: "BRL",
    entry_price: 83,
    meta_pixel_id: "1725992278652713",
    storefront: "gaiety.cloud",
    checkout_provider: "shopify",
  });

  const IMPRESSION_KEY = "gaiety_offer_cta_impressions_v2";
  const STORAGE_PREFIX = "fbads_conversion_tracker";

  function safeJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function currentAttribution() {
    const current = new URLSearchParams(window.location.search);
    const sessionAttribution = safeJson(
      readStorage(`${STORAGE_PREFIX}_session_attribution_v2`),
    );
    const firstTouch = safeJson(readStorage(`${STORAGE_PREFIX}_first_touch`));
    const stored = sessionAttribution?.attribution || firstTouch || {};

    return {
      utm_source: current.get("utm_source") || stored.utm_source || null,
      utm_medium: current.get("utm_medium") || stored.utm_medium || null,
      utm_campaign: current.get("utm_campaign") || stored.utm_campaign || null,
      utm_content: current.get("utm_content") || stored.utm_content || null,
      utm_term: current.get("utm_term") || stored.utm_term || null,
      fbclid: current.get("fbclid") || stored.fbclid || null,
    };
  }

  function storedTrackerContext() {
    const session = safeJson(readStorage(`${STORAGE_PREFIX}_session_v2`));
    return {
      visitor_id: readStorage(`${STORAGE_PREFIX}_visitor_id`) || null,
      session_id: session?.id || null,
    };
  }

  function trackerContext(tracker) {
    const stored = storedTrackerContext();
    let visitorId = stored.visitor_id;
    let sessionId = stored.session_id;
    let pageInstanceId = null;

    try {
      visitorId = tracker?.getVisitorId?.() || visitorId;
      sessionId = tracker?.getSessionId?.() || sessionId;
      pageInstanceId = tracker?.getPageInstanceId?.() || null;
    } catch (_error) {}

    return {
      ct_visitor_id: visitorId,
      ct_session_id: sessionId,
      ct_page_instance_id: pageInstanceId,
      ...currentAttribution(),
    };
  }

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
        if (attempts >= 100) {
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
        script.dataset.autoPageView = "true";
        script.dataset.autoBehavior = "true";
        script.addEventListener("load", finishWhenReady, { once: true });
        script.addEventListener("error", () => resolve(null), { once: true });
        document.head.appendChild(script);
      } else {
        finishWhenReady();
      }
    });

    return window.__gaietyConversionTrackerPromise;
  }

  function track(name, properties, options) {
    return loadTracker()
      .then((tracker) => {
        if (!tracker) return false;
        return tracker.track(
          name,
          Object.assign({}, OFFER, trackerContext(tracker), properties || {}),
          options || {},
        );
      })
      .catch(() => false);
  }

  function checkoutContext(extra) {
    return Object.assign(
      {},
      OFFER,
      trackerContext(window.ConversionTracker),
      {
        ct_origin: "gaiety",
        source_page_url: window.location.href,
      },
      extra || {},
    );
  }

  function buildCheckoutUrl(baseUrl, extra) {
    try {
      const context = checkoutContext(extra);
      const url = new URL(baseUrl, window.location.href);
      const directKeys = [
        "ct_visitor_id",
        "ct_session_id",
        "ct_checkout_id",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "fbclid",
      ];

      directKeys.forEach((key) => {
        const value = context[key];
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });

      const attributeMap = {
        ct_visitor_id: context.ct_visitor_id,
        ct_session_id: context.ct_session_id,
        ct_page_instance_id: context.ct_page_instance_id,
        ct_checkout_id: context.ct_checkout_id || context.checkout_id,
        ct_origin: context.ct_origin,
        ct_product_id: context.product_id,
        ct_variant_id: context.variant_id,
        ct_offer_units: context.offer_units,
        ct_utm_source: context.utm_source,
        ct_utm_medium: context.utm_medium,
        ct_utm_campaign: context.utm_campaign,
        ct_utm_content: context.utm_content,
        ct_utm_term: context.utm_term,
        ct_fbclid: context.fbclid,
      };

      Object.entries(attributeMap).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          url.searchParams.set(`attributes[${key}]`, String(value));
        }
      });

      url.searchParams.set("ref", "gaiety");
      return url
        .toString()
        .replace("?checkout=&", "?checkout&")
        .replace("&checkout=&", "&checkout&");
    } catch (_error) {
      return baseUrl;
    }
  }

  function ctaProperties(element) {
    return {
      placement: element.dataset.cta || "unknown",
      element_text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180) || null,
      destination: element.getAttribute("href") || null,
      cta_goal: "offer",
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
    } catch (_error) {}
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
        void track("cta_click", ctaProperties(cta), { beacon: true });
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
      void track("cta_impression", ctaProperties(cta));
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

  window.GaietyTracking = Object.freeze({
    track,
    ready: loadTracker,
    offer: OFFER,
    context: checkoutContext,
    buildCheckoutUrl,
  });

  loadTracker();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installCtaTracking, { once: true });
  } else {
    installCtaTracking();
  }
})();
