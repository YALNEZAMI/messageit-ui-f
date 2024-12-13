<template>
  <main>
    <!--emojis-->
    <div class="flex">
      <div
        class="emoji relative cursor-default"
        v-for="emojiMap of getEmojisMap()"
        :key="emojiMap.key"
      >
        {{ emojiMap.key }}
        <span class="text-black text-xs absolute -bottom-1 right-0">{{
          emojiMap.emojis.length
        }}</span>
        <div
          class="title absolute z-30 hidden left-full top-0 text-sm px-1 bg-black rounded-md text-white"
        >
          <span v-for="emoji of emojiMap.emojis" :key="emoji._id">
            {{ getReacter(emoji).name }}
          </span>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
.emoji:hover .title {
  display: flex;
  flex-direction: column;
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
interface EmojiMap {
  emojis: Emoji[];
  key: string; //string of emoji
}
const getEmojisMap = (): EmojiMap[] => {
  let res: EmojiMap[] = [];
  emojis.value.map((em: Emoji) => {
    const emojiExist =
      res.filter((emojiMap) => {
        return emojiMap.key == em.emoji;
      }).length > 0;
    if (emojiExist) {
      res = res.map((emojiMap) => {
        if (emojiMap.key == em.emoji) {
          emojiMap.emojis.push(em);
        }
        return emojiMap;
      });
    } else {
      res.push({
        key: em.emoji,
        emojis: [em],
      });
    }
  });
  return res;
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
