import { eventBus } from "@/utils/eventBus";
import type { User } from "~/interfaces/user";
import { useMessageStatusStore } from "~/stores/messageStatus.store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  //set conversation
  const idConv = to.params.id as string;
  if (idConv) {
    const conv = await useConversationsStore().getConversation(idConv);
    console.log("conv", conv);
    const isMember =
      conv.members.filter(
        (member: User) => member._id == useUsersStore().user._id
      ).length > 0;
    if (!isMember) {
      useRouter().push("/conversations");
    }
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
