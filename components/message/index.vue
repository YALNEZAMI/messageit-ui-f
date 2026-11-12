<template>
  <main class="message-item">
    <!--message-->
    <div class="flex flex-col">
      <!--message body-->
      <div
        class="message-row flex"
        :class="{
          'flex-row-reverse': isMyMessage(),
        }"
      >
        <div class="flex items-end" v-if="thereIsSenderImage()">
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
          class="message-row-content flex items-center justify-between w-full"
          :class="{
            'flex-row-reverse': !isMyMessage(),
          }"
        >
          <div v-if="props.selectingMode">
            <input
              :checked="props.isSelected"
              type="checkbox"
              aria-label="Sélectionner le message"
              @change="select()"
            />
          </div>
          <button v-else type="button" class="message-options" aria-label="Options du message" @click="options">
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
          </button>
          <!--text and reply arrow-->
          <div
            class="message-body flex items-center"
            v-if="message.text || message.transfered"
          >
            <button
              v-if="
                isMyMessage() &&
                clickedId == message._id &&
                useConversationsStore().currentConversation.type != 'ai'
              "
              type="button"
              aria-label="Répondre au message"
              class="message-reply"
              @click.stop="reply(message)"
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
              />
            </svg>
            </button>

            <ContainersConversationTheme
              :class="getContainerClasses()"
              class="message-bubble break-words"
            >
              <!--refered message-->
              <div
                @click="emit('goToReferedMessage')"
                v-if="message.referedMessage"
                class="message-quote cursor-pointer"
              >
                <div class="message-quote-sender">
                  {{ message.referedMessage.sender.name }}
                </div>
                <div class="truncate" v-if="message.referedMessage.text != ''">
                  {{ message.referedMessage.text }}
                </div>
                <div v-else>
                  <NuxtImg
                    :src="message.referedMessage.files[0]"
                    class="w-10 h-10 mt-1"
                  ></NuxtImg>
                </div>
              </div>
              <!--transfered mark-->
              <div class="flex flex-col">
                <div class="flex">
                  <div
                    v-if="message.transfered"
                    class="message-bubble-label"
                  >
                    Transféré
                  </div>
                  <div
                    @click="displayOriginalText = !displayOriginalText"
                    v-if="message.originalText"
                    class="message-bubble-label m-1 underline cursor-pointer"
                  >
                    Modifié
                  </div>
                </div>
                <!--message text content-->
                <div :title="message._id">
                  {{ message.text }}
                </div>
                <!--original text-->
                <div
                  @click="displayOriginalText = false"
                  v-if="displayOriginalText"
                  :class="getContainerClasses()"
                  class="message-original break-words"
                >
                  Text original : {{ " " + message.originalText }}
                </div>
              </div>
            </ContainersConversationTheme>

            <button
              v-if="
                !isMyMessage() &&
                clickedId == message._id &&
                useConversationsStore().currentConversation.type != 'ai'
              "
              type="button"
              aria-label="Répondre au message"
              class="message-reply"
              @click.stop="reply(message)"
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            </button>
          </div>
        </div>
      </div>
      <!--files-->
      <MessageFiles :message="message"></MessageFiles>

      <div class="flex justify-between">
        <!--message emojis-->
        <MessageEmojis
          @click="options()"
          class="w-1/2 flex cursor-pointer"
          :message="message"
        ></MessageEmojis>
        <!--message status-->

        <MessageStatus
          class="w-1/2 flex justify-end"
          :message="message"
        ></MessageStatus>
      </div>
    </div>
    <!--date-->
    <div
      class="message-date"
      v-if="props.clickedId == message._id"
    >
      {{ getDate() }}
    </div>
  </main>
</template>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
const props = defineProps({
  message: Object,
  clickedId: String,
  selectingMode: Boolean,
  isSelected: Boolean,
});

const message = props.message as Message;
const displayOriginalText = ref(false);
const emit = defineEmits(["options", "goToReferedMessage", "select"]);
const getContainerClasses = () => {
  return {
    hidden: message.text == "",
    "message-bubble-own": isMyMessage(),
    "message-bubble-other": !isMyMessage(),
  };
};
const options = () => {
  if (!useMessagesStore().temporaryMessagesIds.includes(message._id)) {
    emit("options");
  }
};
const select = () => {
  emit("select");
};
const reply = (msg: Message) => {
  eventBus.emit("refereMessage", msg);
};
const getRobotImage = () => {
  return useConversationsStore().robotImage;
};

const thereIsSenderImage = () => {
  if (props.message.type == "notification" || !message.sender) {
    return false;
  }
  if (
    getNextMessage() == undefined ||
    !getNextMessage().sender ||
    !(getNextMessage().sender as User)._id
  ) {
    //it is the last message(type==message)
    return true;
  }
  return message.sender._id != (getNextMessage().sender as User)._id;
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
  getMessages().find((msg: Message, index: number) => {
    i = index;
    return msg._id == message._id;
  });

  return getMessages()[i + 1];
};
// const getPreviousMessage = () => {
//   let i = 0;
//   getMessages().find((msg: Message, index: number) => {
//     i = index;
//     return msg._id == message.id;
//   });
//   return getMessages()[i - 1];
// };
onMounted(async () => {
  eventBus.on("messageUpdated", (msg: Message) => {
    if (msg._id == message._id) {
      message.text = msg.text;
      message.originalText = msg.originalText;
      message.updatedAt = msg.updatedAt;
    }
  });
});
</script>
