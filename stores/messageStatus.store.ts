import { defineStore } from "pinia";
import type { Message } from "~/interfaces/message";
import type { MessageSeen } from "~/interfaces/message-seen";
import type { Recieving } from "~/interfaces/recieving";
import type { User } from "~/interfaces/user";
export const useMessageStatusStore = defineStore("useMessageStatusStore", {
  state: () => {
    return {
      att: "val",
      messagesViewers: [] as MessageSeen[],
    };
  },
  actions: {
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async isRecieved(message: Message): Promise<boolean> {
      const res = await this.getService("message-recieving").find({
        query: {
          recipient: { $ne: useUsersStore().user._id },
          $or: [
            {
              message: message._id,
              conversation: useConversationsStore().currentConversation._id,
            },
            {
              conversation: useConversationsStore().currentConversation._id,
              createdAt: {
                $gt: new Date(message.createdAt as string).toISOString(),
              },
            },
          ],
        },
        paginate: false,
      });
      return res.data.length > 0;
    },
    async setAllConversationsMessagesAsRecieved() {
      for (const conv of useConversationsStore().conversations) {
        const alreadySetAsRecieved = await this.getService(
          "message-recieving"
        ).find({
          query: {
            conversation: conv._id,
            recipient: useUsersStore().user._id,
            message: "noMessage",
          },
        });
        if (alreadySetAsRecieved.total > 0) {
          return await this.getService("message-recieving").patch(
            alreadySetAsRecieved.data[0]._id,
            {
              createdAt: new Date().toISOString(),
            }
          );
        }
        await this.getService("message-recieving").create({
          conversation: conv._id,
          recipient: useUsersStore().user._id,
          message: "noMessage",
        });
      }
    },
    async initViewers() {
      for (const member of useConversationsStore().currentConversation
        .members as User[]) {
        if (member._id == useUsersStore().user._id) {
          continue;
        }
        const res = await this.getService("message-seen").find({
          query: {
            conversation: useConversationsStore().currentConversation._id,
            viewer: member._id as string,
            $sort: { createdAt: -1 },
            $limit: 1,
          },
          paginate: false,
        });
        if (res.data.length > 0) {
          this.updateMessageViewersLocally(res.data[0]);
        }
      }
    },
    getViewers(message: string): User[] {
      //TODO if message not maped ,retrieve it
      const res: User[] = [];
      for (const view of this.messagesViewers) {
        if (view.message == message) {
          res.push(useConversationsStore().getMember(view.viewer));
        }
      }
      return res;
    },
    async setConversationMessagesAsSeen() {
      const messagesAlreadySeen = await this.getService("message-seen").find({
        query: {
          conversation: useConversationsStore().currentConversation._id,
          viewer: useUsersStore().user._id,
        },
        paginate: false,
      });
      const seenMessagesIds = messagesAlreadySeen.data.map((view: any) => {
        return view.message;
      });
      const messageNotMarkedAsSeen = useMessagesStore().messages.filter(
        (msg) => {
          return !seenMessagesIds.includes(msg._id);
        }
      );
      for (const msgNotSeen of messageNotMarkedAsSeen) {
        const creating = await this.getService("message-seen").create({
          message: msgNotSeen._id,
          viewer: useUsersStore().user._id,
          conversation: useConversationsStore().currentConversation._id,
        });
      }
    },
    updateMessageViewersLocally(messageSeen: MessageSeen) {
      //ignore current user
      if (messageSeen.viewer == useUsersStore().user._id) {
        return;
      }
      //check if user is maped
      const notMaped =
        this.messagesViewers.filter((view: any) => {
          return view.viewer == messageSeen.viewer;
        }).length == 0;
      if (notMaped) {
        this.messagesViewers.push(messageSeen);
        return;
      } else {
        this.messagesViewers = this.messagesViewers.map((view: MessageSeen) => {
          if (view.viewer == messageSeen.viewer) {
            view.message = messageSeen.message;
            return view;
          } else {
            return view;
          }
        });
      }
    },
    getLastMessageSeen(user: string): string {
      const messageId = this.messagesViewers.find((msgView: any) => {
        return msgView.viewer == user;
      })?.message;
      return messageId as string;
    },
    setAtt(newVal: string) {
      this.att = newVal;
    },

    onMessageStatus() {
      this.getService("message-recieving").on(
        "created",
        (recieving: Recieving) => {
          if (recieving.recipient == useUsersStore().user._id) {
            return;
          }
          eventBus.emit("recieving", recieving);
        }
      );
      this.getService("message-seen").on(
        "created",
        (messageSeen: MessageSeen) => {
          this.updateMessageViewersLocally(messageSeen);
          eventBus.emit("messageSeen", messageSeen);
        }
      );
    },
  },
});
