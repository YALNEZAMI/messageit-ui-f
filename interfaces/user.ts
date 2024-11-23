import type { Theme } from "./theme";

export interface User {
  _id?: string;
  theme?: Theme;
  email: string;
  password: string;
  password2?: string;
  name?: string;
  strategy?: string;
  image: string;
  onLine: boolean;
}
