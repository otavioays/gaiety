const crypto = require("crypto");

const PIXEL_ID = process.env.META_PIXEL_ID || "1002939839166097";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v22.0";
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";

const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "InitiateCheckout",
  "Lead",
]);

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (!key) return cookies;
    try {
      cookies[key] = decodeURIComponent(value);
    } catch (_error) {
      cookies[key] = value;
    }
    return cookies;
  }, {});
}

function getRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return {};
  try {
    return JSON.parse(req.body);
  } catch (_error) {
    return {};
  }
}

function cleanString(value, maxLength = 300) {
  if (typeof value !== "string") return undefined;
  const clean = value.trim().slice(0, maxLength);
  return clean || undefined;
}

function cleanSourceUrl(value) {
  const source = cleanString(value, 1000);
  if (!source) return "https://gaiety.cloud/";
  try {
    const parsed = new URL(source);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "https://gaiety.cloud/";
    }
    return parsed.toString();
  } catch (_error) {
    return "https://gaiety.cloud/";
  }
}

function cleanContentIds(value) {
  if (!Array.isArray(value)) return undefined;
  const ids = value
    .map((item) => cleanString(String(item), 120))
    .filter(Boolean)
    .slice(0, 20);
  return ids.length ? ids : undefined;
}

function compact(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function safeMetaError(result) {
  const error = result && typeof result === "object" ? result.error : null;
  if (!error || typeof error !== "object") return undefined;
  return compact({
    message: cleanString(error.message, 500),
    type: cleanString(error.type, 120),
    code: Number.isFinite(Number(error.code)) ? Number(error.code) : undefined,
    error_subcode: Number.isFinite(Number(error.error_subcode)) ? Number(error.error_subcode) : undefined,
    fbtrace_id: cleanString(error.fbtrace_id, 120),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      endpoint: "meta-capi",
      access_token_configured: Boolean(ACCESS_TOKEN),
      test_event_code_configured: Boolean(TEST_EVENT_CODE),
      pixel_id: PIXEL_ID,
      graph_version: GRAPH_VERSION,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  if (!ACCESS_TOKEN) {
    return res.status(503).json({
      ok: false,
      error: "meta_capi_not_configured",
      access_token_configured: false,
      test_event_code_configured: Boolean(TEST_EVENT_CODE),
    });
  }

  const body = getRequestBody(req);
  const eventName = cleanString(body.event_name, 80);

  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ ok: false, error: "unsupported_event" });
  }

  const cookies = parseCookies(req.headers.cookie || "");
  const forwardedFor = cleanString(req.headers["x-forwarded-for"], 300);
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : req.socket?.remoteAddress;
  const eventId = cleanString(body.event_id, 160) || crypto.randomUUID();
  const value = Number(body.value);
  const numItems = Number(body.num_items);

  const userData = compact({
    client_ip_address: cleanString(clientIp, 100),
    client_user_agent: cleanString(req.headers["user-agent"], 1000),
    fbp: cleanString(body.fbp, 300) || cleanString(cookies._fbp, 300),
    fbc: cleanString(body.fbc, 300) || cleanString(cookies._fbc, 300),
  });

  const customData = compact({
    currency: cleanString(body.currency, 3)?.toUpperCase(),
    value: Number.isFinite(value) && value >= 0 ? value : undefined,
    content_ids: cleanContentIds(body.content_ids),
    content_type: cleanString(body.content_type, 80),
    content_name: cleanString(body.content_name, 300),
    content_category: cleanString(body.content_category, 160),
    num_items: Number.isFinite(numItems) && numItems > 0 ? Math.floor(numItems) : undefined,
  });

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: cleanSourceUrl(body.event_source_url),
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`;
    const metaResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await metaResponse.json().catch(() => ({}));

    if (!metaResponse.ok) {
      const metaError = safeMetaError(result);
      console.error("Meta CAPI request failed", {
        status: metaResponse.status,
        event_name: eventName,
        event_id: eventId,
        response: metaError,
      });
      return res.status(502).json({
        ok: false,
        error: "meta_request_failed",
        meta_status: metaResponse.status,
        meta_error: metaError,
        pixel_id: PIXEL_ID,
        graph_version: GRAPH_VERSION,
        test_event_code_configured: Boolean(TEST_EVENT_CODE),
      });
    }

    return res.status(200).json({
      ok: true,
      event_id: eventId,
      event_name: eventName,
      events_received: result.events_received ?? 1,
      messages: Array.isArray(result.messages) ? result.messages.slice(0, 5) : [],
      pixel_id: PIXEL_ID,
      graph_version: GRAPH_VERSION,
      test_event_code_configured: Boolean(TEST_EVENT_CODE),
    });
  } catch (error) {
    console.error("Meta CAPI transport failed", {
      event_name: eventName,
      event_id: eventId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return res.status(502).json({
      ok: false,
      error: "meta_transport_failed",
      message: error instanceof Error ? error.message : "unknown_error",
      pixel_id: PIXEL_ID,
      graph_version: GRAPH_VERSION,
      test_event_code_configured: Boolean(TEST_EVENT_CODE),
    });
  }
};