export interface MessageSeen {
  _id?: string;
  viewer: string;
  conversation?: string;
  message: string;
  createdAt?: string;
}
