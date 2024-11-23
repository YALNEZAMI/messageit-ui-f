import type { Conversation } from "./conversation";
import type { User } from "./user";

export interface Message {
  _id?: string;
  sender: string | User;
  conversation: string | Conversation;
  text?: string;
  createdAt?: string;
}
