import { apiClient } from "../client";


export async function fetchConversations() {
  return await apiClient.get("/conversations");
}

export async function startConversation() {
  
}