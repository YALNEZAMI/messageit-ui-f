<template>
  <main>private-space</main>
</template>
<script lang="ts" setup>
useRouter().push("/conversations");
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
