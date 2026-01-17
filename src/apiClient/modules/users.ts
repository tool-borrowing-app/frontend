import { apiClient } from "../client";

export type ReviewDataDto = {
  score: number;
  comment?: string | null;
};

export type ReviewStatisticsDto = {
  asOwner: ReviewDataDto[];
  asBorrower: ReviewDataDto[];
  averageRating: number;
};

export async function getUserReviewStatistics(userId: number): Promise<{
  status: number;
  data?: ReviewStatisticsDto;
}> {
  const response = await apiClient.get(`/users/${userId}/reviews`);
  return { status: response.status, data: response.data };
}

export async function getToolsForUser({ userId }: { userId: string }) {
  return await apiClient.get(`/users/${userId}/tools`);
}
