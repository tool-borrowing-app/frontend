import { apiClient } from "../client";
import { CreateReservationDto } from "../types/reservation.types";

export async function createReservation(payload: CreateReservationDto) {
  return await apiClient.post("/reservation", payload);
}

export async function getUserReservations() {
  return await apiClient.get("reservation");
}

export async function submitReservationReview(
  id: number,
  review: {
    borrowerScore?: number | null;
    borrowerComment?: string | null;
    ownerScore?: number | null;
    ownerComment?: string | null;
  }
) {
  const res = await apiClient.post(`/reservation/${id}/review`, review);
  return res.data;
}


