/* eslint-disable @typescript-eslint/no-explicit-any */

export type UploadToolPayload = {
  name: string;
  description?: string;
  rentalPrice?: number; // (Ft/nap)
  depositPrice?: number;
  lookupStatus?: string | Record<string, any>;
  lookupCategory: string | Record<string, any>;
  images?: string[];
};
