<template>
  <main>
    <!--search bar-->
    <div class="flex justify-center">
      <div class="relative w-3/4 md:w-1/2">
        <input
          v-model="req"
          @input="search"
          type="text"
          class="rounded-md w-full p-2 bg-gray-200 transition-all duration-500 ease-in-out focus:bg-white"
          placeholder="Recherche..."
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
    <div style="min-height: 32rem" class="flex justify-center pb-2">
      <div
        style="max-height: 32rem; scrollbar-width: thin"
        class="flex pb-3 h-max w-full lg:w-3/4 justify-center flex-wrap overflow-y-auto p-2"
      >
        <Conversation
          v-for="conv of getConvs()"
          :key="conv._id"
          :conversation="conv"
          :isSideBar="false"
        />
        <!--pulse effect-->
        <div
          class="w-11/12 md:w-1/3 m-1"
          :class="{
            hidden: !isPulse() && !isSearchConversationsPulse(),
          }"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
        >
          <Pulse
            v-if="isPulse() || isSearchConversationsPulse()"
            class="w-full overflow-hidden bg-gray-300 rounded"
          ></Pulse>
        </div>

        <NoResult
          v-if="isNoConversations()"
          message="Aucune conversations pour le moment."
        />
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
// import { Conversation } from "~/interfaces/conversation";

const req = ref("");
const searchedConversations = ref([] as any[]);
const search = async () => {
  const res = await useConversationsStore().searchConversations(req.value);
  searchedConversations.value = res;
};
const isSearchConversationsPulse = () => {
  return useConversationsStore().isSearchedConversationsPulse;
};
const getConvs = (): any[] => {
  return req.value == ""
    ? useConversationsStore().conversations
    : searchedConversations.value;
};
const isPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const isNoConversations = (): boolean => {
  return getConvs().length == 0;
};
definePageMeta({
  layout: "private-space",
  middleware: "conversations",
});
onBeforeMount(async () => {
  await useConversationsStore().getInitalConversations();
});
</script>
