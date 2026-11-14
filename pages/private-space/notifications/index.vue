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

      <div class="network-list-heading">
        <h3>Activité récente</h3>
        <span v-if="!isLoading" class="network-count">{{ notifications.length }} {{ notifications.length === 1 ? "notification" : "notifications" }}</span>
      </div>
      <p v-if="loadError" role="alert">{{ loadError }} <button type="button" @click="loadNotifications">Réessayer</button></p>
      <p v-if="isLoading && !notifications.length" class="network-status" role="status">Chargement des notifications…</p>
      <div v-else-if="notifications.length" class="notification-list">
        <article v-for="item in notifications" :key="`${item.kind}-${item.notification._id}`" class="notification-card">
          <div class="notification-meta">
            <span class="notification-kind" :class="{ 'notification-accepted': item.kind === 'accepted' }">{{ item.kind === "request" ? "Demande reçue" : "Demande acceptée" }}</span>
            <time v-if="formatDate(item.notification.createdAt)" :datetime="item.notification.createdAt">{{ formatDate(item.notification.createdAt) }}</time>
          </div>
          <User v-if="typeof item.person !== 'string'" :user="item.person" />
          <p v-else class="notification-unavailable">Profil indisponible.</p>
        </article>
      </div>
      <div v-else-if="!loadError" class="network-empty">
        <span class="network-empty-icon" aria-hidden="true">✦</span>
        <h3>Aucune notification</h3>
        <p>Vos demandes d'amitié et vos nouvelles connexions apparaîtront ici.</p>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
const friendsStore = useFriendsStore();
const loadError = ref("");
const loadNotifications = async () => {
  loadError.value = "";
  try {
    await Promise.all([friendsStore.getFriendRequestsSentToMe(), friendsStore.getAcceptedFriendRequests()]);
  } catch (error) {
    console.error("Impossible de charger les notifications :", error);
    loadError.value = "Impossible de charger toutes les notifications.";
  }
};
onMounted(loadNotifications);
const notifications = computed(() => {
  const requests = friendsStore.friendRequests.map((notification) => ({
    kind: "request" as const, notification, person: notification.sender,
  }));
  const accepted = friendsStore.acceptations.map((notification) => ({
    kind: "accepted" as const, notification, person: notification.recipient,
  }));
  return [...requests, ...accepted].sort((a, b) => {
    const time = (value?: string) => {
      const timestamp = value ? Date.parse(value) : NaN;
      return Number.isNaN(timestamp) ? -Infinity : timestamp;
    };
    return time(b.notification.createdAt) - time(a.notification.createdAt);
  });
});
const isLoading = computed(() => friendsStore.isFriendRequestsPulse || friendsStore.isAcceptationsPulse);
const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

onUnmounted(async () => {
  const requests = friendsStore.friendRequests.filter((request) => !request.seen);
  const acceptedIds = friendsStore.acceptations.map((acceptation) => acceptation._id);
  try {
    for (const request of requests) {
      await friendsStore.setFriendRequestAsSeen(request._id);
    }
    await friendsStore.clearAcceptations(acceptedIds);
    eventBus.emit("notificationNumberChanged", true);
  } catch (error) {
    console.error("Impossible de marquer les notifications comme lues :", error);
  }
});
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>

<style scoped>
.notification-list { grid-template-columns: minmax(0, 1fr); }
.notification-accepted { background: #e7f7ed; color: #166534; }
</style>
