import { supabase } from "./supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export async function authenticatedFetch(path, options = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Your session has ended. Please sign in again.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}