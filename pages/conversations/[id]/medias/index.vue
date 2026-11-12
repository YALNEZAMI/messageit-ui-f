<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">CONVERSATION</p>
      <h1>Médias</h1>
      <p>Retrouvez les photos partagées ici.</p>
    </div>
    <div class="results-heading">
      <h2>Photos partagées</h2>
      <span v-if="!loading && !errorMessage">{{ medias.length }} {{ medias.length === 1 ? "photo" : "photos" }}</span>
    </div>
    <p v-if="loading" class="results-loading" role="status">Chargement des photos…</p>
    <p v-else-if="errorMessage" class="search-error" role="alert">{{ errorMessage }} <button type="button" @click="loadMedias">Réessayer</button></p>
    <div v-else-if="medias.length" class="media-gallery">
      <button v-for="(media, index) in medias" :key="index" type="button" class="media-gallery-item" :aria-label="`Agrandir la photo ${index + 1} sur ${medias.length}`" @click="openViewer(index)">
        <NuxtImg :src="media" :alt="`Photo partagée ${index + 1}`" />
      </button>
    </div>
    <NoResult v-else message="Aucune photo partagée pour le moment." />
    <MediaViewer v-if="viewerOpen" :files="medias" :initial-index="selectedIndex" @close="viewerOpen = false" />
  </main>
</template>

<script lang="ts" setup>
definePageMeta({ middleware: "conversations", layout: "conversations" });
const medias = ref<string[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const viewerOpen = ref(false);
const selectedIndex = ref(0);
const openViewer = (index: number) => {
  selectedIndex.value = index;
  viewerOpen.value = true;
};
const loadMedias = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await useMessageFilesStore().getFilesOfConversation(useRoute().params.id as string);
    medias.value = result.flatMap((media: { urls: string[] }) => media.urls);
  } catch (error) {
    console.error("Impossible de charger les médias :", error);
    errorMessage.value = "Impossible de charger les photos.";
  } finally {
    loading.value = false;
  }
};
onMounted(loadMedias);
</script>
