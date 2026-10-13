/**
 * Notifications: the in-app inbox for administrators, plus the notices that
 * are delivered to a landlord after a decision (approvals, rejections,
 * information requests, suspensions, listing actions).
 */
import { mutateAdminDatabase, newId, roundTrip } from './store';
import type {
  AdminDatabase,
  AdminNotification,
  LandlordNotice,
  LandlordNoticeKind,
  NotificationType,
} from './types';

export interface AdminNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  severity: AdminNotification['severity'];
  route?: string | null;
}

/** Respects the administrator's notification preferences for the given type. */
export function pushAdminNotification(
  db: AdminDatabase,
  input: AdminNotificationInput
): AdminNotification | null {
  const prefs = db.preferences;
  const enabled =
    input.type === 'verification_submitted' || input.type === 'verification_resubmitted'
      ? prefs.notifyVerification
      : input.type === 'report_filed'
        ? prefs.notifyReports
        : input.type === 'unresolved_case'
          ? prefs.notifyUnresolved
          : true;
  if (!enabled) return null;

  const notification: AdminNotification = {
    id: newId('ntf'),
    type: input.type,
    title: input.title,
    body: input.body,
    at: new Date().toISOString(),
    read: false,
    severity: input.severity,
    route: input.route ?? null,
  };
  db.notifications = [notification, ...db.notifications];
  return notification;
}

export interface LandlordNoticeInput {
  landlordId: string;
  applicationId?: string | null;
  kind: LandlordNoticeKind;
  title: string;
  body: string;
  nextSteps: string;
}

/** Records the message a landlord receives after an administrative action. */
export function notifyLandlord(db: AdminDatabase, input: LandlordNoticeInput): LandlordNotice {
  const notice: LandlordNotice = {
    id: newId('ntc'),
    landlordId: input.landlordId,
    applicationId: input.applicationId ?? null,
    kind: input.kind,
    title: input.title,
    body: input.body,
    nextSteps: input.nextSteps,
    at: new Date().toISOString(),
    delivery: 'sent',
  };
  db.landlordNotices = [notice, ...db.landlordNotices];
  return notice;
}

export function unreadNotificationCount(db: AdminDatabase): number {
  return db.notifications.filter((notification) => !notification.read).length;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await roundTrip(60);
  await mutateAdminDatabase((db) => {
    db.notifications = db.notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await roundTrip(80);
  await mutateAdminDatabase((db) => {
    db.notifications = db.notifications.map((notification) =>
      notification.read ? notification : { ...notification, read: true }
    );
  });
}

export async function clearReadNotifications(): Promise<void> {
  await roundTrip(80);
  await mutateAdminDatabase((db) => {
    db.notifications = db.notifications.filter((notification) => !notification.read);
  });
}

/** Notices already delivered to a landlord account, newest first. */
export function noticesForLandlord(db: AdminDatabase, landlordId: string): LandlordNotice[] {
  return db.landlordNotices
    .filter((notice) => notice.landlordId === landlordId)
    .sort((a, b) => b.at.localeCompare(a.at));
}
