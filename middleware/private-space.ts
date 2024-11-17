export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  //websocket channels subscription
  await useFriendsStore().onFriendRequests();
  await useFriendsStore().onFriends();
  useUsersStore().onUser();
  //set me as connected
  useUsersStore().setStatusCheckingIntervalle();
});
