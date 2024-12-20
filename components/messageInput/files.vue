<template>
  <main
    class="fixed top-0 left-0 z-30 bg-black bg-opacity-50 w-screen h-screen flex justify-center items-center"
  >
    <div>
      <div class="flex">
        <div v-for="(file, index) of previewSrc" :key="file" class="relative">
          <NuxtImg
            v-if="index < 3"
            class="w-20 h-20 rounded m-1"
            :src="file"
          ></NuxtImg>
          <button
            class="p-1 cursor-pointer rounded border-0 text-white px-2 bg-red-500 absolute top-0 right-0"
            @click="removeFile(index)"
          >
            x
          </button>
        </div>
        <div
          v-if="previewSrc.length > 3"
          class="flex items-center text-xl font-bold"
        >
          ...
        </div>
      </div>
      <div class="flex flex-wrap justify-center">
        <button
          @click="triggerInput('photos')"
          class="basicButton text-black bg-green-500 flex flex-col"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-10"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>

          <span>Photos</span>
        </button>
        <input
          @change="selectFiles"
          type="file"
          id="photos"
          class="hidden"
          accept="image/*"
          multiple
        />
        <!--<button @click="triggerInput('videos')">videos</button>
        <input
          @change="selectFiles"
          type="file"
          id="videos"
          class="hidden"
          accept="video/*"
          multiple
        />-->
      </div>
      <div class="flex justify-center">
        <button
          @click="emits('finish', { files, previewSrc })"
          class="basicButton bg-yellow-500 m-1 mx-auto"
        >
          Terminer
        </button>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
const props = defineProps({
  previewSrc: Array,
  files: Array,
});
const previewSrc = ref<string[]>(props.previewSrc);
const files = ref<File[]>(props.files);
const emits = defineEmits(["finish", "removeFile"]);

const triggerInput = async (id: string) => {
  document.getElementById(id)?.click();
  files.value = [];
  previewSrc.value = [];
};

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

const selectFiles = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    for (const file of input.files) {
      try {
        const fileData = await readFile(file); // Wait for each file to be processed
        previewSrc.value.push(fileData); // Save the preview source
        files.value.push(file); // Save the file for uploading
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  }
};
const removeFile = (index: number) => {
  files.value = files.value.filter((file: File, i: any) => {
    return index != i;
  });
  previewSrc.value = previewSrc.value.filter((file: File, i: any) => {
    return index != i;
  });
  emits("removeFile", index);
};
</script>
