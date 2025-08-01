<template>
  <main style="height: 36rem">
    <!--input-->
    <div
      class="flex justify-between flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:px-5 bg-gray-200 py-2"
    >
      <div class="flex justify-center sm:justify-normal w-3/4 mx-auto">
        <button
          type="button"
          class="cursor-pointer rounded text-indigo-600 border-2 border-solid border-indigo-500 bg-indigo-50 hover:bg-indigo-100 md:p-2 p-1 mx-2 transition-all duration-500"
          @click="searchButton"
        >
          Rechercher
        </button>
        <ElementsInputsText
          type="text"
          @onInput="onInput($event)"
        ></ElementsInputsText>
      </div>
      <div class="flex justify-center text-black space-x-2">
        <label>
          Utilisateurs
          <div class="flex justify-center">
            <input
              v-model="category"
              type="radio"
              name="option"
              value="users"
              checked
            />
          </div>
        </label>
        <label>
          Conversations
          <div class="flex justify-center">
            <input
              v-model="category"
              type="radio"
              name="option"
              value="conversations"
            />
          </div>
        </label>
      </div>
    </div>
    <!--users result container-->
    <div
      v-if="getSearchedUsers().length > 0 && category == 'users'"
      class="flex flex-wrap justify-center p-2"
    >
      <User
        v-for="user of getSearchedUsers()"
        :key="user._id"
        :user="user"
      ></User>
      <div
        class="w-11/12 md:w-1/3 m-1"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isSearchUsersPulse(),
        }"
      >
        <Pulse
          v-if="isSearchUsersPulse()"
          class="w-full overflow-hidden bg-gray-300"
        ></Pulse>
      </div>
    </div>
    <!--conversations result container-->
    <div
      v-if="
        getSearchedConversations().length > 0 && category == 'conversations'
      "
      class="flex flex-wrap justify-center p-2"
    >
      <Conversation
        v-for="conv of getSearchedConversations()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="false"
      ></Conversation>
      <div
        class="w-11/12 md:w-1/3 m-1"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isSearchConversationsPulse(),
        }"
      >
        <Pulse
          v-if="isSearchConversationsPulse()"
          class="w-full overflow-hidden bg-gray-300"
        ></Pulse>
      </div>
    </div>
    <NoResult
      v-if="
        (getSearchedConversations().length == 0 &&
          category == 'conversations') ||
        (getSearchedUsers().length == 0 && category == 'users')
      "
      class="mt-3"
      :message="req ? `Aucun resultat pour << ${req} >>` : 'Aucun resultat'"
    ></NoResult>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const usersStore = useUsersStore();
const req = ref("");
const category = ref("users");
const search = async () => {
  await usersStore.search(req.value);
  await useConversationsStore().searchConversations(req.value);
};
const isSearchUsersPulse = () => {
  return useUsersStore().isSearchUsersPulse;
};
const isSearchConversationsPulse = () => {
  return useConversationsStore().isSearchedConversationsPulse;
};
const getSearchedUsers = (): User[] => {
  return usersStore.searchedUsers;
};
const getSearchedConversations = () => {
  return useConversationsStore().searchedConversations;
};
const searchButton = async () => {
  usersStore.setsearchedUsers([]);
  useConversationsStore().setSearchedConversations([]);
  await search();
};
onMounted(async () => {
  await search();
});
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
document.addEventListener("keydown", async (e) => {
  if (e.key == "Enter") {
    await search();
    return;
  }
});
const onInput = async (reqParam: string) => {
  req.value = reqParam;
  await search();
};
</script>
