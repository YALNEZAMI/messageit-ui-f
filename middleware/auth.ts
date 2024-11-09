export default defineNuxtRouteMiddleware((to, from) => {
  //to is the destination path(object)
  //from is the origine path(object)
  if (to.fullPath == "/") {
    return navigateTo("/auth/login");
  }
});
