import { useAuthStore } from "~/stores/auth.store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  const authStore = useAuthStore();
  if (
    to.fullPath != "/auth/login" &&
    to.fullPath != "/auth/register" &&
    !authStore.isAuthenticated()
  ) {
    useRouter().push("/auth/login");
  }
  if (authStore.isAuthenticated()) {
    //init data
    await useFriendsStore().getMyFriends();
    await useConversationsStore().getInitalConversations();

    //websocket channels subscription
    await useConversationsStore().onConversation();
    useUsersStore().onUser();
    await useFriendsStore().onFriendRequests();
    await useFriendsStore().onFriends();
    useUsersStore().onUser();
    await useMessagesStore().onMessage();
  }
});
