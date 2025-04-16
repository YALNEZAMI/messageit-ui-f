import { defineStore } from "pinia";
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
        const res = await fetch("/api/upload", {
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
  },
});
