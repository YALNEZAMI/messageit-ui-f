<template>
  <main class="p-2">
    <!--search bar-->
    <div class="flex justify-center w-3/4 mx-auto">
      <ElementsInputsText
        type="text"
        @onInput="onInput($event)"
      ></ElementsInputsText>
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
const onInput = async (reqParam: string) => {
  req.value = reqParam;
  await search();
};
definePageMeta({
  layout: "private-space",
  middleware: "conversations",
});
onBeforeMount(async () => {
  await useConversationsStore().getInitalConversations();
});
</script>
