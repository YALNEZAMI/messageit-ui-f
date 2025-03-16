<template>
  <main style="height: 36rem">
    <!--input-->
    <div class="flex justify-center bg-gray-200 p-2">
      <input
        @input="search"
        type="text"
        v-model="key"
        class="p-2 w-1/2 md:w-1/4"
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
      v-if="getSearchedMessages().length > 0"
      class="flex flex-wrap justify-center"
    >
      <ContainersConversationTheme
        v-for="msg of getSearchedMessages()"
        :key="msg._id"
        @click="
          $router.push(
            `/conversations/${$route.params.id}/messages?messageId=${msg._id}`
          )
        "
        class="bg-black cursor-pointer rounded w-full h-16 p-2 m-1 flex items-center text-black"
      >
        <NuxtImg
          class="h-full w-16 rounded-full"
          :src="getSender(msg).image"
        ></NuxtImg>
        <div class="w-3/4 ml-3">
          <div class="text-xl font-bold">{{ getSender(msg).name }}</div>
          <div>{{ msg.text }}</div>
        </div>
        <div class="text-xs">
          {{ useMessagesStore().getDate(msg.createdAt + "") }}
        </div>
      </ContainersConversationTheme>

      <div
        class="w-11/12 md:w-1/3 m-1"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isSearchMessagesPulse(),
        }"
      >
        <Pulse
          v-if="isSearchMessagesPulse()"
          class="w-full overflow-hidden bg-gray-300"
        ></Pulse>
      </div>
    </div>
    <NoResult
      v-if="getSearchedMessages().length == 0"
      class="mt-3"
      :message="key ? `Aucun resultat pour << ${key} >>` : 'Aucun resultat'"
    ></NoResult>
  </main>
</template>

<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const key = ref("");

const search = async () => {
  await useMessagesStore().search(key.value);
};
const searchButton = async () => {
  await search();
};
const getSearchedMessages = () => {
  return useMessagesStore().searchedMessages;
};
const isSearchMessagesPulse = () => {
  return useMessagesStore().isSearchMessagePulse;
};
const getSender = (msg: Message): User => {
  return msg.sender as User;
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
document.addEventListener("keydown", async (e) => {
  if (e.key == "Enter") {
    await search();
    return;
  }
});
</script>
