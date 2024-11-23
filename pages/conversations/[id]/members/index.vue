<template>
  <main style="min-height: 35.9rem">
    <div
      class="overflow-y-auto flex flex-wrap justify-center h-max"
      style="max-height: 35.9rem; scrollbar-width: thin"
    >
      <User v-for="user of getMembers()" :key="user._id" :user="user"></User>
      <div
        class="w-full m-2 rounded md:w-1/3"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isConversationPulse(),
        }"
      >
        <Pulse
          v-if="isConversationPulse()"
          class="w-full overflow-hidden bg-gray-400"
        ></Pulse>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const getMembers = (): User[] => {
  return useConversationsStore().currentConversation.members as User[];
};
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
