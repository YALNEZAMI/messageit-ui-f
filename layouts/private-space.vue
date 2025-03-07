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
    <ContainersBgTheme :theme="useUsersStore().user.theme">
      <slot />
    </ContainersBgTheme>
  </main>
</template>
