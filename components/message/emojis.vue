<template>
  <main>
    <!--emojis-->
    <div class="flex">
      <div v-for="emoji of getEmojis()" :key="emoji._id">{{ emoji.emoji }}</div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Emoji } from "~/interfaces/emoji";
import type { Message } from "~/interfaces/message";

const props = defineProps({
  message: Object,
});
const message = props.message as Message;
const emojis = ref([] as Emoji[]);
const getEmojis = () => {
  return emojis.value.map((emoji: Emoji) => {
    emoji.reacter = useConversationsStore().getMember(emoji.reacter as string);
    return emoji;
  });
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
