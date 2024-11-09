import { defineStore } from "pinia";
import type { User } from "~/interfaces/user";
export const useAuthStore = defineStore("authStore", {
  state: () => {
    return {
      user: JSON.parse(localStorage.getItem("user") || "{}"),
      accessToken: localStorage.getItem("accessToken"),
      authentication: JSON.parse(
        localStorage.getItem("authentication") || "{}"
      ),
      themes: [
        {
          name: "basic",
          color: "text-black",
          bg: "bg-white",
          emoji: "👍",
        },
      ],
    };
  },
  actions: {
    redirectTo(path: string) {
      useRouter().push(path);
    },
    getThemeTailwindClasses(level: number) {
      switch (this.user.theme) {
        case "basic":
          return {
            [`bg-blue-${level} text-white`]: true,
          };
        default:
          return {
            [`bg-blue-${level}`]: true,
          };
      }
    },
    getTailwindAppClasses() {
      return {
        "bg-gray-700 text-white": true,
      };
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
        const body = auth;

        delete body.password2;
        body.theme = "basic";
        const feathers = useNuxtApp().$feathers; // Access the Feathers client

        await feathers.service("users").create(body);
        this.login({
          email: body.email,
          password: body.password,
        });
      } catch (error: any) {
        console.log("error", error);
      }
    },
    async login(auth: User) {
      try {
        auth.strategy = "local";
        const feathers = useNuxtApp().$feathers; // Access the Feathers client
        const response = await feathers.service("authentication").create(auth);
        console.log("response", response);
        this.setAccessToken(response.accessToken);
        this.setUser(response.user);
        this.setAuthentication(response.authentication);
        this.redirectTo("/admin");
        return response;
      } catch (error: any) {
        console.log("error", error);
        return false;
      }
    },
    isTokenExpired() {
      const now = Math.floor(Date.now() / 1000); // current time in seconds
      return now >= this.authentication.payload.exp;
    },
  },
});
