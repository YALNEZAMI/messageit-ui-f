import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { Theme } from "~/interfaces/theme";
import type { User } from "~/interfaces/user";
export const useConversationsStore = defineStore("conversationsStore", {
  state: () => {
    return {
      robotImage:
        "https://cdn.pixabay.com/photo/2016/12/13/21/20/alien-1905155_640.png",
      conversations: [] as Conversation[],
      currentConversation: {} as Conversation,
      themes: [
        { name: "Basique", _id: "basic" },
        { name: "Printemps", _id: "spring" },
        { name: "Amour", _id: "love" },
        { name: "Panda", _id: "panda" },
      ] as Theme[],
      isConversationsPulse: false,
    };
  },
  actions: {
    setIsConversationsPulse(nval: boolean) {
      this.isConversationsPulse = nval;
    },
    setConversations(convs: Conversation[]) {
      this.conversations = convs;
    },
    setLastMessage(message: any) {
      const conv = this.conversations.find((conv: Conversation) => {
        return conv._id == message.conversation._id;
      });

      if (conv != undefined) {
        conv.lastMessage = message;
        this.updateConversationLocally(conv);
      }
    },
    getLastMessage(idConv: string): Message {
      const res: any = this.conversations.find((conv: Conversation) => {
        return conv._id == idConv;
      })?.lastMessage;
      return res;
    },
    getEmojiOfTheme(): string {
      switch (this.currentConversation.theme?._id) {
        case "basic":
          return "👍";
        case "love":
          return "❤️";
        case "spring":
          return "🌳";
        case "panda":
          return "🐼";
        default:
          return "👍";
      }
    },
    setCurrentConversation(newConv: Conversation) {
      this.currentConversation = newConv;
    },
    async getConversation(id: string) {
      return await this.getService("conversations").get(id);
    },
    getOtherUser(conv: Conversation): User {
      if (!conv.members || conv.type == "ai" || conv.members.length == 1) {
        return useUsersStore().user;
      }
      return conv.members.find((member: any) => {
        return member._id != useUsersStore().user._id;
      }) as User;
    },
    getConnectedFriend(conv: Conversation): User {
      if (!conv.members || conv.type == "ai") {
        return useUsersStore().user;
      }

      const connectedFriend = conv.members.find((member: any) => {
        return member._id != useUsersStore().user._id && member.onLine;
      }) as User;

      if (connectedFriend) {
        return connectedFriend;
      } else {
        return this.getOtherUser(conv);
      }
    },
    getNamePrivateConversation(conv: Conversation): string {
      return this.getOtherUser(conv).name as string;
    },
    updateConversationLocally(newConv: Conversation) {
      this.conversations = this.conversations.map((conv: Conversation) => {
        if (newConv._id == conv._id) {
          return newConv;
        }
        return conv;
      });
    },
    async leave() {
      await this.getService("conversations").remove(
        this.currentConversation._id as string,
        {
          query: {
            currentUserId: useUsersStore().user._id,
          },
        }
      );
      useRouter().push("/conversations");
    },
    async updateConversation(
      conversation: Conversation
    ): Promise<Conversation> {
      return await this.getService("conversations").patch(
        conversation._id as string,
        conversation
      );
    },
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async getInitalConversations() {
      this.isConversationsPulse = true;
      const conversations = await this.getService("conversations").find({
        query: {
          currentUserId: useUsersStore().user._id,
        },
      });
      //set last Message
      //TODO make it in backen
      for (const conv of conversations) {
        conv.lastMessage = await useMessagesStore().getLastMessage(
          conv._id as string
        );
      }
      this.setConversations(conversations);
      this.isConversationsPulse = false;
    },

    async chatWithUser(user: User) {
      const conv = await this.getService("conversations").create({
        members: [user._id, useUsersStore().user._id],
        type: "private",
      });
      this.conversations.push(conv);
      useRouter().push(`/conversations/${conv._id}`);
    },
    async createAIConversation() {
      const conv = await this.getService("conversations").create({
        members: [useUsersStore().user._id],
        type: "ai",
        name: useUsersStore().user._id,
      });
      this.conversations.push(conv);
      useRouter().push(`/conversations/${conv._id}`);
    },
    async createGroup(group: Conversation) {
      //add current User
      group.members.push(useUsersStore().user._id as any);
      const conv = await this.getService("conversations").create(group);
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
          const existConversation =
            this.conversations.filter((conv: Conversation) => {
              return conv._id == conversation._id;
            }).length != 0;
          if (!existConversation) {
            this.conversations.push(conversation);
          }
        }
      );
    },
  },
});
