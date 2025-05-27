<template>
  <main
    class="flex"
    :class="{
      'justify-end': isMyMessage(),
    }"
  >
    <div
      @click="shownFilesSection = true"
      v-if="files.length > 0"
      class="flex flex-col md:w-52 w-32 m-1 mx-2"
    >
      <div
        v-for="(file, index) of files"
        :key="file"
        class="flex w-full"
        :class="{
          'justify-end': index % 2 == 0,
          '-mb-16': index != files.length - 1,
        }"
      >
        <NuxtImg
          class="md:w-40 md:h-40 w-24 h-24 cursor-pointer rounded shadow-md"
          :src="file"
        ></NuxtImg>
      </div>
    </div>
    <ContainersConversationTheme
      v-if="shownFilesSection"
      class="flex justify-center bg-opacity-80 fixed z-50 top-0 left-0 h-screen w-screen"
    >
      <!--files section-->
      <div>
        <!--options-->
        <div class="flex justify-end pr-5 w-screen p-2 space-x-3">
          <!--download-->
          <div
            @click="downloadAll()"
            class="text-green-500 h-max border-2 border-solid border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer rounded-md p-1 px-2"
          >
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
                d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
              />
            </svg>
          </div>
          <!--cancel-->
          <div
            @click="shownFilesSection = false"
            class="text-red-500 border-2 border-solid border-red-500 bg-red-50 hover:bg-red-100 cursor-pointer rounded-md p-2 px-3 h-max"
          >
            X
          </div>
        </div>
        <!--files-->
        <div class="flex flex-wrap justify-center h-screen overflow-y-auto">
          <div
            v-for="file of files"
            :key="file"
            class="flex flex-col justify-center items-center"
          >
            <NuxtImg
              @click="goToFile(file)"
              class="md:w-96 md:h-96 w-48 h-48 m-2 cursor-pointer rounded shadow-md"
              :src="file"
            ></NuxtImg>
            <!--options of single file-->
            <div class="flex justify-center space-x-2 items-center w-full">
              <!--download single file-->
              <a
                :href="file"
                :download="file"
                class="text-blue-500 p-1 bg-white rounded-md hover:text-blue-700 cursor-pointer"
              >
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
                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                  />
                </svg>
              </a>
              <!--share single file-->
              <div
                @click="share(file)"
                class="bg-blue-50 hover:text-blue-700 cursor-pointer p-1 rounded-md text-blue-500"
              >
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
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
              </div>
              <!--transfer component-->
              <div
                v-if="transfering"
                class="flex justify-center items-center fixed z-0 w-full h-full top-0 left-0 bg-black bg-opacity-50"
              >
                <Transfer
                  @finish="cancelTransfering"
                  :messagesToSend="[messageWithTheFileToShare]"
                  class="relative z-10"
                ></Transfer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainersConversationTheme>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const props = defineProps({
  message: Object,
});
const shownFilesSection = ref(false);
const message: Message = props.message as Message;
const transfering = ref(false);
const sentToConversations = ref([]);
const isMyMessage = () => {
  return ((message as Message).sender as User)._id == useUsersStore().user._id;
};
const files = ref([]);
onMounted(async () => {
  files.value = await useMessageFilesStore().getFiles(message._id as string);
});
const downloadAll = () => {
  files.value.map((file: string) => {
    const a = document.createElement("a");
    a.href = file;
    a.download = file.split("--")[1];
    a.click();
    a.remove();
  });
};
const goToFile = (file: string) => {
  window.open(file, "_blank");
};
const cancelTransfering = () => {
  transfering.value = false;
};
const messageWithTheFileToShare = ref({
  text: "",
  files: [],
  referedMessage: "",
  type: "message",
  transfered: false,
  createdAt: new Date().toISOString(),
});

const share = (file: string) => {
  messageWithTheFileToShare.value.files[0] = file;
  transfering.value = true;
};
</script>
