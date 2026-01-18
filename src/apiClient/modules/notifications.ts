import { apiClient } from "../client";


export async function fetchNotifications() {
  return await apiClient.get(`/notifications`);
}

export async function fetchNotificationsWithParams(acknowledged: boolean) {
  return await apiClient.get(`/notifications?acknowledged=${acknowledged}`)
}

export async function acknowledgeNotification(id: number) {
  return await apiClient.post(`/notifications/acknowledge/${id}`);
}