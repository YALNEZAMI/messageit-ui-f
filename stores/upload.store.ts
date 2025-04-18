import { defineStore } from "pinia";
import type uploadMessageFiles from "~/server/api/uploadMessageFiles";
export const useUploadStore = defineStore("upload", {
  state: () => {
    return {};
  },
  actions: {
    async uploadProfilePhoto(file: File): Promise<{ path: string }> {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      formData.append("idUser", useUsersStore().user._id as string);
      try {
        const res = await fetch("/api/uploadProfilePhoto", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        return result;
      } catch (err) {
        console.log(
          "Une erreur est survenue lors de l'upload de la photo de profil"
        );
      }
      return { path: useUsersStore().defaultUserImg };
    },
    async uploadConversationPhoto(file: File): Promise<{ path: string }> {
      const formData = new FormData();
      formData.append("conversationPhoto", file);
      formData.append(
        "idConversation",
        useConversationsStore().currentConversation._id as string
      );
      try {
        const res = await fetch("/api/uploadConversationPhoto", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        return result;
      } catch (err) {
        console.log(
          "Une erreur est survenue lors de l'upload de la photo de profil"
        );
      }
      return { path: useUsersStore().defaultUserImg };
    },
    async uploadMessageFiles(files: File[]): Promise<{ urls: string[] }> {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append(
        "idConversation",
        useConversationsStore().currentConversation._id as string
      );
      try {
        const res = await fetch("/api/uploadMessageFiles", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        return result;
      } catch (err) {
        console.log(
          "Une erreur est survenue lors de l'upload de la photo de profil"
        );
      }
      return { urls: [] };
    },
  },
});
