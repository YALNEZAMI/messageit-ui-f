<template>
  <main class="page-section settings-page">
    <div class="page-heading">
      <p class="page-eyebrow">CONVERSATION</p>
      <h1>Paramètres</h1>
      <p>Personnalisez votre espace de discussion.</p>
    </div>

    <form class="settings-form" @submit.prevent="update">
      <section class="settings-panel settings-identity" aria-labelledby="identity-title">
        <ImagesFallback
          class="settings-avatar"
          :src="previewSrc || conversationImage"
          :fallback="fallbackImage"
          alt=""
        />
        <div class="settings-identity-content">
          <p class="settings-kicker">{{ conversationType }}</p>
          <h2 id="identity-title">{{ conversationName }}</h2>
          <p>{{ conversation.type === "group" ? "Choisissez une image pour votre groupe." : "Personnalisez les détails de cette conversation." }}</p>
          <div v-if="conversation.type === 'group'" class="settings-photo-actions">
            <label for="conversation-photo" class="settings-secondary-button">Changer la photo</label>
            <button v-if="conversationPhoto" type="button" class="settings-text-button" @click="clearPhoto">Annuler</button>
            <span v-if="conversationPhoto" class="settings-file-name">{{ conversationPhoto.name }}</span>
          </div>
          <input
            v-if="conversation.type === 'group'"
            id="conversation-photo"
            ref="photoInput"
            class="settings-file-input"
            type="file"
            accept="image/*"
            @change="selectConversationPhoto"
          />
        </div>
      </section>

      <section class="settings-panel settings-details" aria-labelledby="details-title">
        <div class="settings-section-heading">
          <div>
            <h2 id="details-title">Personnalisation</h2>
            <p>Adaptez la conversation à votre style.</p>
          </div>
        </div>
        <div class="settings-fields">
          <div v-if="conversation.type === 'group'" class="settings-field">
            <label for="conversation-name">Nom du groupe</label>
            <input id="conversation-name" v-model.trim="name" type="text" placeholder="Nom du groupe" required />
          </div>
          <div v-if="conversation.type !== 'ai'" class="settings-field">
            <label for="conversation-description">Description <span>Facultatif</span></label>
            <textarea id="conversation-description" v-model.trim="description" rows="3" placeholder="Ajoutez une description à votre conversation"></textarea>
          </div>
          <div class="settings-field">
            <label for="conversation-theme">Thème</label>
            <select id="conversation-theme" v-model="themeId">
              <option v-for="theme in conversationsStore.themes" :key="theme._id" :value="theme._id">
                {{ theme.emoji }} {{ theme.name }}
              </option>
            </select>
            <p>Le thème s’applique à cette conversation.</p>
          </div>
        </div>
        <p v-if="success" class="settings-feedback settings-feedback-success" role="status">La conversation a été mise à jour.</p>
        <p v-if="errorMessage" class="settings-feedback settings-feedback-error" role="alert">{{ errorMessage }}</p>
        <div class="settings-form-actions">
          <button type="submit" class="settings-primary-button" :disabled="saving || leaving">
            {{ saving ? "Enregistrement…" : "Enregistrer les modifications" }}
          </button>
        </div>
      </section>
    </form>

    <section class="settings-panel settings-danger" aria-labelledby="leave-title">
      <div>
        <h2 id="leave-title">Quitter la conversation</h2>
        <p>Vous ne recevrez plus les nouveaux messages de cette discussion.</p>
      </div>
      <button type="button" class="settings-danger-button" :disabled="saving || leaving" @click="leave">
        {{ leaving ? "Départ en cours…" : "Quitter la conversation" }}
      </button>
      <p v-if="leaveError" class="settings-feedback settings-feedback-error" role="alert">{{ leaveError }}</p>
    </section>
  </main>
</template>

<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { Theme } from "~/interfaces/theme";

const conversationsStore = useConversationsStore();
const conversation = computed(() => conversationsStore.currentConversation);
const name = ref("");
const description = ref("");
const themeId = ref<Theme["_id"]>("basic");
const conversationPhoto = ref<File | null>(null);
const previewSrc = ref("");
const photoInput = ref<HTMLInputElement | null>(null);
const saving = ref(false);
const leaving = ref(false);
const success = ref(false);
const errorMessage = ref("");
const leaveError = ref("");

const fallbackImage = computed(() => conversationsStore.getDefaultImage(conversation.value.type));
const conversationImage = computed(() => {
  if (conversation.value.type === "private") {
    return conversationsStore.getOtherUser(conversation.value).image;
  }
  return conversation.value.type === "ai" ? fallbackImage.value : conversation.value.image;
});
const conversationType = computed(() => ({
  ai: "ASSISTANT",
  group: "GROUPE",
  private: "CONVERSATION PRIVÉE",
}[conversation.value.type]));
const conversationName = computed(() => {
  if (conversation.value.type === "ai") return "Assistant Boby";
  if (conversation.value.type === "group") return conversation.value.name || "Groupe";
  return conversationsStore.getNamePrivateConversation(conversation.value) || "Conversation";
});

const clearPhoto = () => {
  if (previewSrc.value) URL.revokeObjectURL(previewSrc.value);
  previewSrc.value = "";
  conversationPhoto.value = null;
  if (photoInput.value) photoInput.value.value = "";
};
watch(() => conversation.value._id, () => {
  name.value = conversation.value.name || "";
  description.value = conversation.value.description || "";
  themeId.value = conversation.value.theme?._id || "basic";
  clearPhoto();
  success.value = false;
  errorMessage.value = "";
  leaveError.value = "";
}, { immediate: true });

const selectConversationPhoto = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  clearPhoto();
  if (!file.type.startsWith("image/")) {
    errorMessage.value = "Veuillez sélectionner un fichier image.";
    return;
  }
  errorMessage.value = "";
  conversationPhoto.value = file;
  previewSrc.value = URL.createObjectURL(file);
};

const update = async () => {
  if (saving.value || leaving.value) return;
  success.value = false;
  errorMessage.value = "";
  if (conversation.value.type === "group" && !name.value.trim()) {
    errorMessage.value = "Le nom du groupe est requis.";
    return;
  }
  const theme = conversationsStore.themes.find((item) => item._id === themeId.value);
  if (!theme) {
    errorMessage.value = "Veuillez choisir un thème valide.";
    return;
  }
  saving.value = true;
  try {
    const convToUpdate: Pick<Conversation, "_id"> & Partial<Conversation> = {
      _id: conversation.value._id,
      theme,
      description: description.value,
    };
    if (conversation.value.type === "group") {
      convToUpdate.name = name.value.trim();
      if (conversationPhoto.value) {
        const uploaded = await useUploadStore().uploadConversationPhoto(conversationPhoto.value);
        convToUpdate.image = uploaded.path;
      }
    }
    const response = await conversationsStore.updateConversation(convToUpdate);
    conversationsStore.updateConversationLocally(response);
    clearPhoto();
    success.value = true;
  } catch (error) {
    console.error("Échec de la mise à jour de la conversation :", error);
    errorMessage.value = "Impossible d’enregistrer les modifications. Veuillez réessayer.";
  } finally {
    saving.value = false;
  }
};

const leave = async () => {
  if (saving.value || leaving.value) return;
  leaving.value = true;
  leaveError.value = "";
  try {
    await conversationsStore.leave();
  } catch (error) {
    console.error("Impossible de quitter la conversation :", error);
    leaveError.value = "Impossible de quitter la conversation. Veuillez réessayer.";
  } finally {
    leaving.value = false;
  }
};
onBeforeUnmount(clearPhoto);

definePageMeta({
  middleware: "conversations",
  layout: "conversations",
});
</script>

<style scoped>
.settings-page { color: #172033; }
.settings-form { display: grid; gap: 1rem; }
.settings-panel {
  min-width: 0;
  padding: clamp(1.15rem, 3vw, 1.75rem);
  border: 1px solid #e4e8f1;
  border-radius: 1.1rem;
  background: #fff;
  box-shadow: 0 8px 26px rgb(35 43 75 / 6%);
}
.settings-identity { display: flex; align-items: center; gap: 1.3rem; }
.settings-avatar { width: 6rem; height: 6rem; flex: 0 0 auto; border-radius: 1.2rem; object-fit: cover; background: #f0efff; }
.settings-identity-content { min-width: 0; }
.settings-panel h2 { margin: 0; font-size: 1.05rem; font-weight: 750; color: #202a40; overflow-wrap: anywhere; }
.settings-panel p { margin: 0.3rem 0 0; color: #6b768b; font-size: 0.875rem; line-height: 1.5; }
.settings-panel .settings-kicker { margin: 0 0 0.25rem; color: #6a5bd3; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; }
.settings-photo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 0.85rem; }
.settings-secondary-button, .settings-text-button, .settings-primary-button, .settings-danger-button {
  display: inline-flex; min-height: 2.6rem; align-items: center; justify-content: center;
  padding: 0.65rem 1rem; border-radius: 0.7rem; font-size: 0.85rem; font-weight: 700; cursor: pointer;
}
.settings-secondary-button { border: 1px solid #dedaf9; background: #f3f1ff; color: #594bc0; }
.settings-secondary-button:hover { background: #e9e6ff; }
.settings-text-button { padding-inline: 0.25rem; border: 0; background: none; color: #69758b; }
.settings-file-name { max-width: 15rem; overflow: hidden; color: #69758b; font-size: 0.8rem; text-overflow: ellipsis; white-space: nowrap; }
.settings-file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.settings-identity:focus-within .settings-secondary-button { outline: 3px solid rgb(118 105 229 / 55%); outline-offset: 2px; }
.settings-section-heading { padding-bottom: 1.2rem; border-bottom: 1px solid #edf0f5; }
.settings-fields { display: grid; gap: 1.15rem; padding: 1.25rem 0; }
.settings-field { display: grid; gap: 0.45rem; }
.settings-field label { color: #344056; font-size: 0.85rem; font-weight: 700; }
.settings-field label span { margin-left: 0.3rem; color: #667187; font-size: 0.75rem; font-weight: 400; }
.settings-field input, .settings-field textarea, .settings-field select { width: 100%; }
.settings-field textarea { min-height: 6rem; resize: vertical; }
.settings-field p { margin: 0; font-size: 0.78rem; }
.settings-form-actions { display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #edf0f5; }
.settings-primary-button { border: 1px solid #685bd5; background: #685bd5; color: #fff; }
.settings-primary-button:hover { background: #5143bb; }
.settings-danger { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; border-color: #f1dfe2; }
.settings-danger-button { border: 1px solid #efcdd2; background: #fff3f4; color: #ae3445; }
.settings-danger-button:hover { background: #ffe6e9; }
.settings-primary-button:disabled, .settings-danger-button:disabled { opacity: 0.6; cursor: wait; }
.settings-panel .settings-feedback { width: 100%; margin: 0 0 1rem; padding: 0.75rem; border-radius: 0.7rem; }
.settings-panel .settings-feedback-success { background: #eaf8ef; color: #246a3b; }
.settings-panel .settings-feedback-error { background: #fff0f2; color: #a42639; }
@media (max-width: 600px) {
  .settings-identity { align-items: flex-start; }
  .settings-avatar { width: 4.5rem; height: 4.5rem; border-radius: 0.9rem; }
  .settings-form-actions button, .settings-danger-button { width: 100%; }
}
</style>
