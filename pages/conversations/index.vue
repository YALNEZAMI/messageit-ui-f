<template>
  <main>
    <div>
      <Conversation v-for="conv of getConvs()" :key="conv._id"></Conversation>
    </div>
  </main>
</template>
<script lang="ts" setup>
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
definePageMeta({
  layout: "private-space",
});
</script>
