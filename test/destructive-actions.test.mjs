import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, ref } from "vue";
import ts from "typescript";

function loadComponent(file, globals = {}, modules = {}, props = {}) {
  const descriptor = parse(readFileSync(new URL(file, import.meta.url), "utf8")).descriptor;
  const script = compileScript(descriptor, { id: "test-actions" }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, ref, computed, console: { error() {} },
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      if (name in modules) return modules[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    onMounted() {}, onBeforeUnmount() {}, definePageMeta() {}, ...globals,
  });
  return { component: exports.default.setup(props, { expose() {}, emit() {} }), template: descriptor.template.content };
}

test("message deletion requires confirmation, preserves scope and retries only remaining messages", async () => {
  const calls = [];
  let fail = true;
  const first = { _id: "a", text: "one", sender: { _id: "me" } };
  const second = { _id: "b", text: "two", sender: { _id: "me" } };
  const store = {
    messages: [first, second],
    deleteForAll: async (id) => {
      calls.push(["all", id]);
      if (id === "b" && fail) { fail = false; throw new Error("offline"); }
    },
    deleteForMe: async (id) => calls.push(["me", id]),
  };
  const { component: c, template } = loadComponent("../pages/conversations/[id]/messages.vue", {
    useMessagesStore: () => store,
    useAudioStore: () => ({ runWipeDelete() {} }),
    useUsersStore: () => ({ user: { _id: "me" } }),
  }, { "@/utils/eventBus": { eventBus: {} } });
  c.selectingMode.value = true;
  c.selectedMessages.value = [first, second];
  c.requestDelete("all");
  assert.equal(calls.length, 0);
  assert.match(c.deleteDescription.value, /tous/);
  await c.confirmDeleteMessages();
  assert.deepEqual(calls.map((entry) => entry[1]), ["a", "b"]);
  assert.match(c.deleteError.value, /échoué/);
  assert.deepEqual(Array.from(c.deleteIds.value), ["b"]);
  await c.confirmDeleteMessages();
  assert.deepEqual(calls.map((entry) => entry[1]), ["a", "b", "b"]);
  assert.equal(c.deleteMode.value, null);
  assert.equal(c.selectedMessages.value.length, 0);
  c.selectingMode.value = true;
  c.selectedMessages.value = [first];
  c.requestDelete("me");
  c.cancelDelete();
  assert.equal(calls.length, 3);
  assert.match(template, /ConfirmDialog/);
});

test("transfer retry resumes after messages already sent", async () => {
  const calls = [];
  let failed = false;
  const { component: c } = loadComponent("../components/transfer/index.vue", {
    useMessagesStore: () => ({ transfer: async (message) => {
      calls.push(message.text);
      if (message.text === "two" && !failed) {
        failed = true;
        throw new Error("offline");
      }
    } }),
  }, { "~/utils/conversationSearch": { filterConversations: (items) => items } }, {
    messagesToSend: [{ text: "one" }, { text: "two" }],
  });
  await c.send({ _id: "destination" });
  assert.match(c.sendError.value, /restants/);
  await c.send({ _id: "destination" });
  assert.deepEqual(calls, ["one", "two", "two"]);
  assert.equal(c.sentTab.value.includes("destination"), true);
});

test("transfer dialog has a top close button and keeps transferred selection for multiple destinations", async () => {
  const { template } = loadComponent("../components/transfer/index.vue", {
    useConversationsStore: () => ({ conversations: [], currentConversation: {} }),
    useUsersStore: () => ({ user: {} }),
  }, { "~/utils/conversationSearch": { filterConversations: (items) => items } });
  assert.match(template, /class="transfer-close"[^>]*aria-label="Fermer le transfert"/);
  assert.doesNotMatch(template, />\s*Terminer\s*</);
  assert.match(template, /class="transfer-search-icon"/);
  const page = parse(readFileSync(new URL("../pages/conversations/[id]/messages.vue", import.meta.url), "utf8")).descriptor;
  assert.doesNotMatch(page.template.content, /@send="sendFromTransfer/);
});

test("destructive actions open the shared confirmation dialog", () => {
  for (const [file, trigger] of [
    ["../pages/conversations/[id]/settings/index.vue", /confirmLeave = true/],
    ["../pages/private-space/profile/index.vue", /confirmDelete = true/],
    ["../components/user/index.vue", /confirmRemove = true/],
    ["../components/conversation/members/options.vue", /confirmRemoval = true/],
  ]) {
    const template = parse(readFileSync(new URL(file, import.meta.url), "utf8")).descriptor.template.content;
    assert.match(template, trigger);
    assert.match(template, /<ConfirmDialog/);
  }
});
