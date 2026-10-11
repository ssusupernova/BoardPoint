import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/theme';
import { styles } from './BrandHeader.styles';

/** Colors the mark needs; lets alternate palettes (e.g. landlord) reuse it. */
export type BrandPalette = {
  logoBackground: string;
  logoIcon: string;
  brand: string;
  subtitle: string;
};

type Props = {
  /** Small uppercase strap-line under the wordmark. */
  subtitle?: string;
  /** Optional trailing slot (e.g. a profile avatar). */
  trailing?: ReactNode;
  size?: 'md' | 'sm';
  /** Palette override; defaults to the global BoardPoint colors. */
  palette?: BrandPalette;
};

const SIZES = {
  md: { logo: 48, icon: 26, brand: 26, subtitle: 11, tracking: 1.6 },
  sm: { logo: 44, icon: 22, brand: 25, subtitle: 10, tracking: 1.4 },
} as const;

const DEFAULT_PALETTE: BrandPalette = {
  logoBackground: colors.primary,
  logoIcon: colors.onPrimary,
  brand: colors.textPrimary,
  subtitle: colors.textSecondary,
};

/** Shared BoardPoint wordmark: round logo, brand name and strap-line. */
export function BrandHeader({
  subtitle = 'RENTAL OPERATIONS, MAPPED',
  trailing,
  size = 'md',
  palette = DEFAULT_PALETTE,
}: Props) {
  const s = SIZES[size];

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View
          style={[
            styles.logo,
            {
              width: s.logo,
              height: s.logo,
              borderRadius: s.logo / 2,
              backgroundColor: palette.logoBackground,
            },
          ]}
          accessibilityElementsHidden
        >
          <Ionicons name="location" size={s.icon} color={palette.logoIcon} />
        </View>
        <View style={styles.copy}>
          <Text
            style={[styles.brand, { fontSize: s.brand, color: palette.brand }]}
            numberOfLines={1}
          >
            BoardPoint
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontSize: s.subtitle, letterSpacing: s.tracking, color: palette.subtitle },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}
