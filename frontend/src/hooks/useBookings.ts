import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkInAttendee,
  createBooking,
  deleteBooking,
  deleteBookingSeries,
  joinBooking,
  leaveBooking,
  listAvailableClasses,
  listBookings,
  updateBookingStatus,
} from "../api/bookings";

export function useBookings() {
  return useQuery({ queryKey: ["bookings"], queryFn: listBookings });
}

export function useAvailableClasses() {
  return useQuery({ queryKey: ["bookings", "available"], queryFn: listAvailableClasses });
}

function useInvalidateBookings() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["bookings"] });
}

export function useCreateBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({ mutationFn: createBooking, onSuccess: invalidate });
}

export function useUpdateBookingStatus() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (input: { id: string; status: Parameters<typeof updateBookingStatus>[1] }) =>
      updateBookingStatus(input.id, input.status),
    onSuccess: invalidate,
  });
}

export function useDeleteBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({ mutationFn: deleteBooking, onSuccess: invalidate });
}

export function useDeleteBookingSeries() {
  const invalidate = useInvalidateBookings();
  return useMutation({ mutationFn: deleteBookingSeries, onSuccess: invalidate });
}

export function useJoinBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (input: { id: string; clientId?: string }) => joinBooking(input.id, input.clientId),
    onSuccess: invalidate,
  });
}

export function useLeaveBooking() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (input: { id: string; clientId: string }) => leaveBooking(input.id, input.clientId),
    onSuccess: invalidate,
  });
}

export function useCheckInAttendee() {
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (input: { id: string; clientId: string; checkedIn?: boolean }) =>
      checkInAttendee(input.id, input.clientId, input.checkedIn),
    onSuccess: invalidate,
  });
}
