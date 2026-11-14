import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { routes } from '@/routes';
import { useUnreadCount } from '@/services/notifications';
import { colors } from '@/theme';
import { styles } from '@/components/navigation/BottomNavigation/BottomNavigation.styles';

export type LandlordTab = 'overview' | 'properties' | 'maintenance' | 'leases' | 'profile';

type TabConfig = {
  key: LandlordTab;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  activeIcon: ComponentProps<typeof Ionicons>['name'];
  route: Href;
};

const TABS: TabConfig[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: 'home-outline',
    activeIcon: 'home',
    route: routes.landlordDashboard as Href,
  },
  {
    key: 'properties',
    label: 'Properties',
    icon: 'business-outline',
    activeIcon: 'business',
    route: routes.landlordProperties as Href,
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: 'chatbubble-ellipses-outline',
    activeIcon: 'chatbubble-ellipses',
    route: routes.landlordMaintenance as Href,
  },
  {
    key: 'leases',
    label: 'Leases',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
    route: routes.landlordLeases as Href,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
    route: routes.landlordProfile as Href,
  },
];

type Props = {
  active: LandlordTab;
};

export function LandlordBottomBar({ active }: Props) {
  const insets = useSafeAreaInsets();
  const unread = useUnreadCount();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.primary : colors.textSecondary;
        const badgeCount = tab.key === 'maintenance' ? unread : 0;

        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (!isActive) router.replace(tab.route);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={
              badgeCount > 0 ? `${tab.label}, ${badgeCount} unread` : tab.label
            }
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
              {badgeCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </Text>
                </View>
              ) : null}
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
