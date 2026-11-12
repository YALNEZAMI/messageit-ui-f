import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("profile and conversation photo uploads report HTTP and malformed response errors", async () => {
  const source = readFileSync(new URL("../stores/upload.store.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  let response;
  const context = {
    exports,
    require: (name) => {
      if (name === "pinia") return { defineStore: (_name, options) => () => options.actions };
      throw new Error(`Unexpected import: ${name}`);
    },
    FormData: class { append() {} },
    fetch: async () => response,
    useConversationsStore: () => ({ currentConversation: { _id: "conversation" } }),
    useUsersStore: () => ({ user: { _id: "user" } }),
  };
  vm.runInNewContext(code, context);
  const store = exports.useUploadStore();

  for (const upload of [store.uploadConversationPhoto, store.uploadProfilePhoto]) {
    response = { ok: false, status: 500 };
    await assert.rejects(upload({}), /500/);
    response = { ok: true, json: async () => ({}) };
    await assert.rejects(upload({}), /pas renvoyé/);
    response = { ok: true, json: async () => ({ path: "/photo.png" }) };
    assert.equal((await upload({})).path, "/photo.png");
  }
});
