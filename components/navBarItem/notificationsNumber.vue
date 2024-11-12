<template>
  <main v-if="getNumber() != 0">
    <span class="relative flex h-4 w-3 justify-center">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"
      ></span>
      <span
        class="relative inline-flex rounded-full h-4 w-5 px-1 text-xs text-center bg-red-500 text-white opacity-80"
      >
        {{ getNumber() }}
      </span>
    </span>
  </main>
</template>
<script setup>
const props = defineProps({
  name: String,
});
const number = ref(0);

// const feathers = useNuxtApp().$feathers;
// const friendRequestService = feathers.service("friend-requests");
// friendRequestService.on("created", (data) => {
//   if (
//     data.recipient == useAuthStore().user._id &&
//     props.name == "Notifications"
//   ) {
//     number.value++;
//   }
// });
const getNumber = () => {
  if (props.name == "Notifications") {
    return (
      useFriendsStore().friendRequests.length +
      useFriendsStore().acceptations.length
    );
  } else {
    return 0;
  }
};
</script>
