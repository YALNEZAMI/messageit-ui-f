<template>
  <main>
    <!--emojis-->
    <div class="flex">
      <div
        class="emoji relative cursor-pointer"
        v-for="emoji of getEmojis()"
        :title="getReacter(emoji).name"
        :key="emoji._id"
      >
        {{ emoji.emoji }}
        <div
          class="title absolute hidden left-full top-0 text-sm px-1 bg-black rounded-md text-white"
        >
          {{ getReacter(emoji).name }}
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.emoji:hover .title {
  display: block;
}
</style>

<script lang="ts" setup>
import type { Emoji } from "~/interfaces/emoji";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const props = defineProps({
  message: Object,
});
const message = props.message as Message;
const emojis = ref([] as Emoji[]);
const getEmojis = () => {
  return emojis.value;
};
const getReacter = (emoji: Emoji): User => {
  return useConversationsStore().getMember(emoji.reacter as string);
};
onMounted(async () => {
  emojis.value = await useEmojisStore().getEmojis(message._id as string);
  eventBus.on("emojiCreated", (emoji: Emoji) => {
    if (emoji.message != message._id) {
      return;
    }
    const alreadyReacted =
      emojis.value.filter((e: Emoji) => {
        return e._id == emoji._id;
      }).length > 0;
    if (alreadyReacted) {
      emojis.value = emojis.value.map((e: Emoji) => {
        return e._id == emoji._id ? emoji : e;
      });
    } else {
      emojis.value.push(emoji);
    }
  });
  eventBus.on("emojiRemoved", (emoji: Emoji) => {
    if (emoji.message != message._id) {
      return;
    }
    emojis.value = emojis.value.filter((e: Emoji) => {
      return e._id != emoji._id;
    });
  });
});
</script>
