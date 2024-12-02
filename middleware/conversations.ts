import { eventBus } from "@/utils/eventBus";
import { useMessageStatusStore } from "~/stores/messageStatus.store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  //set conversation
  const idConv = to.params.id as string;
  if (idConv) {
    const conv = await useConversationsStore().getConversation(idConv);
    await useConversationsStore().setCurrentConversation(conv);

    //init messages
    await useMessagesStore().getInitialMessages();
    //init viewers
    await useMessageStatusStore().initViewers();
    useEmojisStore().onEmoji();
    eventBus.emit("conversationChanged", conv);
    eventBus.emit("notificationNumberChanged", true);
  }

  //set status checking interval
  useUsersStore().setStatusCheckingIntervalle();
});
