<template>
  <main
    @click="goTo()"
    :class="classes"
    class="flex items-center md:space-x-2 p-1 px-4 md:px-1 rounded"
  >
    <div class="hidden md:block">{{ navBarItem.name }}</div>
    <div class="flex justify-center w-full" :id="navBarItem.name + 'svg'"></div>
  </main>
</template>
<script setup>
// import { NavBarItem } from "../../interfaces/navBarItem";
const store = useAuthStore();
const props = defineProps({
  navBarItem: Object,
  classes: Object,
});
const navBarItem = props.navBarItem;
const classes = props.classes;
const goTo = () => {
  useRouter().push(navBarItem.path);
};
onMounted(async () => {
  const svgDiv = document.getElementById(navBarItem.name + "svg");
  svgDiv.innerHTML = navBarItem.svg;
});
</script>
