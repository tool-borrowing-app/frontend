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
  const res = await apiClient.post("/auth/register", payload);
  return res.data;
}
