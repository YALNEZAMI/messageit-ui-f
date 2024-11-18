<template>
  <main>
    <div class="flex flex-wrap justify-center">
      <Conversation
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="false"
      />
      <NoResult
        v-if="getConvs().length == 0"
        :message="'Aucune conversations pour le moment.'"
      />
    </div>
  </main>
</template>
<script lang="ts" setup>
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
definePageMeta({
  layout: "private-space",
  middleware: "conversations",
});
onBeforeMount(async () => {
  await useConversationsStore().getInitalConversations();
});
</script>
