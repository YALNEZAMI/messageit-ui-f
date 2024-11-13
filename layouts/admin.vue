<template>
  <main>
    <div>
      <AdminHeader></AdminHeader>
      <AdminNavBar></AdminNavBar>
    </div>
    <!--side bar-->
    <div
      :class="{
        hidden: !useSideBarStore().idDisplayed,
      }"
      class="fixed right-0 top-0 w-1/3 h-screen"
    >
      <SideBar></SideBar>
    </div>
    <div><slot /></div>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "admin",
});
</script>
