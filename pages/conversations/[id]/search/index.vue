<template>
  <main class="page-section">
    <div class="page-heading"><div><p class="page-eyebrow">CONVERSATION</p><h1>Rechercher un message</h1><p>Retrouvez un échange dans cette conversation.</p></div></div>
    <!--input-->
    <div class="flex justify-center w-full max-w-xl mx-auto">
      <ElementsInputsText
        type="text"
        @onInput="onInput($event)"
      ></ElementsInputsText>
    </div>
    <!--result container-->
    <div
      v-if="getSearchedMessages().length > 0"
      style="max-height: 70vh"
      class="flex flex-wrap justify-center overflow-y-auto"
    >
      <ContainersConversationTheme
        v-for="msg of getSearchedMessages()"
        :key="msg._id"
        @click="
          $router.push(
            `/conversations/${$route.params.id}/messages?messageId=${msg._id}`
          )
        "
        class="conversation-card cursor-pointer w-full min-h-16 p-2 m-1 flex items-center"
      >
        <ImagesFallback
          class="h-16 w-16 shrink-0 rounded-full object-cover"
          :src="getSender(msg)?.image"
          :fallback="useConversationsStore().getDefaultImage(getSender(msg)?.aiUser ? 'ai' : 'private')"
          alt=""
        />
        <div class="w-full ml-3">
          <div class="text-xl font-bold">{{ getSender(msg)?.aiUser ? 'Boby' : (getSender(msg)?.name || 'Utilisateur') }}</div>
          <div class="flex">
            <div class="truncate w-40 md:w-1/2">{{ msg.text }}</div>
            <div class="text-xs w-1/2 flex justify-end">
              {{ useMessagesStore().getDate(msg.createdAt + "") }}
            </div>
          </div>
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

const getSearchedMessages = () => {
  return useMessagesStore().searchedMessages;
};
const isSearchMessagesPulse = () => {
  return useMessagesStore().isSearchMessagePulse;
};
const getSender = (msg: Message): User | undefined => {
  return typeof msg.sender === "object" ? msg.sender : undefined;
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
const onInput = async (reqParam: string) => {
  key.value = reqParam;
  await search();
};
onBeforeUnmount(() => {
  useMessagesStore().setSearchedMessages([]);
});
</script>
