<template>
  <main style="min-height: 35.9rem">
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
        <div class="flex items-center p-1">
          <User :noButtons="getConversationType() == 'ai'" :user="user"></User>
          <div
            v-if="currentUser._id != user._id"
            class="text-black text-xl cursor-pointer"
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
  </main>
</template>
<script lang="ts" setup>
import type { GroupRights } from "~/interfaces/groupRights";
import type { User } from "~/interfaces/user";
const currentUser = useUsersStore().user;
const getMembers = (): User[] => {
  return useConversationsStore().currentConversation.members as User[];
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
definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>
