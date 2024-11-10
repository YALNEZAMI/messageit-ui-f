import { defineStore } from "pinia";
export const useNotificationsStore = defineStore("notificationsStore", {
  state: () => {
    return {
      notifications: "val",
    };
  },
  actions: {
    setNotifications(newVal: string) {
      this.notifications = newVal;
    },
  },
});
