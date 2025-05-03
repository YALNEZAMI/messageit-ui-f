<template>
  <main class="relative cursor-pointer">
    <div
      class="flex md:min-w-20 lg:min-w-24 items-center justify-center sm:space-x-2 px-2 sm:px-1 sm:pr-3 m-1 sm:mx-2 rounded transition-all duration-500"
    >
      <div class="hidden md:block">
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
    </div>
    <!--selector-->
    <div
      id="selector"
      class="absolute rounded-lg left-0 -bottom-1 h-1 w-full mx-auto bg-white"
      :class="{
        hidden: !isCurrentRoute(),
      }"
    ></div>
  </main>
</template>
<script setup>
// import { NavBarItem } from "../../interfaces/navBarItem";
const route = useRoute();
const isCurrentRoute = () => {
  const match = route.fullPath.split("?")[0] == navBarItem.path;

  return match ? true : route.fullPath.includes(navBarItem.path);
};
const props = defineProps({
  navBarItem: Object,
});
const navBarItem = props.navBarItem;

onMounted(async () => {
  const svgDiv = document.getElementById(navBarItem.name + "svg");
  svgDiv.innerHTML = navBarItem.svg;
});
// const getClasses = () => {
//   return {
//     ...classes,
//   };
// };
</script>
