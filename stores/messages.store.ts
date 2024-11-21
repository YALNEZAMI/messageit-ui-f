import { defineStore } from "pinia";
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
export const useMessagesStore = defineStore("messagesStore", {
  state: () => {
    return {
      paginationValue: 20,
      skip: 0,
      isAppendingMessages: false,
      messages: [] as Message[],
    };
  },
  actions: {
    setSkip(newskip: number) {
      this.skip = newskip;
    },
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
    async send(msg: Message) {
      msg.sender = useAuthStore().user._id as string;
      msg.conversation = useConversationsStore().currentConversation
        ._id as string;
      const message = await this.getService("messages").create(msg);
      if (useConversationsStore().currentConversation.type == "ai") {
        this.messages.push(message.myMessage);
        this.messages.push(message.aiMessage);
      }
      return message;
    },
    async getInitialMessages() {
      const messagesCounting = await this.getService("messages").find({
        query: {
          $limit: 0,
          conversation: useRoute().params.id,
        },
      });
      console.log("messagesTot", messagesCounting.total);
      this.setSkip(Math.max(0, messagesCounting.total - this.paginationValue));
      const messages = await this.getService("messages").find({
        query: {
          $skip: this.skip,
          $limit: this.paginationValue,
          $sort: { createdAt: 1 },
          conversation: useRoute().params.id,
        },
      });
      this.messages = messages.data;
    },
    async appendHistoryMessages() {
      if (this.skip == 0 || this.isAppendingMessages) {
        return;
      }
      this.isAppendingMessages = true;

      let limit = this.skip;
      this.setSkip(Math.max(0, this.skip - this.paginationValue));
      if (this.skip > this.paginationValue) {
        limit = this.paginationValue;
      }
      const messages = await this.getService("messages").find({
        query: {
          $limit: limit,
          $skip: this.skip,
          $sort: { createdAt: 1 },
          conversation: useRoute().params.id,
        },
      });
      this.messages = messages.data.concat(this.messages);
      this.isAppendingMessages = false;
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
        //make event to scroll down
        setTimeout(() => {
          eventBus.emit("messageReceived", message);
        }, 10);
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
