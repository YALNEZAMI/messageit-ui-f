import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadStore(file, globals = {}) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  const context = {
    exports,
    require: (name) => {
      if (name === "pinia") {
        return { defineStore: (_name, options) => () => ({
          ...options.state(),
          ...options.actions,
        }) };
      }
      if (name === "@/utils/eventBus") return { eventBus: {} };
      throw new Error(`Unexpected import: ${name}`);
    },
    ...globals,
  };
  vm.runInNewContext(code, context);
  return exports;
}

test("session initialization is shared and not repeated on navigation", async () => {
  const calls = {};
  const count = (name) => {
    calls[name] = (calls[name] ?? 0) + 1;
  };
  const friends = {
    getMyFriends: async () => count("friends"),
    onFriendRequests: async () => count("friendRequestsListener"),
    onFriends: async () => count("friendsListener"),
  };
  const conversations = {
    getInitalConversations: async () => count("conversations"),
    onConversation: async () => count("conversationListener"),
  };
  const statuses = {
    onMessageStatus: () => count("statusListener"),
    setAllConversationsMessagesAsRecieved: async () => count("received"),
  };
  const { useAuthStore } = loadStore("../stores/auth.store.ts", {
    useRuntimeConfig: () => ({ public: { BASE_URL: "" } }),
    useFriendsStore: () => friends,
    useConversationsStore: () => conversations,
    useUsersStore: () => ({ onUser: () => count("userListener") }),
    useMessagesStore: () => ({ onMessage: async () => count("messageListener") }),
    useMessageStatusStore: () => statuses,
    useTypingStore: () => ({ onTyping: () => count("typingListener") }),
  });
  const store = useAuthStore();
  store.accessToken = "session-a";
  await Promise.all([store.initializeSession(), store.initializeSession()]);
  await store.initializeSession();
  assert.equal(calls.friends, 1);
  assert.equal(calls.conversations, 1);
  assert.equal(calls.received, 1);
  assert.equal(calls.messageListener, 1);

  store.accessToken = "session-b";
  await store.initializeSession();
  assert.equal(calls.friends, 2);
  assert.equal(calls.conversations, 2);
  assert.equal(calls.received, 2);
  assert.equal(calls.messageListener, 1);
});

test("a failed initialization can be retried", async () => {
  let attempts = 0;
  const { useAuthStore } = loadStore("../stores/auth.store.ts", {
    useRuntimeConfig: () => ({ public: { BASE_URL: "" } }),
    useFriendsStore: () => ({
      getMyFriends: async () => {
        if (++attempts === 1) throw new Error("offline");
      },
      onFriendRequests: async () => {},
      onFriends: async () => {},
    }),
    useConversationsStore: () => ({
      getInitalConversations: async () => {},
      onConversation: async () => {},
    }),
    useUsersStore: () => ({ onUser: () => {} }),
    useMessagesStore: () => ({ onMessage: async () => {} }),
    useMessageStatusStore: () => ({
      onMessageStatus: () => {},
      setAllConversationsMessagesAsRecieved: async () => {},
    }),
    useTypingStore: () => ({ onTyping: () => {} }),
  });
  const store = useAuthStore();
  store.accessToken = "session-a";
  await assert.rejects(store.initializeSession(), /offline/);
  assert.equal(store.initializedSessionToken, "");
  await store.initializeSession();
  assert.equal(attempts, 2);
  assert.equal(store.initializedSessionToken, "session-a");
});

test("initial delivery receipts are updated for every conversation", async () => {
  const updated = [];
  const service = {
    find: async ({ query }) => query.conversation === "first"
      ? { total: 1, data: [{ _id: "receipt-1" }] }
      : { total: 0, data: [] },
    patch: async (id) => updated.push(id),
    create: async (data) => updated.push(data.conversation),
  };
  const { useMessageStatusStore } = loadStore("../stores/messageStatus.store.ts", {
    useConversationsStore: () => ({ conversations: [{ _id: "first" }, { _id: "second" }] }),
    useUsersStore: () => ({ user: { _id: "user-1" } }),
  });
  const store = useMessageStatusStore();
  store.getService = () => service;
  await store.setAllConversationsMessagesAsRecieved();
  assert.deepEqual(updated.sort(), ["receipt-1", "second"]);
});

test("viewer lookups run in parallel for the current conversation", async () => {
  const pending = [];
  const { useMessageStatusStore } = loadStore("../stores/messageStatus.store.ts", {
    useConversationsStore: () => ({ currentConversation: {
      _id: "conv", members: [{ _id: "me" }, { _id: "a" }, { _id: "b" }],
    } }),
    useUsersStore: () => ({ user: { _id: "me" } }),
  });
  const store = useMessageStatusStore();
  store.getService = () => ({
    find: ({ query }) => new Promise((resolve) => pending.push({ query, resolve })),
  });
  const loading = store.initViewers();
  assert.equal(pending.length, 2);
  assert.deepEqual(pending.map((item) => item.query.viewer), ["a", "b"]);
  for (const item of pending) item.resolve({ data: [] });
  await loading;
});

test("cursor pagination keeps chronological order despite new and deleted messages", async () => {
  const calls = [];
  let allMessages = Array.from({ length: 60 }, (_, i) => ({
    _id: String(i + 1).padStart(3, "0"),
    createdAt: `2024-01-01T00:00:${String(i).padStart(2, "0")}.000Z`,
    type: "message",
  }));
  const service = {
    find: async (params) => {
      calls.push(params);
      const { olderThanId, $limit } = params.query;
      const older = olderThanId ? allMessages.filter((message) => message._id < olderThanId) : allMessages;
      return { total: older.length, data: older.slice(-$limit).reverse() };
    },
  };
  const { useMessagesStore } = loadStore("../stores/messages.store.ts", {
    useRoute: () => ({ params: { id: "conversation-1" } }),
    useMessageStatusStore: () => ({ setConversationMessagesAsSeen: async () => {} }),
  });
  const store = useMessagesStore();
  store.getThisService = () => service;
  await store.getInitialMessages("conversation-1");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].query.$sort.createdAt, -1);
  assert.equal(calls[0].query.conversation, "conversation-1");
  assert.equal(store.hasOlderMessages, true);
  assert.deepEqual(Array.from(store.messages, (message) => message._id),
    allMessages.slice(-25).map((message) => message._id));
  assert.equal(store.isMessagesPulse, false);

  allMessages = allMessages.filter((message) => message._id !== "050");
  allMessages.push({ _id: "061", createdAt: "2024-01-01T00:01:00.000Z", type: "message" });
  await store.appendHistoryMessages();
  assert.equal(calls[1].query.olderThanId, "036");
  assert.equal(calls[1].query.$limit, 25);
  assert.equal(calls[1].query.$sort._id, -1);
  assert.deepEqual(Array.from(store.messages, (message) => message._id),
    Array.from({ length: 50 }, (_, i) => String(i + 11).padStart(3, "0")));
  await store.appendHistoryMessages();
  assert.equal(calls[2].query.olderThanId, "011");
  assert.equal(store.hasOlderMessages, false);
  assert.deepEqual(Array.from(store.messages, (message) => message._id),
    Array.from({ length: 60 }, (_, i) => String(i + 1).padStart(3, "0")));

  store.getThisService = () => ({ find: async () => { throw new Error("offline"); } });
  await assert.rejects(store.getInitialMessages("conversation-1"), /offline/);
  assert.equal(store.isMessagesPulse, false);
});

test("stale history responses cannot replace a different conversation", async () => {
  let resolveOld;
  const { useMessagesStore } = loadStore("../stores/messages.store.ts");
  const store = useMessagesStore();
  store.getThisService = () => ({
    find: ({ query }) => query.conversation === "old"
      ? new Promise((resolve) => { resolveOld = resolve; })
      : Promise.resolve({ data: [{ _id: "new", createdAt: "2024-01-01", type: "message" }] }),
  });
  const old = store.getInitialMessages("old");
  await store.getInitialMessages("new");
  resolveOld({ data: [{ _id: "old", createdAt: "2024-01-01", type: "message" }] });
  await old;
  assert.deepEqual(Array.from(store.messages, (message) => message._id), ["new"]);
  assert.equal(store.historyConversationId, "new");
});
