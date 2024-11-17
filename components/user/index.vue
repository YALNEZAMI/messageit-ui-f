<template>
  <ContainersTheme
    :id="user._id"
    class="flex items-center w-11/12 sm:w-96 h-16 rounded p-2 m-1 shadow-md"
  >
    <div class="relative">
      <NuxtImg class="w-14" :src="authStore.defaultUserImg" />
      <Status
        v-if="isMyFriend"
        class="absolute top-0 right-0"
        :user="getUser()"
      ></Status>
    </div>
    <div class="mx-2 w-1/2 md:3/4 truncate">
      {{ user ? user.name.toUpperCase() : "Deconnecté" }}
    </div>
    <div id="btngroupe">
      <!--delete and chat-->
      <div v-if="isMyFriend" class="flex flex-col sm:flex-row">
        <button
          type="button"
          @click="remove"
          class="userButton bg-red-500 hover:bg-red-600"
        >
          <div>Supprimer</div>
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
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="chatWithUser()"
          class="userButton bg-gray-400 hover:bg-gray-300 hover:text-black"
        >
          <div>Discuter</div>
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
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
        </button>
      </div>

      <!--add-->

      <button
        type="button"
        class="userButton bg-indigo-500 hover:bg-indigo-600"
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
        class="userButton bg-yellow-500 hover:bg-yellow-600"
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
      <div v-else-if="isHeSentFriendRequest" class="flex flex-col sm:flex-row">
        <!--accept-->

        <button
          @click="accept"
          type="button"
          class="userButton bg-green-500 hover:bg-green-600"
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
          class="userButton bg-red-500 hover:bg-red-600"
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
const user = props.user;
const getUser = () => {
  return props.user;
};
const authStore = useAuthStore();
const friendsStore = useFriendsStore();

const isMyFriend = ref(false);
const isISentFriendRequest = ref(false);
const isHeSentFriendRequest = ref(false);

onMounted(async () => {
  await setUserFriendShipStatus();
});
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
const chatWithUser = async () => {
  await useConversationsStore().chatWithUser(user);
};
</script>
