import { api } from "../lib/apiClient";
import type { Conversation, Message } from "../types";

export function listConversations(): Promise<Conversation[]> {
  return api.get<Conversation[]>("/conversations");
}

export function listMessages(conversationId: string): Promise<Message[]> {
  return api.get<Message[]>(`/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: string, text: string): Promise<Message> {
  return api.post<Message>(`/conversations/${conversationId}/messages`, { text });
}

export function getOrCreateConversation(clientId: string): Promise<Conversation> {
  return api.post<Conversation>("/conversations", { clientId });
}

export function getMyConversation(): Promise<Conversation> {
  return api.post<Conversation>("/conversations", {});
}
