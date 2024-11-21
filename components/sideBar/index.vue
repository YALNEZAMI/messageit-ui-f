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
      <!--toogle button-->
      <div>
        <svg
          @click="sideBarStor.toogleSideBar(false)"
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
      <!--create groupe button-->
      <div>
        <button
          @click="redirectToCreateGroup()"
          type="button"
          class="bg-indigo-500 cursor-pointer w-11/12 m-1 rounded p-1 hover:bg-indigo-400 text-white border-0 flex justify-center space-x-2 items-center"
        >
          <div class="font-bold hidden sm:block">Créer groupe</div>
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
      <!--ai conversation-->
      <div>
        <button
          @click="createAIConversation()"
          type="button"
          class="bg-blue-500 cursor-pointer w-11/12 m-1 rounded p-1 hover:bg-blue-400 py-2 text-white border-0 flex justify-center space-x-2 items-center"
        >
          <div class="hidden sm:block">Conversation IA</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            fill="currentColor"
            class="bi bi-robot"
            viewBox="0 0 16 16"
          >
            <path
              d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"
            />
            <path
              d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"
            />
          </svg>
        </button>
      </div>
      <!--logout button-->
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
      @click="useSideBarStore().toogleSideBar(false)"
    ></div>
  </main>
</template>
<script lang="ts" setup>
const sideBarStor = useSideBarStore();
const redirectToCreateGroup = () => {
  sideBarStor.toogleSideBar(false);
  useRouter().push("/private-space/createGroup");
};
const createAIConversation = async () => {
  await useConversationsStore().createAIConversation();
  sideBarStor.toogleSideBar(false);
};
</script>
