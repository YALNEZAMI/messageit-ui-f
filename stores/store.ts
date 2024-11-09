import { defineStore } from "pinia";
export const useStore = defineStore("store", {
  state: () => {
    return {
      att: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.att = newVal;
    },
  },
});
