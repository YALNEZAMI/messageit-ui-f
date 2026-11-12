<template>
  <main v-if="getDisplyedText() != '0'">
    <span class="relative flex h-4 w-3 justify-center">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"
      ></span>
      <span
        class="relative inline-flex rounded-full h-4 w-5 px-1 text-xs text-center bg-red-700 border-2 border-solid border-white text-white"
      >
        {{ getDisplyedText() }}
      </span>
    </span>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { Notification } from "~/interfaces/notification";

const props = defineProps({
  name: String,
});
const getDisplyedText = () => {
  return number.value;
};
const number = ref("0");
let requestId = 0;
const updateNumber = async () => {
  const id = ++requestId;
  try {
    const result = await getNumber();
    if (id === requestId) number.value = result;
  } catch (error) {
    console.error("Impossible de charger le nombre de notifications :", error);
  }
};
onMounted(() => {
  void updateNumber();
  eventBus.on("notificationNumberChanged", updateNumber);
});
onBeforeUnmount(() => {
  requestId++;
  eventBus.off("notificationNumberChanged", updateNumber);
});
const getNumber = async () => {
  let res = 0;
  switch (props.name) {
    case "Notifications":
      let numberOfFriendReqsNotSeen = 0;
      useFriendsStore().friendRequests.map((fr: Notification) => {
        if (!fr.seen) {
          numberOfFriendReqsNotSeen++;
        }
      });
      res = numberOfFriendReqsNotSeen + useFriendsStore().acceptations.length;

      break;
    case "Conversations":
      res = await getConversationsWithNewMessagesNumber();
      break;
  }
  return res < 10 ? "" + res : "+9";
};
const getConversationsWithNewMessagesNumber = async () => {
  const unread = await Promise.all(useConversationsStore().conversations.map(async (conv) => {
    const lastMessage: any = conv.lastMessage;
    if (lastMessage && lastMessage.type !== "notification" && lastMessage.sender?._id != useUsersStore().user._id) {
      const isSeenBy = await useMessageStatusStore().isSeenBy(
        lastMessage._id,
        useUsersStore().user._id as string
      );
      return !isSeenBy;
    }
    return false;
  }));
  return unread.filter(Boolean).length;
};
</script>
