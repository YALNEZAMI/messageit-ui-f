<template>
  <main class="flex flex-col space-y-3">
    <div class="flex justify-center">
      <img class="w-32 h-32" :src="useUsersStore().defaultUserImg" alt="" />
    </div>
    <div class="flex justify-center">
      <input
        id="name"
        v-model="user.name"
        type="text"
        class="border-black rounded p-1 text-center"
        :class="{
          inputError: inputInError.includes('name'),
        }"
        placeholder="jack"
      />
    </div>
    <div class="flex items-center justify-center">
      <label for="email">Email:</label>
      <input
        id="email"
        v-model="auth.email"
        type="text"
        class="w-1/2 rounded mx-2 p-1"
        :class="{
          inputError: inputInError.includes('email'),
        }"
        placeholder="jack@gmail.com"
      />
      <label for="theme">Theme:</label>
      <select v-model="user.theme" name="theme" class="p-1 mx-2 rounded">
        <option
          v-for="theme of useUsersStore().themes"
          :key="theme._id"
          :value="theme"
        >
          {{ theme.name }}
        </option>
      </select>
    </div>
    <div
      class="flex-col flex space-x-1 space-y-1 items-center sm:flex-row justify-center"
    >
      <div class="flex justify-center w-full">
        <div
          class="flex w-full justify-center space-x-12 sm:justify-end sm:mx-2 sm:space-x-1 items-center"
        >
          <div class="text-end">Mot de passe:</div>
          <input
            id="password"
            type="text"
            placeholder="monChien3MeSuitTil?"
            v-model="auth.password"
            class="p-1 rounded mx-2"
            :class="{
              inputError: inputInError.includes('password'),
            }"
          />
        </div>
      </div>
      <div class="flex justify-center w-full">
        <div
          class="flex w-full justify-center sm:justify-start space-x-3 md:space-x-1 items-center sm:mx-auto"
        >
          <div class="text-end w-max">Confirmation mdp:</div>
          <input
            id="password2"
            type="text"
            placeholder="monChien3MeSuitTil?"
            v-model="auth.password2"
            class="p-1 rounded mx-2"
            :class="{
              inputError: inputInError.includes('password2'),
            }"
          />
        </div>
      </div>
    </div>
    <div
      v-if="alert.bool"
      class="p-2 my-1 text-white text-center"
      :class="{
        'bg-red-400': !success,
        'bg-green-400': success,
      }"
    >
      {{ alert.message }}
    </div>
    <button
      @click="updateUser"
      type="button"
      class="bg-green-500 cursor-pointer text-lg font-bold hover:bg-green-400 text-white p-1 border-0 flex justify-center space-x-2 items-center"
    >
      <div>Mettre à jour</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    </button>
  </main>
</template>
<script lang="ts" setup>
const authStore = useAuthStore();
const user = ref(useUsersStore().user);
const auth = ref({
  email: user.value.email,
  password: "",
  password2: "",
});

const alert = ref({
  bool: false,
  message: "",
});
const lanceAlert = (msg: string, IsSuccess?: boolean) => {
  if (IsSuccess) {
    success.value = true;
  }
  alert.value.bool = true;
  alert.value.message = msg;
  setTimeout(() => {
    alert.value.bool = false;
    alert.value.message = "";
    success.value = false;
  }, 3000);
};

//update method
const updateUser = async () => {
  let success = true;
  if (!allRequiredInputsFilled()) {
    lanceAlert("Veuillez remplir tous les champs obligatoires !");
    return;
  }
  if (auth.value.password != auth.value.password2) {
    inputInError.value.push("password");
    inputInError.value.push("password2");

    lanceAlert("Passwords dont match");
    return;
  } else if (
    !auth.value.email.includes("@") ||
    !auth.value.email.includes(".")
  ) {
    lanceAlert("Format invalide de votre adresse mail");
    inputInError.value.push("email");
    return;
  }
  auth.value.email = auth.value.email.toLowerCase();
  user.value.email = auth.value.email;
  const updating = await useUsersStore().updateUser(user.value);
  let emailIssu = false;
  if (updating._id) {
    useUsersStore().setUser(updating);
  } else {
    success = false;
    if (updating.inputId == "email") {
      emailIssu = true;
    }
    inputInError.value.push(updating.inputId);
    lanceAlert(updating.message);
  }
  //auth user updating
  if (
    (auth.value.email != useUsersStore().user.email ||
      auth.value.password != "") &&
    !emailIssu
  ) {
    const updatingAuth = await useUsersStore().updateCurrentAuthUser(
      auth.value
    );
    if (!updatingAuth._id) {
      success = false;
      if (updating.inputId == "email") {
        emailIssu = true;
      }
      inputInError.value.push(updating.inputId);
      lanceAlert(updating.message);
    }
  }
  if (success) {
    lanceAlert("Votre profile a été mise à jour avec succès", true);
  }
  auth.value.password2 = auth.value.password;
};
const success = ref(false);
const requiredInputs = ["name", "email"];

const inputInError = ref([] as any[]);

onMounted(async () => {
  requiredInputs.map((ri) => {
    const input = document.getElementById(ri) as HTMLInputElement;
    input.addEventListener("focus", () => {
      inputInError.value = inputInError.value.filter((nfy: string) => {
        return nfy != ri;
      });
    });
  });
});
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
definePageMeta({
  layout: "private-space",
  middleware: "private-space",
});
</script>
