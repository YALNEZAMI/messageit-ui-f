<template>
  <main>
    <div>
      <ConversationHeader></ConversationHeader>
      <ConversationNavBar></ConversationNavBar>
    </div>

    <div
      :class="{
        'bg-blue-100 text-white':
          useConversationsStore().currentConversation.theme?._id == 'basic',
        'bg-pink-100 text-white':
          useConversationsStore().currentConversation.theme?._id == 'love',
        'bg-gray-100 text-white':
          useConversationsStore().currentConversation.theme?._id == 'panda',
        'bg-green-100 text-white':
          useConversationsStore().currentConversation.theme?._id == 'spring',
      }"
    >
      <slot />
    </div>
  </main>
</template>
