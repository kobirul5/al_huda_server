import { UserStatus } from "@prisma/client";

export type IUserFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  distanceRange?: number | undefined;
};

export type IUserFilters = {
  searchTerm?: string;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  location?: string;
};
