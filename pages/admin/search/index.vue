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
        class="cursor-pointer bg-green-500 hover:bg-green-600 rounded text-white border-white p-2 mx-2 transition-all duration-500"
        @click="searchButton"
      >
        Rechercher
      </button>
    </div>
    <!--result container-->
    <div
      v-if="usersStore.searchedUsers.length > 0"
      class="flex flex-wrap justify-center"
    >
      <User
        v-for="user of usersStore.searchedUsers"
        :key="user._id"
        :user="user"
      ></User>
    </div>
    <div class="text-center bg-red-400 text-white p-2" v-else>
      Pas de resultat pour ce nom "{{ req.text }}"
    </div>
  </main>
</template>
<script lang="ts" setup>
const usersStore = useUsersStore();
const req = ref({ text: "" });
const search = async () => {
  await usersStore.search(req.value);
};
const searchButton = async () => {
  usersStore.setsearchedUsers([]);

  await search();
};
definePageMeta({
  layout: "admin",
});
</script>
