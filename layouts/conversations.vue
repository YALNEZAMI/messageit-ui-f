<template>
  <main>
    <div>
      <ConversationHeader></ConversationHeader>
      <ConversationNavBar></ConversationNavBar>
    </div>
    <ContainersBgTheme
      :theme="useConversationsStore().currentConversation.theme"
    >
      <slot />
    </ContainersBgTheme>
  </main>
</template>
