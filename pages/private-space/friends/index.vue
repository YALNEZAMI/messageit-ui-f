<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">VOTRE RÉSEAU</p>
      <h1>Amis</h1>
      <p>Retrouvez les personnes avec qui vous échangez.</p>
    </div>

    <section class="network-panel" aria-labelledby="friends-title">
      <div class="network-panel-heading">
        <div class="network-heading-content">
          <span class="network-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 13v-2a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <div>
            <h2 id="friends-title">Votre cercle</h2>
            <p>Vos amis, réunis au même endroit.</p>
          </div>
        </div>
        <NuxtLink class="network-link" to="/private-space/search">
          Trouver des personnes <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div class="network-list-heading">
        <h3>Mes amis</h3>
        <span v-if="!loading && !errorMessage" class="network-count">
          {{ friendsStore.friends.length }} {{ friendsStore.friends.length === 1 ? "ami" : "amis" }}
        </span>
      </div>
      <p v-if="loading" class="network-status" role="status">Chargement de vos amis…</p>
      <p v-else-if="errorMessage" class="search-error" role="alert">
        {{ errorMessage }} <button type="button" @click="loadFriends">Réessayer</button>
      </p>
      <div v-else-if="friendsStore.friends.length" class="network-grid">
        <User v-for="friend in friendsStore.friends" :key="friend._id" :user="friend" />
      </div>
      <div v-else class="network-empty">
        <span class="network-empty-icon" aria-hidden="true">✦</span>
        <h3>Votre cercle commence ici</h3>
        <p>Vous n'avez pas encore d'amis. Découvrez des personnes avec qui échanger.</p>
        <NuxtLink class="network-link" to="/private-space/search">Rechercher des personnes <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
const friendsStore = useFriendsStore();
const loading = ref(true);
const errorMessage = ref("");

const loadFriends = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    await friendsStore.getMyFriends();
  } catch (error) {
    console.error("Impossible de charger les amis :", error);
    errorMessage.value = "Impossible de charger vos amis.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadFriends);
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>
