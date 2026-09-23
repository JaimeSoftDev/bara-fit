import { useMutation } from "@tanstack/react-query";
import { updateProfile, uploadLogo } from "../api/auth";
import { useSession } from "../store/session";

export function useUpdateProfile() {
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: setUser,
  });
}

export function useUploadLogo() {
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: setUser,
  });
}
