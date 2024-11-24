import type { Message } from "postcss";
import type { Theme } from "./theme";
import type { User } from "./user";

export interface Conversation {
  _id?: string;
  name?: string;
  theme?: Theme;
  type: "private" | "group" | "ai";
  members: string[] | User[];
  image?: string;
  lastMessage?: Message;
  createdAt?: string;
  updatedAt?: string;
}
