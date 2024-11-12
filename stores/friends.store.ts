import { defineStore } from "pinia";
import type { Notification } from "~/interfaces/notification";
import type { User } from "~/interfaces/user";
export const useFriendsStore = defineStore("friendsStore", {
  state: () => {
    return {
      searchKey: "",
      friends: [] as User[],
      friendRequests: [] as Notification[],
      acceptations: [] as Notification[],
    };
  },
  actions: {
    setSearchKey(key: string) {
      this.searchKey = key;
    },
    setFriends(friends: User[]) {
      this.friends = friends;
    },
    addFriend(friend: User) {
      const exist =
        this.friends.filter((f) => {
          return friend._id === f._id;
        }).length > 0;
      if (!exist) {
        this.friends = [friend, ...this.friends];
      }
    },
    removeFriend(id: string) {
      this.friends = this.friends.filter((fr) => {
        return fr._id != id;
      });
    },
    setFriendRequests(newVal: any) {
      this.friendRequests = newVal;
    },
    setAcceptatons(newVal: any) {
      this.acceptations = newVal;
    },
    getNotifications(): { friendRequests: Notification[] } {
      return {
        friendRequests: this.friendRequests,
      };
    },
    getNotificationsNumber(): number {
      return this.friendRequests.length;
    },
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    async getFriendRequestsSentToMe(): Promise<Notification[]> {
      const feathers = useNuxtApp().$feathers;
      const query = {
        recipient: useAuthStore().user._id,
      };
      const response: any = await feathers.service("friend-requests").find({
        query,
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      let friendRequests = await response.data;
      // friendRequests = friendRequests.map(async (fr: Notification) => {
      //   fr.sender = await useUsersStore().getUser(fr.sender as string);
      //   return fr;
      // });
      for (let fr of friendRequests) {
        fr.sender = await useUsersStore().getUser(fr.sender as string);
      }
      this.setFriendRequests(friendRequests);
      return friendRequests;
    },
    async getAcceptedFriendRequests() {
      const currentUserId = useAuthStore().user._id;
      const query = {
        sender: currentUserId,
      };
      const response = await this.getService("friend-acceptations").find({
        query: query,
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      const acceptations = response.data as Notification[];
      for (let acc of acceptations) {
        acc.recipient = await useUsersStore().getUser(acc.recipient as string);
      }
      this.setAcceptatons(acceptations);
    },
    async clearAcceptations() {
      const currentUserId = useAuthStore().user._id;
      const query = {
        id: currentUserId,
      };
      const response = await this.getService("friend-acceptations").remove(
        null,
        {
          query: query,
          headers: {
            Authorization: `Bearer ${useAuthStore().accessToken}`,
          },
        }
      );
      this.setAcceptatons([]);
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
      if (response.total == 0) {
        return false;
      } else {
        return true;
      }
    },
    async sendFriendRequest(id: string) {
      const feathers = useNuxtApp().$feathers;
      const service = feathers.service("friend-requests");

      const friendReq = await service.create(
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
      if (accepting) {
        //remove friend request from store
        this.setFriendRequests(
          this.friendRequests.filter((fr: Notification) => {
            const sender = fr.sender as User;
            return sender._id != id;
          })
        );
      }
    },
    async getMyFriends(): Promise<User[]> {
      const feathers = useNuxtApp().$feathers;
      const id = useAuthStore().user._id;
      const myFriends: any = await feathers.service("friends").find({
        query: { id },
        headers: {
          Authorization: `Bearer ${useAuthStore().accessToken}`,
        },
      });
      this.setFriends(myFriends as User[]);
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
    async onFriendRequests() {
      const { $feathers } = useNuxtApp();
      const service = $feathers.service("friend-requests");

      // Listen for the custom event
      service.on("created", async (friendReq: Notification) => {
        console.log("created ", friendReq);
        const friendRequestExist = this.friendRequests.filter(
          (fr: Notification) => {
            return fr._id === friendReq._id;
          }
        );

        if (friendRequestExist.length == 0) {
          friendReq.sender = await useUsersStore().getUser(
            friendReq.sender as string
          );
          this.setFriendRequests([friendReq, ...this.friendRequests]);
        }
      });
      // Listen for the custom event
      service.on("removed", (friendReq: any) => {
        this.setFriendRequests(
          this.friendRequests.filter((fr: Notification) => {
            return fr._id != friendReq._id;
          })
        );
      });
    },
    async onFriends() {
      const { $feathers } = useNuxtApp();
      const service = $feathers.service("friends");

      // Listen for the custom event
      service.on("created", async (accepation: Notification) => {
        //adding friend
        let newFriend: User;
        if (accepation.sender == useAuthStore().user._id) {
          newFriend = await useUsersStore().getUser(
            accepation.recipient as string
          );
        } else {
          newFriend = await useUsersStore().getUser(
            accepation.sender as string
          );
        }
        this.addFriend(newFriend);
        //acceptation handling
        const accepationExist =
          this.acceptations.filter((acc: Notification) => {
            return acc._id === accepation._id;
          }).length > 0;
        if (!accepationExist) {
          accepation.recipient = newFriend;
          this.setAcceptatons([accepation, ...this.acceptations]);
        }
      });
    },
  },
});
