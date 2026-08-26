import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import * as messageService from '@/services/messageService';
import * as motherService from '@/services/motherService';
import * as doctorService from '@/services/doctorService';

// href -> badge value. Absent key means "no badge" (never render 0/empty).
export type SidebarBadgeMap = Record<string, string | number>;

// Appointment statuses that no longer need the mother's/doctor's attention —
// excluded from the "relevant" count per both roles' own status enums
// (MotherAppointmentStatus / DoctorAppointmentStatus).
const INACTIVE_APPOINTMENT_STATUSES = new Set(['cancelled', 'completed']);

async function computeMotherBadges(): Promise<SidebarBadgeMap> {
  const badges: SidebarBadgeMap = {};

  const [conversations, appointments, vaccinations] = await Promise.allSettled([
    messageService.getMyConversations(),
    motherService.getAppointments(),
    motherService.getVaccinations(),
  ]);

  if (conversations.status === 'fulfilled') {
    const unread = conversations.value.reduce((sum, c) => sum + c.unreadCount, 0);
    if (unread > 0) badges['/mother/messages'] = unread;
  }

  if (appointments.status === 'fulfilled') {
    const relevant = appointments.value.filter((a) => !INACTIVE_APPOINTMENT_STATUSES.has(a.status)).length;
    if (relevant > 0) badges['/mother/appointments'] = relevant;
  }

  if (vaccinations.status === 'fulfilled') {
    const hasDue = vaccinations.value.some((v) => v.status === 'due_soon' || v.status === 'overdue');
    if (hasDue) badges['/mother/vaccinations'] = 'Due';
  }

  // Notifications has no real backend yet (MotherNotificationsPage still reads
  // a hardcoded mock array whose "read" state is only ever mutated in local
  // component state, never persisted) — no real count exists, so no badge.

  return badges;
}

async function computeDoctorBadges(): Promise<SidebarBadgeMap> {
  const badges: SidebarBadgeMap = {};

  const [conversations, appointments] = await Promise.allSettled([
    messageService.getMyConversations(),
    doctorService.getMyAppointments(),
  ]);

  if (conversations.status === 'fulfilled') {
    const unread = conversations.value.reduce((sum, c) => sum + c.unreadCount, 0);
    if (unread > 0) badges['/doctor/messages'] = unread;
  }

  if (appointments.status === 'fulfilled') {
    const relevant = appointments.value.filter((a) => !INACTIVE_APPOINTMENT_STATUSES.has(a.status)).length;
    if (relevant > 0) badges['/doctor/appointments'] = relevant;
  }

  // Notifications has no real backend yet (DoctorNotificationsPage still reads
  // a hardcoded mock array whose "read" state is only ever mutated in local
  // component state, never persisted) — no real count exists, so no badge.

  return badges;
}

/**
 * Computes sidebar badge values for the current role, called once here
 * (in AppLayout) and passed down to both Sidebar and MobileDrawer, so the
 * two nav renderers never each fetch independently. Re-runs on role change,
 * on route change (e.g. cancelling an appointment then navigating away), and
 * immediately on message send/read via messageService's activity
 * subscription — not on an interval/poll. Hospital and Admin's existing
 * services are still an in-memory mock store (not real backend-persisted
 * data — see hospitalService.ts/adminService.ts headers), so they resolve to
 * an empty map (no badges) rather than showing a fabricated count.
 */
export function useSidebarBadges(role: UserRole): SidebarBadgeMap {
  const location = useLocation();
  const [badges, setBadges] = useState<SidebarBadgeMap>({});

  const compute = role === 'mother' ? computeMotherBadges : role === 'doctor' ? computeDoctorBadges : null;

  useEffect(() => {
    let cancelled = false;

    if (!compute) {
      setBadges({});
      return;
    }

    const refresh = () => {
      compute()
        .then((result) => {
          if (!cancelled) setBadges(result);
        })
        .catch(() => {
          if (!cancelled) setBadges({});
        });
    };

    refresh();
    // Also refreshes on message send/read even when it happens without a
    // route change (e.g. opening a conversation within the Messages page)
    // — see messageService.subscribeToMessageActivity.
    const unsubscribe = messageService.subscribeToMessageActivity(refresh);

    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, location.pathname]);

  return badges;
}
