export default defineNuxtRouteMiddleware((to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  const isAuthenticated = useAuthStore().isAuthenticated();
  if (isAuthenticated) {
    return navigateTo("/conversations");
  } else {
    return navigateTo("/auth/login");
  }
});
