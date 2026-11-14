import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, effectScope, nextTick, reactive, ref, watch } from "vue";
import ts from "typescript";
import mitt from "mitt";

function compile(file) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

function makeSidebar(conversations, statuses, eventBus) {
  const source = readFileSync(new URL("../components/conversation/sideBar.vue", import.meta.url), "utf8");
  const script = compileScript(parse(source).descriptor, { id: "sidebar" }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const helper = {};
  vm.runInNewContext(compile("../utils/conversationSearch.ts"), { exports: helper });
  const exports = {};
  let cleanup;
  vm.runInNewContext(code, {
    exports, ref, computed, watch, console,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      if (name === "~/utils/eventBus") return { eventBus };
      if (name === "~/utils/conversationSearch") return helper;
      throw new Error(`Unexpected import: ${name}`);
    },
    useConversationsStore: () => conversations,
    useMessageStatusStore: () => statuses,
    useUsersStore: () => ({ user: { _id: "me" } }),
    onBeforeUnmount: (fn) => { cleanup = fn; },
  });
  const scope = effectScope();
  const component = scope.run(() => exports.default.setup({}, { expose: () => {}, emit: () => {} }));
  return { component, dispose: () => { cleanup(); scope.stop(); } };
}

const message = (id, sender = "other") => ({ _id: id, sender, type: "message", text: "Bonjour" });
const flush = async () => { await Promise.resolve(); await nextTick(); await Promise.resolve(); };

test("group and unread filters combine with search and update with read receipts", async () => {
  const store = reactive({ currentConversation: { _id: "private" }, conversations: [
    { _id: "private", type: "private", members: [{ _id: "me" }, { _id: "other", name: "Alice" }], lastMessage: message("a") },
    { _id: "group", type: "group", name: "Projet", members: [], lastMessage: message("b") },
    { _id: "own", type: "group", name: "Personnel", members: [], lastMessage: message("c", "me") },
  ] });
  const bus = mitt();
  const sidebar = makeSidebar(store, { isSeenBy: async (id) => id === "b" }, bus);
  const c = sidebar.component;
  await flush();
  c.setFilterCategory({ value: "groups" });
  assert.deepEqual(Array.from(c.filteredConversations.value, (conv) => conv._id), ["group", "own"]);
  c.onInput("pro");
  assert.deepEqual(Array.from(c.filteredConversations.value, (conv) => conv._id), ["group"]);
  c.onInput("");
  c.setFilterCategory({ value: "unread" });
  assert.deepEqual(Array.from(c.filteredConversations.value, (conv) => conv._id), ["private"]);
  bus.emit("seeing", { viewer: "me", conversation: "private", message: "a" });
  assert.equal(c.filteredConversations.value.length, 0);
  store.conversations[1].lastMessage = message("new");
  await flush();
  assert.deepEqual(Array.from(c.filteredConversations.value, (conv) => conv._id), ["group"]);
  bus.emit("seeing", { viewer: "other", conversation: "group", message: "new" });
  assert.equal(c.filteredConversations.value.length, 1);
  store.conversations = store.conversations.filter((conv) => conv._id !== "group");
  await nextTick();
  assert.equal(c.filteredConversations.value.length, 0);
  sidebar.dispose();
});

test("stale read checks cannot override newer messages or read events", async () => {
  const pending = [];
  const store = reactive({ conversations: [
    { _id: "one", type: "group", name: "Test", members: [], lastMessage: message("old") },
  ] });
  const bus = mitt();
  const sidebar = makeSidebar(store, { isSeenBy: (id) => new Promise((resolve) => pending.push({ id, resolve })) }, bus);
  const c = sidebar.component;
  c.setFilterCategory({ value: "unread" });
  store.conversations[0].lastMessage = message("new");
  await nextTick();
  pending[1].resolve(false);
  await flush();
  pending[0].resolve(true);
  await flush();
  assert.equal(c.filteredConversations.value.length, 1);
  bus.emit("seeing", { viewer: "me", conversation: "one", message: "new" });
  assert.equal(c.filteredConversations.value.length, 0);
  store.conversations[0].lastMessage = message("latest");
  bus.emit("seeing", { viewer: "me", conversation: "one", message: "latest" });
  pending[2].resolve(false);
  await flush();
  assert.equal(c.filteredConversations.value.length, 0);
  sidebar.dispose();
});

test("failed unread lookups are visible and can be retried", async () => {
  let attempts = 0;
  const store = reactive({ conversations: [
    { _id: "one", type: "group", name: "Test", members: [], lastMessage: message("a") },
  ] });
  const sidebar = makeSidebar(store, {
    isSeenBy: async () => {
      if (++attempts === 1) throw new Error("offline");
      return false;
    },
  }, mitt());
  await flush();
  assert.equal(sidebar.component.hasStatusErrors.value, true);
  sidebar.component.retryUnreadStatuses();
  await flush();
  assert.equal(sidebar.component.hasStatusErrors.value, false);
  sidebar.component.setFilterCategory({ value: "unread" });
  assert.equal(sidebar.component.filteredConversations.value.length, 1);
  sidebar.dispose();
});

test("opening a conversation marks every loaded unseen message as read", async () => {
  const exports = {};
  const receipts = [];
  const bus = mitt();
  const events = [];
  bus.on("seeing", (event) => events.push(event.message));
  vm.runInNewContext(compile("../stores/messageStatus.store.ts"), {
    exports,
    require: (name) => {
      if (name === "pinia") return { defineStore: (_name, options) => () => ({ ...options.state(), ...options.actions }) };
      if (name === "@/utils/eventBus") return { eventBus: bus };
      throw new Error(`Unexpected import: ${name}`);
    },
    useConversationsStore: () => ({ currentConversation: { _id: "conv" } }),
    useUsersStore: () => ({ user: { _id: "me" } }),
    useMessagesStore: () => ({ messages: [message("a"), message("b"), message("c")] }),
  });
  const store = exports.useMessageStatusStore();
  store.getService = () => ({
    find: async () => ({ data: [{ message: "a" }] }),
    create: async (data) => { receipts.push(data); return data; },
  });
  await store.setConversationMessagesAsSeen();
  assert.deepEqual(receipts.map((receipt) => receipt.message).sort(), ["b", "c"]);
  assert.deepEqual(events.sort(), ["b", "c"]);
});

test("sending a message updates the latest message and registers one creation listener", async () => {
  const exports = {};
  const listeners = [];
  const latest = [];
  const conversationStore = {
    currentConversation: { _id: "conv", type: "private" },
    removeConversationDraft: () => {},
    setLastMessage: (msg, id) => latest.push({ msg, id }),
  };
  vm.runInNewContext(compile("../stores/messages.store.ts"), {
    exports, setTimeout, clearTimeout,
    require: (name) => {
      if (name === "pinia") return { defineStore: (_name, options) => () => ({ ...options.state(), ...options.actions }) };
      if (name === "@/utils/eventBus") return { eventBus: mitt() };
      throw new Error(`Unexpected import: ${name}`);
    },
    useConversationsStore: () => conversationStore,
    useUsersStore: () => ({ user: { _id: "me" } }),
  });
  const store = exports.useMessagesStore();
  const sent = message("sent", "me");
  store.getThisService = () => ({
    create: async () => sent,
    on: (event) => listeners.push(event),
  });
  store.handleAiDelay = () => {};
  store.handleTemporaryMessage = () => {};
  store.popTemporaryMessage = () => {};
  await store.send(message("draft", "me"), "conv");
  assert.equal(latest[0].msg._id, "sent");
  assert.equal(latest[0].id, "conv");
  await store.onMessage();
  assert.equal(listeners.filter((event) => event === "created").length, 1);
});
