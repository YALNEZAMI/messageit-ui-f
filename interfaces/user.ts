export interface User {
  _id?: string;
  theme?: string;
  email: string;
  password: string;
  password2?: string;
  name?: string;
  strategy?: string;
}
