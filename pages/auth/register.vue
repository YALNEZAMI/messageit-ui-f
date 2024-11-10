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
              'border-2 border-red-500': notFilledYet.includes('name'),
            }"
            id="name"
            type="text"
            v-model="auth.name"
            placeholder="jack"
          />
        </div>
        <div>
          <div>Email*</div>
          <input
            :class="{
              'border-2 border-red-500': notFilledYet.includes('email'),
            }"
            id="email"
            type="text"
            v-model="auth.email"
            placeholder="jack@gmail.com"
          />
        </div>
        <div>
          <div>Mot de passe*</div>
          <input
            :class="{
              'border-2 border-red-500': notFilledYet.includes('password'),
            }"
            id="password"
            type="text"
            v-model="auth.password"
            placeholder="******"
          />
        </div>
        <div>
          <div>Confirmer le mot de passe*</div>
          <input
            :class="{
              'border-2 border-red-500': notFilledYet.includes('password2'),
            }"
            id="password2"
            type="text"
            v-model="auth.password2"
            placeholder="******"
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
        class="bg-blue-500 min-w-20 hover:bg-blue-600 cursor-pointer transition-all duration-500 p-1 px-2 rounded text-white my-2 font-bold"
      >
        <span v-if="!loading">S'inscrire</span>
        <span v-else>...</span>
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
const notFilledYet = ref([]);

onMounted(async () => {
  requiredInputs.map((ri) => {
    const input = document.getElementById(ri) as HTMLInputElement;
    input.addEventListener("focus", () => {
      notFilledYet.value = notFilledYet.value.filter((nfy: string) => {
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
  let allFilled = true;
  requiredInputs.map((ri) => {
    const isFilled = checkInput(ri);
    if (!isFilled) {
      allFilled = false;
      lanceAlert("Veuillez remplir tous les champs obligatoires !");
    }
  });
  if (!allFilled) {
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
  }
  const res = await authStore.register(auth.value);
  if (res._id) {
    authStore.login({
      email: auth.value.email,
      password: auth.value.password,
    });
  } else if (res.status == 500) {
    lanceAlert(res.message);
  }
};
const checkInput = (id: string) => {
  const input = document.getElementById(id) as HTMLInputElement;
  if (input.value == "") {
    //input.style.border = "3px solid red";
    notFilledYet.value.push(id);
    return false;
  } else {
    return true;
  }
};
definePageMeta({ layout: "auth" });
</script>
<style scoped>
input {
  width: 15rem;
  padding: 5px;
  border-radius: 5px;
}
</style>
