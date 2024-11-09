<template>
  <main>
    <h1>header</h1>
    <!--background img-->
    <NuxtImg
      class="fixed top-0 left-0 w-screen h-screen"
      src="https://cdn.pixabay.com/photo/2020/06/20/19/20/message-in-a-bottle-5322111_640.jpg"
      alt=""
    />
    <slot />
  </main>
</template>
<script lang="ts" setup>
console.log("authlayout");
</script>
