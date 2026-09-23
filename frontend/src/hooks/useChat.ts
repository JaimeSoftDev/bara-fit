import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listConversations, listMessages, sendMessage } from "../api/chat";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: listConversations });
}

export function useConversationWith(clientId: string | undefined) {
  const { data: conversations, ...rest } = useConversations();
  return { data: conversations?.find((c) => c.clientId === clientId), ...rest };
}

export function useMyConversation() {
  const { data: conversations, ...rest } = useConversations();
  return { data: conversations?.[0], ...rest };
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => listMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 4000,
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendMessage(conversationId!, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
  });
}
