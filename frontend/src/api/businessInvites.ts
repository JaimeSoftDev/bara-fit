import { api, setToken } from "../lib/apiClient";
import type { AppUser } from "../types";

export interface TeamInvite {
  name: string;
  email: string;
  businessName: string;
  inviterName: string;
  status: "pending" | "accepted" | "expired";
}

export function getTeamInvite(token: string): Promise<TeamInvite> {
  return api.public.get<TeamInvite>(`/team-invites/${token}`);
}

export async function acceptTeamInvite(token: string, password: string): Promise<AppUser> {
  const res = await api.public.post<{ token: string; user: AppUser }>(`/team-invites/${token}/accept`, {
    password,
  });
  setToken(res.token);
  return res.user;
}
