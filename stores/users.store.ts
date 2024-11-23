import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Theme } from "~/interfaces/theme";
import type { User } from "~/interfaces/user";
export const useUsersStore = defineStore("usersStore", {
  state: () => {
    return {
      statusCheckingIntervalle: {} as NodeJS.Timeout,
      statusCheckingIntervalleTime: 1000 * 60, //one minute
      users: [],
      searchedUsers: [],
      defaultUserImg:
        "https://cdn.pixabay.com/photo/2012/04/13/21/07/user-33638_640.png",
      user: {} as User,
      themes: [
        { name: "Basique", _id: "basic" },
        { name: "Printemps", _id: "spring" },
        { name: "Amour", _id: "love" },
        { name: "Panda", _id: "panda" },
      ] as Theme[],
      isSearchUsersPulse: false,
    };
  },
  actions: {
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },
    setUsers(users: any) {
      this.users = users;
    },
    setsearchedUsers(users: any) {
      this.searchedUsers = users;
    },
    async getUser(id: string) {
      return await this.getService("my-users").get(id, {});
    },
    setUser(user: User) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    async updateUser(user: any) {
      return await this.getService("my-users").patch(user._id as string, user);
    },
    async updateCurrentAuthUser(auth: any) {
      delete auth.password2;
      return await this.getService("users").patch(
        this.user._id as string,
        auth
      );
    },
    async setCurrentUserStatus(isOnLine: boolean) {
      await this.getService("my-users").patch(
        this.user._id as string,
        {
          onLine: isOnLine,
        },
        {
          query: {
            statusChecking: true,
          },
        }
      );
    },
    async search(name: string) {
      this.isSearchUsersPulse = true;
      try {
        let response = await this.getService("my-users").find({
          query: {
            name,
            currentUserId: this.user._id,
          },
        });

        this.setsearchedUsers(response);
        this.isSearchUsersPulse = false;
        return response.data;
      } catch (error) {
        console.error("Error retrieving users:", error);
      }
    },
    setStatusCheckingIntervalle() {
      clearInterval(this.statusCheckingIntervalle);
      const newIntervall = setInterval(async () => {
        await useUsersStore().setCurrentUserStatus(true);
      }, this.statusCheckingIntervalleTime);
      this.statusCheckingIntervalle = newIntervall;
    },
    onUser() {
      this.getService("my-users").on("patched", (user: User) => {
        //update friends
        useFriendsStore().setFriends(
          useFriendsStore().friends.map((fr: User) => {
            if (fr._id == user._id) {
              return user;
            }
            return fr;
          })
        );
        //update members of all conversations
        useConversationsStore().setConversations(
          useConversationsStore().conversations.map((conv: Conversation) => {
            conv.members = conv.members.map((mem: any) => {
              if (mem._id == user._id) {
                return user;
              }
              return mem;
            });
            return conv;
          })
        );
        //update members of currentConversation
        const newCurrentConversation =
          useConversationsStore().currentConversation;
        if (newCurrentConversation._id) {
          newCurrentConversation.members = newCurrentConversation.members.map(
            (mem: any) => {
              if (mem._id == user._id) {
                return user;
              }
              return mem;
            }
          );
          useConversationsStore().setCurrentConversation(
            newCurrentConversation
          );
        }
      });
    },
  },
});
