<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">DÉCOUVRIR</p>
      <h1>Recherche</h1>
      <p>Trouvez des personnes et des conversations.</p>
    </div>
    <section class="search-panel" aria-label="Recherche">
      <div class="search-category" role="group" aria-label="Type de recherche">
        <button type="button" :aria-pressed="category === 'users'" :class="{ active: category === 'users' }" @click="category = 'users'">Personnes</button>
        <button type="button" :aria-pressed="category === 'conversations'" :class="{ active: category === 'conversations' }" @click="category = 'conversations'">Conversations</button>
      </div>
      <label class="search-panel-label" for="people-search">{{ category === "users" ? "Rechercher une personne" : "Rechercher une conversation" }}</label>
      <div class="search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.2-5.2M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
        </svg>
        <input id="people-search" v-model="query" type="search" :placeholder="category === 'users' ? 'Rechercher par nom…' : 'Nom, groupe ou Boby…'" />
      </div>
    </section>
    <div class="results-heading">
      <h2>{{ category === "users" ? "Personnes" : "Conversations" }}</h2>
      <span v-if="!loading && !errorMessage">{{ resultCount }} {{ resultCount === 1 ? "résultat" : "résultats" }}</span>
    </div>
    <p v-if="loading" role="status" class="results-loading">Recherche en cours…</p>
    <p v-else-if="errorMessage" role="alert" class="search-error">{{ errorMessage }} <button type="button" @click="searchUsers">Réessayer</button></p>
    <div v-else-if="resultCount" class="results-grid">
      <template v-if="category === 'users'">
        <User v-for="user in users" :key="user._id" :user="user" />
      </template>
      <template v-else>
        <Conversation v-for="conv in conversations" :key="conv._id" :conversation="conv" :isSideBar="false" />
      </template>
    </div>
    <NoResult v-else :message="query.trim() ? 'Aucun résultat pour cette recherche.' : 'Aucun résultat pour le moment.'" />
  </main>
</template>

<script lang="ts" setup>
import type { User } from "~/interfaces/user";
import { filterConversations } from "~/utils/conversationSearch";

const query = ref("");
const category = ref<"users" | "conversations">("users");
const users = ref<User[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const conversations = computed(() => filterConversations(
  useConversationsStore().conversations,
  query.value,
  useUsersStore().user._id
));
const resultCount = computed(() => category.value === "users" ? users.value.length : conversations.value.length);
let timer: ReturnType<typeof setTimeout> | undefined;
let requestId = 0;
const searchUsers = async () => {
  const id = ++requestId;
  loading.value = true;
  errorMessage.value = "";
  try {
    const result = await useUsersStore().getService().find({
      query: { name: query.value },
      paginate: false,
    });
    if (id === requestId) users.value = result;
  } catch (error) {
    if (id === requestId) {
      console.error("Échec de la recherche de personnes :", error);
      errorMessage.value = "Impossible de rechercher des personnes.";
    }
  } finally {
    if (id === requestId) loading.value = false;
  }
};
watch([query, category], () => {
  clearTimeout(timer);
  requestId++;
  loading.value = false;
  errorMessage.value = "";
  if (category.value === "users") {
    loading.value = true;
    timer = setTimeout(searchUsers, 250);
  }
}, { immediate: true });
onBeforeUnmount(() => {
  clearTimeout(timer);
  requestId++;
});
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>
