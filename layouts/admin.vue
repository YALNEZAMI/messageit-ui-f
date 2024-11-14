<template>
  <main>
    <div>
      <AdminHeader></AdminHeader>
      <AdminNavBar></AdminNavBar>
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
  middleware: "admin",
});
</script>
