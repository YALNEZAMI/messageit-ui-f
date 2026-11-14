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
      isFriendRequestsPulse: false,
      isAcceptationsPulse: false,
      isFriendsPulse: false,
    };
  },
  actions: {
    setSearchKey(key: string) {
      this.searchKey = key;
    },
    setFriends(friends: User[]) {
      this.friends = useNuxtApp().$removeDuplicateById(friends);
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
      this.friendRequests = useNuxtApp().$removeDuplicateById(newVal);
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
      this.isFriendRequestsPulse = true;
      try {
        const userId = useUsersStore().user._id;
        const response = await this.getService("friend-requests").find({
          query: { recipient: userId },
        });
        const received = (response.data as Notification[]).filter((request) => request.recipient === userId);
        const friendRequests = await Promise.all(received.map(async (request) => ({
          ...request,
          sender: typeof request.sender === "string" ? await useUsersStore().getUser(request.sender) : request.sender,
        })));
        this.setFriendRequests(friendRequests);
        return friendRequests;
      } finally {
        this.isFriendRequestsPulse = false;
      }
    },
    async getAcceptedFriendRequests() {
      this.isAcceptationsPulse = true;
      try {
        const response = await this.getService("friend-acceptations").find({
          query: { seen: false },
        });
        const acceptations = (response.data as Notification[]).filter(
          (acc) => !acc.seen && acc.sender === useUsersStore().user._id
        );
        const populated = await Promise.all(acceptations.map(async (acc) => ({
          ...acc,
          recipient: typeof acc.recipient === "string" ? await useUsersStore().getUser(acc.recipient) : acc.recipient,
        })));
        this.setAcceptatons(populated);
      } finally {
        this.isAcceptationsPulse = false;
      }
    },
    async getFriendshipDate(userId: string): Promise<string> {
      const response = await this.getService("friend-acceptations").find({
        query: {
          $or: [
            {
              sender: useUsersStore().user._id,
              recipient: userId,
            },
            {
              sender: userId,
              recipient: useUsersStore().user._id,
            },
          ],
          $limit: 1,
        },

        paginate: false,
      });
      return response.data[response.data.length - 1].createdAt;
    },
    async clearAcceptations(ids: string[]) {
      for (const id of ids) {
        await this.getService("friend-acceptations").patch(id, { seen: true });
        this.setAcceptatons(this.acceptations.filter((acc) => acc._id !== id));
      }
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
      // Access Feathers client
      const query = {
        sender: useUsersStore().user._id,
        recipient: id,
      };
      const response: any = await this.getService("friend-requests").find({
        query,
      });
      if (response.total == 0) {
        return false;
      } else {
        const res = response.data.filter((freq: Notification) => {
          return (
            freq.sender == useUsersStore().user._id && freq.recipient == id
          );
        });

        return res.length > 0;
      }
    },
    async IsHeSentFriendRequest(id: string): Promise<boolean> {
      const query = {
        sender: id,
        recipient: useUsersStore().user._id,
      };
      const response: any = await this.getService("friend-requests").find({
        query,
      });
      if (response.total == 0) {
        return false;
      } else {
        return true;
      }
    },
    async sendFriendRequest(id: string) {
      const service = this.getService("friend-requests");

      const friendReq = await service.create({
        sender: useUsersStore().user._id,
        recipient: id,
        seen: false,
      });
      return friendReq;
    },
    async cancelFriendRequest(id: string) {
      const cancelReq = await this.getService("friend-requests").remove(null, {
        query: {
          otherUserId: id,
        },
      });
    },
    async accept(id: string) {
      const accepting = await this.getService("friends").create({
        sender: id,
        recipient: useUsersStore().user._id,
      });
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
      this.isFriendsPulse = true;
      try {
        const id = useUsersStore().user._id;
        const myFriends: User[] = await this.getService("friends").find({
          query: { id },
          paginate: false,
        });
        this.setFriends(myFriends);
        return myFriends;
      } finally {
        this.isFriendsPulse = false;
      }
    },
    async remove(id: string) {
      const deleting: any = await this.getService("friends").remove(null, {
        query: { sender: useUsersStore().user._id, recipient: id },
      });
      return deleting;
    },
    async onFriendRequests() {
      const service = this.getService("friend-requests");

      // Listen for the custom event
      service.on("created", async (friendReq: Notification) => {
        if (friendReq.recipient !== useUsersStore().user._id) return;
        this.setFriendRequests(
          this.friendRequests.filter((fr: Notification) => {
            return fr._id != friendReq._id;
          })
        );
        friendReq.sender = await useUsersStore().getUser(
          friendReq.sender.toString()
        );
        this.setFriendRequests([friendReq, ...this.friendRequests]);
        eventBus.emit("notificationNumberChanged", friendReq);
      });
      // Listen for the custom event
      service.on("removed", (friendReq: any) => {
        this.setFriendRequests(
          this.friendRequests.filter((fr: Notification) => {
            return fr._id != friendReq._id;
          })
        );
        eventBus.emit("notificationNumberChanged", friendReq);
      });
    },
    async onFriends() {
      const service = this.getService("friends");
      // Listen for the custom event
      service.on("created", async (acceptation: Notification) => {
        //adding friend
        let newFriend: User;
        if (acceptation.sender == useUsersStore().user._id) {
          newFriend = await useUsersStore().getUser(
            acceptation.recipient as string
          );
        } else {
          newFriend = await useUsersStore().getUser(
            acceptation.sender as string
          );
        }
        this.addFriend(newFriend);
        //acceptation handling
        if (acceptation.sender == useUsersStore().user._id) {
          await this.getAcceptedFriendRequests();
        }
        eventBus.emit("notificationNumberChanged", acceptation);
      });
      //removing friends
      service.on("removed", (notif: Notification) => {
        if (notif.sender == useUsersStore().user._id) {
          this.setFriends(
            this.friends.filter((fr) => {
              return fr != notif.recipient;
            })
          );
        } else {
          this.setFriends(
            this.friends.filter((fr) => {
              return fr != notif.sender;
            })
          );
        }
        eventBus.emit("notificationNumberChanged", notif);
      });
    },
    async setFriendRequestAsSeen(id: string) {
      const result = await this.getService("friend-requests").patch(id, {
        seen: true,
      });
      this.friendRequests = this.friendRequests.map((request) =>
        request._id === id ? { ...request, seen: true } : request
      );
      return result;
    },
  },
});
