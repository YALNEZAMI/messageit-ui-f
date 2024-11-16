import type { Theme } from "./theme";
import type { User } from "./user";

export interface Conversation {
  _id?: string;
  name?: string;
  theme: Theme;
  user1: string | User;
  user2: string | User;
}
