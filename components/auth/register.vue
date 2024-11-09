<template>
  <main class="w-1/2 bg-indigo-100 p-2 rounded">
    <h4 class="text-center">Création de votre compte</h4>
    <div>
      <div>Nom d'utilisateur</div>
      <input type="text" v-model="auth.name" />
    </div>
    <div></div>
    <div>
      <div>Email</div>
      <input type="text" v-model="auth.email" />
    </div>
    <div>
      <div>Mot de passe</div>
      <input type="text" v-model="auth.password" />
    </div>
    <div>
      <div>Confirmer le mot de passe</div>
      <input type="text" v-model="auth.password2" />
    </div>
    <div class="flex justify-center mt-1">
      <button type="button" @click="register">S'inscrir</button>
    </div>
    <div class="text-center">
      <NuxtLink to="/auth/login" class="underline"
        >Vous avez déjà un compte ?</NuxtLink
      >
    </div>
  </main>
</template>
<script lang="ts" setup>
const auth = ref({
  name: "yaser",
  email: "yaser@gmail.com",
  password: "1234",
  password2: "1234",
});
const authStore = useAuthStore();
const register = async () => {
  if (auth.value.password == auth.value.password2) {
    await authStore.register(auth.value);
  } else {
    alert("passwords dont match");
    return;
  }
};
</script>
