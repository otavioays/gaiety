var GAIETY_TRACKING_ENDPOINT = "https://analise-de-dados-fbads.vercel.app/api/events";
var GAIETY_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function gaietyGet(object, path, fallback) {
  var parts = path.split(".");
  var current = object;
  var index;

  for (index = 0; index < parts.length; index += 1) {
    if (!current || typeof current !== "object" || !(parts[index] in current)) {
      return fallback;
    }
    current = current[parts[index]];
  }

  if (current === undefined || current === null) {
    return fallback;
  }

  return current;
}

function gaietyUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (character) {
    var random = Math.floor(Math.random() * 16);
    var value = random;

    if (character === "y") {
      value = (random & 3) | 8;
    }

    return value.toString(16);
  });
}

function gaietyValidUuid(value) {
  return typeof value === "string" && GAIETY_UUID_PATTERN.test(value);
}

function gaietyAttributes(checkout) {
  var output = {};
  var attributes = [];
  var index;
  var attribute;

  if (checkout && Array.isArray(checkout.attributes)) {
    attributes = checkout.attributes;
  }

  for (index = 0; index < attributes.length; index += 1) {
    attribute = attributes[index];

    if (attribute && attribute.key && attribute.value !== undefined && attribute.value !== null) {
      output[String(attribute.key)] = String(attribute.value);
    }
  }

  return output;
}

function gaietyLineItemTracking(checkout) {
  var output = {};
  var items = [];
  var itemIndex;
  var propertyIndex;
  var properties;
  var property;
  var key;

  if (checkout && Array.isArray(checkout.lineItems)) {
    items = checkout.lineItems;
  }

  for (itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    properties = [];

    if (items[itemIndex] && Array.isArray(items[itemIndex].properties)) {
      properties = items[itemIndex].properties;
    }

    for (propertyIndex = 0; propertyIndex < properties.length; propertyIndex += 1) {
      property = properties[propertyIndex];

      if (!property || !property.key || property.value === undefined || property.value === null) {
        continue;
      }

      key = String(property.key);
      if (key.indexOf("_ct_") === 0) {
        output[key.slice(1)] = String(property.value);
      }
    }
  }

  return output;
}

function gaietyAttribution(checkout) {
  var lineItemValues = gaietyLineItemTracking(checkout);
  var cartValues = gaietyAttributes(checkout);
  var output = {};
  var key;

  for (key in lineItemValues) {
    if (Object.prototype.hasOwnProperty.call(lineItemValues, key)) {
      output[key] = lineItemValues[key];
    }
  }

  for (key in cartValues) {
    if (Object.prototype.hasOwnProperty.call(cartValues, key)) {
      output[key] = cartValues[key];
    }
  }

  return output;
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
  var items = [];
  var output = [];
  var index;
  var item;

  if (checkout && Array.isArray(checkout.lineItems)) {
    items = checkout.lineItems;
  }

  for (index = 0; index < items.length && index < 20; index += 1) {
    item = items[index];
    output.push({
      product_id: gaietyGet(item, "variant.product.id", null),
      variant_id: gaietyGet(item, "variant.id", null),
      product_title: gaietyGet(item, "variant.product.title", null) || gaietyGet(item, "title", null),
      variant_title: gaietyGet(item, "variant.title", null),
      quantity: Number(gaietyGet(item, "quantity", 0)),
      price: gaietyGet(item, "variant.price.amount", null)
    });
  }

  return output;
}

function gaietySend(eventName, event) {
  var checkout = gaietyGet(event, "data.checkout", {});
  var attributes = gaietyAttribution(checkout);
  var visitorId = gaietyUuid();
  var sessionId = gaietyUuid();
  var fallbackUrl = "https://gaiety-6507.myshopify.com/checkouts";
  var pageUrl;
  var pagePath = "/";
  var totalPrice = {};
  var order = {};
  var orderId;
  var attributionSource = "generated";
  var payload;

  if (gaietyValidUuid(attributes.ct_visitor_id)) {
    visitorId = attributes.ct_visitor_id;
    attributionSource = "shopify_tracking_properties";
  }

  if (gaietyValidUuid(attributes.ct_session_id)) {
    sessionId = attributes.ct_session_id;
    attributionSource = "shopify_tracking_properties";
  }

  if (eventName === "purchase") {
    fallbackUrl = "https://gaiety-6507.myshopify.com/thank_you";
  }

  pageUrl = gaietyGet(event, "context.document.location.href", fallbackUrl);
  pagePath = gaietyGet(event, "context.document.location.pathname", "/");

  if (checkout && checkout.totalPrice) {
    totalPrice = checkout.totalPrice;
  }

  if (checkout && checkout.order) {
    order = checkout.order;
  }

  orderId = order.id || order.name || checkout.token || null;

  payload = {
    event_id: gaietyUuid(),
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    client_timestamp: gaietyGet(event, "timestamp", null) || new Date().toISOString(),
    page_url: pageUrl,
    page_path: pagePath,
    page_title: gaietyGet(event, "context.document.title", null) || "Checkout GAIETY",
    referrer: gaietyGet(event, "context.document.referrer", null),
    utm_source: attributes.ct_utm_source || null,
    utm_medium: attributes.ct_utm_medium || null,
    utm_campaign: attributes.ct_utm_campaign || null,
    utm_content: attributes.ct_utm_content || null,
    utm_term: attributes.ct_utm_term || null,
    fbclid: attributes.ct_fbclid || null,
    device_type: gaietyDeviceType(event),
    screen_width: Number(gaietyGet(event, "context.window.innerWidth", 0)) || null,
    language: gaietyGet(event, "context.navigator.language", null),
    properties: {
      source: "shopify_custom_pixel",
      attribution_source: attributionSource,
      shopify_client_id: gaietyGet(event, "clientId", null),
      shopify_event_id: gaietyGet(event, "id", null),
      checkout_token: checkout.token || null,
      order_id: orderId,
      value: totalPrice.amount || null,
      currency: totalPrice.currencyCode || "BRL",
      line_items: gaietyLineItems(checkout)
    }
  };

  fetch(GAIETY_TRACKING_ENDPOINT, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    keepalive: true,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch(function () {});
}

analytics.subscribe("checkout_started", function (event) {
  gaietySend("checkout_started", event);
});

analytics.subscribe("checkout_completed", function (event) {
  gaietySend("purchase", event);
});