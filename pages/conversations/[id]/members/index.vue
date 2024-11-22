<template>
  <main>
    <div
      class="overflow-y-auto flex sm:justify-center flex-col sm:flex-row"
      style="height: 35.9rem; scrollbar-width: thin"
    >
      <User v-for="user of getMembers()" :key="user._id" :user="user"></User>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const getMembers = (): User[] => {
  return useConversationsStore().currentConversation.members as User[];
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
