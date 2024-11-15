<template>
  <main>
    <!--input-->
    <div class="flex justify-center bg-gray-200 p-2">
      <input
        @input="search"
        type="text"
        v-model="req.text"
        class="p-2 rounded w-1/2 md:w-1/4"
        placeholder="Jack"
      />
      <button
        type="button"
        class="cursor-pointer bg-green-500 hover:bg-green-600 rounded text-white border-0 p-2 mx-2 transition-all duration-500"
        @click="searchButton"
      >
        Rechercher
      </button>
    </div>
    <!--result container-->
    <div
      v-if="getSearchedUsers().length > 0"
      class="flex flex-wrap justify-center"
    >
      <User
        v-for="user of getSearchedUsers()"
        :key="user._id"
        :user="user"
      ></User>
    </div>
    <NoResult
      v-if="getSearchedUsers().length == 0"
      class="mt-3"
      :message="
        req.text ? `Aucun resultat pour << ${req.text} >>` : 'Aucun resultat'
      "
    ></NoResult>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const usersStore = useUsersStore();
const req = ref({ text: "" });
const search = async () => {
  await usersStore.search(req.value);
};
const getSearchedUsers = (): User[] => {
  return usersStore.searchedUsers;
};
const searchButton = async () => {
  usersStore.setsearchedUsers([]);
  await search();
};
onMounted(async () => {
  await search();
});
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
