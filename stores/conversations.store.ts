import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { User } from "~/interfaces/user";
export const useConversationsStore = defineStore("conversationsStore", {
  state: () => {
    return {
      conversations: [] as Conversation[],
      currentConversation: {} as Conversation,
    };
  },
  actions: {
    setConversations(newVal: Conversation[]) {
      this.conversations = newVal;
    },
    setCurrentConversation(newConv: Conversation) {
      this.currentConversation = newConv;
    },
    async getConversation(id: string) {
      return await this.getService("conversations").get(id);
    },
    getOtherUser(conv: Conversation): User {
      const user1 = conv.user1 as User;
      const user2 = conv.user2 as User;
      if (user1._id == useAuthStore().user._id) {
        return user2;
      } else {
        return user1;
      }
    },
    getNamePrivateConversation(conv: Conversation): string {
      return this.getOtherUser(conv).name as string;
    },
    updateConversation(newConv: Conversation) {
      this.conversations = this.conversations.map((conv: Conversation) => {
        if (newConv._id == conv._id) {
          return newConv;
        }
        return conv;
      });
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
      for (let conv of conversations.data) {
        conv = await this.fillConversation(conv);
      }
      this.setConversations(conversations.data);
    },
    async fillConversation(conv: Conversation): Promise<Conversation> {
      const user1 = await useUsersStore().getUser(conv.user1 as string);
      const user2 = await useUsersStore().getUser(conv.user2 as string);
      conv.user1 = user1;
      conv.user2 = user2;
      return conv;
    },
    async chatWithUser(user: User) {
      const conv = await this.getService("conversations").create({
        user1: user._id,
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
