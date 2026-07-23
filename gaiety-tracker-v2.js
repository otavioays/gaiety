(function (global) {
  'use strict';

  const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

  function id(prefix) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const value = part.trim();
      if (value.startsWith(prefix)) return decodeURIComponent(value.slice(prefix.length));
    }
    return null;
  }

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; Secure`;
  }

  function attribution() {
    const url = new URL(location.href);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const result = {};
    for (const key of keys) {
      const value = url.searchParams.get(key);
      if (value) result[key] = value;
    }
    return result;
  }

  function identifiers() {
    const url = new URL(location.href);
    const fbclid = url.searchParams.get('fbclid');
    let fbc = getCookie('_fbc');
    if (!fbc && fbclid) {
      fbc = `fb.1.${Date.now()}.${fbclid}`;
      setCookie('_fbc', fbc, 90 * 24 * 60 * 60);
    }
    return { fbclid, fbp: getCookie('_fbp'), fbc };
  }

  function create(options) {
    if (!options || !options.endpoint || !options.token || !options.siteKey) {
      throw new Error('Tracker requires endpoint, token, and siteKey');
    }

    const visitorKey = `ct_visitor_id:${options.siteKey}`;
    const sessionKey = `ct_session:${options.siteKey}:v${options.trackingVersion || 5}`;
    const consentProvider = typeof options.getConsent === 'function'
      ? options.getConsent
      : () => ({ analytics: false, marketing: false });

    function getVisitorId() {
      let visitorId = localStorage.getItem(visitorKey);
      if (!visitorId) {
        visitorId = id('v');
        localStorage.setItem(visitorKey, visitorId);
      }
      return visitorId;
    }

    function getSessionId() {
      const now = Date.now();
      let session;
      try { session = JSON.parse(localStorage.getItem(sessionKey) || 'null'); } catch { session = null; }
      if (!session || !session.id || now - Number(session.lastActivity || 0) > SESSION_TIMEOUT_MS) {
        session = { id: id('s'), startedAt: now, lastActivity: now };
      } else {
        session.lastActivity = now;
      }
      localStorage.setItem(sessionKey, JSON.stringify(session));
      return session.id;
    }

    function context() {
      const ids = identifiers();
      return {
        site_key: options.siteKey,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        page_url: location.href,
        referrer: document.referrer || null,
        attribution: attribution(),
        consent: consentProvider(),
        fbp: ids.fbp,
        fbc: ids.fbc,
        fbclid: ids.fbclid,
      };
    }

    async function post(path, payload, keepalive) {
      const response = await fetch(`${options.endpoint}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tracker-token': options.token },
        body: JSON.stringify(payload),
        keepalive: Boolean(keepalive),
        credentials: 'omit',
      });
      if (!response.ok) throw new Error(`Tracker HTTP ${response.status}`);
      return response.json();
    }

    async function track(eventName, properties = {}, settings = {}) {
      const consent = consentProvider();
      if (eventName !== 'buy_click' && consent.analytics !== true) return { skipped: 'analytics_consent' };
      const payload = {
        event_id: settings.eventId || id('evt'),
        event_name: eventName,
        occurred_at: new Date().toISOString(),
        tracking_version: options.trackingVersion || 5,
        properties,
        is_test: Boolean(settings.isTest),
        ...context(),
      };
      return post('/v1/events', payload, settings.keepalive);
    }

    async function checkout(offerKey, settings = {}) {
      const payload = {
        idempotency_key: settings.idempotencyKey || id('buy'),
        offer_key: offerKey,
        occurred_at: new Date().toISOString(),
        is_test: Boolean(settings.isTest),
        test_reason: settings.testReason,
        ...context(),
      };
      const result = await post('/v1/checkout-intents', payload, true);
      location.assign(result.checkout_url);
      return result;
    }

    function bind(selector = '[data-tracker-offer],[data-gaiety-offer]') {
      document.addEventListener('click', async (event) => {
        const target = event.target.closest(selector);
        if (!target) return;
        event.preventDefault();
        if (target.dataset.trackerBusy === '1') return;
        target.dataset.trackerBusy = '1';
        const offerKey = target.dataset.trackerOffer || target.dataset.gaietyOffer;
        try {
          await checkout(offerKey, {
            isTest: target.dataset.trackingTest === '1',
            testReason: target.dataset.trackingTest === '1' ? 'button_attribute' : undefined,
          });
        } catch (error) {
          console.error('Checkout tracking failed', error);
          target.dataset.trackerBusy = '0';
          if (target.href) location.assign(target.href);
        }
      });
    }

    return {
      track,
      checkout,
      bind,
      getIdentity: () => ({ visitor_id: getVisitorId(), session_id: getSessionId(), site_key: options.siteKey }),
    };
  }

  global.GaietyTracker = { create };
})(window);
