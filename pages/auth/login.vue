<template>
  <section class="auth-card" aria-labelledby="auth-title">
    <div class="auth-brand">
      <span class="auth-brand-mark" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="h-5 w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.5 8.25h9m-9 3.75h5.25M4.5 19.5l1.6-3.2A8.25 8.25 0 1 1 12 18a8.3 8.3 0 0 1-3.7-.87L4.5 19.5Z"
          />
        </svg>
      </span>
      <span>Message-it</span>
    </div>
    <h1 id="auth-title" class="auth-title">Ravi de vous revoir</h1>
    <p class="auth-subtitle">Connectez-vous pour retrouver vos conversations.</p>

    <div v-if="alert.bool" role="alert" class="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
      {{ alert.message }}
    </div>
    <div
      @click="$router.push('/private-space')"
      v-if="useAuthStore().isAuthenticated() && !loading"
      class="mb-4 flex cursor-pointer justify-center gap-1 rounded-lg bg-indigo-50 p-3 text-center text-sm text-indigo-800"
    >
      <div>Continuez en tant que</div>
      <div class="font-semibold underline">{{ useUsersStore().user.name }}</div>
    </div>
    <div class="auth-fields">
      <label class="auth-field" for="login-email">
        <span>Email</span>
        <input
          id="login-email"
          class="auth-input"
          type="email"
          autocomplete="email"
          v-model.trim="auth.email"
          placeholder="vous@exemple.com"
        />
      </label>
      <label class="auth-field" for="login-password">
        <span>Mot de passe</span>
        <input
          id="login-password"
          class="auth-input"
          type="password"
          autocomplete="current-password"
          v-model.trim="auth.password"
          placeholder="Votre mot de passe"
        />
      </label>
    </div>
    <div class="mt-1 flex justify-center">
      <button
        type="button"
        @click="login"
        class="auth-submit"
      >
        <span v-if="!loading">Se connecter</span>
        <span v-else class="flex items-center">
          <svg
            class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Connexion
        </span>
      </button>
    </div>
    <p class="auth-switch">
      Vous n'avez pas de compte ?
      <NuxtLink to="/auth/register" class="auth-link">Créer un compte</NuxtLink>
    </p>
  </section>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

let alreadyConnectedUser = {} as User;
if (useAuthStore().isAuthenticated()) {
  alreadyConnectedUser = useUsersStore().user;
}
const auth = ref({
  email: "",
  password: "",
});
const loading = ref(false);
const authStore = useAuthStore();
const alert = ref({
  bool: false,
  message: "",
});
const lanceAlert = (msg: string) => {
  alert.value.bool = true;
  alert.value.message = msg;
  setTimeout(() => {
    alert.value.bool = false;
    alert.value.message = "";
  }, 3000);
};
definePageMeta({ layout: "auth" });
const login = async () => {
  //set status of already connected user to offline if the connecting user is different
  if (
    alreadyConnectedUser.email != undefined &&
    alreadyConnectedUser.email != auth.value.email
  ) {
    alreadyConnectedUser.onLine = false;
    useUsersStore().updateUser(alreadyConnectedUser);
  }
  loading.value = true;
  const correctLogin = await authStore.login(auth.value);
  if (!correctLogin) {
    lanceAlert("Email ou mot de passe incorrect");
    loading.value = false;
  }
};
document.addEventListener("keydown", async (e) => {
  if (e.key == "Enter") {
    await login();
    return;
  }
});
</script>
