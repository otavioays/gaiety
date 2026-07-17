/*
 * GAIETY Conversion Tracker - Shopify Custom Pixel
 *
 * Shopify Admin -> Configurações -> Eventos do cliente
 * -> Adicionar pixel personalizado
 */

var GAIETY_TRACKING_ENDPOINT =
  "https://analise-de-dados-fbads.vercel.app/api/events";

var GAIETY_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function gaietyGet(object, path, fallback) {
  var current = object;
  var parts = path.split(".");
  var index;

  for (index = 0; index < parts.length; index += 1) {
    if (current === null || current === undefined) {
      return fallback;
    }

    current = current[parts[index]];
  }

  if (current === null || current === undefined) {
    return fallback;
  }

  return current;
}

function gaietyUuid() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (character) {
      var random = Math.floor(Math.random() * 16);
      var value = character === "x" ? random : (random & 3) | 8;
      return value.toString(16);
    },
  );
}

function gaietyAttributes(checkout) {
  var output = {};
  var attributes = checkout && Array.isArray(checkout.attributes)
    ? checkout.attributes
    : [];

  attributes.forEach(function (attribute) {
    if (
      attribute &&
      attribute.key &&
      attribute.value !== null &&
      attribute.value !== undefined
    ) {
      output[String(attribute.key)] = String(attribute.value);
    }
  });

  return output;
}

function gaietyValidUuid(value) {
  return typeof value === "string" && GAIETY_UUID_PATTERN.test(value);
}

function gaietySafeUrl(event, fallback) {
  var candidate = gaietyGet(
    event,
    "context.document.location.href",
    fallback,
  );

  try {
    return new URL(candidate || fallback).toString();
  } catch (error) {
    return fallback;
  }
}

function gaietyDeviceType(event) {
  var width = Number(gaietyGet(event, "context.window.innerWidth", 0));

  if (width > 0 && width < 768) {
    return "mobile";
  }

  if (width >= 768 && width < 1024) {
    return "tablet";
  }

  return "desktop";
}

function gaietyLineItems(checkout) {
  var lineItems = checkout && Array.isArray(checkout.lineItems)
    ? checkout.lineItems
    : [];

  return lineItems.slice(0, 20).map(function (item) {
    return {
      product_id: gaietyGet(item, "variant.product.id", null),
      variant_id: gaietyGet(item, "variant.id", null),
      product_title:
        gaietyGet(item, "variant.product.title", null) ||
        gaietyGet(item, "title", null),
      variant_title: gaietyGet(item, "variant.title", null),
      quantity: Number(gaietyGet(item, "quantity", 0)),
      price: gaietyGet(item, "variant.price.amount", null),
    };
  });
}

function gaietySend(eventName, event) {
  var checkout = gaietyGet(event, "data.checkout", {});
  var attributes = gaietyAttributes(checkout);
  var visitorId = gaietyUuid();
  var sessionId = gaietyUuid();
  var fallbackUrl = "https://gaiety-6507.myshopify.com/checkouts";
  var pageUrl;
  var pagePath = "/";
  var parsed;
  var totalPrice;
  var order;
  var orderId;
  var payload;

  if (gaietyValidUuid(attributes.ct_visitor_id)) {
    visitorId = attributes.ct_visitor_id;
  }

  if (gaietyValidUuid(attributes.ct_session_id)) {
    sessionId = attributes.ct_session_id;
  }

  if (eventName === "purchase") {
    fallbackUrl = "https://gaiety-6507.myshopify.com/thank_you";
  }

  pageUrl = gaietySafeUrl(event, fallbackUrl);

  try {
    parsed = new URL(pageUrl);
    pagePath = parsed.pathname + parsed.search;
  } catch (error) {
    pagePath = "/";
  }

  totalPrice = checkout && checkout.totalPrice ? checkout.totalPrice : {};
  order = checkout && checkout.order ? checkout.order : {};
  orderId = order.id || order.name || checkout.token || null;

  payload = {
    event_id: gaietyUuid(),
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    client_timestamp:
      gaietyGet(event, "timestamp", null) || new Date().toISOString(),
    page_url: pageUrl,
    page_path: pagePath,
    page_title:
      gaietyGet(event, "context.document.title", null) || "Checkout GAIETY",
    referrer: gaietyGet(event, "context.document.referrer", null),
    utm_source: attributes.ct_utm_source || null,
    utm_medium: attributes.ct_utm_medium || null,
    utm_campaign: attributes.ct_utm_campaign || null,
    utm_content: attributes.ct_utm_content || null,
    utm_term: attributes.ct_utm_term || null,
    fbclid: attributes.ct_fbclid || null,
    device_type: gaietyDeviceType(event),
    screen_width:
      Number(gaietyGet(event, "context.window.innerWidth", 0)) || null,
    language: gaietyGet(event, "context.navigator.language", null),
    properties: {
      source: "shopify_custom_pixel",
      shopify_event_id: gaietyGet(event, "id", null),
      checkout_token: checkout.token || null,
      order_id: orderId,
      value: totalPrice.amount || null,
      currency: totalPrice.currencyCode || "BRL",
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
  }).catch(function () {
    return undefined;
  });
}

analytics.subscribe("checkout_started", function (event) {
  gaietySend("checkout_started", event);
});

analytics.subscribe("checkout_completed", function (event) {
  gaietySend("purchase", event);
});
