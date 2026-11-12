<template>
  <Teleport to="body">
    <div class="photo-viewer" @click.self="close" @keydown="onKeydown">
      <section ref="dialog" class="photo-viewer-panel" role="dialog" aria-modal="true" aria-labelledby="photo-viewer-title" tabindex="-1">
        <header class="photo-viewer-header">
          <div class="photo-viewer-heading">
            <p>PHOTOS PARTAGÉES</p>
            <h2 id="photo-viewer-title">Visionneuse</h2>
            <span aria-live="polite">Photo {{ currentIndex + 1 }} sur {{ files.length }}</span>
          </div>
          <button type="button" class="photo-viewer-close" aria-label="Fermer la visionneuse" @click="close">×</button>
        </header>

        <div class="photo-viewer-stage">
          <button v-if="files.length > 1" type="button" class="photo-viewer-arrow" aria-label="Photo précédente" :disabled="currentIndex === 0" @click="previous">‹</button>
          <div class="photo-viewer-image-wrap">
            <img v-if="!imageError" :key="currentFile" :src="currentFile" :alt="`Photo ${currentIndex + 1} sur ${files.length}`" @error="imageError = true" />
            <p v-else class="photo-viewer-error" role="alert">Impossible d’afficher cette photo. Vous pouvez essayer de l’ouvrir dans un nouvel onglet.</p>
          </div>
          <button v-if="files.length > 1" type="button" class="photo-viewer-arrow" aria-label="Photo suivante" :disabled="currentIndex === files.length - 1" @click="next">›</button>
        </div>

        <div v-if="files.length > 1" class="photo-viewer-thumbnails" aria-label="Choisir une photo">
          <button v-for="(file, index) in files" :key="index" type="button" class="photo-viewer-thumbnail" :class="{ active: index === currentIndex }" :aria-label="`Afficher la photo ${index + 1}`" :aria-current="index === currentIndex ? 'true' : undefined" @click="select(index)">
            <img :src="file" alt="" />
          </button>
        </div>

        <footer class="photo-viewer-actions">
          <a class="photo-viewer-action" :href="currentFile" target="_blank" rel="noopener noreferrer">Ouvrir l’original ↗</a>
          <a class="photo-viewer-action" :href="currentFile" :download="filename(currentFile)">Télécharger</a>
          <button ref="transferButton" type="button" class="photo-viewer-action photo-viewer-action-primary" @click="transfering = true">Transférer</button>
          <button v-if="files.length > 1" type="button" class="photo-viewer-action" @click="downloadAll">Tout télécharger</button>
        </footer>
      </section>

      <div v-if="transfering" ref="transferDialog" tabindex="-1" class="photo-transfer-overlay" role="dialog" aria-modal="true" aria-label="Transférer la photo" @click.self="transfering = false" @keydown.esc.stop="transfering = false" @keydown.tab.stop="trapFocus($event, transferDialog)">
        <Transfer :messages-to-send="[messageToTransfer]" @finish="transfering = false" />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type { Message } from "~/interfaces/message";

const props = defineProps<{ files: string[]; initialIndex: number }>();
const emit = defineEmits<{ close: [] }>();
const currentIndex = ref(Math.max(0, Math.min(props.initialIndex, props.files.length - 1)));
const currentFile = computed(() => props.files[currentIndex.value]);
const imageError = ref(false);
const transfering = ref(false);
const dialog = ref<HTMLElement | null>(null);
const transferDialog = ref<HTMLElement | null>(null);
const transferButton = ref<HTMLButtonElement | null>(null);
let opener: HTMLElement | null = null;
watch(transfering, async (open) => {
  await nextTick();
  if (open) transferDialog.value?.focus();
  else transferButton.value?.focus();
});
const messageToTransfer = computed<Message>(() => ({
  text: "",
  conversation: "",
  files: [currentFile.value],
  referedMessage: "",
  type: "message",
  transfered: false,
  createdAt: new Date().toISOString(),
}));

const select = (index: number) => {
  if (index >= 0 && index < props.files.length) {
    currentIndex.value = index;
    imageError.value = false;
  }
};
const previous = () => select(currentIndex.value - 1);
const next = () => select(currentIndex.value + 1);
const filename = (file: string) => {
  const name = file.split("/").pop()?.split("?")[0] || "photo";
  return name.includes("--") ? name.split("--").slice(1).join("--") : name;
};
const downloadAll = () => {
  for (const file of props.files) {
    const link = document.createElement("a");
    link.href = file;
    link.download = filename(file);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
const close = () => emit("close");
const trapFocus = (event: KeyboardEvent, container: HTMLElement | null) => {
  if (!container) return;
  const controls = Array.from(container.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex='-1'])"));
  if (!controls.length) {
    event.preventDefault();
    return;
  }
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
const onKeydown = (event: KeyboardEvent) => {
  if (transfering.value) return;
  if (event.key === "Escape") close();
  if (event.key === "ArrowLeft") previous();
  if (event.key === "ArrowRight") next();
  if (event.key === "Tab") trapFocus(event, dialog.value);
};
onMounted(() => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.value?.focus();
});
onUnmounted(() => opener?.focus());
</script>
