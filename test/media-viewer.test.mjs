import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, parse } from "@vue/compiler-sfc";
import { computed, nextTick, ref, watch } from "vue";
import ts from "typescript";

test("viewer selects the requested image, navigates within bounds and transfers that image", () => {
  const source = readFileSync(new URL("../components/media/viewer.vue", import.meta.url), "utf8");
  const script = compileScript(parse(source).descriptor, { id: "media-viewer" }).content;
  const code = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const events = [];
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === "vue") return { defineComponent: (component) => component };
      throw new Error(`Unexpected import: ${name}`);
    },
    computed, nextTick, ref, watch,
    onMounted: () => {},
    onUnmounted: () => {},
  });
  const viewer = exports.default.setup({ files: ["/one.png", "/two.png"], initialIndex: 1 }, {
    expose: () => {},
    emit: (...args) => events.push(args),
  });
  assert.equal(viewer.currentFile.value, "/two.png");
  viewer.next();
  assert.equal(viewer.currentIndex.value, 1);
  viewer.previous();
  assert.equal(viewer.currentFile.value, "/one.png");
  viewer.previous();
  assert.equal(viewer.currentIndex.value, 0);
  assert.equal(viewer.messageToTransfer.value.files[0], "/one.png");
  viewer.imageError.value = true;
  viewer.select(1);
  assert.equal(viewer.imageError.value, false);
  assert.equal(viewer.filename("/folder/123--photo.png?token=redacted"), "photo.png");
  viewer.close();
  assert.deepEqual(events, [["close"]]);
});

test("both message photos and the media gallery open the shared viewer at the selected index", () => {
  for (const file of ["../components/message/files/index.vue", "../pages/conversations/[id]/medias/index.vue"]) {
    const template = parse(readFileSync(new URL(file, import.meta.url), "utf8")).descriptor.template.content;
    assert.match(template, /@click="openViewer\(index\)"/);
    assert.match(template, /<MediaViewer[^>]*:initial-index="selectedIndex"/);
  }
});
