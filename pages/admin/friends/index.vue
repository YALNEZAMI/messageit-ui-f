<template>
  <main>
    <User
      v-for="friend in friendsStore.friends"
      :key="friend._id"
      :user="friend"
    ></User>
  </main>
</template>
<script lang="ts" setup>
const friendsStore = useFriendsStore();
onMounted(async () => {
  await friendsStore.getMyFriends();
});
definePageMeta({
  layout: "admin",
});
</script>
