<template>
  <main style="min-height: 35.9rem">
    <div class="flex justify-center items-center">
      <button
        @click="addingMembers = true"
        v-if="getConversationType() == 'group'"
        class="p-2 text-white hover:bg-green-500 cursor-pointer rounded border-0 bg-green-400 w-full"
      >
        Add members +
      </button>
      <ConversationMembersAddMember
        @finish="addingMembers = false"
        @error="lanceAlert()"
        v-if="addingMembers"
      ></ConversationMembersAddMember>
    </div>
    <div
      class="overflow-y-auto flex flex-wrap justify-center h-max"
      style="max-height: 35.9rem; scrollbar-width: thin"
    >
      <div v-for="user of getMembers()" :key="user._id">
        <!--if group -> rights-->
        <div
          v-if="getConversationType() == 'group'"
          class="text-black px-2 underline font-bold"
        >
          {{ getRights(user) }}
        </div>
        <div
          class="flex items-center p-1"
          :class="{
            'mt-5': !hasRights(user._id + '') && !user.aiUser,
          }"
        >
          <User :noButtons="getConversationType() == 'ai'" :user="user"></User>
          <div
            v-if="
              currentUser._id != user._id && hasRights(currentUser._id + '')
            "
            class="text-black text-2xl cursor-pointer"
            @click="toogleMemberOptions(true, user)"
          >
            ...
          </div>
        </div>
      </div>

      <div
        class="w-full m-2 rounded md:w-1/3"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isConversationPulse(),
        }"
      >
        <Pulse
          v-if="isConversationPulse()"
          class="w-full overflow-hidden bg-gray-400"
        ></Pulse>
      </div>
    </div>
    <!--options-->
    <ConversationMembersOptions
      @finish="finishOptions()"
      v-if="isMemeberOptions"
      :member="member"
    ></ConversationMembersOptions>
    <!--alert-->
    <PopupAlert
      v-if="alerting"
      @finish="alerting = false"
      :alert="alert"
    ></PopupAlert>
  </main>
</template>
<script lang="ts" setup>
import type { Alert } from "~/interfaces/alert";
import type { Conversation } from "~/interfaces/conversation";
import type { User } from "~/interfaces/user";
const currentUser = useUsersStore().user;
let rights = useGroupRightsStore().rights;
const members = ref([] as User[]);
const addingMembers = ref(false);
const getMembers = (): User[] => {
  return members.value;
};
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const getConversationType = () => {
  return useConversationsStore().currentConversation.type;
};

const getRights = (user: User) => {
  const rights = useGroupRightsStore().rights;
  if (rights.chef == user._id) {
    return "Chef";
  }
  if (rights.admins.includes(user._id as string)) {
    return "Admin";
  }
  return "";
};
const hasRights = (userId: string) => {
  if (getConversationType() != "group") {
    return false;
  }
  return rights.chef == userId || rights.admins.includes(userId as string);
};

const isMemeberOptions = ref(false);
const member = ref<User>({} as User);
const toogleMemberOptions = (bool: boolean, user: User) => {
  member.value = user;
  isMemeberOptions.value = bool;
};
const finishOptions = () => {
  isMemeberOptions.value = false;
};

onMounted(async () => {
  members.value = useConversationsStore().currentConversation.members as User[];
  //listen to conversation change event and scroll then
  eventBus.on("conversationChanged", (conv: Conversation) => {
    if (conv.type == "group") {
      rights = useGroupRightsStore().rights;
    }
    members.value = conv.members as User[];
  });
});
const alert = ref<Alert>({
  message: "error desc",
  header: "error",
});
const alerting = ref(false);
const lanceAlert = () => {
  alerting.value = true;
  addingMembers.value = false;
  alert.value = {
    header: "Aucun amis à ajouter",
    message: "Tous vos amis sont déjà dans le groupe.",
  };
};
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
