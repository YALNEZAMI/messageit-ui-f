<template>
  <main class="workspace-shell conversation-shell">
    <div>
      <ConversationHeader></ConversationHeader>
      <ConversationNavBar></ConversationNavBar>
    </div>
    <ContainersBgTheme class="conversation-content"
      :theme="useConversationsStore().currentConversation.theme"
    >
      <slot />
    </ContainersBgTheme>
  </main>
</template>
