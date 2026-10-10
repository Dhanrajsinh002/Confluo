import axios from "axios";

export interface ApiErrorInfo {
  message: string;
  fields: Record<string, string>;
}

export function parseApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): ApiErrorInfo {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return { message: "Can't reach the server. Check your connection and try again.", fields: {} };
    }
    const body = err.response.data?.error;
    if (body) {
      const fields: Record<string, string> = {};
      for (const [key, val] of Object.entries(body.fields ?? {})) {
        fields[key] =
          typeof val === "string" ? val : Array.isArray(val) ? String(val[0]) : "Invalid value";
      }
      return { message: body.message || fallback, fields };
    }
    if (err.response.status >= 500) {
      return { message: "The server had a problem. Please try again shortly.", fields: {} };
    }
  }
  return { message: fallback, fields: {} };
}
