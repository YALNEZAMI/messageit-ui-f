import mitt from "mitt";
import type { Conversation } from "~/interfaces/conversation";
import type { Emoji } from "~/interfaces/emoji";
import type { Message } from "~/interfaces/message";
import type { MessageSeen } from "~/interfaces/message-seen";
import type { Recieving } from "~/interfaces/recieving";
import type { Typing } from "~/interfaces/typing";
import type { User } from "~/interfaces/user";

type Events = {
  messageReceived: Message;
  recieving: Recieving;
  seeing: MessageSeen;
  conversationChanged: Conversation;
  userPatched: User;
  refereMessage: Message;
  typing: Typing;
  notificationNumberChanged: any;
  emojiCreated: Emoji;
  emojiRemoved: Emoji;
};

export const eventBus = mitt<Events>();
