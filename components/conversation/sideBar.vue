<template>
  <div
    style="max-height: 35.5rem; direction: rtl; scrollbar-width: thin"
    class="overflow-y-auto scro flex justify-center flex-wrap h-max"
  >
    <Conversation
      style="direction: ltr"
      class="mb-1 overflow-hidden"
      v-for="conv of getConvs()"
      :key="conv._id"
      :conversation="conv"
      :isSideBar="true"
    ></Conversation>
    <div
      class="w-11/12"
      v-for="(pulse, index) in ([].length = 10)"
      :key="index"
      :class="{
        hidden: !isConversationPulse(),
      }"
    >
      <Pulse
        style="direction: ltr"
        v-if="isConversationPulse()"
        class="w-full overflow-hidden"
      ></Pulse>
    </div>
  </div>
</template>
<script lang="ts" setup>
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
</script>
