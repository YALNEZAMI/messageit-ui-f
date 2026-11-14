<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">NOUVELLE CONVERSATION</p>
      <h1>Créer un groupe</h1>
      <p>Rassemblez vos amis autour d'une nouvelle conversation.</p>
    </div>

    <form class="group-creation" novalidate @submit.prevent="createGroup">
      <div class="group-main">
        <section class="group-panel" aria-labelledby="group-details-title">
          <div class="section-heading">
            <span class="section-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 13v-2a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div>
              <h2 id="group-details-title">Votre nouveau groupe</h2>
              <p>Commencez par lui donner un nom.</p>
            </div>
          </div>
          <label class="field-label" for="group-name">Nom du groupe <span aria-hidden="true">*</span></label>
          <input id="group-name" v-model="groupName" class="group-input" type="text"
            placeholder="Ex. Les amis du dimanche" autocomplete="off" :disabled="creating"
            :aria-invalid="nameInvalid" :aria-describedby="nameInvalid ? 'group-name-help group-form-error' : 'group-name-help'"
            @input="nameInvalid = false; formError = ''" />
          <p id="group-name-help" class="field-help">Choisissez un nom que tout le monde reconnaîtra.</p>
        </section>

        <section class="group-panel" aria-labelledby="group-friends-title">
          <div class="friends-heading">
            <div>
              <h2 id="group-friends-title">Inviter des amis</h2>
              <p>Sélectionnez au moins deux amis pour commencer.</p>
            </div>
            <span class="count-badge">{{ selectedIds.length }} sélectionné{{ selectedIds.length === 1 ? "" : "s" }}</span>
          </div>
          <label class="field-label" for="friend-search">Rechercher parmi vos amis</label>
          <div class="friend-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.2-5.2M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" />
            </svg>
            <input id="friend-search" v-model="search" type="search" placeholder="Rechercher par nom…" :disabled="creating" />
          </div>
          <p v-if="loading" class="group-status" role="status">Chargement de vos amis…</p>
          <p v-else-if="loadError" class="group-error" role="alert">
            {{ loadError }} <button type="button" @click="loadFriends">Réessayer</button>
          </p>
          <div v-else-if="!friendsStore.friends.length" class="group-empty">
            <p>Vous n'avez pas encore d'amis à inviter.</p>
            <NuxtLink to="/private-space/search">Trouver des personnes <span aria-hidden="true">→</span></NuxtLink>
          </div>
          <p v-else-if="!filteredFriends.length" class="group-empty">Aucun ami ne correspond à cette recherche.</p>
          <div v-else class="friends-list" aria-label="Liste des amis">
            <label v-for="friend in filteredFriends" :key="friend._id" class="friend-option"
              :class="{ 'friend-option-selected': isSelected(friend._id) }">
              <ImagesFallback class="friend-avatar" :src="friend.image" fallback="/images-ui/user.png" alt="" />
              <span class="friend-name">{{ friend.name || "Utilisateur" }}</span>
              <span class="friend-choice">{{ isSelected(friend._id) ? "Sélectionné" : "Ajouter" }}</span>
              <input type="checkbox" :checked="isSelected(friend._id)" :disabled="creating || !friend._id"
                :aria-label="`Sélectionner ${friend.name || 'cet ami'}`" @change="toggleFriend(friend._id)" />
            </label>
          </div>
        </section>
      </div>

      <aside class="group-panel group-summary" aria-labelledby="group-summary-title">
        <p class="summary-eyebrow">VOTRE GROUPE</p>
        <div class="summary-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 13v-2a4 4 0 0 0-3-3.87" />
          </svg>
        </div>
        <h2 id="group-summary-title">{{ groupName.trim() || "Nom du groupe" }}</h2>
        <p class="summary-description">{{ selectedIds.length }} ami{{ selectedIds.length === 1 ? "" : "s" }} sélectionné{{ selectedIds.length === 1 ? "" : "s" }} · Vous serez ajouté automatiquement</p>
        <div class="summary-divider"></div>
        <div class="selected-heading">
          <h3>Participants</h3>
          <span>{{ selectedIds.length }}</span>
        </div>
        <p v-if="!selectedFriends.length" class="summary-empty">Les amis sélectionnés apparaîtront ici.</p>
        <ul v-else class="selected-list">
          <li v-for="friend in selectedFriends" :key="friend._id">
            <ImagesFallback class="selected-avatar" :src="friend.image" fallback="/images-ui/user.png" alt="" />
            <span>{{ friend.name || "Utilisateur" }}</span>
            <button type="button" :disabled="creating" :aria-label="`Retirer ${friend.name || 'cet ami'}`"
              @click="toggleFriend(friend._id)">×</button>
          </li>
        </ul>
        <p v-if="formError" id="group-form-error" class="group-error" role="alert">{{ formError }}</p>
        <button type="submit" class="create-button" :disabled="creating || loading || !!loadError">
          {{ creating ? "Création en cours…" : "Créer le groupe" }}
          <span v-if="!creating" aria-hidden="true">→</span>
        </button>
        <p class="summary-note">Vous pourrez personnaliser le groupe plus tard.</p>
      </aside>
    </form>
  </main>
</template>

<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";

const friendsStore = useFriendsStore();
const groupName = ref("");
const search = ref("");
const selectedIds = ref<string[]>([]);
const loading = ref(true);
const loadError = ref("");
const formError = ref("");
const nameInvalid = ref(false);
const creating = ref(false);

const filteredFriends = computed(() => {
  const query = search.value.trim().toLocaleLowerCase();
  return friendsStore.friends.filter((friend) =>
    (friend.name || "").toLocaleLowerCase().includes(query)
  );
});
const selectedFriends = computed(() =>
  friendsStore.friends.filter((friend) => friend._id && selectedIds.value.includes(friend._id))
);
watch(
  () => friendsStore.friends.map((friend) => friend._id),
  (ids) => {
    const available = new Set(ids);
    selectedIds.value = selectedIds.value.filter((id) => available.has(id));
  }
);
const isSelected = (id?: string) => !!id && selectedIds.value.includes(id);
function toggleFriend(id?: string) {
  if (!id || creating.value) return;
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((selected) => selected !== id)
    : [...selectedIds.value, id];
  formError.value = "";
}

async function loadFriends() {
  loading.value = true;
  loadError.value = "";
  try {
    await friendsStore.getMyFriends();
  } catch (error) {
    console.error("Impossible de charger les amis :", error);
    loadError.value = "Impossible de charger vos amis.";
  } finally {
    loading.value = false;
  }
}

async function createGroup() {
  if (creating.value || loading.value || loadError.value) return;
  nameInvalid.value = !groupName.value.trim();
  if (nameInvalid.value) {
    formError.value = "Veuillez saisir un nom pour le groupe.";
    return;
  }
  if (selectedFriends.value.length < 2) {
    formError.value = "Veuillez sélectionner au moins deux amis.";
    return;
  }
  formError.value = "";
  creating.value = true;
  try {
    const members = selectedFriends.value.flatMap((friend) => friend._id ? [friend._id] : []);
    const group: Conversation = { name: groupName.value.trim(), type: "group", members };
    await useConversationsStore().createGroup(group);
  } catch (error) {
    console.error("Impossible de créer le groupe :", error);
    formError.value = "Impossible de créer le groupe. Veuillez réessayer.";
  } finally {
    creating.value = false;
  }
}

onMounted(loadFriends);
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>

<style scoped>
.group-creation { display: grid; grid-template-columns: minmax(0, 1fr) minmax(16rem, 21rem); gap: 1.25rem; align-items: start; max-width: 76rem; }
.group-main { display: grid; gap: 1rem; min-width: 0; }
.group-panel { min-width: 0; padding: 1.4rem; border: 1px solid #e6e9f2; border-radius: 1.15rem; background: #fff; color: #172033; box-shadow: 0 10px 32px rgb(34 42 73 / 7%); }
.section-heading { display: flex; align-items: center; gap: .9rem; margin-bottom: 1.4rem; }
.section-icon, .summary-avatar { display: grid; flex: none; place-items: center; color: #5b4ac6; background: #eeebff; }
.section-icon { width: 3rem; height: 3rem; border-radius: .9rem; }
.section-icon svg { width: 1.5rem; height: 1.5rem; }
.section-heading h2, .friends-heading h2, .group-summary h2 { margin: 0; color: #202a40; font-size: 1.1rem; font-weight: 750; overflow-wrap: anywhere; }
.section-heading p, .friends-heading p { margin: .25rem 0 0; color: #526078; font-size: .875rem; line-height: 1.5; }
.field-label { display: block; margin: 0 0 .45rem; color: #29364c; font-size: .85rem; font-weight: 700; }
.field-label span { color: #b42318; }
.group-input, .friend-search { width: 100%; border: 1px solid #d5dbe8; border-radius: .75rem; background: #f9faff; color: #172033; }
.group-input { min-height: 3rem; padding: .7rem .9rem; }
.group-input:focus, .friend-search:focus-within { outline: none; border-color: #7669e5; box-shadow: 0 0 0 3px rgb(118 105 229 / 18%); }
.group-input[aria-invalid="true"] { border-color: #b42318; }
.field-help { margin: .45rem 0 0; color: #526078; font-size: .8rem; }
.friends-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.count-badge { flex: none; padding: .35rem .65rem; border-radius: 999px; background: #eeebff; color: #4936aa; font-size: .75rem; font-weight: 700; }
.friend-search { display: flex; align-items: center; gap: .65rem; padding: 0 .85rem; }
.friend-search svg { width: 1.15rem; height: 1.15rem; flex: none; color: #6558c8; }
.friend-search input { width: 100%; min-width: 0; min-height: 3rem; border: 0; outline: 0; background: transparent; color: #172033; }
.friends-list { display: grid; gap: .55rem; max-height: 25rem; overflow-y: auto; margin-top: 1rem; padding: .15rem; }
.friend-option { display: flex; align-items: center; gap: .8rem; min-width: 0; padding: .75rem; border: 1px solid #e5e9f1; border-radius: .85rem; cursor: pointer; transition: background .15s, border-color .15s; }
.friend-option:hover { background: #f8f7ff; border-color: #c9c1f4; }
.friend-option-selected { border-color: #7564db; background: #f3f1ff; }
.friend-option:focus-within { outline: 3px solid #bcb2f4; outline-offset: 2px; }
.friend-avatar, .selected-avatar { flex: none; border-radius: 50%; object-fit: cover; background: #eef0f6; }
.friend-avatar { width: 2.8rem; height: 2.8rem; }
.friend-name { flex: 1; min-width: 0; overflow: hidden; color: #202a40; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.friend-choice { color: #5546b3; font-size: .78rem; font-weight: 700; }
.friend-option input { width: 1.15rem; height: 1.15rem; flex: none; accent-color: #6553cf; }
.group-status, .group-empty { margin: 1rem 0 0; padding: 1.4rem; border-radius: .8rem; background: #f7f8fc; color: #526078; text-align: center; font-size: .875rem; }
.group-empty a { display: inline-block; margin-top: .5rem; color: #4b3cab; font-weight: 700; }
.group-summary { position: sticky; top: 1rem; }
.summary-eyebrow { margin: 0; color: #6454bf; font-size: .7rem; font-weight: 800; letter-spacing: .11em; }
.summary-avatar { width: 3.8rem; height: 3.8rem; margin: 1rem 0 .85rem; border-radius: 1.1rem; }
.summary-avatar svg { width: 2rem; height: 2rem; }
.summary-description, .summary-empty, .summary-note { color: #526078; font-size: .82rem; line-height: 1.5; }
.summary-description { margin: .4rem 0 0; }
.summary-divider { height: 1px; margin: 1.2rem 0; background: #e7eaf1; }
.selected-heading { display: flex; justify-content: space-between; align-items: center; gap: .5rem; font-size: .85rem; font-weight: 700; }
.selected-heading span { color: #6656c1; }
.summary-empty { margin: .75rem 0 1rem; }
.selected-list { display: grid; gap: .6rem; max-height: 14rem; overflow-y: auto; margin: .8rem 0 1rem; padding: 0; list-style: none; }
.selected-list li { display: flex; align-items: center; gap: .6rem; min-width: 0; font-size: .85rem; font-weight: 600; }
.selected-avatar { width: 2rem; height: 2rem; }
.selected-list li span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-list button { width: 2rem; height: 2rem; border-radius: .5rem; color: #526078; font-size: 1.3rem; }
.selected-list button:hover { background: #f0eefb; color: #4936aa; }
.group-error { margin: 1rem 0; padding: .75rem; border-radius: .7rem; background: #fff0ef; color: #a3211a; font-size: .85rem; line-height: 1.45; }
.group-error button { text-decoration: underline; font-weight: 700; }
.create-button { display: flex; align-items: center; justify-content: center; gap: .65rem; width: 100%; min-height: 3rem; padding: .7rem 1rem; border-radius: .75rem; background: #5c4bc5; color: #fff; font-weight: 700; }
.create-button:hover:not(:disabled) { background: #4939ac; }
.create-button:disabled { opacity: .6; cursor: not-allowed; }
.summary-note { margin: .7rem 0 0; text-align: center; }
@media (max-width: 850px) { .group-creation { grid-template-columns: 1fr; } .group-summary { position: static; } }
@media (max-width: 480px) { .group-panel { padding: 1rem; } .friends-heading { gap: .6rem; } .friend-option { gap: .55rem; } .friend-choice { display: none; } }
</style>
