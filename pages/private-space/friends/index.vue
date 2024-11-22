<template>
  <main class="flex justify-center" style="min-height: 35rem">
    <div
      class="overflow-y-auto flex justify-center flex-wrap lg:w-3/4 h-max"
      style="max-height: 35rem; scrollbar-width: thin"
    >
      <User
        v-for="friend in friendsStore.friends"
        :key="friend._id"
        :user="friend"
      ></User>
      <NoResult
        v-if="friendsStore.friends.length == 0"
        message="Pas d'amis pour l'instant"
      ></NoResult>
    </div>
  </main>
</template>
<script lang="ts" setup>
const friendsStore = useFriendsStore();
onMounted(async () => {
  await friendsStore.getMyFriends();
});
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
