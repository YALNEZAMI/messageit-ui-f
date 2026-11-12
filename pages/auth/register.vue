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
    <h1 id="auth-title" class="auth-title">Créez votre compte</h1>
    <p class="auth-subtitle">Quelques informations pour commencer à échanger.</p>

    <div class="auth-fields">
      <label class="auth-field" for="name">
        <span>Nom d'utilisateur <span aria-hidden="true">*</span></span>
          <input
            :class="{
              inputError: inputInError.includes('name'),
            }"
            id="name"
            type="text"
            class="auth-input"
            autocomplete="username"
            v-model.trim="auth.name"
            placeholder="Votre nom"
          />
      </label>
      <label class="auth-field" for="email">
        <span>Email <span aria-hidden="true">*</span></span>
          <input
            :class="{
              inputError: inputInError.includes('email'),
            }"
            id="email"
            type="email"
            class="auth-input"
            autocomplete="email"
            v-model.trim="auth.email"
            placeholder="vous@exemple.com"
          />
      </label>
      <label class="auth-field" for="password">
        <span>Mot de passe <span aria-hidden="true">*</span></span>
          <input
            :class="{
              inputError: inputInError.includes('password'),
            }"
            id="password"
            type="password"
            class="auth-input"
            autocomplete="new-password"
            v-model.trim="auth.password"
            placeholder="Choisissez un mot de passe"
          />
      </label>
      <label class="auth-field" for="password2">
        <span>Confirmer le mot de passe <span aria-hidden="true">*</span></span>
          <input
            :class="{
              inputError: inputInError.includes('password2'),
            }"
            id="password2"
            type="password"
            class="auth-input"
            autocomplete="new-password"
            v-model.trim="auth.password2"
            placeholder="Répétez le mot de passe"
          />
      </label>
    </div>
    <div v-if="alert.bool" role="alert" class="my-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
      {{ alert.message }}
    </div>
    <div v-else class="mt-3 text-center">
      <small class="text-xs text-slate-500">Les champs marqués d'un * sont obligatoires.</small>
    </div>
    <div class="mt-1 flex justify-center">
      <button
        type="button"
        @click="register"
        class="auth-submit"
      >
        <span v-if="!loading">Créer mon compte</span>
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
          Inscription
        </span>
      </button>
    </div>
    <p class="auth-switch">
      Vous avez déjà un compte ?
      <NuxtLink to="/auth/login" class="auth-link">Se connecter</NuxtLink>
    </p>
  </section>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const auth = ref({
  name: "",
  email: "",
  password: "",
  password2: "",
});
const alert = ref({
  bool: false,
  message: "",
});
const loading = ref(false);
const requiredInputs = ["name", "email", "password", "password2"];
const inputInError = ref([] as string[]);

onMounted(async () => {
  localStorage.clear();
  requiredInputs.map((ri) => {
    const input = document.getElementById(ri) as HTMLInputElement;
    input.addEventListener("focus", () => {
      inputInError.value = inputInError.value.filter((nfy: string) => {
        return nfy != ri;
      });
    });
  });
});
const lanceAlert = (msg: string) => {
  loading.value = false;
  alert.value.bool = true;
  alert.value.message = msg;
  setTimeout(() => {
    alert.value.bool = false;
  }, 3000);
};
const authStore = useAuthStore();
//register function
const register = async () => {
  loading.value = true;
  if (!allRequiredInputsFilled()) {
    lanceAlert("Veuillez remplir tous les champs obligatoires !");

    return;
  }
  if (auth.value.password != auth.value.password2) {
    lanceAlert("Passwords dont match");
    return;
  } else if (
    !auth.value.email.includes("@") ||
    !auth.value.email.includes(".")
  ) {
    lanceAlert("Format invalide de votre adresse mail");
    return;
  }
  auth.value.email = auth.value.email.toLowerCase();
  const res = await authStore.register(auth.value as User);
  if (res._id) {
    authStore.login({
      email: auth.value.email,
      password: auth.value.password,
    });
  } else if (res.status == 500) {
    inputInError.value.push(res.inputId as string);
    lanceAlert(res.message);
  }
};
const allRequiredInputsFilled = (): boolean => {
  let res = true;
  requiredInputs.map((id) => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input.value == "") {
      res = false;
      //input.style.border = "3px solid red";
      inputInError.value.push(id);
    }
  });
  return res;
};

definePageMeta({ layout: "auth" });
document.addEventListener("keydown", async (e) => {
  if (e.key == "Enter") {
    await register();
    return;
  }
});
</script>
