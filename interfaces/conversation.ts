import type { Theme } from "./theme";
import type { User } from "./user";

export interface Conversation {
  _id?: string;
  name?: string;
  theme: Theme;
  members: string[] | User[];
  image: string;
}
