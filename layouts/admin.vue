<template>
  <main>
    <div>
      <AdminHeader></AdminHeader>
      <AdminNavBar></AdminNavBar>
    </div>
    <div><slot /></div>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "admin",
});
</script>
