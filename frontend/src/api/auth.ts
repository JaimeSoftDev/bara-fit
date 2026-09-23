import { api, setToken } from "../lib/apiClient";
import type { AppUser } from "../types";

interface AuthResponse {
  token: string;
  user: AppUser;
}

export async function login(email: string, password: string): Promise<AppUser> {
  const res = await api.post<AuthResponse>("/login", { email, password });
  setToken(res.token);
  return res.user;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  specialties?: string[];
  bio?: string;
}): Promise<AppUser> {
  const res = await api.post<AuthResponse>("/register", input);
  setToken(res.token);
  return res.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } finally {
    setToken(null);
  }
}

export function me(): Promise<AppUser> {
  return api.get<AppUser>("/me");
}

export function updateProfile(input: {
  name?: string;
  bio?: string;
  specialties?: string[];
  brandColor?: string | null;
  logoUrl?: string | null;
}): Promise<AppUser> {
  return api.patch<AppUser>("/me/profile", input);
}

export function uploadLogo(file: File): Promise<AppUser> {
  const form = new FormData();
  form.append("logo", file);
  return api.postForm<AppUser>("/me/logo", form);
}
