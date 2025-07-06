<template>
  <main class="relative w-full">
    <input
      @input="onInput"
      :type="props.type"
      v-model="val"
      class="rounded-xl hover:rounded-md w-full p-2 border-2 border-dashed border-indigo-700 focus:border-0 focus:border-indigo-700 focus:bg-indigo-50"
      placeholder="Recherche..."
    />
    <div
      class="flex absolute right-0 top-0 h-full w-max items-center space-x-2"
    >
      <!--cancel icon-->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6 text-indigo-600 hover:text-indigo-500 cursor-pointer"
        @click="clear"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <!--search icon-->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-5 text-indigo-800"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    </div>
  </main>
</template>
<script lang="ts" setup>
const val = ref("");
const props = defineProps({
  type: String,
});
const emits = defineEmits(["onInput"]);
const onInput = () => {
  emits("onInput", val.value);
};
const clear = () => {
  val.value = "";
  emits("onInput", "");
};
</script>
