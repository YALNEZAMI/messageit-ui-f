<template>
  <main
    @click="goTo()"
    :class="classes"
    class="relative hover:opacity-70 cursor-pointer flex md:min-w-28 items-center justify-center md:space-x-1 p-1 px-5 md:px-2 md:mx-4 rounded transition-all duration-500"
  >
    <div class="hidden md:block">{{ navBarItem.name }}</div>
    <div class="flex justify-center w-max" :id="navBarItem.name + 'svg'"></div>
    <!--selector-->
    <div
      class="absolute rounded-lg w-full -left-0 md:-left-1 -bottom-1 h-1 bg-white"
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
  return route.fullPath.split("?")[0] == navBarItem.path;
};
const props = defineProps({
  navBarItem: Object,
  classes: Object,
});
const navBarItem = props.navBarItem;
let classes = props.classes;

const goTo = () => {
  useRouter().push(navBarItem.path);
};
onMounted(async () => {
  const svgDiv = document.getElementById(navBarItem.name + "svg");
  svgDiv.innerHTML = navBarItem.svg;
});
const getClasses = () => {
  return {
    ...classes,
  };
};
</script>
