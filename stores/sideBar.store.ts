import { defineStore } from "pinia";
export const useSideBarStore = defineStore("sideBarStore", {
  state: () => {
    return {
      idDisplayed: true,
    };
  },
  actions: {
    setIdDisplayed(newVal: boolean) {
      this.idDisplayed = newVal;
    },
  },
});
