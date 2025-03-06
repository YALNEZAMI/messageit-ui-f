<template>
  <main v-if="getDisplyedText() != '0'">
    <span class="relative flex h-4 w-3 justify-center">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"
      ></span>
      <span
        class="relative inline-flex rounded-full h-4 w-5 px-1 text-xs text-center bg-red-500 border-2 border-solid border-white text-white opacity-80"
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
const number = ref("");
onMounted(async () => {
  number.value = await getNumber();
  eventBus.on("notificationNumberChanged", async (notif: Notification) => {
    await updateNumber();
  });
});
const updateNumber = async () => {
  number.value = await getNumber();
};
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
  let res = 0;
  for (const conv of useConversationsStore().conversations) {
    const lastMessage: any = conv.lastMessage;

    if (lastMessage && lastMessage.sender._id != useUsersStore().user._id) {
      if (lastMessage.type == "notification") {
        continue;
      }
      const isSeenBy = await useMessageStatusStore().isSeenBy(
        lastMessage._id,
        useUsersStore().user._id as string
      );
      if (!isSeenBy) {
        res++;
      }
    }
  }
  return res;
};
</script>
