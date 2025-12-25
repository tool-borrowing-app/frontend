import { apiClient } from "../client";
import { UploadToolPayload } from "../types/tool.types";

export async function uploadTool(payload: UploadToolPayload) {
  return await apiClient.post("/tools", payload);
}

export async function deleteTool(id: string) {
  return await apiClient.delete(`/tools/${id}`);
}
