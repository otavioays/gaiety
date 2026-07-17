/*
 * GAIETY Conversion Tracker - Shopify Custom Pixel
 *
 * Cole este arquivo em:
 * Shopify Admin -> Configurações -> Eventos do cliente -> Adicionar pixel personalizado
 *
 * O pixel recebe os IDs e UTMs enviados pelo link permanente do carrinho
 * e registra checkout_started e purchase no dashboard privado.
 */

const GAIETY_TRACKING_ENDPOINT =
  "https://analise-de-dados-fbads.vercel.app/api/events";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function gaietyUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 3) | 8;
    return value.toString(16);
  });
}

function gaietyAttributes(checkout) {
  const output = {};
  const attributes = Array.isArray(checkout?.attributes) ? checkout.attributes : [];

  attributes.forEach((attribute) => {
    if (attribute?.key && attribute?.value != null) {
      output[String(attribute.key)] = String(attribute.value);
    }
  });

  return output;
}

function gaietyValidUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function gaietySafeUrl(event, fallback) {
  const candidate = event?.context?.document?.location?.href;

  try {
    return new URL(candidate || fallback).toString();
  } catch (_error) {
    return fallback;
  }
}

function gaietyDeviceType(event) {
  const width = Number(event?.context?.window?.innerWidth || 0);

  if (width > 0 && width < 768) return "mobile";
  if (width >= 768 && width < 1024) return "tablet";
  return "desktop";
}

function gaietyLineItems(checkout) {
  const lineItems = Array.isArray(checkout?.lineItems) ? checkout.lineItems : [];

  return lineItems.slice(0, 20).map((item) => ({
    product_id: item?.variant?.product?.id || null,
    variant_id: item?.variant?.id || null,
    product_title: item?.variant?.product?.title || item?.title || null,
    variant_title: item?.variant?.title || null,
    quantity: Number(item?.quantity || 0),
    price: item?.variant?.price?.amount || null,
  }));
}

function gaietySend(eventName, event) {
  const checkout = event?.data?.checkout || {};
  const attributes = gaietyAttributes(checkout);
  const visitorId = gaietyValidUuid(attributes.ct_visitor_id)
    ? attributes.ct_visitor_id
    : gaietyUuid();
  const sessionId = gaietyValidUuid(attributes.ct_session_id)
    ? attributes.ct_session_id
    : gaietyUuid();
  const fallbackUrl =
    eventName === "purchase"
      ? "https://gaiety-6507.myshopify.com/thank_you"
      : "https://gaiety-6507.myshopify.com/checkouts";
  const pageUrl = gaietySafeUrl(event, fallbackUrl);
  let pagePath = "/";

  try {
    const parsed = new URL(pageUrl);
    pagePath = parsed.pathname + parsed.search;
  } catch (_error) {
    pagePath = "/";
  }

  const totalPrice = checkout?.totalPrice || {};
  const order = checkout?.order || {};
  const orderId = order?.id || order?.name || checkout?.token || null;

  const payload = {
    event_id: gaietyUuid(),
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    client_timestamp: event?.timestamp || new Date().toISOString(),
    page_url: pageUrl,
    page_path: pagePath,
    page_title: event?.context?.document?.title || "Checkout GAIETY",
    referrer: event?.context?.document?.referrer || null,
    utm_source: attributes.ct_utm_source || null,
    utm_medium: attributes.ct_utm_medium || null,
    utm_campaign: attributes.ct_utm_campaign || null,
    utm_content: attributes.ct_utm_content || null,
    utm_term: attributes.ct_utm_term || null,
    fbclid: attributes.ct_fbclid || null,
    device_type: gaietyDeviceType(event),
    screen_width: Number(event?.context?.window?.innerWidth || 0) || null,
    language: event?.context?.navigator?.language || null,
    properties: {
      source: "shopify_custom_pixel",
      shopify_event_id: event?.id || null,
      checkout_token: checkout?.token || null,
      order_id: orderId,
      value: totalPrice?.amount || null,
      currency: totalPrice?.currencyCode || "BRL",
      line_items: gaietyLineItems(checkout),
    },
  };

  return fetch(GAIETY_TRACKING_ENDPOINT, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

analytics.subscribe("checkout_started", (event) => {
  gaietySend("checkout_started", event);
});

analytics.subscribe("checkout_completed", (event) => {
  gaietySend("purchase", event);
});
