<template>
  <main class="flex flex-col">
    <!--categories-->
    <div class="flex flex-wrap justify-center w-full my-2 bg-gray-100 p-2">
      <button
        type="button"
        @click="categorie = 'FriendRequests'"
        :class="{
          'border-2 border-red-500':
            useFriendsStore().friendRequests.length > 0,
        }"
        class="w-full sm:w-1/3 m-2 my-1 p-2 rounded bg-yellow-600 text-white border-0 cursor-pointer hover:bg-yellow-500 transition-all duration-500"
      >
        {{ useFriendsStore().friendRequests.length }} demandes d'amitié reçues
      </button>
      <button
        type="button"
        @click="categorie = 'Acceptations'"
        class="w-full sm:w-1/3 m-2 my-1 p-2 rounded bg-green-600 text-white border-0 cursor-pointer hover:bg-green-500 transition-all duration-500"
        :class="{
          'border-2 border-red-500': useFriendsStore().acceptations.length > 0,
        }"
      >
        {{ useFriendsStore().acceptations.length }} demandes d'amitié acceptées
      </button>
    </div>
    <!--no result-->
    <NoResult
      v-if="
        (getFriendRequests().length == 0 && categorie == 'FriendRequests') ||
        (getAcceptations().length == 0 && categorie == 'Acceptations')
      "
      class="mt-3"
      :message="getNoResultMessage()"
    ></NoResult>
    <!--friendrequests data-->
    <div
      v-if="categorie == 'FriendRequests'"
      class="overflow-y-auto"
      style="height: 27rem"
    >
      <div v-for="fr of getFriendRequests()" :key="fr._id">
        <User :user="fr.sender"></User>
      </div>
    </div>
    <!--acceptations-->
    <div
      v-if="categorie == 'Acceptations'"
      class="overflow-y-auto"
      style="height: 27rem"
    >
      <div v-for="acc of getAcceptations()" :key="acc._id">
        <User :user="acc.recipient"></User>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
//Ref<"FriendRequests" | "Acceptations">
const categorie = ref("Acceptations");
const getFriendRequests = (): any[] => {
  return useFriendsStore().friendRequests;
};
const getAcceptations = (): any[] => {
  return useFriendsStore().acceptations;
};
const getNoResultMessage = (): string => {
  if (categorie.value == "FriendRequests") {
    return "Aucune demande d'amitié trouvée.";
  } else {
    return "Aucune notification d'acceptation trouvée.";
  }
};

onUnmounted(async () => {
  for (let friendRes of getFriendRequests()) {
    await useFriendsStore().setFriendRequestAsSeen(friendRes._id);
  }
  await clearAcceptations();
});
const clearAcceptations = async () => {
  await useFriendsStore().clearAcceptations();
};
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
