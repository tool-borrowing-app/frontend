import { apiClient } from "../client";
import { SendMessageDto, StartConversationPayload } from "../types/conversation.types";


export async function fetchConversations() {
  return await apiClient.get(`/conversations`);
}

export async function fetchConversationsWithParam(itemId: string) {
  return await apiClient.get(`/conversations?itemId=${itemId}`);
}

export async function createConversation(payload: StartConversationPayload) {
  return await apiClient.post("/conversations", payload);
}

export async function deleteConversation(id: number) {
  return await apiClient.delete(`/conversations/${id}`)
}

export async function sendMessage(payload: SendMessageDto) {
  return await apiClient.post("/messages", payload);
}

export async function getMessages(conversationId: number) {
  return await apiClient.get(`/conversations/${conversationId}/messages`)
}