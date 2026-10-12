import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionCard,
} from '@/components/admin/containers';
import { FilterChips, SearchField, StatusPill } from '@/components/admin/primitives';
import { adminRoutes, href } from '@/routes';
import { isWithinRange, relativeTime } from '@/services/admin/format';
import {
  matchesQuery,
  reportCountForListing,
  retryAdminStore,
  useAdminStore,
  type DateRange,
} from '@/services/admin';
import { currency, adminColors, adminRadii, adminType, type AdminTone } from '@/theme/admin';
import type { ListingStatus } from '@/services/admin/types';

type StatusFilter = 'all' | ListingStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'correction_requested', label: 'Correction' },
  { value: 'hidden', label: 'Hidden' },
];

const RANGE_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
] as const;

export function listingStatusTone(status: ListingStatus): AdminTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'flagged':
      return 'warning';
    case 'hidden':
      return 'danger';
    default:
      return 'info';
  }
}

export default function PropertyModerationScreen() {
  const { status, db, error } = useAdminStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [range, setRange] = useState<DateRange>('all');

  const rows = useMemo(() => {
    if (!db) return [];
    return db.listings
      .filter((listing) => {
        const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
        const haystack = `${listing.title} ${listing.city} ${listing.address} ${landlord?.fullName ?? ''}`;
        if (!matchesQuery(haystack, query)) return false;
        if (filter !== 'all' && listing.status !== filter) return false;
        if (!isWithinRange(listing.updatedAt, range)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [db, query, filter, range]);

  const counts = useMemo(() => {
    if (!db) return { active: 0, flagged: 0, correction_requested: 0, hidden: 0 };
    const tally = { active: 0, flagged: 0, correction_requested: 0, hidden: 0 };
    for (const listing of db.listings) tally[listing.status] += 1;
    return tally;
  }, [db]);

  if (status === 'loading' || (status === 'idle' && !db)) {
    return (
      <Screen>
        <LoadingState label="Loading listings…" />
      </Screen>
    );
  }

  if (status === 'error' || !db) {
    return (
      <Screen>
        <ErrorState
          message={error ?? 'Listings could not be loaded.'}
          onRetry={() => void retryAdminStore()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.introTitle}>Property moderation</Text>
        <Text style={styles.introText}>
          Listings from verified landlords are reviewed on their own merits. Flagging, corrections
          and hiding never change the landlord&apos;s verification status.
        </Text>
      </View>

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search listing, city or landlord…"
        accessibilityLabel="Search property listings"
      />

      <SectionCard title="Filters">
        <FilterChips
          label="Listing status"
          options={STATUS_OPTIONS.map((option) => ({
            ...option,
            count: option.value === 'all' ? db.listings.length : counts[option.value],
          }))}
          value={filter}
          onChange={setFilter}
        />
        <FilterChips
          label="Recently updated"
          options={RANGE_OPTIONS.map((option) => ({ ...option }))}
          value={range}
          onChange={setRange}
        />
      </SectionCard>

      <Text style={styles.resultCount}>
        {rows.length} {rows.length === 1 ? 'listing' : 'listings'} shown
      </Text>

      {rows.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="business-outline"
            title="No listings match"
            message="Adjust the status, date range or search text."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setFilter('all');
              setRange('all');
            }}
          />
        </SectionCard>
      ) : (
        rows.map((listing) => {
          const landlord = db.landlords.find((entry) => entry.id === listing.landlordId);
          const reports = reportCountForListing(db, listing.id);
          return (
            <Pressable
              key={listing.id}
              onPress={() => router.push(href(adminRoutes.listing(listing.id)))}
              accessibilityRole="button"
              accessibilityLabel={`Open ${listing.title}. Status ${listing.status}. ${reports} reports.`}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.rowHeader}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={2}>
                    {landlord?.fullName ?? 'Unknown landlord'}
                    {landlord?.verificationStatus === 'verified' ? ' · verified' : ''} ·{' '}
                    {listing.city} · updated {relativeTime(listing.updatedAt)}
                  </Text>
                </View>
                <StatusPill label={listing.status.replace('_', ' ')} tone={listingStatusTone(listing.status)} />
              </View>

              <View style={styles.rowFooter}>
                <Text style={styles.rowPrice}>
                  {currency.symbol}
                  {listing.price.toLocaleString()}
                  <Text style={styles.rowPriceUnit}>/month</Text>
                </Text>
                <View style={styles.rowBadges}>
                  {listing.flags.length > 0 ? (
                    <StatusPill label={`${listing.flags.length} flag${listing.flags.length === 1 ? '' : 's'}`} tone="warning" icon="flag-outline" />
                  ) : null}
                  {reports > 0 ? (
                    <StatusPill label={`${reports} report${reports === 1 ? '' : 's'}`} tone={reports > 0 ? 'danger' : 'neutral'} icon="alert-circle-outline" />
                  ) : null}
                  <View style={styles.rowOpen}>
                    <Text style={styles.rowOpenLabel}>Review</Text>
                    <Ionicons name="arrow-forward" size={14} color={adminColors.primary} />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })
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
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 16,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
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
    lineHeight: 16,
    fontWeight: '600',
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
    paddingTop: 10,
  },
  rowPrice: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.darkBrown,
    fontVariant: ['tabular-nums'],
  },
  rowPriceUnit: {
    fontSize: adminType.tiny,
    fontWeight: '600',
    color: adminColors.textSecondary,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    flex: 1,
  },
  rowOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rowOpenLabel: {
    fontSize: adminType.small,
    fontWeight: '800',
    color: adminColors.primary,
  },
});
