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
        (noFriendRequests() && categorie == 'FriendRequests') ||
        (noAcceptations() && categorie == 'Acceptations')
      "
      class="mt-3"
      :message="getNoResultMessage()"
    ></NoResult>
    <div
      style="min-height: 31rem; scrollbar-width: thin"
      class="flex overflow-y-auto justify-center"
    >
      <!--friendrequests data-->
      <div
        style="max-height: 31rem; scrollbar-width: thin"
        v-if="categorie == 'FriendRequests'"
        class="overflow-y-auto lg:w-3/4 h-max w-full flex flex-wrap justify-center"
      >
        <User
          v-for="fr of getFriendRequests()"
          :key="fr._id"
          :user="fr.sender"
        ></User>
        <div
          class="w-11/12 md:w-1/3 m-1"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
          :class="{
            hidden: !isFriendRequestsPulse(),
          }"
        >
          <Pulse
            v-if="isFriendRequestsPulse()"
            class="w-full overflow-hidden bg-gray-300 rounded"
          ></Pulse>
        </div>
      </div>
      <!--acceptations-->
      <div
        style="max-height: 31rem; scrollbar-width: thin"
        v-if="categorie == 'Acceptations'"
        class="overflow-y-auto lg:w-3/4 h-max w-full flex flex-wrap justify-center"
      >
        <div
          class="w-11/12 md:w-1/3 m-1"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
          :class="{
            hidden: !isAcceptationsPulse(),
          }"
        >
          <Pulse
            v-if="isAcceptationsPulse()"
            class="w-full overflow-hidden bg-gray-300 rounded"
          ></Pulse>
        </div>
        <User
          v-for="acc of getAcceptations()"
          :key="acc._id"
          :user="acc.recipient"
        ></User>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
//Ref<"FriendRequests" | "Acceptations">
const isFriendRequestsPulse = () => {
  return useFriendsStore().isFriendRequestsPulse;
};
const isAcceptationsPulse = () => {
  return useFriendsStore().isAcceptationsPulse;
};
const categorie = ref("Acceptations");
const getFriendRequests = (): any[] => {
  return useFriendsStore().friendRequests;
};
const getAcceptations = (): any[] => {
  return useFriendsStore().acceptations;
};
const noFriendRequests = (): boolean => {
  return getFriendRequests().length == 0;
};
const noAcceptations = (): boolean => {
  return getAcceptations().length == 0;
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
  eventBus.emit("notificationNumberChanged", true);
});
const clearAcceptations = async () => {
  await useFriendsStore().clearAcceptations();
};
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
