import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import conversations from "~/middleware/conversations";
export const useStore = defineStore("store", {
  state: () => {
    return {
      conversations: [] as Conversation[],
    };
  },
  actions: {
    setAtt(newVal: Conversation[]) {
      this.conversations = newVal;
    },
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async conversationExistWith(idUser: string) {
      return await this.getService("members").get("", {
        query: {
          user1: idUser,
          user2: useAuthStore().user._id,
        },
      });
    },
  },
});
