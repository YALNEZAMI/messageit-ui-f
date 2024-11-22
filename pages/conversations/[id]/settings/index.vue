<template>
  <main>
    <div class="flex justify-center">
      <NuxtImg :src="conversation.image" class="w-28 h-28"></NuxtImg>
    </div>
    <div class="flex my-2 flex-col md:flex-row">
      <!--name-->
      <div v-if="conversation.type == 'group'" class="flex space-x-2 my-1">
        Nom du groupe:
        <input
          type="text"
          v-model="conversation.name"
          class="rounded p-1 px-2"
        />
      </div>
      <div class="flex">
        <div>Thème</div>
        <select
          v-model="conversation.theme"
          name="theme"
          class="p-1 mx-2 rounded"
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
    <!--update conversation-->
    <div class="flex justify-center my-2">
      <button
        @click="update"
        class="bg-green-600 border-0 hover:bg-green-500 transition-all duration-500 ease-in-out flex space-x-2 items-center rounded text-white p-2"
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
        class="bg-red-600 border-0 hover:bg-red-500 transition-all duration-500 ease-in-out flex space-x-2 items-center rounded text-white p-2"
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
    convToUpdate.name = conversation.value.name;
  }
  await useConversationsStore().updateConversation(convToUpdate);
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
