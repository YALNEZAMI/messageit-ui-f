<template>
  <main
    class="fixed left-0 top-0 w-screen h-screen z-50 flex justify-center items-center"
  >
    <div class="bg-white text-black rounded p-4">
      <div class="text-center text-orange-500 font-bold">
        {{ alert.header }}
      </div>
      <div class="text-center my-2">{{ alert.message }}</div>
      <div class="text-center">
        <ContainersMain
          @click="emits('finish')"
          class="mx-auto cursor-pointer text-white w-max px-2 py-1 rounded"
          >Fermer</ContainersMain
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
