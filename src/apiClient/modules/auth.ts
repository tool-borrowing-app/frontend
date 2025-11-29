import { apiClient } from "../client";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  postalCode: string;
  city: string;
  streetAddress: string;
  password: string;
};

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
