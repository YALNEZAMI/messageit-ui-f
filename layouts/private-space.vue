<template>
  <main>
    <div>
      <PrivateSpaceHeader></PrivateSpaceHeader>
      <PrivateSpaceNavBar></PrivateSpaceNavBar>
    </div>
    <!--side bar-->
    <div>
      <SideBar></SideBar>
    </div>
    <div><slot /></div>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "private-space",
});
</script>
