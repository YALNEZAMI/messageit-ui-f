<template>
  <main class="page-section profile-page">
    <div class="page-heading">
      <p class="page-eyebrow">VOTRE COMPTE</p>
      <h1>Mon profil</h1>
      <p>Personnalisez vos informations et votre espace.</p>
    </div>
    <form class="profile-form" @submit.prevent="updateUser">
      <section class="profile-panel profile-identity" aria-labelledby="profile-identity-title">
        <ImagesFallback class="profile-avatar" :src="previewSrc || usersStore.user.image" :fallback="fallbackImage" alt="" />
        <div class="profile-identity-content">
          <p class="profile-kicker">VOTRE PROFIL</p>
          <h2 id="profile-identity-title">{{ usersStore.user.name || "Votre compte" }}</h2>
          <p>Ajoutez une photo pour personnaliser votre profil.</p>
          <div class="profile-photo-actions">
            <label for="profile-photo" class="profile-secondary-button">Changer la photo</label>
            <button v-if="userPhoto" type="button" class="profile-text-button" @click="clearPhoto">Annuler</button>
            <span v-if="userPhoto" class="profile-file-name">{{ userPhoto.name }}</span>
          </div>
          <input id="profile-photo" ref="photoInput" class="profile-file-input" type="file" accept="image/*" @change="selectUserPhoto" />
        </div>
      </section>

      <section class="profile-panel" aria-labelledby="profile-details-title">
        <div class="profile-section-heading">
          <h2 id="profile-details-title">Informations personnelles</h2>
          <p>Ces informations permettent aux autres de vous retrouver.</p>
        </div>
        <div class="profile-fields">
          <div class="profile-field">
            <label for="profile-name">Nom d’utilisateur</label>
            <input id="profile-name" v-model.trim="name" autocomplete="nickname" required />
          </div>
          <div class="profile-field">
            <label for="profile-email">Adresse e-mail</label>
            <input id="profile-email" v-model.trim="email" type="email" autocomplete="email" required />
          </div>
          <div class="profile-field">
            <label for="profile-theme">Thème de votre espace</label>
            <select id="profile-theme" v-model="themeId">
              <option v-for="theme in usersStore.themes" :key="theme._id" :value="theme._id">{{ theme.name }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="profile-panel" aria-labelledby="security-title">
        <div class="profile-section-heading">
          <h2 id="security-title">Sécurité</h2>
          <p>Laissez ces champs vides pour conserver votre mot de passe actuel.</p>
        </div>
        <div class="profile-fields profile-password-fields">
          <div class="profile-field">
            <label for="profile-password">Nouveau mot de passe</label>
            <input id="profile-password" v-model="password" type="password" autocomplete="new-password" />
          </div>
          <div class="profile-field">
            <label for="profile-password-confirm">Confirmer le mot de passe</label>
            <input id="profile-password-confirm" v-model="passwordConfirmation" type="password" autocomplete="new-password" />
          </div>
        </div>
        <p v-if="feedback" :class="['profile-feedback', success ? 'profile-success' : 'profile-error']" :role="success ? 'status' : 'alert'">{{ feedback }}</p>
        <div class="profile-actions">
          <button type="submit" class="profile-primary-button" :disabled="saving || deleting">{{ saving ? "Enregistrement…" : "Enregistrer les modifications" }}</button>
        </div>
      </section>
    </form>

    <section class="profile-panel profile-danger" aria-labelledby="delete-title">
      <div>
        <h2 id="delete-title">Supprimer mon compte</h2>
        <p>Cette action est irréversible.</p>
      </div>
      <button v-if="!confirmDelete" type="button" class="profile-danger-button" :disabled="saving || deleting" @click="confirmDelete = true">Supprimer mon compte</button>
      <div v-else class="profile-delete-actions">
        <p>Confirmer la suppression de votre compte ?</p>
        <button type="button" class="profile-text-button" :disabled="deleting" @click="confirmDelete = false">Annuler</button>
        <button type="button" class="profile-danger-button" :disabled="deleting" @click="deleteUser">{{ deleting ? "Suppression…" : "Confirmer la suppression" }}</button>
      </div>
      <p v-if="deleteError" class="profile-feedback profile-error" role="alert">{{ deleteError }}</p>
    </section>
  </main>
</template>

<script lang="ts" setup>
const usersStore = useUsersStore();
const name = ref(usersStore.user.name || "");
const email = ref(usersStore.user.email || "");
const themeId = ref(usersStore.user.theme?._id || "basic");
const password = ref("");
const passwordConfirmation = ref("");
const userPhoto = ref<File | null>(null);
const previewSrc = ref("");
const photoInput = ref<HTMLInputElement | null>(null);
const saving = ref(false);
const deleting = ref(false);
const confirmDelete = ref(false);
const deleteError = ref("");
const feedback = ref("");
const success = ref(false);
const fallbackImage = useConversationsStore().getDefaultImage("private");

const clearPhoto = () => {
  if (previewSrc.value) URL.revokeObjectURL(previewSrc.value);
  previewSrc.value = "";
  userPhoto.value = null;
  if (photoInput.value) photoInput.value.value = "";
};
const selectUserPhoto = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  clearPhoto();
  if (!file.type.startsWith("image/")) {
    success.value = false;
    feedback.value = "Veuillez sélectionner un fichier image.";
    return;
  }
  feedback.value = "";
  userPhoto.value = file;
  previewSrc.value = URL.createObjectURL(file);
};
const updateUser = async () => {
  if (saving.value || deleting.value) return;
  feedback.value = "";
  success.value = false;
  if (!name.value.trim()) {
    feedback.value = "Le nom d’utilisateur est requis.";
    return;
  }
  if (password.value !== passwordConfirmation.value) {
    feedback.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  const theme = usersStore.themes.find((item) => item._id === themeId.value);
  if (!theme) {
    feedback.value = "Veuillez choisir un thème valide.";
    return;
  }
  saving.value = true;
  let profileSaved = false;
  try {
    const image = userPhoto.value
      ? (await useUploadStore().uploadProfilePhoto(userPhoto.value)).path
      : usersStore.user.image;
    const normalizedEmail = email.value.toLowerCase();
    const updated = await usersStore.updateUser({
      _id: usersStore.user._id,
      name: name.value.trim(),
      email: normalizedEmail,
      theme,
      image,
    });
    if (!updated?._id) {
      feedback.value = updated?.message || "Impossible de mettre à jour le profil.";
      return;
    }
    await usersStore.setUserLocally(updated);
    profileSaved = true;
    clearPhoto();
    const authUpdate = await usersStore.updateCurrentAuthUser({
      email: normalizedEmail,
      ...(password.value ? { password: password.value } : {}),
    });
    if (!authUpdate?._id) {
      feedback.value = `Profil enregistré, mais les informations de connexion n’ont pas été modifiées : ${authUpdate?.message || "veuillez réessayer."}`;
      return;
    }
    email.value = normalizedEmail;
    password.value = "";
    passwordConfirmation.value = "";
    feedback.value = "Votre profil a été mis à jour.";
    success.value = true;
  } catch (error) {
    console.error("Échec de la mise à jour du profil :", error);
    feedback.value = profileSaved
      ? "Profil enregistré, mais les informations de connexion n’ont pas été modifiées. Veuillez réessayer."
      : "Impossible de mettre à jour le profil. Veuillez réessayer.";
  } finally {
    saving.value = false;
  }
};
const deleteUser = async () => {
  deleting.value = true;
  deleteError.value = "";
  try {
    await usersStore.deleteUser();
  } catch (error) {
    console.error("Échec de la suppression du compte :", error);
    deleteError.value = "Impossible de supprimer le compte. Veuillez réessayer.";
  } finally {
    deleting.value = false;
  }
};
onBeforeUnmount(clearPhoto);
definePageMeta({ layout: "private-space", middleware: "private-space" });
</script>
