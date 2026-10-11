import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandHeader } from '@/components/common/BrandHeader/BrandHeader';
import { ProfileAvatar } from '@/components/common/ProfileAvatar/ProfileAvatar';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import {
  BottomNavigation,
  type RenterTab,
} from '@/components/navigation/BottomNavigation/BottomNavigation';
import { routes } from '@/routes';
import { useAuthSession } from '@/services/auth';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  active: RenterTab;
  /** Screen heading under the brand header. */
  title?: string;
  /** Supporting line under the title. */
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renter tab scaffold: the shared brand header (wordmark + profile avatar), an
 * optional title block, scrollable content and the fixed bottom navigation.
 * Every renter tab renders through this so the chrome is identical everywhere.
 */
export function RenterScreen({
  active,
  title,
  subtitle,
  children,
  scroll = true,
  contentContainerStyle,
}: Props) {
  const router = useRouter();
  const { session } = useAuthSession();

  return (
    <View style={styles.root}>
      <ScreenContainer
        scroll={scroll}
        contentContainerStyle={[{ paddingBottom: spacing.xl }, contentContainerStyle]}
      >
        <BrandHeader
          subtitle="RENTAL ACCOUNT"
          trailing={
            session ? (
              <ProfileAvatar
                name={session.user.fullName}
                onPress={() => router.push(routes.renterProfile)}
                accessibilityLabel="Open your profile"
              />
            ) : undefined
          }
        />
        {title ? (
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScreenContainer>
      <BottomNavigation active={active} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  titleBlock: {
    marginTop: spacing.xl,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
