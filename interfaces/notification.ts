import type { User } from "./user";

export interface Notification {
  _id: string;
  sender: User | string;
  recipient: User | string;
  type: "friendRequest" | "friendAcceptation";
  seen?: boolean;
}
