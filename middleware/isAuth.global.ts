import { useAuthStore } from "~/stores/auth.store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  const authStore = useAuthStore();
  if (
    to.fullPath != "/auth/login" &&
    to.fullPath != "/auth/register" &&
    !authStore.isAuthenticated()
  ) {
    useRouter().push("/auth/login");
  }
  if (authStore.isAuthenticated()) {
    try {
      await authStore.initializeSession();
    } catch (e) {
      console.error("Échec de l'initialisation de la session :", e);
      localStorage.clear();
      useAuthStore().setAccessToken("");
      useRouter().push("/auth/login");
    }
  }
});
