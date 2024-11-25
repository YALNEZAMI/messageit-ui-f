import type { User } from "./user";

export interface Typing {
  _id?: string;
  typer: string | User;
  conversation: string;
}
