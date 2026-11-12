<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">VOTRE ESPACE</p>
      <h1>Conversations</h1>
      <p>Retrouvez toutes vos discussions au même endroit.</p>
    </div>
    <div class="search-panel">
      <label class="search-panel-label" for="conversation-search">Rechercher une conversation</label>
      <div class="search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.2-5.2M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
        </svg>
        <input id="conversation-search" v-model="query" type="search" placeholder="Nom, groupe ou Boby…" />
      </div>
    </div>
    <div class="results-heading">
      <h2>Vos conversations</h2>
      <span>{{ filtered.length }} {{ filtered.length === 1 ? "discussion" : "discussions" }}</span>
    </div>
    <div v-if="conversationsStore.isConversationsPulse" role="status" class="results-loading">Chargement des conversations…</div>
    <div v-else-if="filtered.length" class="results-grid">
      <Conversation v-for="conv in filtered" :key="conv._id" :conversation="conv" :isSideBar="false" />
    </div>
    <NoResult v-else :message="query ? 'Aucune conversation ne correspond à votre recherche.' : 'Aucune conversation pour le moment.'" />
  </main>
</template>

<script lang="ts" setup>
import { filterConversations } from "~/utils/conversationSearch";

const conversationsStore = useConversationsStore();
const query = ref("");
const filtered = computed(() => filterConversations(
  conversationsStore.conversations,
  query.value,
  useUsersStore().user._id
));
definePageMeta({ layout: "private-space", middleware: "conversations" });
</script>
