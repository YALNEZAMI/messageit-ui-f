<template>
  <ContainersTheme
    @click="goTo()"
    class="hover:opacity-70 cursor-pointer flex sm:min-w-28 items-center justify-center sm:space-x-2 p-1 px-3 sm:px-1 sm:pr-3 m-1 sm:mx-2 rounded transition-all duration-500"
  >
    <div class="hidden sm:block">
      {{ navBarItem.name }}
    </div>
    <!--svg and notifsnumber-->
    <div class="relative">
      <div
        class="flex justify-center w-max"
        :id="navBarItem.name + 'svg'"
      ></div>
      <!--notif number-->
      <div
        class="absolute -top-1 -right-2 sm:-right-3 text-white px-1 rounded-full"
      >
        <NavBarItemNotificationsNumber
          :name="navBarItem._id"
        ></NavBarItemNotificationsNumber>
      </div>
    </div>
    <!--selector-->
    <div
      id="selector"
      class="absolute rounded-lg w-full -left-0 sm:-left-1 -bottom-1 h-1 bg-white"
      :class="{
        hidden: !isCurrentRoute(),
      }"
    ></div>
  </ContainersTheme>
</template>
<script setup>
// import { NavBarItem } from "../../interfaces/navBarItem";
const route = useRoute();
const friendStore = useFriendsStore();
const isCurrentRoute = () => {
  return route.fullPath.split("?")[0] == navBarItem.path;
};
const props = defineProps({
  navBarItem: Object,
});
const navBarItem = props.navBarItem;

const goTo = () => {
  useRouter().push(navBarItem.path);
};
onMounted(async () => {
  const svgDiv = document.getElementById(navBarItem.name + "svg");
  svgDiv.innerHTML = navBarItem.svg;
  setInterval(() => {}, 1000);
});
// const getClasses = () => {
//   return {
//     ...classes,
//   };
// };
</script>
