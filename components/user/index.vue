<template>
  <ContainersTheme
    :id="user._id"
    class="flex items-center w-11/12 sm:w-96 h-16 rounded p-2 m-1 shadow-md"
  >
    <NuxtImg class="w-14" :src="authStore.defaultUserImg" />
    <div class="mx-2 w-1/2 md:3/4 truncate">
      {{ user ? user.name.toUpperCase() : "Deconnecté" }}
    </div>
    <div id="btngroupe">
      <!--delete-->

      <button
        type="button"
        @click="remove"
        v-if="isMyFriend"
        class="bg-red-500 hover:bg-red-600 transition-all duration-500 cursor-pointer text-white p-2 rounded mx-1 border-0 flex justify-center items-center space-x-2"
      >
        <div>Supprimer</div>
      </button>
      <!--add-->

      <button
        type="button"
        class="bg-green-500 hover:bg-green-600 transition-all duration-500 cursor-pointer text-white p-2 rounded mx-1 border-0 flex justify-center items-center space-x-2"
        v-else-if="
          !isMyFriend && !isISentFriendRequest && !isHeSentFriendRequest
        "
        @click="addFriendRequest"
      >
        <div>Ajouter</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
          />
        </svg>
      </button>
      <!--cancel-->
      <button
        type="button"
        class="bg-yellow-500 hover:bg-yellow-600 transition-all duration-500 cursor-pointer text-white p-2 rounded mx-1 border-0 flex justify-center items-center space-x-2"
        v-else-if="isISentFriendRequest"
        @click="
          cancelFriendRequest({
            sender: useAuthStore().user._id,
            recipient: user._id,
          })
        "
      >
        <div>Annuler</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      <div
        v-else-if="isHeSentFriendRequest"
        class="flex flex-col sm:flex-row space-y-1"
      >
        <!--accept-->

        <button
          @click="accept"
          type="button"
          class="bg-green-500 hover:bg-green-600 transition-all duration-500 cursor-pointer text-white p-2 rounded mx-1 border-0 flex justify-center items-center space-x-2"
        >
          <div>Accepter</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </button>
        <!--refuse-->

        <button
          type="button"
          class="bg-red-500 hover:bg-red-600 transition-all duration-500 cursor-pointer text-white p-2 rounded mx-1 border-0 flex justify-center items-center space-x-2"
          @click="
            cancelFriendRequest({
              recipient: useAuthStore().user._id,
              sender: user._id,
            })
          "
        >
          <div>Refuser</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </ContainersTheme>
</template>
<script setup>
const props = defineProps({
  user: Object,
});
const authStore = useAuthStore();
const friendsStore = useFriendsStore();

const isMyFriend = ref(false);
const isISentFriendRequest = ref(false);
const isHeSentFriendRequest = ref(false);

onMounted(async () => {
  await setUserFriendShipStatus();
});
const user = props.user;
const addFriendRequest = async () => {
  const response = await friendsStore.sendFriendRequest(user._id);
  await setUserFriendShipStatus();
};
const cancelFriendRequest = async (query) => {
  const response = await friendsStore.cancelFriendRequest(query);
  await setUserFriendShipStatus();
};
const setUserFriendShipStatus = async () => {
  isMyFriend.value = await friendsStore.isMyFriend(user._id);
  isISentFriendRequest.value = await friendsStore.IsISentFriendRequest(
    user._id
  );
  isHeSentFriendRequest.value = await friendsStore.IsHeSentFriendRequest(
    user._id
  );
};
const accept = async () => {
  await friendsStore.accept(user._id);
  await setUserFriendShipStatus();
};
const remove = async () => {
  await friendsStore.remove(user._id);
  await setUserFriendShipStatus();
};
</script>
