<template>
  <main>
    <div
      class="overflow-y-auto flex sm:justify-center flex-col sm:flex-row"
      style="height: 35.9rem; scrollbar-width: thin"
    >
      <User v-for="user of getMembers()" :key="user._id" :user="user"></User>
      <div
        class="w-11/12 md:w-1/3"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
      >
        <Pulse
          v-if="isConversationPulse()"
          class="w-full overflow-hidden"
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
