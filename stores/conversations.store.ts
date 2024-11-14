import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
export const useConversationsStore = defineStore("conversationsStore", {
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
    async chatWithUser(idUser: string) {
      const conv = await this.getService("conversations").get("", {
        query: {
          user1: idUser,
          user2: useAuthStore().user._id,
        },
      });

      useRouter().push(`/private-space/conversations/${conv._id}`);
    },
    //if bool is true id is set as Conversation _id, null otherwise
    // async conversationExistWith(
    //   idUser: string
    // ): Promise<any> // : Promise<{ bool: boolean; _id: string }>
    // {
    //   const myId = useAuthStore().user._id;
    //   const response = await this.getService("conversations").get("", {
    //     query: {
    //       user1: myId,
    //       user2: idUser,
    //     },
    //   });
    //   console.log("response", response);

    //   // response1.concact(response2);
    //   // console.log("response", merge);
    //   // if (merge.length == 0) {
    //   //   return {
    //   //     bool: false,
    //   //     _id: "",
    //   //   };
    //   // } else {
    //   //   return {
    //   //     bool: true,
    //   //     _id: merge[0]._id,
    //   //   };
    //   // }
    // },
  },
});
