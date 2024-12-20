<template>
  <main
    style="background: linear-gradient(40deg, white, brown)"
    class="w-3/4 md:w-1/2 p-2 rounded flex flex-col space-y-2 shadow-md"
  >
    <h3 class="text-center">Connexion à votre compte</h3>
    <div class="flex justify-center">
      <div id="inputs" class="flex flex-col space-y-1">
        <div>
          <div>Email</div>
          <input
            type="text"
            v-model.trim="auth.email"
            placeholder="jack@gmail.com"
          />
        </div>
        <div>
          <div>Mot de passe</div>
          <input
            type="password"
            v-model.trim="auth.password"
            placeholder="monChien3MeSuitTil?"
          />
        </div>
      </div>
    </div>
    <div v-if="alert.bool" class="bg-red-400 p-2 my-1 text-white text-center">
      {{ alert.message }}
    </div>
    <div
      @click="$router.push('/private-space')"
      v-if="useAuthStore().isAuthenticated() && !loading"
      class="bg-indigo-400 p-2 my-1 cursor-pointer text-white text-center flex justify-center space-x-2"
    >
      <div>Continuez en tant que</div>
      <div class="underline font-serif">{{ useUsersStore().user.name }}</div>
    </div>
    <div class="flex justify-center mt-1">
      <button
        type="button"
        @click="login"
        class="min-w-20 bg-indigo-500 hover:bg-indigo-600 transition-all duration-500 rounded p-2 px-3 text-white cursor-pointer"
      >
        <span v-if="!loading">Se connecter</span>
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
          Connexion
        </span>
      </button>
    </div>
    <div class="text-center">
      <NuxtLink to="/auth/register" class="underline"
        >Vous n'avez pas de compte ?</NuxtLink
      >
    </div>
  </main>
</template>
<script lang="ts" setup>
const auth = ref({
  email: "yaser@gmail.com",
  password: "1234",
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
