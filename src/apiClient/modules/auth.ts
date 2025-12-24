import { apiClient } from "../client";
import { RegisterPayload } from "../types/auth.types";

export async function registerUser(payload: RegisterPayload) {
  return await apiClient.post("/auth/register", payload);
}
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return await apiClient.post("/auth/login", {
    email,
    password,
  });
}

export async function fetchProfile() {
  return await apiClient.get("/auth/profile");
}

export async function logoutUser() {
  return await apiClient.post("/auth/logout", {});
}
