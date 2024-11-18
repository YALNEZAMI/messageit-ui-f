<template>
  <div class="flex flex-col">
    <div
      class="pb-1 mb-1 rounded flex"
      :class="{
        'flex-row-reverse': isMyMessage(),
      }"
    >
      <div class="flex items-end">
        <ImagesUserImage
          v-if="thereIsImage()"
          class="rounded-full w-8 h-8 border-2 border-solid p-1"
          :title="message.sender.name"
          :src="message.sender.image"
        ></ImagesUserImage>
      </div>
      <div class="flex items-center">
        <ContainersConversationTheme
          :class="{
            'ml-12': !thereIsImage() && !isMyMessage(),
            'mr-12': !thereIsImage() && isMyMessage(),
            'mr-1': isMyMessage() && thereIsImage(),
            'ml-1': thereIsImage() && !isMyMessage(),
          }"
          class="p-1 rounded break-words w-max h-max max-w-52"
          >{{ message.text }}</ContainersConversationTheme
        >
      </div>
    </div>
    <div class="text-center" v-if="props.clickedId == message._id">
      {{ getDate() }}
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  message: "Object",
  nextMessage: "Object",
  previousMessage: "Object",
  clickedId: "Boolean",
});

const message = props.message;
const nextMessage = props.nextMessage;
const thereIsImage = () => {
  return (
    nextMessage == undefined || message.sender._id != nextMessage.sender._id
  );
};
const isMyMessage = () => {
  return message.sender._id == useAuthStore().user._id;
};
const getDate = () => {
  const date = new Date(message.createdAt);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} at ${hours}:${minutes}`;
};
</script>
