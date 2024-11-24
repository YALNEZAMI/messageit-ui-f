import { defineStore } from "pinia";
import type { User } from "~/interfaces/user";

export const useAuthStore = defineStore("authStore", {
  state: () => {
    return {
      accessToken: "",
      authentication: { payload: { exp: 1 } },
    };
  },
  actions: {
    getService(name: string) {
      return useNuxtApp().$feathers.service(name);
    },

    redirectTo(path: string) {
      useRouter().push(path);
    },

    isAuthenticated() {
      return this.accessToken != "" && !this.isTokenExpired();
    },

    setAuthentication(auth: any) {
      this.authentication = auth;
      localStorage.setItem("authentication", JSON.stringify(auth));
    },
    setAccessToken(token: string) {
      this.accessToken = token;
      localStorage.setItem("accessToken", token);
    },
    async register(auth: User) {
      localStorage.clear();
      try {
        const body: any = {
          email: auth.email,
          password: auth.password,
        };
        const query = {
          name: auth.name,
          email: auth.email,
        };

        const registering = await this.getService("users").create(body, {
          query,
        });
        return registering;
      } catch (error: any) {
        console.log("error", error);
      }
    },
    async logout() {
      try {
        //set as offline
        await useUsersStore().setCurrentUserStatus(false);

        localStorage.clear();
        this.setAccessToken("");
        this.setAuthentication({});
        useUsersStore().setUserLocally({} as User);
        useRouter().push("/auth/login");
        window.location.reload();
      } catch (error) {
        localStorage.clear();
        this.setAccessToken("");
        this.setAuthentication({});
        useUsersStore().setUserLocally({} as User);
        useRouter().push("/auth/login");
        window.location.reload();
      }
    },
    async login(auth: any) {
      try {
        auth.strategy = "local";
        const response: any = await this.getService("authentication").create(
          auth
        );
        //set access token
        this.setAccessToken(response.accessToken);
        //set auth object
        this.setAuthentication(response.authentication);
        const completeUser = await this.getService("my-users").get(
          response.user._id
        );
        useUsersStore().setUserLocally(completeUser);

        //init friends requests
        await useFriendsStore().getFriendRequestsSentToMe();
        //set onLine as true
        await useUsersStore().setCurrentUserStatus(true);

        this.redirectTo("/private-space");
        return response;
      } catch (error: any) {
        console.log("error", error);
        return false;
      }
    },
    isTokenExpired() {
      if (!this.authentication.payload) {
        return true;
      }
      const now = Math.floor(Date.now() / 1000); // current time in seconds
      return now >= this.authentication.payload.exp;
    },
    initializeAuth() {
      // Retrieve token and user from localStorage
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      const storedAuthentication = localStorage.getItem("authentication");
      if (storedToken != null) {
        this.setAccessToken(storedToken);
      } else {
        this.setAccessToken("");
      }
      if (storedUser != null) {
        useUsersStore().setUserLocally(JSON.parse(storedUser));
      } else {
        useUsersStore().setUserLocally({} as User);
      }
      if (storedAuthentication != null) {
        this.setAuthentication(JSON.parse(storedAuthentication));
      }
    },
  },
});
