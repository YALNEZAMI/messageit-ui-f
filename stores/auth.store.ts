import { defineStore } from "pinia";
import type { Auth } from "~/interfaces/auth";

export const useAuthStore = defineStore("authStore", {
  state: () => {
    return {
      loading: false,
      error: {},
      email: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.email = newVal;
    },
    async register(auth: Auth) {
      try {
        // const body = {
        //   email: auth.email,
        //   password: auth.password,
        //   name: auth.name,
        // };
        const feathers = useNuxtApp().$feathers; // Access the Feathers client
        const response = await feathers.service("users").create(auth);
      } catch (error: any) {
        console.log("error", error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
  },
});
