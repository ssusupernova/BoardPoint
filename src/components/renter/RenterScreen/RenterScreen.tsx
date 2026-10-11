import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ScreenContainer } from '@/components/common/ScreenContainer/ScreenContainer';
import {
  BottomNavigation,
  type RenterTab,
} from '@/components/navigation/BottomNavigation/BottomNavigation';
import { spacing } from '@/theme';

type Props = {
  active: RenterTab;
  children: ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renter tab scaffold: scrollable content above the shared fixed bottom
 * navigation. Every renter tab page renders through this so the chrome is
 * identical everywhere.
 */
export function RenterScreen({ active, children, scroll = true, contentContainerStyle }: Props) {
  return (
    <View style={styles.root}>
      <ScreenContainer
        scroll={scroll}
        contentContainerStyle={[{ paddingBottom: spacing.xl }, contentContainerStyle]}
      >
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
});
