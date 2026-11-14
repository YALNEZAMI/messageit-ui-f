<template>
  <Teleport to="body">
    <div class="confirm-backdrop" @click.self="cancel" @keydown.esc.stop="cancel" @keydown.tab="trapFocus">
      <section ref="dialog" class="confirm-dialog" role="dialog" aria-modal="true"
        :aria-labelledby="titleId" :aria-describedby="descriptionId" tabindex="-1">
        <div class="confirm-icon" aria-hidden="true">!</div>
        <div class="confirm-copy">
          <h2 :id="titleId">{{ title }}</h2>
          <p :id="descriptionId">{{ description }}</p>
        </div>
        <p v-if="error" class="confirm-error" role="alert">{{ error }}</p>
        <div class="confirm-actions">
          <button ref="cancelButton" type="button" class="confirm-cancel" :disabled="busy" @click="cancel">Annuler</button>
          <button type="button" class="confirm-danger" :disabled="busy" @click="$emit('confirm')">
            {{ busy ? "Opération en cours…" : confirmLabel }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
}>(), { busy: false, error: "" });
const emit = defineEmits<{ cancel: []; confirm: [] }>();
const titleId = useId();
const descriptionId = useId();
const dialog = ref<HTMLElement | null>(null);
const cancelButton = ref<HTMLButtonElement | null>(null);
let opener: HTMLElement | null = null;
function cancel() {
  if (!props.busy) emit("cancel");
}
function trapFocus(event: KeyboardEvent) {
  const buttons = Array.from(dialog.value?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
  if (!buttons.length) {
    event.preventDefault();
    return;
  }
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (event.shiftKey && index <= 0) {
    event.preventDefault();
    buttons[buttons.length - 1].focus();
  } else if (!event.shiftKey && (index === -1 || index === buttons.length - 1)) {
    event.preventDefault();
    buttons[0].focus();
  }
}
onMounted(async () => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  await nextTick();
  cancelButton.value?.focus();
});
onBeforeUnmount(() => {
  if (opener?.isConnected) opener.focus();
});
</script>

<style scoped>
.confirm-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: rgb(15 23 42 / 70%); backdrop-filter: blur(4px); }
.confirm-dialog { width: min(100%, 28rem); max-height: calc(100dvh - 2rem); overflow-y: auto; padding: 1.5rem; border: 1px solid #e6e9f1; border-radius: 1.2rem; background: #fff; color: #172033; box-shadow: 0 24px 70px rgb(15 23 42 / 32%); }
.confirm-icon { display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: .9rem; background: #fff0ef; color: #b42318; font-size: 1.5rem; font-weight: 800; }
.confirm-copy h2 { margin: 1rem 0 .45rem; color: #172033; font-size: 1.2rem; font-weight: 750; }
.confirm-copy p { margin: 0; color: #475569; font-size: .9rem; line-height: 1.55; }
.confirm-error { margin: 1rem 0 0; padding: .7rem; border-radius: .6rem; background: #fff0ef; color: #991b1b; font-size: .85rem; }
.confirm-actions { display: flex; justify-content: flex-end; gap: .6rem; margin-top: 1.4rem; }
.confirm-actions button { min-height: 2.75rem; padding: .65rem 1rem; border-radius: .7rem; font-weight: 700; }
.confirm-cancel { border: 1px solid #cbd5e1; color: #334155; background: #fff; }
.confirm-danger { background: #b42318; color: white; }
.confirm-danger:hover:not(:disabled) { background: #8f1b15; }
.confirm-actions button:disabled { opacity: .6; cursor: wait; }
@media (max-width: 420px) { .confirm-actions { flex-direction: column-reverse; } .confirm-actions button { width: 100%; } }
</style>
