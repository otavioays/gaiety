export default function handler(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  return response.status(200).json({
    ok: true,
    function: "ping",
    method: request.method,
    runtime: "vercel-node",
    timestamp: new Date().toISOString(),
  });
}
