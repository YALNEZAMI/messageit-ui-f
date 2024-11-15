import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
export const useConversationsStore = defineStore("conversationsStore", {
  state: () => {
    return {
      conversations: [] as Conversation[],
    };
  },
  actions: {
    setConversations(newVal: Conversation[]) {
      this.conversations = newVal;
    },
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async getInitalConversations() {
      const conversations = await this.getService("conversations").find({
        query: {
          currentUserId: useAuthStore().user._id,
        },
      });
      this.conversations = conversations.data;
    },
    async chatWithUser(idUser: string) {
      const conv = await this.getService("conversations").create({
        user1: idUser,
        user2: useAuthStore().user._id,
      });
      this.conversations.push(conv);
      useRouter().push(`/conversations/${conv._id}`);
    },
    async deleteConversation(id: string) {
      const response = await this.getService("conversations").remove(id);
      this.setConversations(
        this.conversations.filter((conv: Conversation) => {
          return response._id != conv._id;
        })
      );
    },
    onConversation() {
      this.getService("conversations").on(
        "removed",
        (conversation: Conversation) => {
          this.setConversations(
            this.conversations.filter((conv) => {
              return conv._id != conversation._id;
            })
          );
        }
      );
      this.getService("conversations").on(
        "created",
        (conversation: Conversation) => {
          console.log("created", conversation);
          this.conversations.push(conversation);
        }
      );
    },
  },
});
