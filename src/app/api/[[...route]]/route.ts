import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({
    ok: true,
    message: "API is healthy",
  });
});

const handler = handle(app);

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
