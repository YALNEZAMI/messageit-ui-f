<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">CONVERSATION</p>
      <h1>Rechercher un message</h1>
      <p>Retrouvez un échange par ses mots ou par son sens.</p>
    </div>

    <section class="search-panel" aria-label="Recherche dans la conversation">
      <div class="search-modes" role="group" aria-label="Mode de recherche">
        <button type="button" :aria-pressed="mode === 'text'" @click="setMode('text')">Mots exacts</button>
        <button type="button" :aria-pressed="mode === 'semantic'" @click="setMode('semantic')">Sens</button>
      </div>
      <p class="search-help">
        {{ mode === 'text' ? 'Recherchez des mots présents dans les messages.' : 'Décrivez une idée pour trouver les messages les plus proches. La recherche est locale.' }}
      </p>
      <form class="search-form" @submit.prevent="search">
        <label class="sr-only" for="conversation-search">Rechercher dans la conversation</label>
        <input id="conversation-search" v-model="key" class="search-input" type="search" maxlength="1000"
          :placeholder="mode === 'text' ? 'Rechercher des mots...' : 'Ex. notre discussion sur les vacances'"
          @input="onInput" />
        <button class="upload-button-primary" type="submit" :disabled="!key.trim() || loading">
          Rechercher
        </button>
      </form>
      <p v-if="mode === 'semantic'" class="search-help">La première recherche peut prendre du temps pendant l’indexation des messages visibles.</p>
    </section>

    <p v-if="loading" class="search-status" role="status">
      {{ mode === 'semantic' ? 'Recherche et indexation en cours…' : 'Recherche en cours…' }}
    </p>
    <p v-else-if="error" class="search-error" role="alert">{{ error }}</p>
    <template v-else-if="searched">
      <p v-if="messages.length && mode === 'semantic'" class="search-status">Messages les plus proches de votre recherche (20 maximum).</p>
      <div v-if="messages.length" class="search-results">
        <ContainersConversationTheme
          v-for="msg in messages" :key="msg._id"
          class="conversation-card cursor-pointer w-full min-h-16 p-2 flex items-center"
          @click="$router.push(`/conversations/${$route.params.id}/messages?messageId=${msg._id}`)"
        >
          <ImagesFallback class="h-16 w-16 shrink-0 rounded-full object-cover"
            :src="getSender(msg)?.image"
            :fallback="useConversationsStore().getDefaultImage(getSender(msg)?.aiUser ? 'ai' : 'private')" alt="" />
          <div class="w-full min-w-0 ml-3">
            <div class="text-xl font-bold">{{ getSender(msg)?.aiUser ? 'Boby' : (getSender(msg)?.name || 'Utilisateur') }}</div>
            <div class="flex gap-2">
              <div class="truncate flex-1">{{ msg.text }}</div>
              <div class="text-xs shrink-0">{{ useMessagesStore().getDate(msg.createdAt + "") }}</div>
            </div>
          </div>
        </ContainersConversationTheme>
      </div>
      <NoResult v-else class="mt-3" message="Aucun message trouvé." />
    </template>
  </main>
</template>

<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const route = useRoute();
const key = ref("");
const mode = ref<"text" | "semantic">("text");
const messages = ref<Message[]>([]);
const loading = ref(false);
const searched = ref(false);
const error = ref("");
let requestId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

const getSender = (msg: Message): User | undefined =>
  typeof msg.sender === "object" ? msg.sender : undefined;

function reset() {
  requestId++;
  clearTimeout(timer);
  messages.value = [];
  loading.value = false;
  searched.value = false;
  error.value = "";
}

function setMode(value: "text" | "semantic") {
  if (mode.value === value) return;
  mode.value = value;
  reset();
  if (value === "text" && key.value.trim()) onInput();
}

function onInput() {
  reset();
  if (mode.value === "text" && key.value.trim()) timer = setTimeout(search, 300);
}

watch(() => route.params.id, () => {
  key.value = "";
  reset();
});

async function search() {
  clearTimeout(timer);
  const query = key.value.trim();
  if (!query) return reset();
  const id = ++requestId;
  const selectedMode = mode.value;
  loading.value = true;
  error.value = "";
  searched.value = false;
  try {
    let result: Message[];
    if (selectedMode === "semantic") {
      result = await $fetch<Message[]>(`${useRuntimeConfig().public.FEATHERS_URL}/messages`, {
        query: { conversation: String(route.params.id), key: query, searchMode: "semantic" },
        headers: { Authorization: `Bearer ${useAuthStore().accessToken}` },
      });
    } else {
      result = await useMessagesStore().getThisService().find({
        query: { conversation: String(route.params.id), key: query },
      });
    }
    if (id !== requestId) return;
    messages.value = result;
    searched.value = true;
  } catch (cause: unknown) {
    if (id !== requestId) return;
    const data = typeof cause === "object" && cause !== null && "data" in cause ? cause.data : undefined;
    error.value = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
      ? data.message : "La recherche a échoué. Vérifiez la connexion et réessayez.";
  } finally {
    if (id === requestId) loading.value = false;
  }
}

onBeforeUnmount(reset);
definePageMeta({ middleware: "conversations", layout: "conversations" });
</script>

<style scoped>
.search-panel { max-width: 46rem; margin: 0 auto 1.5rem; padding: 1.25rem; border-radius: 1rem; background: #fff; color: #172033; box-shadow: 0 8px 30px rgb(15 23 42 / 8%); }
.search-modes { display: flex; gap: .5rem; }
.search-modes button { border: 1px solid #cbd5e1; border-radius: .7rem; padding: .55rem .9rem; font-weight: 700; color: #334155; }
.search-modes button[aria-pressed="true"] { border-color: #5143bb; background: #5143bb; color: #fff; }
.search-help { margin: .8rem 0; color: #475569; font-size: .9rem; }
.search-form { display: flex; gap: .75rem; }
.search-form .search-input { min-width: 0; padding-right: 1rem; }
.search-results { display: grid; gap: .5rem; max-height: 65vh; overflow-y: auto; }
.search-status { margin: .75rem 0; color: inherit; }
.search-error { padding: .8rem; border-radius: .7rem; color: #991b1b; background: #fee2e2; }
@media (max-width: 480px) { .search-form { flex-direction: column; } .search-form button { width: 100%; } }
</style>
