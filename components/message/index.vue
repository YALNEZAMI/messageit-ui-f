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
          class="flex items-center justify-between w-full"
          :class="{
            'flex-row-reverse': !isMyMessage(),
          }"
        >
          <div v-if="props.selectingMode">
            <input
              :checked="props.isSelected"
              type="checkbox"
              @change="select()"
            />
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
          <div
            class="flex items-center"
            v-if="message.text || message.transfered"
          >
            <svg
              v-if="
                isMyMessage() &&
                clickedId == message._id &&
                useConversationsStore().currentConversation.type != 'ai'
              "
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
              :class="getContainerClasses()"
              class="p-1 break-words w-max h-max md:max-w-52 lg:max-w-96 max-w-40 shadow-md"
            >
              <!--refered message-->
              <div
                @click="emit('goToReferedMessage')"
                v-if="message.referedMessage"
                class="bg-gray-300 cursor-pointer text-black p-1 truncate rounded border-l-4 border-solid border-0 border-red-600"
              >
                <div class="text-red-600">
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
                    class="font-serif text-xs text-gray-400"
                  >
                    Transféré
                  </div>
                  <div
                    @click="displayOriginalText = !displayOriginalText"
                    v-if="message.originalText"
                    class="font-serif m-1 text-xs text-gray-400 underline cursor-pointer"
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
                  class="p-1 break-words border-0 border-solid border-black w-max h-max md:max-w-52 lg:max-w-96 max-w-40 text-gray-500"
                >
                  <div class="text-center">___________</div>
                  <br />
                  Text original : {{ " " + message.originalText }}
                </div>
              </div>
            </ContainersConversationTheme>

            <svg
              v-if="
                !isMyMessage() &&
                clickedId == message._id &&
                useConversationsStore().currentConversation.type != 'ai'
              "
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
    "ml-12": !thereIsSenderImage() && !isMyMessage(),
    "mr-12": !thereIsSenderImage() && isMyMessage(),
    "mr-1": isMyMessage() && thereIsSenderImage(),
    "ml-1": thereIsSenderImage() && !isMyMessage(),
    "rounded-t-md rounded-bl-md": isMyMessage(),
    "rounded-t-md rounded-br-md": !isMyMessage(),
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
