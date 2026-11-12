import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { nextTick, reactive, ref, watch } from "vue";
import ts from "typescript";

test("image fallback handles missing, broken and changed sources", async () => {
  const source = readFileSync(new URL("../components/images/fallback.vue", import.meta.url), "utf8");
  const script = compileScript(parse(source).descriptor, { id: "image-fallback" }).content;
  const code = ts.transpileModule(script, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      throw new Error(`Unexpected import: ${name}`);
    },
    ref,
    watch,
  });

  const props = reactive({ src: undefined, fallback: "/group.png", alt: "" });
  const component = exports.default.setup(props, { expose: () => {} });
  assert.equal(component.imageSrc.value, "/group.png");
  props.src = "/missing.png";
  await nextTick();
  assert.equal(component.imageSrc.value, "/missing.png");
  component.handleError();
  assert.equal(component.imageSrc.value, "/group.png");
  component.handleError();
  assert.equal(component.imageSrc.value, "/group.png");
  props.src = "/new.png";
  await nextTick();
  assert.equal(component.imageSrc.value, "/new.png");
  props.src = "  ";
  props.fallback = "/user.png";
  await nextTick();
  assert.equal(component.imageSrc.value, "/user.png");
});

test("message and conversation reader avatars use the shared fallback", () => {
  const status = parse(readFileSync(new URL("../components/message/status.vue", import.meta.url), "utf8")).descriptor.template.content;
  const message = parse(readFileSync(new URL("../components/message/index.vue", import.meta.url), "utf8")).descriptor.template.content;
  const conversation = parse(readFileSync(new URL("../components/conversation/index.vue", import.meta.url), "utf8")).descriptor.template.content;

  assert.match(status, /<ImagesFallback[\s\S]*?:src="viewer\.image"[\s\S]*?:fallback="useConversationsStore\(\)\.getDefaultImage\('private'\)"/);
  assert.match(message, /<MessageStatus\b/);
  assert.match(conversation, /<MessageStatus\b[\s\S]*?:onConversation="true"/);
});
