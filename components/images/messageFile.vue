<template>
  <main>
    <NuxtImg
      @click="isBig = true"
      class="md:w-40 md:h-40 w-24 h-24 cursor-pointer rounded shadow-md"
      :src="props.src"
    ></NuxtImg>
    <!--big format-->
    <div
      v-if="isBig"
      class="flex justify-center items-center fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-40"
    >
      <div>
        <NuxtImg class="w-64 h-64 rounded shadow-md" :src="props.src"></NuxtImg>
        <div class="flex justify-center space-x-2">
          <!-- <button
            @click="download"
            class="basicButton bg-indigo-500 hover:bg-opacity-80"
          >
            Télécharger
          </button>-->
          <button
            @click="isBig = false"
            class="basicButton bg-red-600 hover:opacity-80"
          >
            Términer
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
const props = defineProps({
  src: String,
});
const isBig = ref(false);
</script>
