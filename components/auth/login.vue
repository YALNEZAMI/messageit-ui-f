<template>
  <main class="w-1/2 bg-indigo-100 p-2 rounded">
    <h4 class="text-center">Connexion à votre compte</h4>
    <div>
      <div>Email</div>
      <input type="text" v-model="auth.email" />
    </div>
    <div>
      <div>Mot de passe</div>
      <input type="text" v-model="auth.password" />
    </div>
    <div class="flex justify-center mt-1"><button>Connexion</button></div>
    <div class="text-center">
      <NuxtLink to="/auth/register" class="underline"
        >Vous n'avez pas de compte ?</NuxtLink
      >
    </div>
  </main>
</template>
<script lang="ts" setup>
const auth = ref({
  email: "",
  password: "",
});
const store = useAuthStore();
</script>
