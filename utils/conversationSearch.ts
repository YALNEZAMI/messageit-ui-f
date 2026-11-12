import type { Conversation } from "~/interfaces/conversation";
import type { User } from "~/interfaces/user";

export function filterConversations(
  conversations: Conversation[],
  query: string,
  userId?: string
): Conversation[] {
  const key = query.trim().toLocaleLowerCase();
  if (!key) return conversations;
  return conversations.filter((conversation) => {
    let name = "";
    if (conversation.type === "ai") {
      name = "assistant boby ai";
    } else if (conversation.type === "group") {
      name = conversation.name || "";
    } else {
      const members = conversation.members.filter(
        (member): member is User => typeof member !== "string"
      );
      name = (members.find((member) => member._id !== userId) || members[0])?.name || "";
    }
    return name.toLocaleLowerCase().includes(key);
  });
}
