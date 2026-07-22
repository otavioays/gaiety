const UPSTREAM_URL =
  process.env.TRACKING_UPSTREAM_URL || "https://track.gaiety.cloud/api/events";
const MAX_BODY_BYTES = 256 * 1024;
const UPSTREAM_TIMEOUT_MS = 7000;

function cleanHeader(value, maxLength = 2000) {
  if (typeof value !== "string") return undefined;
  const clean = value.trim().slice(0, maxLength);
  return clean || undefined;
}

function firstForwardedIp(request) {
  const forwarded = cleanHeader(request.headers["x-forwarded-for"], 500);
  if (forwarded) return forwarded.split(",")[0].trim();
  return cleanHeader(request.headers["x-real-ip"], 100);
}

function serializeBody(request) {
  if (typeof request.body === "string") return request.body;
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  if (request.body && typeof request.body === "object") {
    return JSON.stringify(request.body);
  }
  return "";
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");

  if (request.method === "GET") {
    return response.status(200).json({
      ok: true,
      endpoint: "tracking-proxy",
      upstream: new URL(UPSTREAM_URL).host,
    });
  }

  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "GET, POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST, OPTIONS");
    return response.status(405).json({
      ok: false,
      error: "method_not_allowed",
      method: request.method,
    });
  }

  const body = serializeBody(request);
  if (!body) {
    return response.status(400).json({ ok: false, error: "empty_body" });
  }

  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return response.status(413).json({ ok: false, error: "payload_too_large" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  const clientIp = firstForwardedIp(request);

  try {
    const upstreamResponse = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": cleanHeader(request.headers["user-agent"], 1000) || "gaiety-tracking-proxy/1.0",
        ...(clientIp
          ? {
              "X-Forwarded-For": clientIp,
              "X-Real-IP": clientIp,
            }
          : {}),
        "X-Forwarded-Host": cleanHeader(request.headers.host, 300) || "www.gaiety.cloud",
        "X-Forwarded-Proto": "https",
        Origin: "https://www.gaiety.cloud",
        Referer: cleanHeader(request.headers.referer, 2000) || "https://www.gaiety.cloud/",
      },
      body,
      signal: controller.signal,
    });

    const responseBody = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) response.setHeader("Content-Type", contentType);

    return response.status(upstreamResponse.status).send(responseBody);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return response.status(502).json({
      ok: false,
      error: timedOut ? "tracking_upstream_timeout" : "tracking_upstream_failed",
    });
  } finally {
    clearTimeout(timeout);
  }
}
