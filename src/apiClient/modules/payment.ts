import { apiClient } from "../client";
import { CreateCheckoutSessionDto } from "../types/payment.types";

// note: this will return the url where we want to redirect the user to
export async function createCheckoutSession(payload: CreateCheckoutSessionDto) {
  return await apiClient.post("/payments", payload);
}
