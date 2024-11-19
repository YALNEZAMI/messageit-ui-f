import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
import conversations from "~/middleware/conversations";
export const useMessagesStore = defineStore("messagesStore", {
  state: () => {
    return {
      messages: [] as Message[],
    };
  },
  actions: {
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    setMessages(newVal: Message[]) {
      this.messages = newVal;
    },
    addMessage(msg: Message) {
      const exist = this.messages.find((message: Message) => {
        return message._id == msg._id;
      });
      if (exist == undefined) {
        this.messages.push(msg);
      }
    },
    async send(message: Message) {
      message.sender = useAuthStore().user._id as string;
      message.conversation = useConversationsStore().currentConversation
        ._id as string;
      return await this.getService("messages").create(message);
    },
    async getInitialMessages() {
      console.log("useRoute().params.id", useRoute().params.id);
      const messages = await this.getService("messages").find({
        query: {
          $sort: { createdAt: 1 },
          conversation: useRoute().params.id,
        },
      });
      this.messages = messages.data;
    },
    async getMessages(idConv: string) {
      return await this.getService("messages").find({
        query: {
          conversation: idConv,
        },
      });
    },
    async getLastMessage(idConv: string) {
      const result = await this.getService("messages").find({
        query: {
          conversation: idConv,
          $sort: { createdAt: -1 }, // Sort by `createdAt` in descending order
          $limit: 1, // Limit the results to 1
        },
        paginate: false, // Disable pagination to get the raw result
      });
      return result.data.length ? result.data[0] : undefined; // Return the last document or null if no documents exist
    },
    async getMessage(id: string) {
      return await this.getService("messages").get(id);
    },
    async onMessage() {
      this.getService("messages").on("created", async (message: Message) => {
        const conv = message.conversation;
        message.conversation = await useConversationsStore().getConversation(
          conv as string
        );
        message.sender = await useUsersStore().getUser(
          message.sender as string
        );
        //set lastMessage
        useConversationsStore().setLastMessage(message);
        this.addMessage(message);
      });
      this.getService("messages").on("removed", async (message: Message) => {
        //set new lastMessage
        const conversationId = message.conversation;
        const lastMessage = await useMessagesStore().getLastMessage(
          conversationId as string
        );
        useConversationsStore().setLastMessage(lastMessage);
        this.messages = this.messages.filter((msg) => {
          return msg._id != message._id;
        });
      });
    },
  },
});
