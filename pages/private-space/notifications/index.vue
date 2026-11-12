<template>
  <main class="page-section">
    <div class="page-heading">
      <p class="page-eyebrow">ACTIVITÉ</p>
      <h1>Notifications</h1>
      <p>Suivez vos demandes et vos nouvelles connexions.</p>
    </div>

    <section class="network-panel" aria-labelledby="activity-title">
      <div class="network-panel-heading">
        <div class="network-heading-content">
          <span class="network-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </svg>
          </span>
          <div>
            <h2 id="activity-title">Votre activité</h2>
            <p>Vos demandes et connexions en un coup d'œil.</p>
          </div>
        </div>
      </div>

      <div class="notification-categories" role="group" aria-label="Catégorie de notifications">
        <button type="button" :class="{ active: category === 'FriendRequests' }" :aria-pressed="category === 'FriendRequests'" @click="category = 'FriendRequests'">
          <span>Demandes reçues</span>
          <span class="notification-count">{{ friendsStore.friendRequests.length }}</span>
        </button>
        <button type="button" :class="{ active: category === 'Acceptations' }" :aria-pressed="category === 'Acceptations'" @click="category = 'Acceptations'">
          <span>Demandes acceptées</span>
          <span class="notification-count">{{ friendsStore.acceptations.length }}</span>
        </button>
      </div>

      <div class="network-list-heading">
        <h3>{{ category === "FriendRequests" ? "Demandes d'amitié" : "Nouvelles connexions" }}</h3>
        <span v-if="!isLoading" class="network-count">{{ notifications.length }} {{ notifications.length === 1 ? "notification" : "notifications" }}</span>
      </div>
      <p v-if="isLoading && !notifications.length" class="network-status" role="status">Chargement des notifications…</p>
      <div v-else-if="notifications.length" class="notification-list">
        <article v-for="item in notifications" :key="item.notification._id" class="notification-card">
          <div class="notification-meta">
            <span class="notification-kind">{{ category === "FriendRequests" ? "Demande reçue" : "Demande acceptée" }}</span>
            <time v-if="formatDate(item.notification.createdAt)" :datetime="item.notification.createdAt">{{ formatDate(item.notification.createdAt) }}</time>
          </div>
          <User v-if="typeof item.person !== 'string'" :user="item.person" />
          <p v-else class="notification-unavailable">Profil indisponible.</p>
        </article>
      </div>
      <div v-else class="network-empty">
        <span class="network-empty-icon" aria-hidden="true">✦</span>
        <h3>{{ category === "FriendRequests" ? "Aucune demande reçue" : "Aucune nouvelle connexion" }}</h3>
        <p>{{ category === "FriendRequests" ? "Les demandes d'amitié que vous recevrez apparaîtront ici." : "Les acceptations de vos demandes apparaîtront ici." }}</p>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
const friendsStore = useFriendsStore();
const category = ref<"FriendRequests" | "Acceptations">("Acceptations");
const notifications = computed(() => {
  const requests = category.value === "FriendRequests";
  return (requests ? friendsStore.friendRequests : friendsStore.acceptations).map((notification) => ({
    notification,
    person: requests ? notification.sender : notification.recipient,
  }));
});
const isLoading = computed(() => category.value === "FriendRequests" ? friendsStore.isFriendRequestsPulse : friendsStore.isAcceptationsPulse);
const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

onUnmounted(async () => {
  for (const request of friendsStore.friendRequests) {
    await friendsStore.setFriendRequestAsSeen(request._id);
  }
  await friendsStore.clearAcceptations();
  eventBus.emit("notificationNumberChanged", true);
});
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>
