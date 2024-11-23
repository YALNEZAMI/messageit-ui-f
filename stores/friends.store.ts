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
      const query = {
        recipient: useUsersStore().user._id,
      };
      const response: any = await this.getService("friend-requests").find({
        query,
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
      this.isFriendRequestsPulse = false;
      return friendRequests;
    },
    async getAcceptedFriendRequests() {
      this.isAcceptationsPulse = true;

      const response = await this.getService("friend-acceptations").find();
      const acceptations = response.data as Notification[];
      for (let acc of acceptations) {
        acc.recipient = await useUsersStore().getUser(acc.recipient as string);
      }
      this.setAcceptatons(acceptations);
      this.isAcceptationsPulse = false;
    },
    async clearAcceptations() {
      const response = await this.getService("friend-acceptations").remove(
        null
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
      const id = useUsersStore().user._id;
      const myFriends: any = await this.getService("friends").find({
        query: { id },
      });
      this.setFriends(myFriends as User[]);
      this.isFriendsPulse = false;
      return myFriends;
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
        this.setFriendRequests(
          this.friendRequests.filter((fr: Notification) => {
            return fr._id != friendReq._id;
          })
        );
        friendReq.sender = await useUsersStore().getUser(
          friendReq.sender.toString()
        );
        this.setFriendRequests([friendReq, ...this.friendRequests]);
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
          const acceptationExist =
            this.acceptations.filter((acc: Notification) => {
              return acc._id === acceptation._id;
            }).length > 0;
          if (!acceptationExist) {
            acceptation.recipient = newFriend;
            this.setAcceptatons([acceptation, ...this.acceptations]);
          }
        }
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
      });
    },
    async setFriendRequestAsSeen(id: string) {
      for (let fReq of this.friendRequests) {
        fReq.seen = true;
      }
      return await this.getService("friend-requests").patch(id, {
        seen: true,
      });
    },
  },
});
