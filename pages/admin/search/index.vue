<template>
  <main>
    <!--input-->
    <div class="flex justify-center">
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
    <div>
      <User
        v-for="user of usersStore.searchedUsers"
        :key="user._id"
        :user="user"
      ></User>
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
