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
    <div
      :class="{
        'bg-blue-100 text-white': useUsersStore().user.theme?._id == 'basic',
        'bg-pink-100 text-white': useUsersStore().user.theme?._id == 'love',
        'bg-gray-100 text-white': useUsersStore().user.theme?._id == 'panda',
        'bg-green-100 text-white': useUsersStore().user.theme?._id == 'spring',
      }"
    >
      <slot />
    </div>
  </main>
</template>
