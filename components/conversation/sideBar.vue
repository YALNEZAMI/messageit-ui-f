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
          :class="{ active: filterCategory === fc.value }"
          :aria-pressed="filterCategory === fc.value"
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
        v-for="conv of filteredConversations"
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
      <p v-if="filterCategory === 'unread' && hasStatusErrors" class="sidebar-filter-message" role="alert">
        Impossible de vérifier certains messages non lus.
        <button type="button" class="underline" @click="retryUnreadStatuses">Réessayer</button>
      </p>
      <p v-else-if="filterCategory === 'unread' && hasPendingStatuses" class="sidebar-filter-message" role="status">
        Vérification des messages non lus…
      </p>
      <p v-else-if="!isConversationPulse() && !filteredConversations.length" class="sidebar-filter-message">
        Aucune conversation ne correspond à ce filtre.
      </p>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { MessageSeen } from "~/interfaces/message-seen";
import { eventBus } from "~/utils/eventBus";
import { filterConversations } from "~/utils/conversationSearch";
const emit = defineEmits(["conversation-selected"]);

const key = ref("");
const filterCategory = ref<FilterCategory["value"]>("all");
const conversationsStore = useConversationsStore();
const messageStatusStore = useMessageStatusStore();
const usersStore = useUsersStore();
type ReadStatus = "loading" | "read" | "unread" | "error";
const statuses = ref<Record<string, { messageId: string; status: ReadStatus }>>({});
const versions = new Map<string, number>();
let disposed = false;

interface FilterCategory {
  name: string;
  value: "all" | "groups" | "unread";
}
const setFilterCategory = (fc: FilterCategory) => {
  filterCategory.value = fc.value;
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
const filteredConversations = computed(() => {
  const conversations = filterConversations(conversationsStore.conversations, key.value, usersStore.user._id);
  if (filterCategory.value === "groups") return conversations.filter((c) => c.type === "group");
  if (filterCategory.value === "unread") {
    return conversations.filter((c) => c._id && statuses.value[c._id]?.status === "unread");
  }
  return conversations;
});
const hasStatusErrors = computed(() => Object.values(statuses.value).some((entry) => entry.status === "error"));
const hasPendingStatuses = computed(() => Object.values(statuses.value).some((entry) => entry.status === "loading"));

async function updateUnreadStatus(conversation: Conversation) {
  const id = conversation._id;
  const message = conversation.lastMessage;
  if (!id) return;
  const version = (versions.get(id) || 0) + 1;
  versions.set(id, version);
  if (!message?._id || !usersStore.user._id) {
    delete statuses.value[id];
    return;
  }
  const sender = typeof message.sender === "string" ? message.sender : message.sender?._id;
  if (sender && sender === usersStore.user._id) {
    statuses.value[id] = { messageId: message._id, status: "read" };
    return;
  }
  statuses.value[id] = { messageId: message._id, status: "loading" };
  try {
    const seen = await messageStatusStore.isSeenBy(message._id, usersStore.user._id);
    if (!disposed && versions.get(id) === version) {
      statuses.value[id] = { messageId: message._id, status: seen ? "read" : "unread" };
    }
  } catch (error) {
    console.error("Impossible de vérifier les messages non lus :", error);
    if (!disposed && versions.get(id) === version) {
      statuses.value[id] = { messageId: message._id, status: "error" };
    }
  }
}

watch(
  () => conversationsStore.conversations.map((c) => ({
    id: c._id,
    messageId: c.lastMessage?._id,
    sender: typeof c.lastMessage?.sender === "string" ? c.lastMessage.sender : c.lastMessage?.sender?._id,
    userId: usersStore.user._id,
  })),
  (current, previous = []) => {
    const old = new Map(previous.map((item) => [item.id, item]));
    const ids = new Set(current.map((item) => item.id));
    for (const id of versions.keys()) {
      if (!ids.has(id)) {
        versions.set(id, (versions.get(id) || 0) + 1);
        delete statuses.value[id];
      }
    }
    for (const item of current) {
      const before = old.get(item.id);
      if (!before || before.messageId !== item.messageId || before.sender !== item.sender || before.userId !== item.userId) {
        const conversation = conversationsStore.conversations.find((c) => c._id === item.id);
        if (conversation) void updateUnreadStatus(conversation);
      }
    }
  },
  { immediate: true, flush: "sync" }
);

function onSeeing(seen: MessageSeen) {
  if (seen.viewer !== usersStore.user._id || !seen.conversation) return;
  const entry = statuses.value[seen.conversation];
  if (entry?.messageId !== seen.message) return;
  versions.set(seen.conversation, (versions.get(seen.conversation) || 0) + 1);
  statuses.value[seen.conversation] = { messageId: seen.message, status: "read" };
}
function retryUnreadStatuses() {
  for (const conversation of conversationsStore.conversations) {
    if (conversation._id && statuses.value[conversation._id]?.status === "error") void updateUnreadStatus(conversation);
  }
}
eventBus.on("seeing", onSeeing);
onBeforeUnmount(() => {
  disposed = true;
  eventBus.off("seeing", onSeeing);
});
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const onInput = (reqParam: string) => {
  key.value = reqParam;
};
</script>

<style scoped>
.sidebar-filter-message { padding: .8rem 1rem; color: inherit; font-size: .85rem; }
</style>
