import { api, setToken } from "../lib/apiClient";
import type { AppUser, Invite } from "../types";

export function getInvite(token: string): Promise<Invite> {
  return api.public.get<Invite>(`/invites/${token}`);
}

export async function acceptInvite(token: string, password: string): Promise<AppUser> {
  const res = await api.public.post<{ token: string; user: AppUser }>(`/invites/${token}/accept`, {
    password,
  });
  setToken(res.token);
  return res.user;
}
