<template>
  <main>
    <NuxtImg
      class="w-16 h-16 rounded-md"
      :src="imgSrc"
      @error="handleError"
    ></NuxtImg>
  </main>
</template>

<script setup>
const props = defineProps({
  src: String, // Fixed type definition
});

const imgSrc = ref(props.src); // Local reactive variable for the image source

const handleError = () => {
  imgSrc.value = useUsersStore().defaultUserImg; // Set to default image on error
};
</script>
