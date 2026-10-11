import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { routes } from '@/routes';
import { colors } from '@/theme';
import { styles } from './BottomNavigation.styles';

export type RenterTab = 'home' | 'saved' | 'alerts' | 'payments' | 'profile';

type TabConfig = {
  key: RenterTab;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  activeIcon: ComponentProps<typeof Ionicons>['name'];
  route: Href;
};

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: routes.renterDashboard as Href },
  { key: 'saved', label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark', route: routes.renterSaved as Href },
  { key: 'alerts', label: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications', route: routes.renterAlerts as Href },
  { key: 'payments', label: 'Payments', icon: 'card-outline', activeIcon: 'card', route: routes.renterPayments as Href },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: routes.renterProfile as Href },
];

type Props = {
  active: RenterTab;
};

/**
 * Shared fixed bottom navigation for the renter area. Sits below the scroll
 * content (never overlaps it) and respects the device safe area.
 */
export function BottomNavigation({ active }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.primary : colors.textSecondary;

        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (!isActive) router.replace(tab.route);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            </View>
            <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
