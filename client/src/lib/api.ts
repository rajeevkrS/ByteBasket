import axios, { type AxiosRequestConfig } from "axios";
import { env } from "./env";
import type { ApiEnvelope } from "./types";

// Token Getter Variable
let tokenGetter: (() => Promise<string | null>) | null = null;

// Globally stores authentication token getter, Connects With Clerk frontend auth
export function setApiTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

// Creates reusable Axios configuration instance
const api = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Runs before every API request, Used For Automatically attaching auth token
api.interceptors.request.use(async (config) => {
  if (!tokenGetter) return config;

  const token = await tokenGetter();

  // Adds Clerk JWT token to requests
  if (token) {
    config.headers = config.headers || {};

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Global Error Message Handler
// Connects With Backend- fail() response structure
function getErrorMsg(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong!!! Please try again";
}

// Reusable type-safe GET request helper
export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  try {
    // Send GET request and expect backend response in ApiEnvelope<T> format
    const response = await api.get<ApiEnvelope<T>>(url, config);

    // Checks backend standardized response status
    // Connects With Backend- ok(); fail();
    if (response.data.status === "error" || !response.data.data) {
      throw new Error(response.data.errors?.[0]?.message || "Req failed");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMsg(error));
  }
}
