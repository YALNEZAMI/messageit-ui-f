export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  const idConv = useRoute().params.id as string;
  if (idConv) {
    const conv = await useConversationsStore().getConversation(idConv);
    conv.user1 = await useUsersStore().getUser(conv.user1);
    conv.user2 = await useUsersStore().getUser(conv.user2);
    useConversationsStore().setCurrentConversation(conv);
  }
  useConversationsStore().onConversation();
});
