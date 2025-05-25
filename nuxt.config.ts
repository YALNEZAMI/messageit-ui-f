// https://nuxt.com/docs/api/configuration/nuxt-config
const port = 3000;
export default defineNuxtConfig({
  pages: true,
  ssr: false,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  plugins: ["~/plugins/feathers.ts", "~/plugins/utils.ts"],
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
    // secretApiKey: process.env.NUXT_SECRET_API_KEY,

    // Public environment variables (exposed to the client)
    public: {
      FEATHERS_URL: "http://localhost:3030",
      BASE_URL: `http://localhost:${port}`,
    },
  },
  devServer: {
    port: port, // 👈 your custom port
    host: "0.0.0.0", // (optional) make it accessible on your LAN
  },
  nitro: {
    preset: "node-server", // (default for fullstack apps)
  },
});
