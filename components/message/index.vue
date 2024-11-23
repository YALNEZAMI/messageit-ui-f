<template>
  <div class="flex flex-col">
    <div
      class="pb-1 mb-1 rounded flex"
      :class="{
        'flex-row-reverse': isMyMessage(),
      }"
    >
      <div class="flex items-end" v-if="thereIsImage()">
        <ImagesMessageSender
          :title="message.sender.name"
          :src="
            getConversationType() == 'ai' && !isMyMessage()
              ? getRobotImage()
              : message.sender.image
          "
        ></ImagesMessageSender>
      </div>
      <div
        class="flex items-center justify-between w-full"
        :class="{
          'flex-row-reverse': !isMyMessage(),
        }"
      >
        <div class="text-black cursor-pointer" @click="select">
          <svg
            v-if="isMyMessage()"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            />
          </svg>
        </div>

        <ContainersConversationTheme
          :class="{
            'ml-12': !thereIsImage() && !isMyMessage(),
            'mr-12': !thereIsImage() && isMyMessage(),
            'mr-1': isMyMessage() && thereIsImage(),
            'ml-1': thereIsImage() && !isMyMessage(),
            'rounded-t-md rounded-bl-md': isMyMessage(),
            'rounded-t-md rounded-br-md': !isMyMessage(),
          }"
          class="p-1 break-words w-max h-max md:max-w-52 max-w-40"
          >{{ message.text }}</ContainersConversationTheme
        >
      </div>
    </div>
    <div
      class="text-center text-sm text-black"
      v-if="props.clickedId == message._id"
    >
      {{ getDate() }}
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  message: "Object",
  clickedId: "Boolean",
});
const message = props.message;

const emit = defineEmits(["select"]);
const select = () => {
  emit("select");
};
const getRobotImage = () => {
  return useConversationsStore().robotImage;
};
const thereIsImage = () => {
  return (
    getNextMessage() == undefined ||
    message.sender._id != getNextMessage().sender._id
  );
};
const isMyMessage = () => {
  return message.sender._id == useUsersStore().user._id;
};
function getDate() {
  return useMessagesStore().getDate(message.createdAt);
}
const getConversationType = () => {
  return useConversationsStore().currentConversation.type;
};
const getMessages = () => {
  return useMessagesStore().messages;
};
const getNextMessage = () => {
  let i = 0;
  getMessages().find((msg, index) => {
    i = index;
    return msg._id == message._id;
  });
  return getMessages()[i + 1];
};
const getPreviousMessage = () => {
  let i = 0;
  getMessages().find((msg, index) => {
    i = index;
    return msg._id == message.id;
  });
  return getMessages()[i - 1];
};
</script>
