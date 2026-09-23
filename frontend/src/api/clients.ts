import { api } from "../lib/apiClient";
import type { ClientProfile } from "../types";

export function listClients(): Promise<ClientProfile[]> {
  return api.get<ClientProfile[]>("/clients");
}

export function getClient(id: string): Promise<ClientProfile> {
  return api.get<ClientProfile>(`/clients/${id}`);
}

export interface InviteResponse {
  id: string;
  name: string;
  email: string;
  acceptUrl: string;
  status: string;
}

export function inviteClient(input: {
  name: string;
  email: string;
  goal?: string;
  heightCm?: number;
}): Promise<InviteResponse> {
  return api.post<InviteResponse>("/clients/invite", input);
}
