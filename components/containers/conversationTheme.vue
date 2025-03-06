<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      'bg-white text-black':
        useConversationsStore().currentConversation.theme?._id == 'basic',
      'bg-pink-400 text-white':
        useConversationsStore().currentConversation.theme?._id == 'love',
      'bg-black text-white':
        useConversationsStore().currentConversation.theme?._id == 'panda',
      'bg-green-400 text-white':
        useConversationsStore().currentConversation.theme?._id == 'spring',
    }"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const attrs = useAttrs();
</script>
