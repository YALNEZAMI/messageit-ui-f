import type { Conversation } from "./conversation";
import type { User } from "./user";

export interface Message {
  _id?: string;
  sender?: string | User;
  conversation: string | Conversation;
  text: string;
  type: "notification" | "message";
  referedMessage?: string | Message;
  createdAt?: string;
  updatedAt?: string;
  transfered?: boolean;
  files?: any[];
}
