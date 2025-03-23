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
    async uploadProfilePhoto(file: File) {
      const reader = new FileReader();

      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        // Convert ArrayBuffer to base64
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = uint8Array.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );
        const base64String = btoa(binaryString);

        // Send base64-encoded file to the service
        const response = await useNuxtApp()
          .$feathers.service("users-photos")
          .create({
            file: {
              buffer: base64String, // Base64-encoded buffer
              originalname: file.name, // File name
            },
          });
      };

      reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
    },
  },
});
