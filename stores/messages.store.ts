import { defineStore } from "pinia";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
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
      this.messages.push(msg);
    },
    async send(message: Message) {
      message.sender = useAuthStore().user._id as string;
      message.conversation = useConversationsStore().currentConversation
        ._id as string;
      return await this.getService("messages").create(message);
    },
    async getInitialMessages() {
      const messages = await this.getService("messages").find({
        query: {
          conversation: useRoute().params.id,
        },
      });
      this.messages = messages.data;
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
        this.addMessage(message);
      });
      this.getService("messages").on("removed", (message: Message) => {
        this.messages = this.messages.filter((msg) => {
          return msg._id != message._id;
        });
      });
    },
  },
});
