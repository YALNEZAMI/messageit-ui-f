import { defineStore } from "pinia";
export const useSideBarStore = defineStore("sideBarStore", {
  state: () => {
    return {
      isDisplayed: false,
      isTranslated: false,
      isHidden: true,
    };
  },
  actions: {
    toogleSideBar(newVal: boolean) {
      const to = setTimeout(() => {
        this.isTranslated = newVal;
        clearTimeout(to);
      }, 60);
      if (newVal) {
        this.isDisplayed = newVal;
        this.isHidden = false;
      } else {
        const to = setTimeout(() => {
          this.isDisplayed = newVal;
          clearTimeout(to);
        }, 60);
        const to2 = setTimeout(() => {
          this.isHidden = true;
          clearTimeout(to2);
        }, 500);
      }
    },
  },
});
