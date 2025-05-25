import { defineStore } from "pinia";
import type { Conversation } from "~/interfaces/conversation";
import type { Theme } from "~/interfaces/theme";
import type { User } from "~/interfaces/user";
import { eventBus } from "@/utils/eventBus";

export const useUsersStore = defineStore("usersStore", {
  state: () => {
    return {
      users: [],
      searchedUsers: [],
      defaultUserImg:
        useRuntimeConfig().public.BASE_URL + "/images-ui/user.png",
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
    getService() {
      return useNuxtApp().$feathers.service("my-users");
    },
    setUsers(users: any) {
      this.users = users;
    },
    setsearchedUsers(users: any) {
      this.searchedUsers = users;
    },
    async getUser(id: string) {
      return await this.getService().get(id, {});
    },
    async setUserLocally(user: User) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    async setUserFromApi(user: User) {
      this.user = await this.getService().get(user._id as string, {});
      localStorage.setItem("user", JSON.stringify(user));
    },
    async updateUser(user: any) {
      return await this.getService().patch(user._id as string, user);
    },
    async updateCurrentAuthUser(auth: any) {
      delete auth.password2;
      const feathers = useNuxtApp().$feathers;
      return await feathers
        .service("users")
        .patch(this.user._id as string, auth);
    },

    async search(name: string) {
      this.isSearchUsersPulse = true;
      try {
        let response = await this.getService().find({
          query: {
            name,
          },
          paginate: false,
        });
        this.setsearchedUsers(response);
        this.isSearchUsersPulse = false;
        return response;
      } catch (error) {
        console.error("Error retrieving users:", error);
      }
    },

    onUser() {
      this.getService().on("patched", async (user: User) => {
        if (this.user._id == user._id) {
          this.setUserLocally(user);
        }
        eventBus.emit("userPatched", user);
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
          await useConversationsStore().setCurrentConversation(
            newCurrentConversation
          );
        }
      });
    },

    async deleteUser() {
      const id = this.user._id as string;
      await this.getService().remove(id);
      await useNuxtApp().$feathers.service("users").remove(id);
      localStorage.clear();
      useRouter().push("/auth/login");
      window.location.reload();
    },
  },
});
