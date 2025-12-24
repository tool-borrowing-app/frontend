import { apiClient } from "../client";

export async function getToolsForUser({ userId }: { userId: string }) {
  return await apiClient.get(`/users/${userId}/tools`);
}
