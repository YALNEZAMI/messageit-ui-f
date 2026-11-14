import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createApp, toNodeListener } from "h3";
import ts from "typescript";

test("upload middleware serves only files under the uploads URL", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "messageit-uploads-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "public/uploads/profilesPhotos"), { recursive: true });
  await writeFile(join(directory, "public/uploads/profilesPhotos/photo.txt"), "test-image");
  await writeFile(join(directory, "public/hidden.txt"), "other-file");

  const source = await readFile(new URL("../server/middleware/uploads.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: createRequire(import.meta.url),
    process: { cwd: () => directory },
  });

  const app = createApp();
  app.use(exports.default);
  const server = createServer(toNodeListener(app));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const response = await fetch(`${base}/uploads/profilesPhotos/photo.txt`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "test-image");
  assert.equal((await fetch(`${base}/profilesPhotos/photo.txt`)).status, 404);
  assert.equal((await fetch(`${base}/uploads/not-found.txt`)).status, 404);
  const traversal = await fetch(`${base}/uploads/profilesPhotos/%2e%2e%2f%2e%2e%2fhidden.txt`);
  assert.notEqual(traversal.status, 200);
});
