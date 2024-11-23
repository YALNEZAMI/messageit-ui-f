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
      <div
        class="w-11/12 md:w-1/3"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
      >
        <Pulse v-if="isFriendsPulse()" class="w-full overflow-hidden"></Pulse>
      </div>
      <NoResult
        v-if="friendsStore.friends.length == 0"
        message="Pas d'amis pour l'instant"
      ></NoResult>
    </div>
  </main>
</template>
<script lang="ts" setup>
const friendsStore = useFriendsStore();
const isFriendsPulse = () => {
  return useFriendsStore().isFriendsPulse;
};
onMounted(async () => {
  await friendsStore.getMyFriends();
});
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
