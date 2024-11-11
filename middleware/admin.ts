export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  await useFriendsStore().onFriendRequestCreated();
  await useFriendsStore().onAcceptationCreated();
});