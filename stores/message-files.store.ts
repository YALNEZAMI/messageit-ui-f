import { defineStore } from "pinia";

export const useMessageFilesStore = defineStore("useMessageFilesStore", {
  state: () => {
    return {
      att: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.att = newVal;
    },
    getService() {
      return useNuxtApp().$feathers.service("message-files");
    },

    async getFiles(message: string) {
      const res = await this.getService().find({
        query: {
          message,
        },
      });
      if (res.data.length == 0) {
        return [];
      }
      return res.data[0].urls;
    },
    async getFilesOfConversation(conversation: string) {
      const res = await this.getService().find({
        query: {
          conversation,
        },
      });
      return res.data;
    },
  },
});
