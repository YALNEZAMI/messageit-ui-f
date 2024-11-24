import mitt from "mitt";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

type Events = {
  messageReceived: Message;
  conversationChanged: Conversation;
  userPatched: User;
  refereMessage: Message;
};

export const eventBus = mitt<Events>();
