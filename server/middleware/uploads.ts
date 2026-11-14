// server/middleware/uploads.ts
import { defineEventHandler, fromNodeMiddleware } from "h3";
import serveStatic from "serve-static";
import { join } from "path";

const serveUploads = fromNodeMiddleware(
  serveStatic(join(process.cwd(), "public/uploads"), {
    index: false,
    maxAge: 3600,
  })
);

export default defineEventHandler(async (event) => {
  const url = event.node.req.url;
  if (!url?.startsWith("/uploads/")) return;
  event.node.req.url = url.slice("/uploads".length);
  try {
    return await serveUploads(event);
  } finally {
    event.node.req.url = url;
  }
});
