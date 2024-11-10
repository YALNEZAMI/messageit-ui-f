<template>
  <main>
    <!--background img-->
    <NuxtImg
      class="fixed top-0 left-0 w-screen h-screen z-0"
      src="https://cdn.pixabay.com/photo/2020/06/20/19/20/message-in-a-bottle-5322111_640.jpg"
      alt=""
    />
    <div
      class="flex z-20 justify-center items-center relative w-screen h-screen"
    >
      <slot />
    </div>
  </main>
</template>
<script lang="ts" setup></script>
