import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, effectScope, nextTick, reactive, ref, watch } from "vue";
import ts from "typescript";

function setup(path, globals = {}) {
  const descriptor = parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8")).descriptor;
  const script = compileScript(descriptor, { id: path }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const bus = globals.eventBus ?? { on() {}, off() {}, emit() {} };
  vm.runInNewContext(code, {
    exports, ref, computed, watch, console, eventBus: bus,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      if (name === "@/utils/eventBus") return { eventBus: bus };
      throw new Error(`Unexpected import: ${name}`);
    },
    onMounted() {}, onUnmounted() {}, onBeforeUnmount() {}, definePageMeta() {},
    ...globals,
  });
  const scope = effectScope();
  const component = scope.run(() => exports.default.setup(globals.props ?? {}, { expose() {} }));
  return { component, scope, template: descriptor.template.content };
}

test("composer sends on Enter, preserves Shift+Enter and ignores IME and repeated keys", async () => {
  const sent = [];
  let resolve;
  const conversation = { _id: "c", type: "private", theme: { emoji: "👍" } };
  const { component: c, scope, template } = setup("components/messageInput/index.vue", {
    useConversationsStore: () => ({ currentConversation: conversation }),
    useMessagesStore: () => ({ send: (msg) => { sent.push(msg); return new Promise((done) => { resolve = done; }); } }),
  });
  const key = (options = {}) => {
    const event = { key: "Enter", preventDefault() { this.prevented = true; }, ...options };
    c.handleKeydown(event);
    return event;
  };
  c.message.value.text = "hello\nworld";
  assert.equal(key({ shiftKey: true }).prevented, undefined);
  assert.equal(key({ isComposing: true }).prevented, undefined);
  assert.equal(key({ ctrlKey: true }).prevented, undefined);
  assert.equal(key({ repeat: true }).prevented, true);
  assert.equal(sent.length, 0);
  assert.equal(key().prevented, true);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].text, "hello\nworld");
  c.message.value.text = "next";
  key();
  assert.equal(sent.length, 1);
  resolve();
  await nextTick();
  await Promise.resolve();
  assert.equal(c.message.value.text, "next");
  assert.match(template, /@keydown="handleKeydown"/);
  scope.stop();
});

test("notifications merge both kinds by date and keep missing dates last", async () => {
  const store = reactive({
    friendRequests: [{ _id: "same", createdAt: "2025-01-01", sender: { name: "A" } }, { _id: "old" }],
    acceptations: [{ _id: "same", createdAt: "2025-02-01", recipient: { name: "B" } }],
    isFriendRequestsPulse: false, isAcceptationsPulse: false,
  });
  const { component: c, scope, template } = setup("pages/private-space/notifications/index.vue", { useFriendsStore: () => store });
  assert.deepEqual(Array.from(c.notifications.value, (item) => item.kind), ["accepted", "request", "request"]);
  assert.equal(c.notifications.value[0].person.name, "B");
  store.isFriendRequestsPulse = true;
  assert.equal(c.isLoading.value, true);
  assert.match(template, /item\.kind.*item\.notification\._id/);
  scope.stop();
});

test("notification stores select received requests and acceptance records, then mark only displayed records", async () => {
  const source = readFileSync(new URL("../stores/friends.store.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const patched = [];
  const records = {
    "friend-requests": [
      { _id: "received", sender: "alice", recipient: "me" },
      { _id: "sent", sender: "me", recipient: "bob" },
    ],
    "friend-acceptations": [
      { _id: "mine", sender: "me", recipient: "bob", seen: false },
      { _id: "theirs", sender: "alice", recipient: "me", seen: false },
    ],
  };
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "pinia") return { defineStore: (_name, options) => () => ({ ...options.state(), ...options.actions }) };
      if (name === "@/utils/eventBus") return { eventBus: { emit() {} } };
      throw new Error(`Unexpected import: ${name}`);
    },
    useUsersStore: () => ({ user: { _id: "me" }, getUser: async (id) => ({ _id: id }) }),
    useNuxtApp: () => ({ $removeDuplicateById: (items) => items }),
  });
  const store = exports.useFriendsStore();
  store.getService = (name) => ({
    find: async () => ({ data: records[name] }),
    patch: async (id) => { patched.push([name, id]); },
  });
  await store.getFriendRequestsSentToMe();
  await store.getAcceptedFriendRequests();
  assert.deepEqual(Array.from(store.friendRequests, (item) => item._id), ["received"]);
  assert.equal(store.friendRequests[0].sender._id, "alice");
  assert.deepEqual(Array.from(store.acceptations, (item) => item._id), ["mine"]);
  await store.clearAcceptations(["mine"]);
  assert.deepEqual(patched, [["friend-acceptations", "mine"]]);
  assert.equal(store.acceptations.length, 0);
  store.getService = () => ({ find: async () => { throw new Error("offline"); } });
  await assert.rejects(() => store.getAcceptedFriendRequests(), /offline/);
  assert.equal(store.isAcceptationsPulse, false);
});

test("presence follows updates without mutating props and unsubscribes", async () => {
  const callbacks = {};
  const bus = { on: (name, fn) => { callbacks[name] = fn; }, off: (name, fn) => { assert.equal(callbacks[name], fn); delete callbacks[name]; } };
  let cleanup;
  const props = reactive({ user: { _id: "u", onLine: false } });
  const { component: c, scope } = setup("components/status/index.vue", {
    props, eventBus: bus, onBeforeUnmount: (fn) => { cleanup = fn; },
  });
  callbacks.userPatched({ _id: "other", onLine: true });
  assert.equal(c.online.value, false);
  callbacks.userPatched({ _id: "u", onLine: true });
  assert.equal(c.online.value, true);
  assert.equal(props.user.onLine, false);
  props.user = { _id: "v", onLine: false };
  await nextTick();
  assert.equal(c.online.value, false);
  cleanup();
  assert.equal(callbacks.userPatched, undefined);
  scope.stop();
});

test("header reads the reactive store and profile photo URLs change on upload", () => {
  const header = parse(readFileSync(new URL("../components/images/header.vue", import.meta.url), "utf8")).descriptor.template.content;
  const profile = readFileSync(new URL("../pages/private-space/profile/index.vue", import.meta.url), "utf8");
  assert.match(header, /:src="usersStore\.user\.image"/);
  assert.match(header, /:fallback="usersStore\.defaultUserImg"/);
  assert.match(profile, /url\.searchParams\.set\("v", String\(Date\.now\(\)\)\)/);
});
