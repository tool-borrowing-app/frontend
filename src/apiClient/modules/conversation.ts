import { apiClient } from "../client";
import { SendMessageDto, StartConversationPayload } from "../types/conversation.types";


export async function fetchConversations() {
  return await apiClient.get("/conversations");
}

export async function createConversation(payload: StartConversationPayload) {
  return await apiClient.post("/conversations", payload);
}

export async function sendMessage(payload: SendMessageDto) {
  return await apiClient.post("/messages", payload);
}