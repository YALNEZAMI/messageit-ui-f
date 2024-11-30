import { defineStore } from "pinia";
import type { Emoji } from "~/interfaces/emoji";
export const useEmojisStore = defineStore("useEmojisStore", {
  state: () => {
    return {
      att: "val",
      availableEmojis: ["👍", "❤️", "😊", "😔", "😡"],
    };
  },
  actions: {
    getService() {
      return useNuxtApp().$feathers.service("emojis");
    },

    setAtt(newVal: string) {
      this.att = newVal;
    },

    async getEmojis(message: string) {
      const response = await this.getService().find({
        query: {
          message,
        },
      });
      return response.data;
    },
    async postEmoji(message: string, emoji: string) {
      if (!this.availableEmojis.includes(emoji)) {
        return;
      }
      const alreadyReacted = await this.alreadyReacted(message);
      if (alreadyReacted.length > 0) {
        const sameEmoji = alreadyReacted[0].emoji == emoji;
        if (sameEmoji) {
          await this.getService().remove(alreadyReacted[0]._id);
        } else {
          const response = await this.getService().patch(
            alreadyReacted[0]._id,
            {
              emoji,
              message,
              reacter: useUsersStore().user._id,
            }
          );
          return response;
        }
      } else {
        const response = await this.getService().create({
          emoji,
          message,
          reacter: useUsersStore().user._id,
        });
        return response;
      }
    },
    async alreadyReacted(message: string) {
      const response = await this.getService().find({
        query: {
          message,
          reacter: useUsersStore().user._id,
        },
      });
      return response.data;
    },
    onEmoji() {
      this.getService().on("created", (emoji: Emoji) => {
        eventBus.emit("emojiCreated", emoji);
      });
      this.getService().on("patched", (emoji: Emoji) => {
        eventBus.emit("emojiCreated", emoji);
      });
      this.getService().on("removed", (emoji: Emoji) => {
        eventBus.emit("emojiRemoved", emoji);
      });
    },
  },
});
