import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, effectScope, nextTick, reactive, ref, watch } from "vue";
import ts from "typescript";

function setup({ friends = [], load = async () => {}, create = async () => {} } = {}) {
  const source = readFileSync(new URL("../pages/private-space/createGroup/index.vue", import.meta.url), "utf8");
  const descriptor = parse(source).descriptor;
  const script = compileScript(descriptor, { id: "create-group" }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const friendsStore = reactive({ friends, getMyFriends: load });
  let mounted;
  const errors = [];
  vm.runInNewContext(code, {
    exports, ref, computed, watch,
    console: { error: (...args) => errors.push(args) },
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      throw new Error(`Unexpected import: ${name}`);
    },
    useFriendsStore: () => friendsStore,
    useConversationsStore: () => ({ createGroup: create }),
    onMounted: (fn) => { mounted = fn; },
    definePageMeta: () => {},
  });
  const scope = effectScope();
  const component = scope.run(() => exports.default.setup({}, { expose: () => {} }));
  return { component, friendsStore, mounted, errors, scope, template: descriptor.template.content };
}

test("selection, search and validation preserve selected friends across searches", async () => {
  const calls = [];
  const { component: c, mounted, scope, template } = setup({
    friends: [{ _id: "a", name: "Alice" }, { _id: "b", name: "Bob" }, { _id: "c", name: "Clara" }],
    create: async (group) => { calls.push(group); group.members.push("me"); },
  });
  await mounted();
  await c.createGroup();
  assert.match(c.formError.value, /nom/);
  assert.equal(c.nameInvalid.value, true);
  c.groupName.value = "  Vacances  ";
  c.toggleFriend("a");
  await c.createGroup();
  assert.match(c.formError.value, /deux amis/);
  c.search.value = "BO";
  assert.deepEqual(Array.from(c.filteredFriends.value, (friend) => friend._id), ["b"]);
  c.toggleFriend("b");
  assert.deepEqual(Array.from(c.selectedFriends.value, (friend) => friend._id), ["a", "b"]);
  await c.createGroup();
  assert.equal(calls[0].name, "Vacances");
  assert.deepEqual(Array.from(calls[0].members), ["a", "b", "me"]);
  assert.deepEqual(Array.from(c.selectedIds.value), ["a", "b"]);
  assert.match(template, /type="checkbox"/);
  assert.match(template, /type="submit"/);
  scope.stop();
});

test("creation handles failures and prevents repeated submissions", async () => {
  let resolve;
  let calls = 0;
  const { component: c, mounted, errors, scope } = setup({
    friends: [{ _id: "a" }, { _id: "b" }],
    create: () => {
      calls++;
      return new Promise((_, reject) => { resolve = reject; });
    },
  });
  await mounted();
  c.groupName.value = "Projet";
  c.toggleFriend("a");
  c.toggleFriend("b");
  const pending = c.createGroup();
  await c.createGroup();
  assert.equal(calls, 1);
  assert.equal(c.creating.value, true);
  resolve(new Error("offline"));
  await pending;
  assert.match(c.formError.value, /réessayer/);
  assert.equal(c.creating.value, false);
  assert.equal(errors.length, 1);
  scope.stop();
});

test("friend loading can be retried and removed friends are deselected", async () => {
  let attempts = 0;
  const { component: c, friendsStore, mounted, scope } = setup({
    friends: [{ _id: "a" }, { _id: "b" }],
    load: async () => { if (++attempts === 1) throw new Error("offline"); },
  });
  await mounted();
  assert.match(c.loadError.value, /Impossible/);
  await c.loadFriends();
  assert.equal(c.loadError.value, "");
  c.toggleFriend("a");
  c.toggleFriend("b");
  friendsStore.friends = [{ _id: "b" }];
  await nextTick();
  assert.deepEqual(Array.from(c.selectedIds.value), ["b"]);
  scope.stop();
});

test("friend loading resets its shared loading state on error", async () => {
  const source = readFileSync(new URL("../stores/friends.store.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "pinia") return { defineStore: (_name, options) => () => ({ ...options.state(), ...options.actions }) };
      throw new Error(`Unexpected import: ${name}`);
    },
    useUsersStore: () => ({ user: { _id: "me" } }),
  });
  const store = exports.useFriendsStore();
  store.getService = () => ({ find: async () => { throw new Error("offline"); } });
  await assert.rejects(() => store.getMyFriends(), /offline/);
  assert.equal(store.isFriendsPulse, false);
});
