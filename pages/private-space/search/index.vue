<template>
  <main style="height: 36rem">
    <!--input-->
    <div class="flex justify-center bg-gray-200 p-2">
      <input
        @input="search"
        type="text"
        v-model="req"
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
    <NoResult
      v-if="getSearchedUsers().length == 0"
      class="mt-3"
      :message="req ? `Aucun resultat pour << ${req} >>` : 'Aucun resultat'"
    ></NoResult>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const usersStore = useUsersStore();
const req = ref("");
const search = async () => {
  await usersStore.search(req.value);
};
const isSearchUsersPulse = () => {
  return useUsersStore().isSearchUsersPulse;
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
