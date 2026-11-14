<template>
  <span class="presence-indicator" :class="{ 'presence-online': online }"
    role="img" :aria-label="online ? 'En ligne' : 'Hors ligne'"
    :title="online ? 'En ligne' : 'Hors ligne'"></span>
</template>

<script setup lang="ts">
import { eventBus } from "@/utils/eventBus";
import type { User } from "~/interfaces/user";

const props = defineProps<{ user?: User }>();
const online = ref(!!props.user?.onLine);
watch(() => [props.user?._id, props.user?.onLine], () => {
  online.value = !!props.user?.onLine;
});
const onUserPatched = (user: User) => {
  if (user._id && user._id === props.user?._id) online.value = !!user.onLine;
};
eventBus.on("userPatched", onUserPatched);
onBeforeUnmount(() => eventBus.off("userPatched", onUserPatched));
</script>

<style scoped>
.presence-indicator { display: block; width: .9rem; height: .9rem; border: 2px solid white; border-radius: 50%; background: #64748b; box-shadow: 0 1px 4px rgb(15 23 42 / 35%); }
.presence-online { background: #16a34a; }
</style>
