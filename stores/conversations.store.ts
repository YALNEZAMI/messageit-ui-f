import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { Theme } from "~/interfaces/theme";
import type { User } from "~/interfaces/user";
export const useConversationsStore = defineStore("conversationsStore", {
  state: () => {
    return {
      robotImage:
        "https://cdn.pixabay.com/photo/2014/04/03/11/55/robot-312566_1280.png",

      conversations: [] as Conversation[],
      currentConversation: {} as Conversation,
      themes: [
        { name: "Basique", _id: "basic" },
        { name: "Printemps", _id: "spring" },
        { name: "Amour", _id: "love" },
        { name: "Panda", _id: "panda" },
      ] as Theme[],
      isConversationsPulse: false,
      searchedConversations: [] as Conversation[],
      isSearchedConversationsPulse: false,
    };
  },
  actions: {
    setSearchedConversations(convs: Conversation[]) {
      this.searchedConversations = convs;
    },
    setIsConversationsPulse(nval: boolean) {
      this.isConversationsPulse = nval;
    },
    setConversations(convs: Conversation[]) {
      this.conversations = convs;
    },
    conversationExist(id: string): boolean {
      return (
        this.conversations.filter((conv) => {
          return conv._id == id;
        }).length > 0
      );
    },
    setLastMessage(message: any, conversationId: string) {
      const conv = this.conversations.find((conv: Conversation) => {
        return conv._id == conversationId;
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
    async setCurrentConversation(newConv: Conversation) {
      this.currentConversation = newConv;
      if (newConv.type == "group") {
        await useGroupRightsStore().fetchRights();
      }
    },
    async getConversation(id: string) {
      return await this.getService("conversations").get(id);
    },
    getConversationLocally(id: string): Conversation {
      return this.conversations.find((conv: Conversation) => {
        return conv._id == id;
      }) as Conversation;
    },
    getOtherUser(conv: Conversation): User {
      if (!conv.members || conv.type == "ai" || conv.members.length == 1) {
        const currentUser = useUsersStore().user;
        currentUser.onLine = true;
        return currentUser;
      }
      const otherUser = conv.members.find((member: any) => {
        return member._id != useUsersStore().user._id;
      }) as User;
      return otherUser ? otherUser : useUsersStore().user;
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
      if (this.currentConversation._id == newConv._id) {
        this.currentConversation = newConv;
      }
      this.conversations = this.conversations.map((conv: Conversation) => {
        if (newConv._id == conv._id) {
          return newConv;
        }
        return conv;
      });
    },
    async leave() {
      await this.getService("conversations").remove(
        this.currentConversation._id as string
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
      const conversations = await this.getService("conversations").find();

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
      useRouter().push(`/conversations/${conv._id}/messages`);
    },
    async deleteConversation(id: string) {
      const response = await this.getService("conversations").remove(id);
      this.setConversations(
        this.conversations.filter((conv: Conversation) => {
          return response._id != conv._id;
        })
      );
    },
    async searchConversations(key: string) {
      this.isSearchedConversationsPulse = true;
      const res = await this.getService("conversations").find({
        query: {
          key,
        },
      });
      this.setSearchedConversations(res);
      this.isSearchedConversationsPulse = false;
      return res;
    },
    getMember(_id: string): User {
      return (this.currentConversation.members as User[]).find((mem: User) => {
        return mem._id == _id;
      }) as User;
    },
    getMemberFromConv(_id: string, conv: Conversation): User {
      return (conv.members as User[]).find((mem: User) => {
        return mem._id == _id;
      }) as User;
    },
    sortConversations() {
      this.conversations = this.conversations.sort((conv1, conv2) => {
        // Get the timestamp of the last message or the conversation creation date as fallback
        const date1 = conv1.lastMessage?.createdAt
          ? new Date(conv1.lastMessage.createdAt).getTime()
          : new Date(conv1.createdAt!).getTime();
        const date2 = conv2.lastMessage?.createdAt
          ? new Date(conv2.lastMessage.createdAt).getTime()
          : new Date(conv2.createdAt!).getTime();

        // Sort in descending order (newest to oldest)
        return date2 - date1;
      });
    },
    async onConversation() {
      this.getService("conversations").on(
        "removed",
        (conversation: Conversation) => {
          const currentUserOut =
            conversation.members.filter((mem: any) => {
              return mem._id == useUsersStore().user._id;
            }).length == 0;
          if (currentUserOut) {
            this.setConversations(
              this.conversations.filter((conv) => {
                return conv._id != conversation._id;
              })
            );
          }
        }
      );
      this.getService("conversations").on(
        "patched",
        (conversation: Conversation) => {
          this.updateConversationLocally(conversation);
          const currentUserOut =
            conversation.members.filter((mem: any) => {
              return mem._id == useUsersStore().user._id;
            }).length == 0;
          console.log("currentUserOut", currentUserOut);
          //remove current user from group
          if (currentUserOut) {
            this.conversations = this.conversations.filter((conv) => {
              return conv._id != conversation._id;
            });
            if (useRoute().params.id == conversation._id) {
              useRouter().push("/conversations");
            }
          }
          //add current user to group
          if (
            !currentUserOut &&
            !this.conversationExist(conversation._id as string)
          ) {
            this.setConversations([conversation, ...this.conversations]);
            this.sortConversations();
          }
        }
      );
      this.getService("conversations").on(
        "created",
        async (conversation: Conversation) => {
          //filling members if not filled
          if ((conversation.members[0] as any)._id == undefined) {
            const membersAsUsers: User[] = [];
            for (let member of conversation.members) {
              const user = await useUsersStore().getUser(member as string);
              membersAsUsers.push(user);
            }
            conversation.members = membersAsUsers;
          }

          //push to conversations
          this.conversations = this.conversations.filter(
            (conv: Conversation) => {
              return conv._id != conversation._id;
            }
          );
          this.setConversations([conversation, ...this.conversations]);
          this.sortConversations();
        }
      );
    },
    async toogleMembership(memberId: string) {
      const convId = useRoute().params.id as string;
      let res = await this.getService("conversations").patch(
        convId,
        {},
        {
          query: {
            member: memberId,
          },
        }
      );
      eventBus.emit("conversationChanged", res);
      return res;
    },
    async uploadConversationPhoto(file: File) {
      const reader = new FileReader();

      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        // Convert ArrayBuffer to base64
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = uint8Array.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );
        const base64String = btoa(binaryString);

        // Send base64-encoded file to the service
        const response = await useNuxtApp()
          .$feathers.service("conversations-photos")
          .create(
            {
              file: {
                buffer: base64String, // Base64-encoded buffer
                originalname: file.name, // File name
              },
            },
            {
              query: {
                conversationId: this.currentConversation._id,
              },
            }
          );
      };

      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
    },
  },
});
