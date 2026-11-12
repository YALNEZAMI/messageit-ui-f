<template>
  <main class="flex" :class="{ 'justify-end': isMyMessage }">
    <div v-if="files.length" class="message-files-preview">
      <button
        v-for="(file, index) in files"
        :key="index"
        type="button"
        class="message-file-thumb"
        :aria-label="`Agrandir la photo ${index + 1} sur ${files.length}`"
        @click="openViewer(index)"
      >
        <NuxtImg class="message-file-image" :src="file" :alt="`Photo ${index + 1}`" />
      </button>
    </div>
    <MediaViewer v-if="viewerOpen" :files="files" :initial-index="selectedIndex" @close="viewerOpen = false" />
  </main>
</template>

<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const props = defineProps<{ message: Message }>();
const isMyMessage = computed(() => (props.message.sender as User)._id === useUsersStore().user._id);
const files = ref<string[]>([]);
const viewerOpen = ref(false);
const selectedIndex = ref(0);
const openViewer = (index: number) => {
  selectedIndex.value = index;
  viewerOpen.value = true;
};
onMounted(async () => {
  try {
    files.value = await useMessageFilesStore().getFiles(props.message._id as string);
  } catch (error) {
    console.error("Impossible de charger les photos du message :", error);
  }
});
</script>
