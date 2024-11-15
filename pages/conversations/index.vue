<template>
  <main>
    <div>
      <Conversation
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
      ></Conversation>
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
