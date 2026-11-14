import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { nextTick, reactive, ref, watch } from "vue";
import ts from "typescript";

test("conversation search switches modes, ignores stale responses and displays errors", async () => {
  const source = readFileSync(new URL("../pages/conversations/[id]/search/index.vue", import.meta.url), "utf8");
  const script = compileScript(parse(source).descriptor, { id: "semantic-search" }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const pending = [];
  const textQueries = [];
  const route = reactive({ params: { id: "conv" } });
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      throw new Error(`Unexpected import: ${name}`);
    },
    ref, watch, setTimeout, clearTimeout,
    onBeforeUnmount: () => {},
    definePageMeta: () => {},
    useRoute: () => route,
    useRuntimeConfig: () => ({ public: { FEATHERS_URL: "http://localhost:3030" } }),
    useAuthStore: () => ({ accessToken: "test-token" }),
    useMessagesStore: () => ({ getThisService: () => ({
      find: async ({ query }) => { textQueries.push(query); return [{ _id: "text" }]; },
    }) }),
    $fetch: (url, options) => new Promise((resolve, reject) => pending.push({ url, options, resolve, reject })),
  });
  const component = exports.default.setup({}, { expose: () => {} });
  component.key.value = "plage";
  await component.search();
  assert.equal(textQueries[0].key, "plage");
  assert.equal(component.messages.value[0]._id, "text");

  component.setMode("semantic");
  const first = component.search();
  assert.equal(pending[0].options.query.searchMode, "semantic");
  assert.equal(pending[0].options.query.conversation, "conv");
  assert.equal(pending[0].options.headers.Authorization, "Bearer test-token");
  component.key.value = "voyage";
  component.onInput();
  const second = component.search();
  pending[1].resolve([{ _id: "new" }]);
  await second;
  pending[0].resolve([{ _id: "old" }]);
  await first;
  assert.equal(component.messages.value[0]._id, "new");

  component.key.value = "autre";
  component.onInput();
  const failed = component.search();
  pending[2].reject({ data: { message: "Ollama indisponible" } });
  await failed;
  assert.equal(component.error.value, "Ollama indisponible");
  assert.equal(component.loading.value, false);

  component.key.value = "ancienne conversation";
  const oldConversation = component.search();
  route.params.id = "another";
  await nextTick();
  pending[3].resolve([{ _id: "old-conversation-message" }]);
  await oldConversation;
  assert.equal(component.messages.value.length, 0);
  assert.equal(component.key.value, "");
});
