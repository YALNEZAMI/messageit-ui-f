import type { Theme } from "./theme";

export interface Conversation {
  _id?: string;
  name?: string;
  type: string;
  theme: Theme;
}