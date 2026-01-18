
export type NotificationDto = {
  id: number;
  createdAt: Date;
  message: string;
  reference: string;
  acknowledged: boolean;
  type: string;
}