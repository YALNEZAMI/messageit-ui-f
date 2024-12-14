<template>
  <main>
    <!--message-->
    <div class="flex flex-col">
      <!--message body-->
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
          <div v-if="props.selectingMode">
            <input type="checkbox" @change="select()" />
          </div>
          <div v-else class="text-black cursor-pointer" @click="options">
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
          <!--text and reply arrow-->
          <div class="flex items-center">
            <svg
              v-if="isMyMessage() && clickedId == message._id"
              @click="reply(message)"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4 replyArrow"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
              />
            </svg>
            <ContainersConversationTheme
              :title="'-msgid: ' + message._id"
              :class="{
                'ml-12': !thereIsImage() && !isMyMessage(),
                'mr-12': !thereIsImage() && isMyMessage(),
                'mr-1': isMyMessage() && thereIsImage(),
                'ml-1': thereIsImage() && !isMyMessage(),
                'rounded-t-md rounded-bl-md': isMyMessage(),
                'rounded-t-md rounded-br-md': !isMyMessage(),
              }"
              class="p-1 break-words w-max h-max md:max-w-52 max-w-40 shadow-md"
            >
              <div
                @click="emit('goToReferedMessage')"
                v-if="message.referedMessage"
                class="bg-gray-300 text-black p-1 truncate rounded border-l-4 border-solid border-0 border-red-600"
              >
                <div class="text-red-600">
                  {{ message.referedMessage.sender.name }}
                </div>
                <div class="truncate">
                  {{ message.referedMessage.text }}
                </div>
              </div>

              <div class="flex flex-col">
                <div
                  v-if="message.transfered"
                  class="font-serif text-xs text-gray-300"
                >
                  Transfered
                </div>
                <div>{{ message.text }}</div>
              </div>
            </ContainersConversationTheme>

            <svg
              v-if="!isMyMessage() && clickedId == message._id"
              @click="reply(message)"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4 replyArrow"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </div>
        </div>
      </div>
      <!--message status-->
      <div class="flex justify-between">
        <MessageEmojis
          @click="options()"
          class="w-1/2 flex cursor-pointer"
          :message="message"
        ></MessageEmojis>

        <MessageStatus
          class="w-1/2 flex justify-end"
          :message="message"
        ></MessageStatus>
      </div>
    </div>
    <!--date-->
    <div
      class="text-center text-sm text-black"
      v-if="props.clickedId == message._id"
    >
      {{ getDate() }}
    </div>
  </main>
</template>
<style lang="postcss" scoped>
.replyArrow {
  @apply text-black text-sm mx-2 cursor-pointer;
}
</style>
<script setup>
import { eventBus } from "@/utils/eventBus";

const props = defineProps({
  message: "Object",
  clickedId: "Boolean",
  selectingMode: "Boolean",
});

const message = props.message;
const isConversationNotification = props.message.type == "notification";
const emit = defineEmits(["options", "goToReferedMessage", "select"]);
const options = () => {
  if (!useMessagesStore().temporaryMessagesIds.includes(message._id)) {
    emit("options");
  }
};
const select = () => {
  emit("select");
};
const reply = (msg) => {
  eventBus.emit("refereMessage", msg);
};
const getRobotImage = () => {
  return useConversationsStore().robotImage;
};
const isLastMessage = () => {
  return (
    useMessagesStore().messages[useMessagesStore().messages.length - 1]._id ==
    message._id
  );
};
const thereIsImage = () => {
  if (isConversationNotification) {
    return false;
  }
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
onMounted(async () => {});
</script>
