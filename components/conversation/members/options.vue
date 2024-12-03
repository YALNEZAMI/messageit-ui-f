<template>
  <main class="fixed bottom-0 left-0 h-max w-full bg-gray-600">
    <div class="text-center my-2 text-xl">
      Operation sur <span class="underline">{{ member.name }}</span>
    </div>
    <div class="flex flex-col md:flex-row justify-center p-2">
      <button
        class="basicButton bg-yellow-500 hover:bg-yellow-400"
        v-if="isUpgradeAdmin()"
        @click="toogleAdmin()"
      >
        Assigner status admin
      </button>
      <button
        class="basicButton bg-orange-500 hover:bg-orange-400"
        v-if="isDowngradeAdmin()"
        @click="toogleAdmin()"
      >
        Retirer status admin
      </button>
      <button
        class="basicButton bg-red-500 hover:bg-red-400"
        v-if="IsRemoveMember()"
        @click="removeMember()"
      >
        Retirer de la conversation
      </button>
      <button
        class="basicButton bg-black hover:bg-black"
        v-if="IsUpgradeChef()"
        @click="upgradeToChef()"
      >
        Assigner status chef
      </button>
      <button
        @click="emits('finish')"
        class="basicButton bg-indigo-500 hover:bg-indigo-400"
      >
        Fermer
      </button>
    </div>
  </main>
</template>
<style scoped>
button {
  padding: 10px;
  margin: 10px;
  min-width: 10rem;
}
</style>

<script lang="ts" setup>
import type { User } from "~/interfaces/user";
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
    //chef cant be removed
    return false;
  }
  if (currentUser._id == rights.chef) {
    //chef can remove any one
    return true;
  }

  return (
    (rights?.chef == currentUser._id ||
      rights?.admins.includes(currentUser._id as string)) &&
    !rights?.admins.includes(member._id as string)
  );
};
const toogleAdmin = async () => {
  let rights = await useGroupRightsStore().toogleAdmin(member._id as string);
  emits("finish");
};
const upgradeToChef = async () => {
  await useGroupRightsStore().upgradeToChef(member._id as string);
  emits("finish");
};
const removeMember = async () => {
  await useConversationsStore().toogleMembership(member._id as string);
  emits("finish");
};
const props = defineProps({
  member: Object,
});
const emits = defineEmits(["finish"]);
const member = props.member as User;
</script>
