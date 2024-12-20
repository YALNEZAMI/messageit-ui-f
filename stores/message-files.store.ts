import { defineStore } from "pinia";

export const useMessageFilesStore = defineStore("useMessageFilesStore", {
  state: () => {
    return {
      att: "val",
    };
  },
  actions: {
    setAtt(newVal: string) {
      this.att = newVal;
    },
    getService() {
      return useNuxtApp().$feathers.service("message-files");
    },
    async uploadMessageFiles(files: File[], message: string) {
      const bufferFiles = [];

      const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
      };

      try {
        for (const file of files) {
          // Wait for the file to be read
          const arrayBuffer = await readFileAsArrayBuffer(file);

          // Convert ArrayBuffer to base64
          const uint8Array = new Uint8Array(arrayBuffer);
          const binaryString = uint8Array.reduce(
            (acc, byte) => acc + String.fromCharCode(byte),
            ""
          );
          const base64String = btoa(binaryString);

          bufferFiles.push({
            buffer: base64String,
            originalname: file.name,
          });
        }

        // Send base64-encoded files to the service
        const response = await this.getService().create(
          {
            files: bufferFiles,
            message,
            urls: [],
          },
          {
            query: {
              message,
            },
          }
        );
      } catch (error) {
        console.error("Error during file upload:", error);
      }
    },
    async getFiles(message: string) {
      const res = await this.getService().find({
        query: {
          message,
        },
      });
      if (res.data.length == 0) {
        return [];
      }
      return res.data[0].urls;
    },
  },
});
