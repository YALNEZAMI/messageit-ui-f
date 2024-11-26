<template>
  <main>
    <!--typing-->
    <div
      class="flex flex-col p-0 transition-all duration-300 ease-out"
      v-if="typings.length > 0"
    >
      <div
        v-for="typing of typings"
        :key="getTyper(typing)._id + ''"
        :id="getTyper(typing)._id"
        class="flex items-center space-x-2 w-full h-16 transition-all duration-300 ease-out"
      >
        <ImagesMessageSender
          :title="getTyper(typing).name"
          :src="getTyper(typing).image"
        />
        <div class="text-black font-bold">en train...</div>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import { Message } from "~/interfaces/message";
import type { Typing } from "~/interfaces/typing";
import type { User } from "~/interfaces/user";
const emits = defineEmits(["goBottom"]);
const typings = ref([] as Typing[]);
const getTyper = (typing: Typing): User => {
  return typing.typer as User;
};
const popTyper = (t: Typing) => {
  typings.value = typings.value.filter((tFilter: Typing) => {
    return (
      getTyper(t)._id != (tFilter.typer as User)._id && t._id != tFilter._id
    );
  });
};
onMounted(async () => {
  //set interval to clear typings
  //remove typer
  let date = new Date().getTime();
  setInterval(() => {
    const filteredTypings = typings.value.filter((t: Typing) => {
      let typingDate = new Date(t.createdAt as string).getTime();
      const bool = typingDate > date;
      if (!bool) {
        const typer = document.getElementById(
          getTyper(t)._id as string
        ) as HTMLDivElement;
        if (typer != null) {
          typer.classList.toggle("opacity-0");
          typer.classList.toggle("ml-10");
        }
      }
      return bool;
    });
    const to = setTimeout(() => {
      typings.value = filteredTypings;
      clearTimeout(to);
    }, 500);
    date = new Date().getTime();
  }, 3000);
  //listen to typing event
  eventBus.on("typing", (t: Typing) => {
    // popTyper(t);
    if (getTyper(t)._id != useUsersStore().user._id) {
      const isAtBotm: boolean = useMessagesStore().isAtBottom;
      const typerExist =
        typings.value.filter((typingFilter: Typing) => {
          return (t.typer as User)._id == (typingFilter.typer as User)._id;
        }).length > 0;
      console.log("typerExist", typerExist);
      if (!typerExist) {
        typings.value.push(t);
        if (isAtBotm) {
          const to3 = setTimeout(() => {
            emits("goBottom");
            clearTimeout(to3);
          }, 200);
        }
      }
    }
    eventBus.on("messageReceived", (msg: Message) => {
      popTyper({
        typer: msg.sender as User,
        conversation: (msg.conversation as Conversation)._id as string,
      });
    });
  });
});
</script>
