<template>
  <main
    class="conversation-notice"
  >
    <div>{{ message.text }}</div>
    <!--date-->
    <div
      class="conversation-notice-date"
      v-if="props.clickedId == message._id"
    >
      {{ getDate() }}
    </div>
  </main>
</template>
<script lang="ts" setup>
const props = defineProps({
  message: Object,
  clickedId: String,
});
const message = props.message!;
function getDate() {
  return useMessagesStore().getDate(message.createdAt);
}
</script>
