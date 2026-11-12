<template>
  <main
    class="dialog-backdrop fixed inset-0 flex justify-center items-center z-50"
  >
    <div class="dialog-panel">
      <h2 class="dialog-title">Ajouter des membres</h2>
      <p class="dialog-subtitle">Choisissez les amis à inviter dans la conversation.</p>
      <div class="flex justify-center flex-wrap max-h-96 h-max overflow-y-auto">
        <div
          v-for="mem of membersToAdd"
          :key="mem._id"
          class="flex items-center"
        >
          <User :user="mem" :noButtons="true"></User>
          <ContainersMain
            class="border-0 rounded-lg px-3 py-2 mx-1 font-bold cursor-pointer"
            @click="addMember(mem._id + '')"
          >
            +
          </ContainersMain>
        </div>
      </div>
      <div class="flex justify-center my-2">
        <button
          @click="emits('finish')"
          class="upload-button-primary"
        >
          Terminer
        </button>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { User } from "~/interfaces/user";
const emits = defineEmits(["finish", "error"]);
const membersToAdd = ref([] as User[]);
const getMembersToAdd = (conv: Conversation) => {
  return useFriendsStore().friends.filter((friend: User) => {
    const isMember =
      (conv.members as User[]).filter((mem: any) => {
        return mem._id == friend._id;
      }).length > 0;
    return !isMember;
  });
};
const addMember = async (memId: string) => {
  let res = await useConversationsStore().toogleMembership(memId);
  membersToAdd.value = getMembersToAdd(
    useConversationsStore().currentConversation
  );
};
onMounted(async () => {
  membersToAdd.value = getMembersToAdd(
    useConversationsStore().currentConversation
  );
  if (membersToAdd.value.length == 0) {
    emits("error", {
      message: "Tous vos amis sont déjà dans le groupe.",
      header: "Pas d'amis",
    });
  }
  eventBus.on("conversationChanged", (conv: Conversation) => {
    membersToAdd.value = getMembersToAdd(conv);
    if (membersToAdd.value.length == 0) {
      emits("finish");
    }
  });
});
</script>
