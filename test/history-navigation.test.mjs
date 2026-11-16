import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, nextTick, ref } from "vue";
import ts from "typescript";

function setup(store, elements = {}) {
  const descriptor = parse(readFileSync(new URL("../pages/conversations/[id]/messages.vue", import.meta.url), "utf8")).descriptor;
  const code = ts.transpileModule(compileScript(descriptor, { id: "history" }).content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const container = { scrollHeight: 1000, scrollTop: 100, clientHeight: 400 };
  let mounted;
  const bus = { on() {}, off() {} };
  vm.runInNewContext(code, {
    exports, ref, computed, nextTick, console, setTimeout, clearTimeout,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      if (name === "@/utils/eventBus") return { eventBus: bus };
      throw new Error(name);
    },
    document: {
      getElementById: (id) => id === "messagesContainer" ? container : elements[id] || null,
      querySelectorAll: () => [],
    },
    onMounted: (fn) => { mounted = fn; }, onBeforeUnmount() {}, watch() {}, definePageMeta() {},
    useMessagesStore: () => store,
    useRoute: () => ({ params: { id: "conversation" }, query: {} }),
    useMessageStatusStore: () => ({ getLastSeenMessageId: async () => null, setConversationMessagesAsSeen: async () => {} }),
  });
  const component = exports.default.setup({}, { expose() {} });
  mounted();
  return { component, container, template: descriptor.template.content };
}

test("navigation loads older pages, highlights the target and stops when unavailable", async () => {
  const elements = {};
  let calls = 0;
  let focused = false;
  const classes = new Set();
  const target = { scrollIntoView: () => { focused = true; }, classList: {
    add: (value) => classes.add(value), remove: (value) => classes.delete(value),
  } };
  const store = {
    messages: [], historyConversationId: "conversation", hasOlderMessages: true,
    appendHistoryMessages: async () => {
      if (++calls === 3) { elements.target = target; store.hasOlderMessages = false; }
      return true;
    },
  };
  const { component } = setup(store, elements);
  await nextTick();
  await component.goToMessage("target", true);
  assert.equal(calls, 3);
  assert.equal(focused, true);
  assert(classes.has("searchedMessage"));
  await component.goToMessage("missing", true);
  assert.match(component.navigationNotice.value, /plus disponible/);
  assert.equal(calls, 3);
});

test("history loading preserves scroll position and exposes retry on failure", async () => {
  let fail = true;
  const store = {
    messages: [], historyConversationId: "conversation", hasOlderMessages: true,
    appendHistoryMessages: async () => {
      if (fail) throw new Error("offline");
      container.scrollHeight += 300;
      return true;
    },
  };
  const { component, container } = setup(store);
  await new Promise((resolve) => setImmediate(resolve));
  container.scrollTop = 100;
  assert.equal(await component.loadHistory(), false);
  assert.match(component.historyError.value, /Impossible/);
  fail = false;
  assert.equal(await component.loadHistory(), true);
  assert.equal(container.scrollTop, 400);
  assert.equal(component.historyError.value, "");
});

test("search results are accessible links to the message", () => {
  const template = parse(readFileSync(new URL("../pages/conversations/[id]/search/index.vue", import.meta.url), "utf8")).descriptor.template.content;
  assert.match(template, /<NuxtLink v-for="msg in messages"/);
  assert.match(template, /query: \{ messageId: msg\._id \}/);
});
