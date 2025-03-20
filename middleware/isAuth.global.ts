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
  console.log("useRoute().fullPath", useRoute().fullPath);
  if (authStore.isAuthenticated()) {
    try {
      //init data
      await useFriendsStore().getMyFriends();
      await useConversationsStore().getInitalConversations();

      //websocket channels subscription
      await useConversationsStore().onConversation();
      useUsersStore().onUser();
      await useFriendsStore().onFriendRequests();
      await useFriendsStore().onFriends();
      await useMessagesStore().onMessage();
      useMessageStatusStore().onMessageStatus();
      await useMessageStatusStore().setAllConversationsMessagesAsRecieved();
      useTypingStore().onTyping();
    } catch (e) {
      localStorage.clear();
      useAuthStore().setAccessToken("");
      useRouter().push("/auth/login");
    }
  }
});
