import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
} from '@/components/admin/containers';
import { Avatar, FilterChips, SearchField, StatusPill } from '@/components/admin/primitives';
import { adminRoutes, href } from '@/routes';
import { formatDate } from '@/services/admin/format';
import { matchesQuery, retryAdminStore, useAdminStore } from '@/services/admin';
import { adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { LandlordAccount, LandlordVerificationState } from '@/services/admin/types';

type AccountFilter = 'all' | 'verified' | 'in_review' | 'rejected' | 'suspended';

const FILTER_OPTIONS: { value: AccountFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_review', label: 'In review' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

function verificationTone(state: LandlordVerificationState): AdminTone {
  switch (state) {
    case 'verified':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'info_requested':
      return 'warning';
    case 'resubmitted':
      return 'info';
    case 'pending':
      return 'primary';
    default:
      return 'neutral';
  }
}

function matchesFilter(landlord: LandlordAccount, filter: AccountFilter): boolean {
  switch (filter) {
    case 'verified':
      return landlord.verificationStatus === 'verified';
    case 'in_review':
      return (
        landlord.verificationStatus === 'pending' ||
        landlord.verificationStatus === 'info_requested' ||
        landlord.verificationStatus === 'resubmitted'
      );
    case 'rejected':
      return landlord.verificationStatus === 'rejected';
    case 'suspended':
      return landlord.accountStatus === 'suspended';
    default:
      return true;
  }
}

export default function LandlordAccountsScreen() {
  const { status, db, error } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AccountFilter>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.landlords
      .filter((landlord) => {
        const haystack = `${landlord.fullName} ${landlord.email} ${landlord.phone} ${landlord.city}`;
        return matchesQuery(haystack, query) && matchesFilter(landlord, filter);
      })
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  }, [db, query, filter]);

  const counts = useMemo(() => {
    if (!db) return { verified: 0, in_review: 0, rejected: 0, suspended: 0 };
    return {
      verified: db.landlords.filter((l) => l.verificationStatus === 'verified').length,
      in_review: db.landlords.filter(
        (l) =>
          l.verificationStatus === 'pending' ||
          l.verificationStatus === 'info_requested' ||
          l.verificationStatus === 'resubmitted'
      ).length,
      rejected: db.landlords.filter((l) => l.verificationStatus === 'rejected').length,
      suspended: db.landlords.filter((l) => l.accountStatus === 'suspended').length,
    };
  }, [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading landlord accounts…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Landlord accounts could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Landlord accounts</Text>
        <Text style={styles.introText}>
          Search accounts, check verification status and review history. Suspending or reactivating
          an account always requires a reason and is written to the audit log.
        </Text>
      </View>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, email, phone or city…"
        accessibilityLabel="Search landlord accounts"
      />

      <SectionCard title="Filters">
        <FilterChips
          label="Account state"
          options={FILTER_OPTIONS.map((option) => ({
            ...option,
            count:
              option.value === 'all'
                ? db.landlords.length
                : option.value === 'verified'
                  ? counts.verified
                  : option.value === 'in_review'
                    ? counts.in_review
                    : option.value === 'rejected'
                      ? counts.rejected
                      : counts.suspended,
          }))}
          value={filter}
          onChange={setFilter}
        />
      </SectionCard>

      <Text style={styles.resultCount}>
        {rows.length} {rows.length === 1 ? 'account' : 'accounts'} shown
      </Text>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="people-outline"
            title="No accounts match"
            message="Try a different search term or clear the active filter."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setFilter('all');
            }}
          />
        </SectionCard>
      ) : (
        rows.map((landlord) => (
          <Pressable
            key={landlord.id}
            onPress={() => router.push(href(adminRoutes.account(landlord.id)))}
            accessibilityRole="button"
            accessibilityLabel={`Open ${landlord.fullName}. Verification ${landlord.verificationStatus}. Account ${landlord.accountStatus}.`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Avatar name={landlord.fullName} size={44} tone={landlord.city ? 'primary' : 'info'} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {landlord.fullName}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {landlord.email}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {landlord.city} · joined {formatDate(landlord.joinedAt)}
              </Text>
              <View style={styles.rowPills}>
                <StatusPill
                  label={landlord.verificationStatus.replace('_', ' ')}
                  tone={verificationTone(landlord.verificationStatus)}
                />
                {landlord.accountStatus === 'suspended' ? (
                  <StatusPill label="suspended" tone="danger" icon="pause-circle-outline" />
                ) : null}
              </View>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    backgroundColor: adminColors.cream,
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    padding: 16,
    gap: 6,
  },
  introTitle: {
    fontSize: adminType.title,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.3,
  },
  introText: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
  resultCount: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
  },
  rowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
  },
  rowMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  rowPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
});
