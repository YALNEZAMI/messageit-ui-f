import { defineStore } from "pinia";
import type { User } from "~/interfaces/user";

export const useAuthStore = defineStore("authStore", {
  state: () => {
    return {
      defaultUserImg:
        "https://cdn.pixabay.com/photo/2012/04/13/21/07/user-33638_640.png",
      user: {} as User,
      accessToken: "",
      //   accessToken: "",
      authentication: { payload: { exp: 1 } },
      themes: [
        {
          name: "Basique",
          _id: "basic",
        },
      ],
    };
  },
  actions: {
    redirectTo(path: string) {
      useRouter().push(path);
    },

    isAuthenticated() {
      return this.accessToken != "" && !this.isTokenExpired();
    },
    setUser(user: User) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
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
      try {
        const body: User = {
          email: auth.email,
          password: auth.password,
        };
        const query = {
          name: auth.name,
          email: auth.email,
        };

        const feathers = useNuxtApp().$feathers; // Access the Feathers client
        const registering = await feathers
          .service("users")
          .create(body, { query });
        return registering;
      } catch (error: any) {
        console.log("error", error);
      }
    },
    async logout() {
      localStorage.clear();
      this.setAccessToken("");
      this.setAuthentication({});
      this.setUser({} as User);
      useRouter().push("/auth/login");
      window.location.reload();
    },
    async login(auth: User) {
      try {
        auth.strategy = "local";
        const feathers = useNuxtApp().$feathers; // Access the Feathers client
        const authenticationService = feathers.service("authentication");
        const response: any = await authenticationService.create(auth);
        this.setAccessToken(response.accessToken);
        const completeUser = await feathers
          .service("my-users")
          .get(response.user._id, {
            headers: {
              Authorization: `Bearer ${useAuthStore().accessToken}`,
            },
          });
        this.setUser(completeUser);
        this.setAuthentication(response.authentication);
        await useFriendsStore().getFriendRequestsSentToMe();
        this.redirectTo("/admin");
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
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const storedAuthentication = JSON.parse(
        localStorage.getItem("authentication") || "{}"
      );
      if (storedToken) {
        this.setAccessToken(storedToken);
      }
      if (storedUser) {
        this.setUser(storedUser);
      }
      if (storedAuthentication) {
        this.setAuthentication(storedAuthentication);
      }
    },
  },
});
