<template>
  <main class="flex items-center justify-center w-screen h-screen">
    <div class="flex w-3/4 h-max z-10 justify-center bg-indigo-400">
      <AuthLogin></AuthLogin>
    </div>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "root",
});
</script>
