(function installGaietyTrackingBridge() {
  "use strict";

  if (window.__gaietyTrackingBridgeInstalled) return;
  window.__gaietyTrackingBridgeInstalled = true;

  const TRACKER_SOURCE = "gaiety-tracker-v2.js?v=20260723-2";
  const TRACKING_ENDPOINT = "https://events.gaiety.cloud";
  const SITE_KEY = "gaiety-main";
  const BROWSER_INGEST_TOKEN = "site_DzYL53BKVoLOeI4Vm3D-8xHfyQF5tc7G";
  const TRACKING_VERSION = 5;
  const CLASSIFIED_VIEW_KEY = "gaiety_sales_page_view_v3";
  const FUNNEL_TOUCH_KEY = "gaiety_funnel_touch_v1";
  const FUNNEL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
  const params = new URLSearchParams(window.location.search);

  let trackerInstance = null;
  let trackerPromise = null;

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

  function readSessionStorage(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeSessionStorage(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_error) {}
  }

  function referrerIsEditorial() {
    if (!document.referrer) return false;
    try {
      const referrer = new URL(document.referrer);
      const sameSite = ["gaiety.cloud", "www.gaiety.cloud"].includes(referrer.hostname);
      return sameSite && referrer.pathname.startsWith("/editorial/");
    } catch (_error) {
      return false;
    }
  }

  function validFunnelTouch() {
    const touch = safeJson(readStorage(FUNNEL_TOUCH_KEY));
    if (!touch || !touch.seen_at) return null;
    const seenAt = Date.parse(touch.seen_at);
    if (!Number.isFinite(seenAt) || Date.now() - seenAt > FUNNEL_WINDOW_MS) return null;
    return touch;
  }

  function resolveJourney() {
    const priorTouch = validFunnelTouch();
    const explicitFunnel =
      params.get("ct_entry") === "funnel" ||
      params.get("ct_funnel") === "editorial" ||
      params.get("ct_page_type") === "funnel";

    if (explicitFunnel || referrerIsEditorial()) {
      return {
        journey_type: "funnel_to_sales",
        previous_page_type: "funnel",
        entry_source: explicitFunnel ? "editorial_cta" : "editorial_referrer",
        funnel_touch_at: priorTouch?.seen_at || null,
      };
    }

    if (priorTouch) {
      return {
        journey_type: "funnel_assisted_sales",
        previous_page_type: "prior_funnel",
        entry_source: "prior_funnel_touch",
        funnel_touch_at: priorTouch.seen_at,
      };
    }

    return {
      journey_type: "direct_to_sales",
      previous_page_type: "external_or_direct",
      entry_source: "direct_or_external",
      funnel_touch_at: null,
    };
  }

  const PAGE_CONTEXT = Object.freeze({
    page_type: "sales_page",
    funnel_stage: "sales_page",
    page_name: "gaiety_sales_page",
    funnel_id: "gaiety_modo_claro",
    ...resolveJourney(),
  });

  const OFFER = Object.freeze({
    product_id: "15917657129329",
    product_name: "Mushroom Complex",
    product_category: "Foco e bem-estar",
    offer_stage: "direct_sale",
    page_version: "gaiety-mushroom-complex-v2",
    currency: "BRL",
    entry_price: 83,
    meta_pixel_id: "1725992278652713",
    storefront: "gaiety.cloud",
    checkout_provider: "shopify",
    ...PAGE_CONTEXT,
  });

  function getConsent() {
    const consent = window.gaietyConsent;
    if (consent && typeof consent === "object") {
      return {
        analytics: consent.analytics === true,
        marketing: consent.marketing === true,
      };
    }
    return { analytics: true, marketing: false };
  }

  function createTracker() {
    if (trackerInstance) return trackerInstance;
    if (!window.GaietyTracker || typeof window.GaietyTracker.create !== "function") {
      throw new Error("GaietyTracker V2 did not load");
    }

    trackerInstance = window.GaietyTracker.create({
      endpoint: TRACKING_ENDPOINT,
      siteKey: SITE_KEY,
      token: BROWSER_INGEST_TOKEN,
      trackingVersion: TRACKING_VERSION,
      getConsent,
    });
    window.__gaietyTrackerV2 = trackerInstance;
    return trackerInstance;
  }

  function loadTracker() {
    if (trackerInstance) return Promise.resolve(trackerInstance);
    if (trackerPromise) return trackerPromise;

    trackerPromise = new Promise((resolve, reject) => {
      const finish = () => {
        try {
          resolve(createTracker());
        } catch (error) {
          reject(error);
        }
      };

      if (window.GaietyTracker && typeof window.GaietyTracker.create === "function") {
        finish();
        return;
      }

      const existing = document.querySelector("script[data-gaiety-tracker-v2]");
      if (existing) {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => reject(new Error("Tracker script failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = TRACKER_SOURCE;
      script.async = true;
      script.dataset.gaietyTrackerV2 = "true";
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", () => reject(new Error("Tracker script failed")), { once: true });
      document.head.appendChild(script);
    });

    return trackerPromise;
  }

  function track(name, properties, options) {
    const settings = options || {};
    return loadTracker()
      .then((tracker) => tracker.track(
        name,
        Object.assign({}, OFFER, PAGE_CONTEXT, properties || {}),
        {
          eventId: settings.eventId || settings.eventID,
          isTest: settings.isTest === true || params.get("ct_test") === "1",
          keepalive: settings.keepalive === true || settings.beacon === true,
        },
      ))
      .catch((error) => {
        console.error("Gaiety tracking error", error);
        return false;
      });
  }

  function checkout(offerKey, settings) {
    const config = settings || {};
    return loadTracker().then((tracker) => tracker.checkout(offerKey, {
      idempotencyKey: config.idempotencyKey || config.checkoutId,
      isTest: config.isTest === true || params.get("ct_test") === "1",
      testReason: config.testReason || (params.get("ct_test") === "1" ? "query_parameter" : undefined),
    }));
  }

  function identity() {
    try {
      return trackerInstance?.getIdentity?.() || null;
    } catch (_error) {
      return null;
    }
  }

  function createEventId(eventName) {
    const random = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `gaiety-${String(eventName).toLowerCase()}-${random}`;
  }

  function offerForUnits(units) {
    return {
      1: { offerKey: "one_package", variantId: "64223935332721", value: 84 },
      2: { offerKey: "two_packages", variantId: "64223935299953", value: 156 },
      5: { offerKey: "five_packages", variantId: "64223935234417", value: null },
    }[units] || null;
  }

  function sendBrowserInitiateCheckout(units, offer, eventId) {
    if (typeof window.fbq !== "function") return;
    try {
      window.fbq("trackSingle", OFFER.meta_pixel_id, "InitiateCheckout", {
        currency: "BRL",
        value: offer.value,
        content_ids: [offer.variantId],
        content_type: "product",
        content_name: `Mushroom Complex - ${units} ${units === 1 ? "unidade" : "unidades"}`,
        content_category: "Foco e bem-estar",
        num_items: units,
      }, { eventID: eventId });
    } catch (_error) {}
  }

  function installCheckoutInterception() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      const button = target.closest("[data-offer-button]");
      if (!button) return;

      const units = Number(button.dataset.offerButton || 0);
      const offer = offerForUnits(units);
      if (!offer) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (button.dataset.trackerBusy === "1") return;

      button.dataset.trackerBusy = "1";
      button.disabled = true;
      const checkoutId = createEventId("checkout");
      const properties = {
        product_id: OFFER.product_id,
        variant_id: offer.variantId,
        offer_key: offer.offerKey,
        offer_units: units,
        quantity: 1,
        value: offer.value,
        cart_value: offer.value,
        currency: "BRL",
        placement: "final_offer",
        checkout_provider: "shopify",
        checkout_id: checkoutId,
        ct_checkout_id: checkoutId,
        destination_host: "tedyzw-27.myshopify.com",
      };

      sendBrowserInitiateCheckout(units, offer, checkoutId);
      void track("buy_button_click", properties, { eventId: checkoutId, keepalive: true });

      checkout(offer.offerKey, { idempotencyKey: checkoutId }).catch((error) => {
        console.error("Checkout handoff failed", error);
        button.dataset.trackerBusy = "0";
        button.disabled = false;
        window.location.assign(`https://tedyzw-27.myshopify.com/cart/${offer.variantId}:1?checkout`);
      });
    }, true);
  }

  function sendClassifiedPageView() {
    if (readSessionStorage(CLASSIFIED_VIEW_KEY) === "1") return;
    void track("sales_page_view", {
      landing_classification: PAGE_CONTEXT.journey_type,
      referrer_url: document.referrer || null,
    }).then((result) => {
      if (result) writeSessionStorage(CLASSIFIED_VIEW_KEY, "1");
    });
  }

  window.ConversionTracker = Object.freeze({
    track,
    ready: loadTracker,
    getVisitorId: () => identity()?.visitor_id || null,
    getSessionId: () => identity()?.session_id || null,
    getPageInstanceId: () => null,
  });

  window.GaietyTracking = Object.freeze({
    track,
    checkout,
    ready: loadTracker,
    offer: OFFER,
    page: PAGE_CONTEXT,
    context: (extra) => Object.assign({}, OFFER, PAGE_CONTEXT, identity() || {}, extra || {}),
    buildCheckoutUrl: (baseUrl) => baseUrl,
  });

  installCheckoutInterception();
  loadTracker().catch((error) => console.error("Gaiety tracker failed to load", error));

  const initialize = () => sendClassifiedPageView();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();