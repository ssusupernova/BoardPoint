import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  adminColors,
  adminRadii,
  adminType,
  cardShadow,
  toneStyles,
  type AdminTone,
} from '@/theme/admin';
import { formatDate } from '@/services/admin/format';
import { AdminButton, type IconName } from './primitives';

/* -------------------------------------------------------------------- screen */

export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();

  if (!scroll) {
    return <View style={[styles.screen, { paddingBottom: insets.bottom }, style]}>{children}</View>;
  }

  return (
    <View style={[styles.screen, style]}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, { paddingBottom: insets.bottom + 36 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------- section card */

type CardTone = 'surface' | 'cream' | 'blue';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: CardTone;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  actionLabel,
  onAction,
  tone = 'surface',
  children,
  style,
  padded = true,
}: SectionCardProps) {
  const background =
    tone === 'cream' ? adminColors.cream : tone === 'blue' ? adminColors.lightBlueSoft : adminColors.surface;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: background },
        tone === 'surface' && cardShadow,
        style,
      ]}
    >
      {title || actionLabel ? (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
            {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
          </View>
          {actionLabel && onAction ? (
            <Pressable
              onPress={onAction}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              hitSlop={8}
              style={({ pressed }) => [styles.cardAction, pressed && styles.cardActionPressed]}
            >
              <Text style={styles.cardActionLabel}>{actionLabel}</Text>
              <Ionicons name="chevron-forward" size={14} color={adminColors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={padded ? styles.cardBody : undefined}>{children}</View>
    </View>
  );
}

/* ----------------------------------------------------------------- stat card */

interface StatCardProps {
  label: string;
  value: number;
  icon: IconName;
  tone: AdminTone;
  hint?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, icon, tone, hint, onPress }: StatCardProps) {
  const palette = toneStyles[tone];

  const body = (
    <>
      <View style={[styles.statIcon, { backgroundColor: palette.background, borderColor: palette.border }]}>
        <Ionicons name={icon} size={18} color={palette.foreground} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
      {hint ? <Text style={styles.statHint} numberOfLines={1}>{hint}</Text> : null}
    </>
  );

  if (!onPress) {
    return (
      <View accessibilityRole="summary" accessibilityLabel={`${label}: ${value}`} style={styles.statCard}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Open module.`}
      style={({ pressed }) => [styles.statCard, pressed && styles.statCardPressed]}
    >
      {body}
    </Pressable>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={styles.statGrid}>{children}</View>;
}

/* -------------------------------------------------------------------- states */

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.state} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={adminColors.primary} />
      <Text style={styles.stateTitle}>{label}</Text>
      <Text style={styles.stateMessage}>Fetching the latest records from BoardPoint.</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={26} color={adminColors.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <AdminButton label={actionLabel} onPress={onAction} variant="secondary" style={styles.stateAction} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.state} accessibilityRole="alert">
      <View style={[styles.stateIcon, { backgroundColor: adminColors.dangerBg }]}>
        <Ionicons name="alert-circle-outline" size={26} color={adminColors.danger} />
      </View>
      <Text style={styles.stateTitle}>Something went wrong</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {onRetry ? (
        <AdminButton label="Try again" onPress={onRetry} icon="refresh-outline" style={styles.stateAction} />
      ) : null}
    </View>
  );
}

export function AccessDenied({ message }: { message: string }) {
  return (
    <View style={styles.state} accessibilityRole="alert">
      <View style={[styles.stateIcon, { backgroundColor: adminColors.cream }]}>
        <Ionicons name="lock-closed-outline" size={26} color={adminColors.darkBrown} />
      </View>
      <Text style={styles.stateTitle}>Not available for your role</Text>
      <Text style={styles.stateMessage}>{message}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ timeline */

export interface TimelineEntry {
  id: string;
  at: string;
  title: string;
  detail?: string | null;
  actor?: string | null;
  icon?: IconName;
  tone?: AdminTone;
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <View style={styles.timeline}>
      {entries.map((entry, index) => {
        const palette = toneStyles[entry.tone ?? 'neutral'];
        return (
          <View key={entry.id} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: palette.background, borderColor: palette.border },
                ]}
              >
                <Ionicons name={entry.icon ?? 'ellipse'} size={10} color={palette.foreground} />
              </View>
              {index < entries.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{entry.title}</Text>
              {entry.detail ? <Text style={styles.timelineDetail}>{entry.detail}</Text> : null}
              <Text style={styles.timelineMeta}>
                {entry.actor ? `${entry.actor} · ` : ''}
                {formatDate(entry.at)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------------- shortcuts */

export function ShortcutTile({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: IconName;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} needing attention` : label}
      style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
    >
      <View style={styles.shortcutIcon}>
        <Ionicons name={icon} size={19} color={adminColors.darkBrown} />
        {typeof badge === 'number' && badge > 0 ? (
          <View style={styles.shortcutBadge}>
            <Text style={styles.shortcutBadgeLabel}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.shortcutLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  screenContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 16,
  },
  card: {
    borderRadius: adminRadii.lg,
    borderWidth: 1,
    borderColor: adminColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: adminType.heading,
    fontWeight: '800',
    color: adminColors.textPrimary,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 17,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  cardActionPressed: {
    opacity: 0.6,
  },
  cardActionLabel: {
    fontSize: adminType.small,
    fontWeight: '700',
    color: adminColors.primary,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 140,
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 14,
    ...cardShadow,
  },
  statCardPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: adminRadii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: adminColors.textPrimary,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    marginTop: 2,
    fontSize: adminType.small,
    fontWeight: '600',
    color: adminColors.textSecondary,
    lineHeight: 16,
  },
  statHint: {
    marginTop: 4,
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
  },
  state: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: adminRadii.full,
    backgroundColor: adminColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.textPrimary,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  stateAction: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    alignItems: 'center',
    width: 26,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: adminColors.border,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    gap: 3,
  },
  timelineTitle: {
    fontSize: adminType.body,
    fontWeight: '700',
    color: adminColors.textPrimary,
  },
  timelineDetail: {
    fontSize: adminType.small,
    color: adminColors.textSecondary,
    lineHeight: 18,
  },
  timelineMeta: {
    fontSize: adminType.tiny,
    color: adminColors.textMuted,
    fontWeight: '600',
  },
  shortcut: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: adminColors.border,
    padding: 12,
    gap: 8,
  },
  shortcutPressed: {
    backgroundColor: adminColors.cream,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: adminRadii.sm,
    backgroundColor: adminColors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  shortcutBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: adminColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: adminColors.textInverse,
  },
  shortcutLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    color: adminColors.textPrimary,
    lineHeight: 15,
  },
});
