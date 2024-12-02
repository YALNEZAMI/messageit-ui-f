<template>
  <main class="fixed bottom-0 left-0 h-max w-full bg-gray-600">
    <div class="text-center my-2 text-xl">
      Operation sur <span class="underline">{{ member.name }}</span>
    </div>
    <div class="flex justify-center space-x-2 p-2">
      <button v-if="isUpgradeAdmin()" @click="toogleAdmin()">
        Assigner status admin
      </button>
      <button v-if="isDowngradeAdmin()" @click="toogleAdmin()">
        Retirer status admin
      </button>
      <button v-if="IsRemoveMember()">Retirer de la conversation</button>
      <button v-if="IsUpgradeChef()">Assigner status chef</button>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { GroupRights } from "~/interfaces/groupRights";
import type { User } from "~/interfaces/user";
const conv = useConversationsStore().currentConversation;
const rights = useGroupRightsStore().rights;
const currentUser = useUsersStore().user;
const isUpgradeAdmin = () => {
  return (
    rights?.chef == currentUser._id &&
    !rights?.admins.includes(member._id as string)
  );
};
const IsUpgradeChef = () => {
  return (
    currentUser._id == rights?.chef &&
    rights?.admins.includes(member._id as string)
  );
};
const isDowngradeAdmin = () => {
  return (
    rights?.chef == currentUser._id &&
    rights?.admins.includes(member._id as string)
  );
};
const IsRemoveMember = () => {
  if (member._id == rights?.chef) {
    return false;
  }
  return (
    (rights?.chef == currentUser._id ||
      rights?.admins.includes(currentUser._id as string)) &&
    !rights?.admins.includes(member._id as string)
  );
};
const toogleAdmin = async () => {
  let rights = await useGroupRightsStore().toogleAdmin(member._id as string);
  useGroupRightsStore().setRightsLocally(rights[0] as GroupRights);
  emits("finish");
};
const props = defineProps({
  member: Object,
});
const emits = defineEmits(["finish"]);
const member = props.member as User;
</script>
