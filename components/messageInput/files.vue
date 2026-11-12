<template>
  <Teleport to="body">
    <div class="upload-overlay" @click.self="cancel" @keydown.esc.stop="cancel">
      <section
        ref="dialog"
        class="upload-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        aria-describedby="upload-description"
        tabindex="-1"
        @keydown.tab="trapFocus"
      >
        <div class="upload-header">
          <div>
            <p class="upload-eyebrow">PIÈCES JOINTES</p>
            <h2 id="upload-title">Partager des photos</h2>
            <p id="upload-description">Choisissez les images à joindre à votre message.</p>
          </div>
          <button type="button" class="upload-close" aria-label="Fermer" :disabled="loading" @click="cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div class="upload-body">
          <button type="button" class="upload-picker" :disabled="loading" @click="fileInput?.click()">
            <span class="upload-picker-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </span>
            <span class="upload-picker-title">{{ files.length ? "Ajouter d’autres photos" : "Choisir des photos" }}</span>
            <span class="upload-picker-hint">Sélectionnez une ou plusieurs images sur votre appareil</span>
          </button>
          <input ref="fileInput" type="file" class="sr-only" tabindex="-1" accept="image/*" multiple @change="selectFiles" />

          <p v-if="loading" class="upload-status" role="status">Préparation des images…</p>
          <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
          <div v-if="files.length" class="upload-selection">
            <div class="upload-selection-heading">
              <strong>Photos sélectionnées</strong>
              <span>{{ files.length }} {{ files.length > 1 ? "images" : "image" }}</span>
            </div>
            <div class="upload-grid">
              <div v-for="(file, index) in files" :key="`${file.name}-${index}`" class="upload-preview">
                <img :src="previewSrc[index]" :alt="file.name" />
                <button type="button" class="upload-remove" :aria-label="`Retirer ${file.name}`" @click="removeFile(index)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                <span :title="file.name">{{ file.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="upload-footer">
          <button type="button" class="upload-button-secondary" :disabled="loading" @click="cancel">Annuler</button>
          <button type="button" class="upload-button-primary" :disabled="loading || (!files.length && !props.files.length)" @click="confirm">
            Ajouter au message
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
const props = defineProps<{ previewSrc: string[]; files: File[] }>();
const emits = defineEmits<{
  finish: [data: { files: File[]; previewSrc: string[] }];
}>();
const files = ref([...props.files]);
const previewSrc = ref([...props.previewSrc]);
const fileInput = ref<HTMLInputElement | null>(null);
const dialog = ref<HTMLElement | null>(null);
const loading = ref(false);
const error = ref("");
let previousFocus: HTMLElement | null = null;

onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  dialog.value?.focus();
});
onBeforeUnmount(() => previousFocus?.focus());

const cancel = () => {
  if (!loading.value) emits("finish", { files: props.files, previewSrc: props.previewSrc });
};
const confirm = () => emits("finish", { files: files.value, previewSrc: previewSrc.value });
const removeFile = (index: number) => {
  files.value.splice(index, 1);
  previewSrc.value.splice(index, 1);
};
const trapFocus = (event: KeyboardEvent) => {
  const elements = dialog.value?.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]):not(.sr-only), [tabindex]:not([tabindex="-1"])'
  );
  if (!elements?.length) return;
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const selectFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  loading.value = true;
  error.value = "";
  for (const file of Array.from(input.files)) {
    try {
      const preview = await readFile(file);
      files.value.push(file);
      previewSrc.value.push(preview);
    } catch (reason) {
      console.error("Impossible de lire l'image sélectionnée", reason);
      error.value = "Certaines images n’ont pas pu être lues. Veuillez réessayer.";
    }
  }
  input.value = "";
  loading.value = false;
};
</script>
