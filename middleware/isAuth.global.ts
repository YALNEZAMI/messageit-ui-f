import { useAuthStore } from "~/stores/auth.store";

export default defineNuxtRouteMiddleware((to, from) => {
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
});
