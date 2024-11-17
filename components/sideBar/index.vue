<template>
  <main
    :class="{
      hidden: useSideBarStore().isHidden,
      'bg-black opacity-0 w-0': !useSideBarStore().isTranslated,
      'bg-black bg-opacity-50 w-screen': useSideBarStore().isTranslated,
    }"
    class="fixed z-30 right-0 top-0 h-full flex flex-row-reverse transition-all duration-500 ease-in-out"
  >
    <!--main side bar-->
    <div
      :class="{
        'w-0': !useSideBarStore().isTranslated,
        'w-1/3': useSideBarStore().isTranslated,
      }"
      class="flex p-2 flex-col bg-white transition-all duration-500 ease-in-out"
    >
      <div>
        <svg
          @click="sideBarStor.setIsDisplayed(false)"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 cursor-pointer"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
      </div>
      <div>
        <button
          type="button"
          class="bg-indigo-500 cursor-pointer w-11/12 m-1 rounded p-1 hover:bg-indigo-400 text-white border-0 flex justify-center space-x-2 items-center"
        >
          <div class="font-bold hidden sm:block">Se déconnecter</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
            />
          </svg>
        </button>
      </div>
      <div>
        <button
          @click="useAuthStore().logout()"
          type="button"
          class="bg-red-500 cursor-pointer w-11/12 m-1 rounded p-1 hover:bg-red-400 text-white border-0 flex justify-center space-x-2 items-center"
        >
          <div class="font-bold hidden sm:block">Se déconnecter</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </button>
      </div>
    </div>
    <!--other side of screen-->
    <div
      class="w-2/3 bg-black opacity-50 h-full"
      @click="useSideBarStore().setIsDisplayed(false)"
    ></div>
  </main>
</template>
<script lang="ts" setup>
const sideBarStor = useSideBarStore();
</script>
