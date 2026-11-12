<template>
  <main class="page-section">
    <div class="page-heading"><div><p class="page-eyebrow">CONVERSATION</p><h1>Médias</h1><p>Retrouvez les photos partagées ici.</p></div></div>
    <div
      class="overflow-y-auto flex justify-center flex-wrap h-max"
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
// import type { Message } from "~/interfaces/message";

definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
const medias = ref([] as string[]);
onMounted(async () => {
  const res = await useMessageFilesStore().getFilesOfConversation(
    useRoute().params.id as string
  );
  res.map((media: any) => {
    medias.value = medias.value.concat(media.urls);
  });
});
</script>
