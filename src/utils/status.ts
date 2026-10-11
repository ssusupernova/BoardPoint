import type { PaymentOverview, TenantStatus } from '@/data/mock';

export type StatusVariant = 'neutral' | 'success' | 'warning' | 'info';

/** Every status that can be rendered through a StatusBadge. */
export type StatusInput = TenantStatus | PaymentOverview['status'];

/** Map a domain status onto a StatusBadge colour variant. */
export function statusVariant(status: StatusInput): StatusVariant {
  switch (status) {
    case 'Active':
    case 'Completed':
    case 'Paid':
      return 'success';
    case 'Unpaid':
      return 'warning';
    case 'Scheduled':
    case 'Due soon':
      return 'info';
    default:
      return 'neutral';
  }
}
