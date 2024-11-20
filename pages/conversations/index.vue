<template>
  <main>
    <div class="flex flex-wrap justify-center">
      <Conversation
        class="w-full md:w-1/3"
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
