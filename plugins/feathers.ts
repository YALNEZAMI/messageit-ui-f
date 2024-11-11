// plugins/feathers.js
import { feathers } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";
// import rest from "@feathersjs/rest-client";
// import axios from "axios";
export default defineNuxtPlugin(() => {
  const apiUrl = useRuntimeConfig().public.FEATHERS_URL;
  const authStore = useAuthStore();
  authStore.initializeAuth();
  const token = authStore.accessToken;

  let socket;
  if (authStore.isAuthenticated()) {
    socket = io(apiUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    socket = io(apiUrl);
  }
  // Remplacez par l'URL de votre serveur FeathersJS
  const app = feathers();

  app.configure(socketio(socket));

  return {
    provide: {
      feathers: app,
    },
  };
});
