(function installNitidaFunnelTracking() {
  "use strict";

  if (window.__nitidaFunnelTrackingInstalled) return;
  window.__nitidaFunnelTrackingInstalled = true;

  const TRACKER_SOURCE = "https://analise-de-dados-fbads.vercel.app/tracker.js";
  const FUNNEL_TOUCH_KEY = "gaiety_funnel_touch_v1";
  const FUNNEL_VIEW_KEY = "gaiety_funnel_view_v1";
  const CTA_IMPRESSIONS_KEY = "gaiety_funnel_cta_impressions_v1";

  function referrerType() {
    if (!document.referrer) return "direct";
    try {
      const referrer = new URL(document.referrer);
      if (referrer.hostname === window.location.hostname) return "internal";
      return "external";
    } catch (_error) {
      return "unknown";
    }
  }

  const PAGE_CONTEXT = Object.freeze({
    page_type: "funnel",
    funnel_stage: "advertorial",
    page_name: "nitida_editorial",
    funnel_id: "gaiety_modo_claro",
    journey_type: "funnel",
    previous_page_type: referrerType() === "internal" ? "internal" : "external_or_direct",
    entry_source: referrerType(),
    content_format: "advertorial",
    publication: "nitida",
  });

  function readSessionJson(key) {
    try {
      return JSON.parse(window.sessionStorage.getItem(key) || "{}");
    } catch (_error) {
      return {};
    }
  }

  function writeSessionJson(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {}
  }

  function storeFunnelTouch() {
    try {
      window.localStorage.setItem(
        FUNNEL_TOUCH_KEY,
        JSON.stringify({
          funnel_id: PAGE_CONTEXT.funnel_id,
          page_type: PAGE_CONTEXT.page_type,
          funnel_stage: PAGE_CONTEXT.funnel_stage,
          page_name: PAGE_CONTEXT.page_name,
          path: window.location.pathname,
          page_url: window.location.href,
          seen_at: new Date().toISOString(),
        }),
      );
    } catch (_error) {}
  }

  function attributionParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      fbclid: params.get("fbclid"),
    };
  }

  function loadTracker() {
    if (window.ConversionTracker && typeof window.ConversionTracker.track === "function") {
      return Promise.resolve(window.ConversionTracker);
    }

    if (window.__nitidaTrackerPromise) return window.__nitidaTrackerPromise;

    window.__nitidaTrackerPromise = new Promise((resolve) => {
      const script = document.createElement("script");
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

      script.src = TRACKER_SOURCE;
      script.async = true;
      script.dataset.nitidaConversionTracker = "true";
      script.dataset.debug = "false";
      script.dataset.sessionTimeoutMinutes = "30";
      script.dataset.autoPageView = "true";
      script.dataset.autoBehavior = "true";
      script.dataset.pageType = PAGE_CONTEXT.page_type;
      script.dataset.funnelStage = PAGE_CONTEXT.funnel_stage;
      script.dataset.pageName = PAGE_CONTEXT.page_name;
      script.dataset.funnelId = PAGE_CONTEXT.funnel_id;
      script.dataset.journeyType = PAGE_CONTEXT.journey_type;
      script.addEventListener("load", finishWhenReady, { once: true });
      script.addEventListener("error", () => resolve(null), { once: true });
      document.head.appendChild(script);
    });

    return window.__nitidaTrackerPromise;
  }

  function track(name, properties, options) {
    return loadTracker()
      .then((tracker) => {
        if (!tracker) return false;
        return tracker.track(
          name,
          Object.assign({}, PAGE_CONTEXT, attributionParams(), properties || {}),
          options || {},
        );
      })
      .catch(() => false);
  }

  function sendFunnelView() {
    try {
      if (window.sessionStorage.getItem(FUNNEL_VIEW_KEY) === "1") return;
      window.sessionStorage.setItem(FUNNEL_VIEW_KEY, "1");
    } catch (_error) {}

    void track("funnel_view", {
      article_title: document.querySelector("h1")?.textContent?.trim() || document.title,
      sponsored_content: true,
      referrer_url: document.referrer || null,
    });
  }

  function ctaProperties(cta) {
    const allCtas = Array.from(document.querySelectorAll(".editorial-cta"));
    const index = Math.max(1, allCtas.indexOf(cta) + 1);
    const nearestHeading = cta.closest("section")?.querySelector("h2") || cta.previousElementSibling;
    return {
      placement: "editorial_article",
      cta_index: index,
      element_text: (cta.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180),
      destination: cta.href,
      nearest_section: nearestHeading?.textContent?.trim().slice(0, 180) || null,
      cta_goal: "sales_page",
      destination_page_type: "sales_page",
    };
  }

  function installClickTracking() {
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const cta = target.closest(".editorial-cta");
        if (!cta) return;
        storeFunnelTouch();
        void track("funnel_cta_click", ctaProperties(cta), { beacon: true });
      },
      true,
    );
  }

  function installImpressionTracking() {
    const sent = readSessionJson(CTA_IMPRESSIONS_KEY);
    let observer = null;

    const send = (cta) => {
      const properties = ctaProperties(cta);
      const key = String(properties.cta_index);
      if (sent[key]) return;
      sent[key] = new Date().toISOString();
      writeSessionJson(CTA_IMPRESSIONS_KEY, sent);
      void track("funnel_cta_impression", properties);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
            send(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: [0.5] },
      );
    }

    const register = () => {
      document.querySelectorAll(".editorial-cta:not([data-funnel-observed])").forEach((cta) => {
        cta.dataset.funnelObserved = "true";
        if (observer) observer.observe(cta);
        else send(cta);
      });
    };

    register();
    const mutationObserver = new MutationObserver(register);
    mutationObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => mutationObserver.disconnect(), 15000);
  }

  storeFunnelTouch();
  window.NitidaTracking = Object.freeze({ track, ready: loadTracker, page: PAGE_CONTEXT });
  loadTracker();

  const initialize = () => {
    sendFunnelView();
    installClickTracking();
    installImpressionTracking();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
