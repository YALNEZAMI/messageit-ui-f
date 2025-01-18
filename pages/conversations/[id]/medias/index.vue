<template>
  <main style="min-height: 35.9rem">
    <div
      class="overflow-y-auto flex justify-center flex-wrap h-max"
      style="max-height: 35.9rem; scrollbar-width: thin"
    >
      <ImagesMessageFile
        class="m-1 h-max"
        v-for="media of medias"
        :key="media"
        :src="media"
      ></ImagesMessageFile>
    </div>
    <NoResult
      v-if="medias.length == 0"
      class="mt-3"
      :message="'Aucun media trouvé.'"
    ></NoResult>
  </main>
</template>
<script lang="ts" setup>
import { Message } from "~/interfaces/message";

definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
const medias = ref([] as string[]);
onMounted(async () => {
  const res = await useMessageFilesStore().getFilesOfConversation(
    useRoute().params.id
  );
  res.map((media: any) => {
    medias.value = medias.value.concat(media.urls);
  });
});
</script>
