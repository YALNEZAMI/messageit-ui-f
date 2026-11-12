<template>
  <main class="workspace-shell">
    <div>
      <PrivateSpaceHeader></PrivateSpaceHeader>
      <PrivateSpaceNavBar></PrivateSpaceNavBar>
    </div>
    <!--side bar-->
    <div>
      <SideBar></SideBar>
    </div>
    <ContainersBgTheme class="workspace-content" :theme="useUsersStore().user.theme">
      <slot />
    </ContainersBgTheme>
  </main>
</template>
