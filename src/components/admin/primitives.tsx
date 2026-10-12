import { type ReactNode, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adminColors, adminRadii, adminType, toneStyles, type AdminTone } from '@/theme/admin';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ------------------------------------------------------------------ button */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'info';

const BUTTON_VARIANTS: Record<
  ButtonVariant,
  { background: string; pressed: string; text: string; border: string }
> = {
  primary: {
    background: adminColors.primary,
    pressed: adminColors.primaryPressed,
    text: adminColors.textOnPrimary,
    border: adminColors.primary,
  },
  secondary: {
    background: adminColors.surface,
    pressed: adminColors.surfacePressed,
    text: adminColors.textPrimary,
    border: adminColors.borderStrong,
  },
  danger: {
    background: adminColors.danger,
    pressed: '#973830',
    text: adminColors.textInverse,
    border: adminColors.danger,
  },
  info: {
    background: adminColors.lightBlue,
    pressed: '#7FB8D9',
    text: adminColors.darkBrown,
    border: adminColors.lightBlue,
  },
  ghost: {
    background: 'transparent',
    pressed: adminColors.surfacePressed,
    text: adminColors.textSecondary,
    border: 'transparent',
  },
};

interface AdminButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  busy?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AdminButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  busy = false,
  accessibilityLabel,
  style,
  testID,
}: AdminButtonProps) {
  const palette = BUTTON_VARIANTS[variant];
  const isDisabled = disabled || loading || busy;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading || busy }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !isDisabled && { backgroundColor: palette.pressed },
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={17} color={palette.text} /> : null}
          <Text style={[styles.buttonLabel, { color: palette.text }]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------------- status pill */

interface StatusPillProps {
  label: string;
  tone: AdminTone;
  icon?: IconName;
  /** Renders a hollow pill for secondary metadata. */
  subtle?: boolean;
}

export function StatusPill({ label, tone, icon, subtle = false }: StatusPillProps) {
  const palette = toneStyles[tone];
  return (
    <View
      accessibilityRole="text"
      style={[
        styles.pill,
        {
          backgroundColor: subtle ? 'transparent' : palette.background,
          borderColor: subtle ? palette.border : palette.border,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={palette.foreground} /> : null}
      <Text style={[styles.pillLabel, { color: palette.foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------- search field */

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  accessibilityLabel,
}: SearchFieldProps) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search-outline" size={18} color={adminColors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={adminColors.textMuted}
        style={styles.searchInput}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          style={styles.searchClear}
        >
          <Ionicons name="close-circle" size={18} color={adminColors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------------------------------------------------------------- filter chips */

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export function FilterChips<T extends string>({ options, value, onChange, label }: FilterChipsProps<T>) {
  return (
    <View>
      {label ? <Text style={styles.filterLabel}>{label}</Text> : null}
      <View style={styles.chipRow} accessibilityRole="tablist" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="tab"
              accessibilityLabel={
                option.count !== undefined ? `${option.label}, ${option.count} items` : option.label
              }
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && !selected && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
                {option.count !== undefined ? ` ${option.count}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- field row */

interface FieldRowProps {
  label: string;
  value: string;
  icon?: IconName;
  mono?: boolean;
  children?: ReactNode;
}

export function FieldRow({ label, value, icon, mono = false, children }: FieldRowProps) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        {icon ? <Ionicons name={icon} size={15} color={adminColors.textSecondary} /> : null}
        <Text
          style={[styles.fieldValue, mono && styles.fieldValueMono]}
          selectable
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------- avatar */

export function Avatar({
  name,
  size = 40,
  tone = 'primary',
}: {
  name: string;
  size?: number;
  tone?: 'primary' | 'info';
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const background = tone === 'info' ? adminColors.lightBlueSoft : adminColors.cream;
  const color = tone === 'info' ? adminColors.infoText : adminColors.darkBrown;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
      ]}
    >
      <Text style={[styles.avatarLabel, { color, fontSize: Math.round(size * 0.36) }]}>
        {initials || '?'}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------- progress bar */

export function ProgressBar({
  percent,
  tone = 'success',
  label,
}: {
  percent: number;
  tone?: AdminTone;
  label?: string;
}) {
  const palette = toneStyles[tone];
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View accessibilityLabel={label ? `${label}: ${clamped}%` : `${clamped}%`}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${clamped}%`, backgroundColor: palette.foreground },
          ]}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ helpers */

export function Divider({ spaced = false }: { spaced?: boolean }) {
  return <View style={[styles.divider, spaced && styles.dividerSpaced]} />;
}

export function InlineNote({
  icon = 'information-circle-outline',
  tone = 'info',
  children,
}: {
  icon?: IconName;
  tone?: AdminTone;
  children: ReactNode;
}) {
  const palette = toneStyles[tone];
  return (
    <View
      accessibilityRole="text"
      style={[styles.note, { backgroundColor: palette.background, borderColor: palette.border }]}
    >
      <Ionicons name={icon} size={15} color={palette.foreground} />
      <Text style={[styles.noteText, { color: palette.foreground }]}>{children}</Text>
    </View>
  );
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: adminRadii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  pillLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: adminColors.surface,
    borderWidth: 1,
    borderColor: adminColors.border,
    borderRadius: adminRadii.md,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: adminType.body,
    color: adminColors.textPrimary,
    paddingVertical: 10,
  },
  searchClear: {
    padding: 2,
  },
  filterLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: adminRadii.full,
    borderWidth: 1,
    borderColor: adminColors.borderStrong,
    backgroundColor: adminColors.surface,
  },
  chipSelected: {
    backgroundColor: adminColors.primary,
    borderColor: adminColors.primary,
  },
  chipPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  chipLabel: {
    fontSize: adminType.small,
    fontWeight: '600',
    color: adminColors.textSecondary,
  },
  chipLabelSelected: {
    color: adminColors.textOnPrimary,
    fontWeight: '700',
  },
  fieldRow: {
    paddingVertical: 10,
  },
  fieldLabel: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  fieldValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  fieldValue: {
    flex: 1,
    fontSize: adminType.body,
    lineHeight: 20,
    color: adminColors.textPrimary,
    fontWeight: '600',
  },
  fieldValueMono: {
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 8,
    borderRadius: adminRadii.full,
    backgroundColor: adminColors.neutralBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: adminRadii.full,
  },
  divider: {
    height: 1,
    backgroundColor: adminColors.border,
  },
  dividerSpaced: {
    marginVertical: 12,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: adminRadii.sm,
    borderWidth: 1,
  },
  noteText: {
    flex: 1,
    fontSize: adminType.small,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: adminType.tiny,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});
