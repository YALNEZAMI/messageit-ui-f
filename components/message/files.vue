<template>
  <main
    class="flex"
    :class="{
      'justify-end': isMyMessage(),
    }"
  >
    <div v-if="files.length > 0" class="flex flex-col w-32 md:w-48" :class="{}">
      <div
        v-for="(file, index) of files"
        :key="file"
        class="flex w-full m-1"
        :class="{
          'justify-end': index % 2 == 0,
        }"
      >
        <NuxtImg :src="file" class="w-20 h-20 rounded shadow-md"></NuxtImg>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import { Message } from "~/interfaces/message";
import { User } from "~/interfaces/user";

const props = defineProps({
  message: Object,
});

const message: Message = props.message;
const isMyMessage = () => {
  return ((message as Message).sender as User)._id == useUsersStore().user._id;
};
const files = ref([]);
onMounted(async () => {
  files.value = await useMessageFilesStore().getFiles(message._id);
  console.log("files", files.value);
});
</script>
