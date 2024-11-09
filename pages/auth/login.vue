<template>
  <main class="w-screen h-screen flex items-center justify-center">
    <AuthLogin></AuthLogin>
  </main>
</template>
<script lang="ts" setup>
console.log("login");
definePageMeta({ layout: "authLayout" });
</script>
