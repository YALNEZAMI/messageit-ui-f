import mitt from "mitt";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { Recieving } from "~/interfaces/recieving";
import type { Typing } from "~/interfaces/typing";
import type { User } from "~/interfaces/user";

type Events = {
  messageReceived: Message;
  recieving: Recieving;
  conversationChanged: Conversation;
  userPatched: User;
  refereMessage: Message;
  typing: Typing;
};

export const eventBus = mitt<Events>();
