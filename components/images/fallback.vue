<template>
  <NuxtImg :src="imageSrc" :alt="alt" @error="handleError" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string | null;
  fallback: string;
  alt?: string;
}>(), {
  src: "",
  alt: "",
});

const imageSrc = ref("");
watch(
  () => [props.src, props.fallback],
  () => {
    imageSrc.value = props.src?.trim() || props.fallback;
  },
  { immediate: true }
);

const handleError = () => {
  if (imageSrc.value !== props.fallback) {
    imageSrc.value = props.fallback;
  }
};
</script>
