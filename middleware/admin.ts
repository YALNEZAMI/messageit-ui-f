export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("admin middl");
  //to is the destination path(object)
  //from is the origine path(object)
  await useFriendsStore().onFriendRequestCreated();
  await useFriendsStore().onAcceptationCreated();
});
