import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyConversation, getOrCreateConversation, listConversations, listMessages, sendMessage } from "../api/chat";

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: listConversations });
}

export function useConversationWith(clientId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", "with", clientId],
    queryFn: () => getOrCreateConversation(clientId!),
    enabled: !!clientId,
    staleTime: Infinity,
  });
}

export function useMyConversation() {
  return useQuery({ queryKey: ["conversations", "mine"], queryFn: getMyConversation, staleTime: Infinity });
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
