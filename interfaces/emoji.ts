import type { User } from "./user";

export interface Emoji {
  _id?: string;
  emoji: string;
  reacter: string | User;
  message: string;
}
