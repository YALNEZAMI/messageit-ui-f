<template>
  <main
    class="flex"
    :class="{
      'justify-end': isMyMessage(),
    }"
  >
    <div v-if="files.length > 0" class="flex flex-col md:w-52 w-32" :class="{}">
      <div
        v-for="(file, index) of files"
        :key="file"
        class="flex w-full m-1"
        :class="{
          'justify-end': index % 2 == 0,
        }"
      >
        <ImagesMessageFile :src="file"></ImagesMessageFile>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

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
  console.log("");
});
</script>
