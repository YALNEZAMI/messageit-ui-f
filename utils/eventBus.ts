import mitt from "mitt";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";

type Events = {
  messageReceived: Message;
  conversationChanged: Conversation;
};

export const eventBus = mitt<Events>();
