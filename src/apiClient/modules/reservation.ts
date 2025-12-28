import { apiClient } from "../client";
import { CreateReservationDto } from "../types/reservation.types";

export async function createReservation(payload: CreateReservationDto) {
  return await apiClient.post("/reservation", payload);
}

export async function getUserReservations() {
  return await apiClient.get("reservation");
}
