import { api } from "../lib/apiClient";
import type { Booking, BookingStatus, BookingType, Recurrence } from "../types";

export function listBookings(): Promise<Booking[]> {
  return api.get<Booking[]>("/bookings");
}

export function listAvailableClasses(): Promise<Booking[]> {
  return api.get<Booking[]>("/bookings/available");
}

export interface CreateBookingInput {
  title: string;
  type: BookingType;
  startsAt: string;
  endsAt: string;
  location: string;
  notes?: string;
  capacity?: number | null;
  clientId?: string; // initial attendee for a 1:1 session
  recurrence?: Recurrence;
}

export function createBooking(input: CreateBookingInput): Promise<Booking[]> {
  return api.post<Booking[]>("/bookings", input);
}

export function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}`, { status });
}

export function deleteBooking(id: string): Promise<void> {
  return api.delete(`/bookings/${id}`);
}

export function deleteBookingSeries(seriesId: string): Promise<void> {
  return api.delete(`/bookings/series/${seriesId}`);
}

export function joinBooking(id: string, clientId?: string): Promise<Booking> {
  return api.post<Booking>(`/bookings/${id}/attendees`, clientId ? { clientId } : {});
}

export function leaveBooking(id: string, clientId: string): Promise<void> {
  return api.delete(`/bookings/${id}/attendees/${clientId}`);
}

export function checkInAttendee(id: string, clientId: string, checkedIn = true): Promise<Booking> {
  return api.post<Booking>(`/bookings/${id}/attendees/${clientId}/check-in`, { checkedIn });
}
