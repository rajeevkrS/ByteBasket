//Creates reusable TypeScript types for the frontend application
//This file acts as the frontend type foundation layer

// Creates frontend role type restriction
export type UserRole = "user" | "admin";

// Defines frontend authenticated user structure
export type AppUser = {
  id: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  role: UserRole;
};

// Defines frontend error object structure
export type ApiErrorItem = {
  message: string;
  code?: string;
};

// Defines standardized API response structure
export type ApiEnvelope<T> = {
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  errors?: ApiErrorItem[];
};
