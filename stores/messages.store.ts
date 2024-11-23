import { defineStore } from "pinia";
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
import conversations from "~/middleware/conversations";
export const useMessagesStore = defineStore("messagesStore", {
  state: () => {
    //TODO message options(reply, delete forall forme, copie select)
    //TODO send photos
    //TODO update profile photo and conversation photo
    //TODO message status(sent recieved vue)
    return {
      paginationValue: 25,
      skip: 0,
      isAppendingMessages: false, //to prevent multiple calls
      messages: [] as Message[],
      isMessagesPulse: false,
      searchedMessages: [] as Message[],
      isSearchMessagePulse: false,
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
      msg.sender = useUsersStore().user._id as string;
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
      this.isMessagesPulse = true;
      const messagesCounting = await this.getService("messages").find({
        query: {
          $limit: 0,
          conversation: useRoute().params.id,
        },
      });
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
      this.isMessagesPulse = false;
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
    async search(key: string) {
      this.isSearchMessagePulse = true;
      if (key == "") {
        this.isSearchMessagePulse = false;
        this.searchedMessages = [];
        return;
      }
      const res = await this.getService("messages").find({
        query: {
          key,
          conversation: useConversationsStore().currentConversation._id,
        },
      });
      this.searchedMessages = res;
      this.isSearchMessagePulse = false;
      return res;
    },
    getDate(str: string) {
      const date = new Date(str);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = date.getFullYear();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${day}/${month}/${year} at ${hours}:${minutes}`;
    },
    deleteMessageLocally(_id: string) {
      this.messages = this.messages.filter((msg: Message) => {
        return msg._id != _id;
      });
    },
    async deleteForMe(_id: string) {
      const res = await this.getService("message-visibility").remove(null, {
        query: {
          messageId: _id,
          userId: useUsersStore().user._id,
          conversationId: useConversationsStore().currentConversation._id,
        },
      } as any);
      if (res) {
        this.deleteMessageLocally(_id);
      }
    },
    async deleteForAll(_id: string) {
      const res = await this.getService("messages").remove(_id);
      if (res) {
        this.deleteMessageLocally(_id);
      }
    },
  },
});
