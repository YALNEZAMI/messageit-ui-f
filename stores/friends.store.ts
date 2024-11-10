import { defineStore } from "pinia";
import type { User } from "~/interfaces/user";
export const useFriendsStore = defineStore("friendsStore", {
  state: () => {
    return {
      searchKey: "",
      frineds: [],
      friendRequests: [],
    };
  },
  actions: {
    setSearchKey(key: string) {
      this.searchKey = key;
    },
    setFriends(newVal: any) {
      this.frineds = newVal;
    },
    setFriendRequests(newVal: any) {
      this.friendRequests = newVal;
    },
    async isMyFriend(id: string): Promise<boolean> {
      const myFriends = await this.getMyFriends();
      let res = false;
      myFriends.map((f) => {
        if (f._id == id) {
          res = true;
        }
      });
      return res;
    },
    async IsISentFriendRequest(id: string): Promise<boolean> {
      const feathers = useNuxtApp().$feathers; // Access Feathers client
      const query = {
        sender: useAuthStore().user._id,
        recipient: id,
      };
      const response: any = await feathers.service("friend-requests").find({
        query,
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      console.log("isissentfriendrequest", response);
      if (response.total == 0) {
        return false;
      } else {
        return true;
      }
    },
    async IsHeSentFriendRequest(id: string): Promise<boolean> {
      const feathers = useNuxtApp().$feathers;
      const query = {
        sender: id,
        recipient: useAuthStore().user._id,
      };
      const response: any = await feathers.service("friend-requests").find({
        query,
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      console.log("isissentfriendrequest", response);
      if (response.total == 0) {
        return false;
      } else {
        return true;
      }
    },
    async sendFriendRequest(id: string) {
      const feathers = useNuxtApp().$feathers;
      const friendReq = await feathers.service("friend-requests").create(
        { sender: useAuthStore().user._id, recipient: id },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore().accessToken}`,
          },
        }
      );
      return friendReq;
    },
    async cancelFriendRequest(query: any) {
      const feathers = useNuxtApp().$feathers;
      const cancelReq = await feathers.service("friend-requests").remove(null, {
        query,
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
    },
    async accept(id: string) {
      const feathers = useNuxtApp().$feathers;
      const accepting = await feathers.service("friends").create(
        {
          sender: id,
          recipient: useAuthStore().user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore().accessToken}`,
          },
        }
      );
    },
    async getMyFriends(): Promise<User[]> {
      const feathers = useNuxtApp().$feathers;
      const id = useAuthStore().user._id;
      console.log("myid", id);
      const myFriends: any = await feathers.service("friends").find({
        query: { id },
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      console.log("myFriends", myFriends);
      this.setFriends(myFriends.data);
      return myFriends;
    },
    async remove(id: string) {
      const feathers = useNuxtApp().$feathers;
      const deleting: any = await feathers.service("friends").remove(null, {
        query: { sender: useAuthStore().user._id, recipient: id },
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      return deleting;
    },
  },
});
