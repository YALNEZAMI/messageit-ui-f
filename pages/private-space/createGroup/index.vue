<template>
  <main style="min-height: 35.9rem">
    <div class="flex justify-between items-center">
      <!--filter input-->
      <div class="flex justify-center mb-1">
        <div class="relative w-full">
          <input
            placeholder="Recherche d'amis..."
            class="w-full pt-3 pb-2 px-3 rounded-md border-2 border-solid border-black"
            type="text"
            v-model="key"
          />
          <!--search icon-->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 text-black absolute -right-1 top-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>
      <div class="w-1/2 flex justify-end pr-2 items-center space-x-10">
        <div class="relative my-4 w-1/2 md:w-1/3 lg:w-1/4">
          <label
            @click="nameGroupLabelClicked"
            id="nameGroupLabel"
            for="groupName"
            class="overflow-visible text-black rounded-md cursor-text absolute z-10 left-3 transition-all duration-300 ease-in-out"
            :class="{
              'top-2 bg-white': !nameGroupInputIsFocused && group.name == '',
              '-top-2 ': nameGroupInputIsFocused || group.name != '',
            }"
          >
            <div class="relative z-10">Nom du groupe</div>
            <div
              class="absolute h-1 w-full bg-white top-2 z-0"
              :class="{ hidden: !nameGroupInputIsFocused && group.name == '' }"
            ></div>
          </label>

          <input
            v-model="group.name"
            id="nameGroupInput"
            type="text"
            placeholder="Les amis"
            class="w-full pt-3 pb-2 px-3 rounded-2xl border-2 border-solid border-black"
          />
        </div>
        <button
          @click="createGroupe"
          class="p-2 rounded cursor-pointer bg-indigo-500 hover:bg-indigo-600 transition-all duration-500 ease-in-out h-max text-white"
        >
          Create
        </button>
      </div>
    </div>

    <!--friends-->
    <div
      style="max-height: 31rem"
      class="flex flex-wrap justify-center h-max overflow-y-auto"
    >
      <div
        class="w-11/12 md:w-1/3 m-1"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isFriendsPulse(),
        }"
      >
        <Pulse
          v-if="isFriendsPulse()"
          class="w-full bg-gray-300 overflow-hidden"
        ></Pulse>
      </div>
      <div
        @click="select(friend._id)"
        class="flex items-center w-full cursor-pointer justify-center"
        v-for="friend of getFriends()"
        :key="friend._id"
      >
        <User :user="friend" :noButtons="true"></User>
        <!--not selected svg-->
        <svg
          v-if="!isSelected(friend._id)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-black"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
          />
        </svg>
        <!--selected svg-->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-6 text-black"
        >
          <path
            fill-rule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    <!--error popup-->
    <div
      class="flex justify-center items-center fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50"
      v-if="alert.bool"
    >
      <div class="bg-white rounded w-3/4 h-max p-2 py-4">
        <div class="flex justify-center my-1 text-red-500">
          <strong>OUPS !</strong>
        </div>
        <div class="text-center text-black">{{ alert.message }}</div>
        <div class="flex justify-center my-2">
          <button
            @click="alert.bool = false"
            class="p-1 rounded border-0 bg-orange-500 cursor-pointer hover:opacity-80 text-white px-2"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { User } from "~/interfaces/user";

const group: Ref<Conversation> = ref({
  name: "",
  members: [] as string[],
  type: "group",
});
const key = ref("");

const alert = ref({
  bool: false,
  message: "",
});
const lanceAlert = (msg: string): void => {
  alert.value.bool = true;
  alert.value.message = msg;
};
const isFriendsPulse = () => {
  return useFriendsStore().isFriendsPulse;
};
const createGroupe = async () => {
  if (group.value.name == "") {
    lanceAlert("Veillez spécifier un nom pour le groupe.");
    return;
  } else if (group.value.members.length < 2) {
    lanceAlert("Veillez sélectionner au moin deux amis.");
    return;
  } else {
    await useConversationsStore().createGroup(group.value);
  }
};
const getFriends = () => {
  if (key.value == "") {
    return useFriendsStore().friends;
  } else {
    return useFriendsStore().friends.filter((user: User) => {
      return (user.name as string)
        .toLowerCase()
        .includes(key.value.toLowerCase());
    });
  }
};
const select = (id: any) => {
  if (isSelected(id)) {
    group.value.members = group.value.members.filter((member: any) => {
      return id != member;
    }) as string[];
  } else {
    group.value.members.push(id);
  }
};
const isSelected = (id: any): boolean => {
  return group.value.members.includes(id);
};
definePageMeta({
  layout: "private-space",
});
const nameGroupInputIsFocused = ref(false);
const nameGroupLabelClicked = () => {
  nameGroupInputIsFocused.value = true;
  const nameGroupInput = document.getElementById(
    "nameGroupInput"
  ) as HTMLInputElement;

  nameGroupInput.focus();
};
onMounted(() => {
  const nameGroupInput = document.getElementById(
    "nameGroupInput"
  ) as HTMLInputElement;

  nameGroupInput.addEventListener("focus", () => {
    nameGroupInputIsFocused.value = true;
  });
  nameGroupInput.addEventListener("focusout", () => {
    nameGroupInputIsFocused.value = false;
  });
});
</script>
