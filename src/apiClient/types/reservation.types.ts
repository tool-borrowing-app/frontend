import { LookupDto, ToolDto } from "@/app/eszkozeim/page";

export type CreateReservationDto = {
  toolId: string;
  dateFrom: Date;
  dateTo: Date;
  borrowerUserId: number;
};

export type UserFullProfileDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  postalCode?: string;
  city?: string;
  streetAddress?: string;
  toolIds?: number[];
  renterConversationIds?: number[];
  sentMessageIds?: number[];
  notificationIds?: number[];
};

export type ReservationDto = {
  id: number;
  toolDto: ToolDto;
  dateFrom: Date;
  dateTo: Date;
  status: LookupDto;
  ownerScore: number;
  ownerComment: string;
  borrowerScore: number;
  borrowerComment: string;
  borrower?: UserFullProfileDto | null;
  user?: UserFullProfileDto | null;
};
