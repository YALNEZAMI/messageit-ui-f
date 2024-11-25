import { defineStore } from "pinia";
import type { Typing } from "~/interfaces/typing";
import { eventBus } from "@/utils/eventBus";

export const useTypingStore = defineStore("typingStore", {
  state: () => {
    return {
      att: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.att = newVal;
    },
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async createTyping() {
      const body: Typing = {
        typer: useUsersStore().user._id as string,
        conversation: useConversationsStore().currentConversation._id as string,
      };
      await this.getService("is-typing").create(body);
    },
    onTyping() {
      this.getService("is-typing").on("created", async (typing: Typing) => {
        typing.typer = await useUsersStore().getUser(typing.typer as string);
        eventBus.emit("typing", typing);
      });
    },
  },
});
