// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  plugins: ["~/plugins/feathers.ts"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    "@nuxt/image",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate"],
      },
    ],
  ],
  imports: {
    dirs: ["stores"],
  },
  runtimeConfig: {
    // Private environment variables (only available on the server side)
    secretApiKey: process.env.NUXT_SECRET_API_KEY,

    // Public environment variables (exposed to the client)
    public: {
      FEATHERS_URL: "http://localhost:3030",
      publicApiKey: process.env.NUXT_PUBLIC_API_KEY,
    },
  },
});