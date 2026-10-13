import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { routes } from '@/routes';
import { styles, LANDLORD_THEME } from '@/styles/landlord';

export type LandlordTab = 'overview' | 'properties' | 'maintenance' | 'leases' | 'profile';

type TabConfig = {
  key: LandlordTab;
  label: string;
  route: Href;
  renderIcon: (isActive: boolean) => React.ReactNode;
};

const TABS: TabConfig[] = [
  {
    key: 'overview',
    label: 'Overview',
    route: routes.landlordDashboard as Href,
    renderIcon: (isActive) =>
      isActive ? (
        <View style={styles.activeCircleIndicator}>
          <View style={styles.activeInnerDot} />
        </View>
      ) : (
        <View style={styles.inactiveCircle} />
      ),
  },
  {
    key: 'properties',
    label: 'Properties',
    route: routes.landlordProperties as Href,
    renderIcon: (isActive) =>
      isActive ? (
        <View style={styles.activeCircleIndicator}>
          <View style={styles.activeInnerDot} />
        </View>
      ) : (
        <View style={styles.inactiveCircle} />
      ),
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    route: routes.landlordMaintenance as Href,
    renderIcon: (isActive) => (
      <Ionicons
        name={isActive ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
        size={18}
        color={isActive ? LANDLORD_THEME.primary : LANDLORD_THEME.tabInactive}
      />
    ),
  },
  {
    key: 'leases',
    label: 'Leases',
    route: routes.landlordLeases as Href,
    renderIcon: (isActive) => (
      <Ionicons
        name={isActive ? 'document-text' : 'document-text-outline'}
        size={18}
        color={isActive ? LANDLORD_THEME.primary : LANDLORD_THEME.tabInactive}
      />
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    route: routes.landlordProfile as Href,
    renderIcon: (isActive) =>
      isActive ? (
        <View style={styles.activeCircleIndicator}>
          <View style={styles.activeInnerDot} />
        </View>
      ) : (
        <View style={styles.inactiveCircle} />
      ),
  },
];

type Props = {
  active: LandlordTab;
};

export function LandlordBottomBar({ active }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={() => {
              if (!isActive) {
                router.replace(tab.route);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <View style={styles.tabIconWrap}>{tab.renderIcon(isActive)}</View>
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
