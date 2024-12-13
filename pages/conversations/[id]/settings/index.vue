<template>
  <main style="height: 36rem">
    <div class="flex justify-center">
      <NuxtImg :src="conversation.image" class="w-28 h-28"></NuxtImg>
    </div>
    <div class="flex my-2 flex-col md:flex-row text-black">
      <!--name-->
      <div v-if="conversation.type == 'group'" class="flex space-x-2 my-1">
        <div>Nom du groupe:</div>
        <input
          type="text"
          v-model.trim="conversation.name"
          class="rounded p-1 px-2"
        />
      </div>
      <!--theme-->
      <div
        class="flex items-center my-2"
        :class="{
          'justify-center': conversation.type != 'group',
        }"
      >
        <div>Thème:</div>
        <select
          v-model="conversation.theme"
          name="theme"
          class="p-1 mx-2 rounded cursor-pointer"
        >
          <option
            v-for="theme of useConversationsStore().themes"
            :key="theme._id"
            :value="theme"
          >
            {{ theme.name }}
          </option>
        </select>
      </div>
    </div>
    <!--success message-->
    <div v-if="success" class="text-center bg-green-600 p-2">
      La conversation a été mise à jour avec success.
    </div>
    <!--alert-->
    <div v-if="alert.bool" class="text-center bg-red-600 p-2">
      {{ alert.message }}
    </div>
    <!--update conversation-->
    <div class="flex justify-center my-2 mb-10">
      <button
        @click="update"
        class="bg-green-600 cursor-pointer border-0 hover:bg-green-500 transition-all duration-500 ease-in-out flex space-x-2 items-center rounded text-white p-2"
      >
        <div>Mettre à jour la conversation</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      </button>
    </div>
    <!--leave conversation-->
    <div class="flex justify-center my-2">
      <button
        @click="leave"
        class="bg-red-600 cursor-pointer border-0 hover:bg-red-500 transition-all duration-500 ease-in-out flex space-x-2 items-center rounded text-white p-2"
      >
        <div>Quitter la conversation</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
      </button>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";

const conversation = ref(useConversationsStore().currentConversation);
const update = async () => {
  const convToUpdate = {
    _id: conversation.value._id,
    theme: conversation.value.theme,
  } as Conversation;
  if (conversation.value.type == "group") {
    if (conversation.value.name == "") {
      lanceAlert("Le nom du groupe est requis.");
      return;
    }
    convToUpdate.name = conversation.value.name;
  }
  const response = await useConversationsStore().updateConversation(
    convToUpdate
  );
  if (response) {
    success.value = true;
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } else {
    lanceAlert("Une erreur est survenue lors de la mise à jour !");
  }
};
const success = ref(false);
const alert = ref({
  bool: false,
  message: "",
});
const lanceAlert = (msg: string) => {
  alert.value.bool = true;
  alert.value.message = msg;
  setTimeout(() => {
    alert.value.bool = false;
  }, 3000);
};
const leave = async () => {
  await useConversationsStore().leave();
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
