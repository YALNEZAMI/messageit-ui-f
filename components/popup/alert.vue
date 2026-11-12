<template>
  <main
    class="dialog-backdrop fixed inset-0 z-50 flex justify-center items-center"
  >
    <div class="dialog-panel text-black">
      <div class="text-center text-orange-500 font-bold">
        {{ alert.header }}
      </div>
      <div class="text-center my-2">{{ alert.message }}</div>
      <div class="text-center">
        <button
          type="button"
          @click="emits('finish')"
          class="upload-button-primary"
          >Fermer</button
        >
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Alert } from "~/interfaces/alert";

const props = defineProps({
  alert: Object,
});
const emits = defineEmits(["finish"]);
const alert = props.alert as Alert;
</script>
