import { defineStore } from "pinia";
import type { User } from "~/interfaces/user";
export const useUsersStore = defineStore("usersStore", {
  state: () => {
    return {
      users: [],
      searchedUsers: [],
    };
  },
  actions: {
    setUsers(users: any) {
      this.users = users;
    },
    setsearchedUsers(users: any) {
      this.searchedUsers = users;
    },
    async getUser(id: string) {
      const feathers = useNuxtApp().$feathers;
      return await feathers.service("my-users").get(id, {});
    },
    async search(req: any) {
      try {
        const feathers = useNuxtApp().$feathers; // Access Feathers client
        let response = await feathers.service("my-users").find({
          query: {
            $and: [
              { name: req.text },
              { _id: { $ne: useAuthStore().user._id } },
            ],
          },
          headers: {
            Authorization: `Bearer ${useAuthStore().accessToken}`,
          },
        });
        if (response.data.length == 0) {
          response = await feathers.service("my-users").find({
            query: {
              _id: { $ne: useAuthStore().user._id },
            },
            headers: {
              Authorization: `Bearer ${useAuthStore().accessToken}`,
            },
          });
        }
        response.data = response.data.filter((user: User) => {
          return (
            user.name?.includes(req.text) && user._id != useAuthStore().user._id
          );
        });
        this.setsearchedUsers(response.data);
        return response.data;
      } catch (error) {
        console.error("Error retrieving users:", error);
      }
    },
  },
});
