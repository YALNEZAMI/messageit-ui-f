import { defineStore } from "pinia";
import type { GroupRights } from "~/interfaces/groupRights";
export const useGroupRightsStore = defineStore("useGroupRightsStore", {
  state: () => {
    return {
      rights: {} as GroupRights,
      att: "val",
    };
  },
  actions: {
    setRightsLocally(rights: GroupRights) {
      this.rights = rights;
    },
    async fetchRights() {
      const res = await this.getService().find({
        query: {
          conversation: useConversationsStore().currentConversation._id,
        },
      });
      const rights = res.data[0];
      this.rights = rights;
    },
    getService() {
      return useNuxtApp().$feathers.service("group-rights");
    },
    async toogleAdmin(memberId: string): Promise<any> {
      return await this.getService().patch(
        null,
        {},
        {
          query: {
            admin: memberId,
            conversation: useConversationsStore().currentConversation._id,
          },
        }
      );
    },
  },
});
