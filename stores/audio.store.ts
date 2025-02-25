import { defineStore } from "pinia";
export const useAudioStore = defineStore("audioStore", {
  state: () => {
    return {
      att: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.att = newVal;
    },

    runRecieving() {
      const audio = new Audio("/audio/recieving.mp3");
      audio.play();
    },
    runWipeDelete() {
      const audio = new Audio("/audio/wipe-delete.mp3");
      audio.play();
    },
  },
});
