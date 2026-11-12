import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function load(file, globals = {}, modules = {}) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name in modules) return modules[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    ...globals,
  });
  return exports;
}

test("switching tabs within a conversation does not refetch its history", async () => {
  const calls = [];
  const store = {
    currentConversation: { _id: "one" },
    getConversation: async (id) => {
      calls.push("conversation");
      return { _id: id, members: [{ _id: "me" }] };
    },
    setCurrentConversation: async (conv) => { store.currentConversation = conv; },
  };
  const middleware = load("../middleware/conversations.ts", {
    defineNuxtRouteMiddleware: (fn) => fn,
    useConversationsStore: () => store,
    useUsersStore: () => ({ user: { _id: "me" } }),
    useMessagesStore: () => ({ getInitialMessages: async () => calls.push("messages") }),
    useEmojisStore: () => ({ onEmoji: () => calls.push("emoji") }),
  }, {
    "@/utils/eventBus": { eventBus: { emit: () => {} } },
    "~/stores/messageStatus.store": { useMessageStatusStore: () => ({ initViewers: async () => calls.push("viewers") }) },
  }).default;
  await middleware({ params: { id: "one" } }, { params: { id: "one" } });
  assert.deepEqual(calls, []);
  await middleware({ params: { id: "two" } }, { params: { id: "one" } });
  assert.deepEqual(calls, ["conversation", "messages", "viewers", "emoji"]);
});

test("local search finds private, group and assistant conversations", () => {
  const { filterConversations } = load("../utils/conversationSearch.ts");
  const conversations = [
    { _id: "1", type: "private", members: [{ _id: "me", name: "Moi" }, { _id: "you", name: "Alice" }] },
    { _id: "2", type: "group", name: "Projet", members: [] },
    { _id: "3", type: "ai", members: [] },
  ];
  assert.deepEqual(Array.from(filterConversations(conversations, " ALI ", "me"), c => c._id), ["1"]);
  assert.deepEqual(Array.from(filterConversations(conversations, "pro", "me"), c => c._id), ["2"]);
  assert.deepEqual(Array.from(filterConversations(conversations, "BOBY", "me"), c => c._id), ["3"]);
  assert.equal(filterConversations(conversations, " ", "me").length, 3);
});
