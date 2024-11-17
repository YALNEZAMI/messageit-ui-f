export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  //set conversation
  const idConv = to.params.id as string;
  if (idConv) {
    const conv = await useConversationsStore().getConversation(idConv);
    useConversationsStore().setCurrentConversation(conv);
  }
  //websocket channels subscription
  useConversationsStore().onConversation();
  useUsersStore().onUser();
  //set status checking interval
  useUsersStore().setStatusCheckingIntervalle();
});
