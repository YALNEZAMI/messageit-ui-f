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
      eventBus.emit(
        "conversationChanged",
        useConversationsStore().currentConversation
      );
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
    async toogleAdmin(newAdminId: string): Promise<any> {
      const rights = await this.getService().patch(
        null,
        {},
        {
          query: {
            admin: newAdminId,
            conversation: useConversationsStore().currentConversation._id,
          },
        }
      );
      this.setRightsLocally(rights[0] as GroupRights);
    },
    async upgradeToChef(newChefId: string) {
      const rights = await this.getService().patch(
        null,
        {},
        {
          query: {
            chef: newChefId,
            conversation: useConversationsStore().currentConversation._id,
          },
        }
      );
      this.setRightsLocally(rights[0] as GroupRights);
    },
  },
});
