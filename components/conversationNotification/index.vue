<template>
  <main
    class="text-center text-sm text-black bg-gray-100 bg-opacity-75 rounded-md"
  >
    <div>{{ message.text }}</div>
    <!--date-->
    <div
      class="text-center text-ss text-black"
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
