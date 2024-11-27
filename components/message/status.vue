<template>
  <main>
    <!--message status-->
    <!--viewers images-->
    <div
      v-if="viewers.length > 0 && getConversationType() != 'ai'"
      class="flex justify-end px-2 mb-2"
    >
      <img
        class="w-4 h-4 rounded-full"
        :title="viewer.name + ' userid: ' + viewer._id"
        :src="viewer.image"
        v-for="viewer of viewers"
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
          'bg-black': isRecieved,
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
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { MessageSeen } from "~/interfaces/message-seen";
import type { Recieving } from "~/interfaces/recieving";
import type { User } from "~/interfaces/user";

const props = defineProps({
  message: Object,
  onConversation: Boolean,
});
const message = props.message as Message;
let conversation = message.conversation as any;
if (!conversation._id) {
  conversation = useConversationsStore().getConversationLocally(
    message.conversation as string
  ) as Conversation;
}
const isRecieved = ref(false);
const viewers = ref([] as User[]);
const popViewer = (_id: string) => {
  const filtered = viewers.value.filter((user: User) => {
    return user._id != _id;
  });
  viewers.value = filtered;
};
const getViewers = async () => {
  let res = [] as User[];
  if (props.onConversation) {
    res = await useMessageStatusStore().getViewersForConversationLastMessage(
      message as Message
    );
  } else {
    res = useMessageStatusStore().getViewers(message!._id as string);
  }
  res = res.filter((user: User) => {
    return user != undefined;
  });
  return res;
};
const getConversationType = () => {
  return conversation.type;
};
const isMyMessage = () => {
  return (message!.sender as User)._id == useUsersStore().user._id;
};
const isLastMessage = () => {
  return (
    props.onConversation ||
    useMessagesStore().messages[useMessagesStore().messages.length - 1]._id ==
      message!._id
  );
};
const senderIsViewer = () => {
  let sender = message.sender as User;
  if (sender._id) {
    return (
      viewers.value.filter((view: any) => {
        return view.viewer == sender._id;
      }).length > 0
    );
  }
};
const isViewer = (_id: string) => {
  if (_id) {
    return (
      viewers.value.filter((view: any) => {
        return view.viewer == _id;
      }).length > 0
    );
  }
};
onMounted(async () => {
  //set viewers
  viewers.value = await getViewers();
  if (!senderIsViewer() && isLastMessage()) {
    if ((message.sender as User)._id != useUsersStore().user._id) {
      popViewer((message.sender as User)._id as string);
      viewers.value.push(message.sender as User);
    }
  } else {
    popViewer((message.sender as User)._id as string);
  }
  isRecieved.value = await useMessageStatusStore().isRecieved(
    message as Message
  );

  //listent to recieve message to mark it as recieved
  eventBus.on("recieving", (recieving: Recieving) => {
    if (recieving.message == message!._id) {
      isRecieved.value = true;
    }
  });
  eventBus.on("userPatched", (user: User) => {
    const isMember =
      (conversation.members as User[]).filter(
        (mem: User) => mem._id == user._id
      ).length > 0;
    if (isMember && user._id != useUsersStore().user._id) {
      isRecieved.value = true;
    }
  });
  eventBus.on("seeing", (seeing: MessageSeen) => {
    if (seeing.message != message._id) {
      popViewer(seeing.viewer);
      popViewer((message.sender as User)._id as string);

      return;
    }
    if (seeing.viewer != useUsersStore().user._id && isLastMessage()) {
      const viewer = useConversationsStore().getMember(seeing.viewer);
      popViewer(seeing.viewer); //avoid repetition
      viewers.value.push(viewer);
    }
  });
});
</script>
