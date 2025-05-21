// server/middleware/uploads.ts
import { defineEventHandler, fromNodeMiddleware } from "h3";
import serveStatic from "serve-static";
import { join } from "path";

export default fromNodeMiddleware(
  serveStatic(join(process.cwd(), "public/uploads/messageFiles"), {
    index: false,
    maxAge: 3600,
  })
);
