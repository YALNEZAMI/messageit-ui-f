import { eventBus } from "@/utils/eventBus";
import type { User } from "~/interfaces/user";
import { useMessageStatusStore } from "~/stores/messageStatus.store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  //set conversation
  const idConv = to.params.id as string;
  if (idConv) {
    //check membership of current user
    const conv = await useConversationsStore().getConversation(idConv);
    const isMember =
      conv.members.filter(
        (member: User) => member._id == useUsersStore().user._id
      ).length > 0;
    if (!isMember) {
      useRouter().push("/conversations");
      return;
    }

    //set current conversation
    await useConversationsStore().setCurrentConversation(conv);

    //init messages
    await useMessagesStore().getInitialMessages(idConv);
    //init viewers
    await useMessageStatusStore().initViewers();
    //call the emoji realtime handler
    useEmojisStore().onEmoji();
    //set conversation messages as seen
    await useMessageStatusStore().setConversationMessagesAsSeen(idConv);
    eventBus.emit("conversationChanged", conv);
    eventBus.emit("notificationNumberChanged", true);
  }
});
