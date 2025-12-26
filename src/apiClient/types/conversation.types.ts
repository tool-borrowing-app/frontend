import { ToolDto, UserDto } from "@/app/eszkozeim/page";

export type StartConversationPayload = {
  toolId: number;
}

export type ConversationDto = {
  id: number;
  tool: ToolDto;
  renter: UserDto;
  lender: UserDto;
}