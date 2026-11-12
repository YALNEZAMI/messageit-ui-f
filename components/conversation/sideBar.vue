<template>
  <main class="conversation-sidebar-content">
    <div class="conversation-sidebar-toolbar">
      <div class="w-full">
        <ElementsInputsText
          type="text"
          @onInput="onInput($event)"
        ></ElementsInputsText>
      </div>

      <div class="conversation-filters" role="group" aria-label="Filtrer les conversations">
        <button
          v-for="fc of filterCategorys"
          :key="fc.value"
          type="button"
          @click="setFilterCategory(fc)"
          :class="{ active: filterCategory.value == fc.value }"
          :aria-pressed="filterCategory.value == fc.value"
          >{{ fc.name }}</button
        >
      </div>
    </div>
    <!--conversations container-->
    <div
      class="conversation-sidebar-list"
    >
      <Conversation
        class="overflow-hidden"
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="true"
        @click="emit('conversation-selected')"
      ></Conversation>
      <div
        class="w-11/12"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
        :class="{
          hidden: !isConversationPulse(),
        }"
      >
        <Pulse
          v-if="isConversationPulse()"
          class="w-full overflow-hidden"
        ></Pulse>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
const emit = defineEmits(["conversation-selected"]);

const key = ref("");
const filterCategory: Ref<FilterCategory> = ref({
  name: "Tout",
  value: "all",
});
const unreadConversationsIds = new Set();

interface FilterCategory {
  name: string;
  value: "all" | "groups" | "unread";
}
const setFilterCategory = (fc: FilterCategory) => {
  filterCategory.value = fc;
};
const filterCategorys: FilterCategory[] = [
  {
    name: "Tout",
    value: "all",
  },
  {
    name: "Groupes",
    value: "groups",
  },
  {
    name: "Non lus",
    value: "unread",
  },
];
const filter = async () => {
  await useConversationsStore().searchConversations(key.value);
};
const getConvs = (): any[] => {
  const convs = key.value
    ? useConversationsStore().searchedConversations
    : useConversationsStore().conversations;
  switch (filterCategory.value.value) {
    case "all":
      return convs;
    case "groups":
      return convs.filter(
        (c: Conversation) =>
          c.type == "group" ||
          c._id == useConversationsStore().currentConversation._id
      );
    case "unread":
      return convs.filter((c: Conversation) => {
        const isUnread = unreadConversationsIds.has(c._id);

        return (
          isUnread || c._id == useConversationsStore().currentConversation._id
        );
      });
    default:
      return convs;
  }
};
onMounted(async () => {
  useConversationsStore().conversations.map(async (c: Conversation) => {
    if (c.lastMessage == undefined || c.lastMessage!._id == undefined) {
      return c;
    }
    const isSeen = await useMessageStatusStore().isSeenBy(
      c.lastMessage!._id,
      useUsersStore().user._id as string
    );
    if (!isSeen) {
      unreadConversationsIds.add(c._id);
    }
  });
});
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const onInput = async (reqParam: string) => {
  key.value = reqParam;
  await filter();
};
</script>
