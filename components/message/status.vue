<template>
  <main>
    <!--message status-->
    <!--viewers images-->
    <div
      v-if="getViewers().length > 0 && getConversationType() != 'ai'"
      class="flex justify-end px-2 mb-2"
    >
      <img
        class="w-4 h-4 rounded-full"
        :title="viewer.name + ' userid: ' + viewer._id"
        :src="viewer.image"
        v-for="viewer of getViewers()"
        :key="viewer._id"
      />
    </div>
    <div
      class="flex justify-end px-2 mb-2"
      v-else-if="isMyMessage() && isLastMessage()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-check-circle rounded-full"
        :class="{
          'bg-white text-black': !isRecieved,
          'bg-blue-400': isRecieved,
        }"
        viewBox="0 0 16 16"
      >
        <path
          d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
        />
        <path
          d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"
        />
      </svg>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { Recieving } from "~/interfaces/recieving";
import type { User } from "~/interfaces/user";

const props = defineProps({
  message: Object,
});
const isRecieved = ref(false);

const getViewers = () => {
  const res = useMessageStatusStore().getViewers(props.message!._id);
  return res;
};
const getConversationType = () => {
  return props.message!.conversation.type;
};
const isMyMessage = () => {
  return props.message!.sender._id == useUsersStore().user._id;
};
const isLastMessage = () => {
  return (
    useMessagesStore().messages[useMessagesStore().messages.length - 1]._id ==
    props.message!._id
  );
};
onMounted(async () => {
  if (isLastMessage()) {
    isRecieved.value = await useMessageStatusStore().isRecieved(
      props.message as Message
    );
  }
  //listent to recieve message to mark it as recieved
  eventBus.on("recieving", (recieving: Recieving) => {
    if (recieving.message == props.message!._id) {
      isRecieved.value = true;
    }
  });
  eventBus.on("userPatched", (user: User) => {
    const isMember =
      props.message!.conversation.members.filter(
        (mem: User) => mem._id == user._id
      ).length > 0;
    if (isMember) {
      isRecieved.value = true;
    }
  });
});
</script>
