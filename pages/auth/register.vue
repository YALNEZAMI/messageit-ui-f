<template>
  <main
    style="background: linear-gradient(40deg, white, brown)"
    class="w-3/4 md:w-1/2 p-2 rounded shadow-md"
  >
    <h3 class="text-center">Création de votre compte</h3>
    <div class="flex justify-center">
      <div id="inputs" class="flex flex-col space-y-1">
        <div class="inputy">
          <div>Nom d'utilisateur*</div>
          <input
            :class="{
              inputError: inputInError.includes('name'),
            }"
            id="name"
            type="text"
            v-model.trim="auth.name"
            placeholder="jack"
          />
        </div>
        <div>
          <div>Email*</div>
          <input
            :class="{
              inputError: inputInError.includes('email'),
            }"
            id="email"
            type="text"
            v-model.trim="auth.email"
            placeholder="jack@gmail.com"
          />
        </div>
        <div>
          <div>Mot de passe*</div>
          <input
            :class="{
              inputError: inputInError.includes('password'),
            }"
            id="password"
            type="password"
            v-model.trim="auth.password"
            placeholder="monChien3MeSuitTil?"
          />
        </div>
        <div>
          <div>Confirmer le mot de passe*</div>
          <input
            :class="{
              inputError: inputInError.includes('password2'),
            }"
            id="password2"
            type="password"
            v-model.trim="auth.password2"
            placeholder="monChien3MeSuitTil?"
          />
        </div>
      </div>
    </div>
    <div v-if="alert.bool" class="bg-red-400 p-2 my-1 text-white text-center">
      {{ alert.message }}
    </div>
    <div v-else class="flex justify-center mt-1">
      <small>Tous les champs marqués de * sont obligatoires</small>
    </div>
    <div class="flex justify-center mt-1">
      <button
        type="button"
        @click="register"
        style="background: linear-gradient(40deg, purple, white)"
        class="min-w-20 cursor-pointer transition-all duration-500 px-4 rounded-xl hover:rounded p-2 text-black my-2 font-bold"
      >
        <span v-if="!loading">S'inscrir</span>
        <span v-else class="flex items-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
    <div class="text-center">
      <NuxtLink to="/auth/login" class="underline"
        >Vous avez déjà un compte ?</NuxtLink
      >
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { User } from "~/interfaces/user";

const auth = ref({
  name: "yaser",
  email: "yaser@gmail.com",
  password: "1234",
  password2: "1234",
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
<style scoped>
input {
  width: 15rem;
  padding: 5px;
  border-radius: 5px;
}
</style>
