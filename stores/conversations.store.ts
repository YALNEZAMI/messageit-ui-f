import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
export const useConversationsStore = defineStore("conversationsStore", {
  state: () => {
    return {
      conversations: [] as Conversation[],
      currentConversation: {} as Conversation,
    };
  },
  actions: {
    setConversations(convs: Conversation[]) {
      this.conversations = convs;
    },
    setLastMessage(message: any) {
      const conv = this.conversations.find((conv: Conversation) => {
        return conv._id == message.conversation._id;
      });

      if (conv != undefined) {
        conv.lastMessage = message;
        this.updateConversation(conv);
      }
    },
    getLastMessage(idConv: string): Message {
      const res: any = this.conversations.find((conv: Conversation) => {
        return conv._id == idConv;
      })?.lastMessage;
      return res;
    },
    setCurrentConversation(newConv: Conversation) {
      this.currentConversation = newConv;
    },
    async getConversation(id: string) {
      return await this.getService("conversations").get(id);
    },
    getOtherUser(conv: Conversation): User {
      if (!conv.members) {
        return useAuthStore().user;
      }
      return conv.members.find((member: any) => {
        return member._id != useAuthStore().user._id;
      }) as User;
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
      //set last Message
      for (const conv of conversations) {
        conv.lastMessage = await useMessagesStore().getLastMessage(
          conv._id as string
        );
      }
      this.setConversations(conversations);
    },

    async chatWithUser(user: User) {
      const conv = await this.getService("conversations").create({
        members: [user._id, useAuthStore().user._id],
        type: "private",
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
    async onConversation() {
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
        async (conversation: Conversation) => {
          //filling members
          const membersAsUsers: User[] = [];
          for (let member of conversation.members) {
            const user = await useUsersStore().getUser(member as string);
            membersAsUsers.push(user);
          }
          conversation.members = membersAsUsers;
          //push to conversations
          this.conversations.push(conversation);
        }
      );
    },
  },
});
