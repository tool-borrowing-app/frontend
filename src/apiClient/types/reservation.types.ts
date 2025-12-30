import { LookupDto, ToolDto } from "@/app/eszkozeim/page";

export type CreateReservationDto = {
  toolId: string;
  dateFrom: Date;
  dateTo: Date;
  borrowerUserId: number;
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
};
