import { defineStore } from "pinia";
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
import type { Recieving } from "~/interfaces/recieving";
import type { Conversation } from "~/interfaces/conversation";
import type { MessageSeen } from "~/interfaces/message-seen";
export const useMessagesStore = defineStore("messagesStore", {
  state: () => {
    //TODO handle pagination in users search, conversations friendReq,friendAcc,members,searchedMessages

    return {
      paginationValue: 25,
      skip: 0,
      isAppendingMessages: false, //to prevent multiple calls
      messages: [] as Message[],
      isMessagesPulse: false,
      searchedMessages: [] as Message[],
      isSearchMessagePulse: false,
      isAtBottom: true,
      temporaryMessagesIds: [] as number[],
      isAiTyping: false,
    };
  },
  actions: {
    setIsAtBottom(nval: boolean) {
      this.isAtBottom = nval;
    },
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
      const exist =
        this.messages.filter((message: Message) => {
          return message._id == msg._id;
        }).length > 0;
      if (
        !exist &&
        (useRoute().params.id == (msg.conversation as Conversation)._id ||
          useRoute().params.id == msg.conversation)
      ) {
        this.messages.push(msg);
      }
    },
    handleTemporaryMessage(temporaryId: number, msg: Message) {
      const referedMessage = this.messages.find((msgfind) => {
        return msgfind._id == msg.referedMessage;
      });
      let temporaryMessage: any = {
        ...msg,
        referedMessage,
        sender: useUsersStore().user,
        createdAt: new Date().toISOString(),
        conversation: useConversationsStore().getConversationLocally(
          msg.conversation as string
        ),
        _id: temporaryId,
      };
      this.temporaryMessagesIds.push(temporaryId);
      this.messages.push(temporaryMessage);
      setTimeout(() => {
        eventBus.emit("messageReceived", temporaryMessage);
      }, 50);
    },
    handleAiDelay(msg: Message) {
      this.isAiTyping = true;
      if (useRoute().params.id == msg.conversation) {
        const conv = useConversationsStore().conversations.find((convfind) => {
          return convfind._id == msg.conversation;
        });
        if (conv?.type == "ai") {
          const aiUser = ((conv as Conversation).members as User[]).find(
            (mem: User) => {
              return mem._id != msg.sender;
            }
          ) as User;
          const interval = setInterval(() => {
            if (this.isAiTyping) {
              eventBus.emit("typing", {
                conversation: msg.conversation as string,
                typer: aiUser,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } else {
              clearInterval(interval);
            }
          }, 500);
        }
      }
    },
    async send(msg: Message, conversationId: string, files: File[]) {
      msg.sender = useUsersStore().user._id as string;
      msg.conversation = conversationId;
      this.handleAiDelay(msg);

      //set temporary message
      const temporaryId = this.temporaryMessagesIds.length;

      this.handleTemporaryMessage(temporaryId, msg);
      //if ai conversation message:{myMessage:Message,aiMessage:Message}
      const message = await this.getService("messages").create(msg);
      //files handling
      if (files.length > 0) {
        await useMessageFilesStore().uploadMessageFiles(files, message._id);
      }
      if (useConversationsStore().currentConversation.type == "ai") {
        this.isAiTyping = false;
        this.popTemporaryMessage(temporaryId + "", message.myMessage);
        this.messages.push(message.aiMessage);
        eventBus.emit("messageReceived", message.myMessage);
        eventBus.emit("messageReceived", message.aiMessage);
      } else {
        this.popTemporaryMessage(temporaryId + "", message);
      }
      return message;
    },
    async transfer(msg: Message, conversationId: string) {
      msg.sender = useUsersStore().user._id as string;
      msg.conversation = conversationId;
      const message = await this.getService("messages").create(msg);
      return message;
    },
    popTemporaryMessage(_id: string, newMessage: Message) {
      this.messages = this.messages.map((msg: Message) => {
        if (_id == msg._id) {
          return newMessage;
        }
        return msg;
      });
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

      this.messages = await this.populateMessages(messages.data);

      this.isMessagesPulse = false;
      //set messages as seen
      //set conversation messages as seen
      await useMessageStatusStore().setConversationMessagesAsSeen();
    },
    async populateMessages(messages: Message[]) {
      const res = [];
      for (const msg of messages) {
        if (msg.type == "notification") {
          res.push(msg);
          continue;
        }
        const refMessage = msg.referedMessage as Message;
        if (refMessage) {
          let refSender: any = refMessage.sender;
          if (!refSender._id) {
            const refSenderId = refSender as string;
            refSender = await useUsersStore().getUser(refSenderId as string);
            refMessage.sender = refSender;
            msg.referedMessage = refMessage;
          }
        }

        res.push(msg);
      }
      return res;
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
      const res = await this.getService("messages").find({
        query: {
          $limit: limit,
          $skip: this.skip,
          $sort: { createdAt: 1 },
          conversation: useRoute().params.id,
        },
      });
      let messages = res.data;

      messages = await this.populateMessages(messages);

      this.messages = messages.concat(this.messages);
      this.isAppendingMessages = false;
      //set new loaded messages as seen
      await useMessageStatusStore().setConversationMessagesAsSeen();
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
    async handleMessageCreated(message: Message) {
      //notification handling
      if (message.type == "notification") {
        this.addMessage(message);

        return;
      }
      //basic message handling
      if ((message.sender as User)._id == useUsersStore().user._id) {
        return;
      }
      const populating = await this.populateMessages([message]);
      message = populating[0];
      //set lastMessage
      useConversationsStore().setLastMessage(
        message,
        (message.conversation as Conversation)._id as string
      );
      this.addMessage(message);
      //make event to scroll down
      setTimeout(() => {
        eventBus.emit("messageReceived", message);
      }, 10);
      //sort conversations
      useConversationsStore().sortConversations();
      //set message as seen

      if (
        useRoute().params.id &&
        useRoute().params.id == (message.conversation as Conversation)._id
      ) {
        const messageSeen: MessageSeen = {
          message: message._id as string,
          conversation: (message.conversation as Conversation)._id as string,
          viewer: useUsersStore().user._id as string,
        };
        const creatingMessageSeen = await this.getService(
          "message-seen"
        ).create(messageSeen);
      }
      //set message as recieved
      const recieving: Recieving = {
        message: message._id as string,
        conversation: (message.conversation as Conversation)._id as string,
        recipient: useUsersStore().user._id as string,
      };
      await this.getService("message-recieving").create(recieving);

      // }
      //update navItem number
      eventBus.emit("notificationNumberChanged", message);
    },

    async onMessage() {
      this.getService("messages").on("created", async (message: Message) => {
        await this.handleMessageCreated(message);
      });

      this.getService("messages").on("created", async (message: Message) => {
        await this.handleMessageCreated(message);
      });
      this.getService("messages").on("removed", async (message: Message) => {
        //set new lastMessage
        let conversationId: any = message.conversation;
        if (conversationId._id) {
          conversationId = conversationId._id;
        }
        // ._id as string;
        //update conversation last message
        const lastMessage = await useMessagesStore().getLastMessage(
          conversationId as string
        );
        useConversationsStore().setLastMessage(
          lastMessage,
          message.conversation as string
        );
        this.messages = this.messages.filter((msg) => {
          return msg._id != message._id;
        });
        //sort conversations
        useConversationsStore().sortConversations();
        //update navItem number
        eventBus.emit("notificationNumberChanged", message);
      });
    },
  },
});
