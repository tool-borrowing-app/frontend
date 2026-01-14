export type CreateCheckoutSessionDto = {
  toolId: string;
  dateFrom: Date;
  dateTo: Date;
  borrowerUserId: number;
};
