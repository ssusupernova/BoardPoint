import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Animated, BackHandler, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname, type Href } from 'expo-router';
import { authService } from '@/services/auth';
import { routes } from '@/routes';
import {
  openApplications,
  unreadNotificationCount,
  useAdminActor,
  useAdminStore,
} from '@/services/admin';
import { adminColors, adminRadii, adminType, cardShadow } from '@/theme/admin';
import { Avatar, type IconName } from './primitives';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: 'verification' | 'reports' | 'notifications';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: 'grid-outline' },
  { href: '/admin/verification', label: 'Landlord Verification', icon: 'shield-checkmark-outline', badge: 'verification' },
  { href: '/admin/accounts', label: 'Landlord Accounts', icon: 'people-outline' },
  { href: '/admin/moderation', label: 'Property Moderation', icon: 'business-outline' },
  { href: '/admin/reports', label: 'Reports & Complaints', icon: 'flag-outline', badge: 'reports' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: 'time-outline' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'notifications-outline', badge: 'notifications' },
  { href: '/admin/settings', label: 'Admin Settings', icon: 'settings-outline' },
];

const TITLES: { match: string; title: string }[] = [
  { match: '/admin/verification/', title: 'Application review' },
  { match: '/admin/accounts/', title: 'Landlord account' },
  { match: '/admin/moderation/', title: 'Listing review' },
  { match: '/admin/reports/', title: 'Report case' },
  { match: '/admin/verification', title: 'Landlord Verification' },
  { match: '/admin/accounts', title: 'Landlord Accounts' },
  { match: '/admin/moderation', title: 'Property Moderation' },
  { match: '/admin/reports', title: 'Reports & Complaints' },
  { match: '/admin/audit-logs', title: 'Audit Logs' },
  { match: '/admin/analytics', title: 'Analytics' },
  { match: '/admin/notifications', title: 'Notifications' },
  { match: '/admin/settings', title: 'Admin Settings' },
  { match: '/admin', title: 'Admin Dashboard' },
];

export function titleForPath(pathname: string): string {
  const match = TITLES.find((entry) => pathname === entry.match || pathname.startsWith(`${entry.match}/`));
  return match?.title ?? 'BoardPoint Admin';
}

interface AdminNavContextValue {
  openDrawer: () => void;
}

const AdminNavContext = createContext<AdminNavContextValue>({ openDrawer: () => undefined });

export function useAdminNav(): AdminNavContextValue {
  return useContext(AdminNavContext);
}

interface HeaderNavigation {
  goBack: () => void;
  canGoBack: () => boolean;
}

/**
 * Custom stack header: menu (drawer) on the left, back arrow when the screen
 * is a detail view, module title in the middle and the notification bell —
 * with its unread badge — on the right.
 */
export function AdminHeader({ navigation }: { navigation: HeaderNavigation }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { openDrawer } = useAdminNav();
  const { db } = useAdminStore();
  const unread = db ? unreadNotificationCount(db) : 0;
  const canGoBack = navigation.canGoBack();

  const goBack = () => {
    if (canGoBack) navigation.goBack();
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerSide}>
        {canGoBack ? (
          <Pressable
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          >
            <Ionicons name="arrow-back" size={21} color={adminColors.darkBrown} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={openDrawer}
          accessibilityRole="button"
          accessibilityLabel="Open admin navigation menu"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Ionicons name="menu" size={22} color={adminColors.darkBrown} />
        </Pressable>
      </View>

      <View style={styles.headerTitleWrap} accessibilityRole="header">
        <Text style={styles.headerTitle} numberOfLines={1}>
          {titleForPath(pathname)}
        </Text>
        <Text style={styles.headerBrand} numberOfLines={1}>
          BoardPoint Admin
        </Text>
      </View>

      <Pressable
        onPress={() => router.push(routes.adminNotifications)}
        accessibilityRole="button"
        accessibilityLabel={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications, none unread'
        }
        hitSlop={8}
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
      >
        <Ionicons name="notifications-outline" size={21} color={adminColors.darkBrown} />
        {unread > 0 ? (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeLabel}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------- drawer */

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { db } = useAdminStore();
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);
  const width = Dimensions.get('window').width;
  const panelWidth = Math.min(320, Math.round(width * 0.86));

  const [translateX] = useState(() => new Animated.Value(-panelWidth));
  const [backdrop] = useState(() => new Animated.Value(0));

  const badges = useMemo(() => {
    if (!db) return { verification: 0, reports: 0, notifications: 0 };
    return {
      verification: openApplications(db).length,
      reports: db.reports.filter((report) => report.status === 'open').length,
      notifications: unreadNotificationCount(db),
    };
  }, [db]);

  const openDrawer = useCallback(() => {
    setRendered(true);
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    if (!rendered) return;
    setOpen(false);
    Animated.parallel([
      Animated.timing(translateX, { toValue: -panelWidth, duration: 200, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [backdrop, panelWidth, rendered, translateX]);

  useEffect(() => {
    if (!rendered || !open) return;
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [backdrop, open, rendered, translateX]);

  useEffect(() => {
    if (!rendered) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => subscription.remove();
  }, [closeDrawer, rendered]);

  const navigate = useCallback(
    (href: string) => {
      closeDrawer();
      setTimeout(() => {
        if (href === pathname) return;
        router.push(href as unknown as Href);
      }, 180);
    },
    [closeDrawer, pathname]
  );

  const handleSignOut = useCallback(async () => {
    closeDrawer();
    await authService.signOut();
    router.replace(routes.signIn);
  }, [closeDrawer]);

  const value = useMemo<AdminNavContextValue>(() => ({ openDrawer }), [openDrawer]);

  return (
    <AdminNavContext.Provider value={value}>
      <View style={styles.shell}>
        {children}

        {rendered ? (
          <>
            <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
              <Pressable
                onPress={closeDrawer}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            <Animated.View
              style={[styles.drawer, { width: panelWidth, transform: [{ translateX }] }]}
              accessibilityViewIsModal
            >
              <View style={[styles.drawerHeader, { paddingTop: insets.top + 16 }]}>
                <View style={styles.drawerBrandRow}>
                  <View style={styles.drawerLogo}>
                    <Ionicons name="location" size={20} color={adminColors.textInverse} />
                  </View>
                  <View style={styles.drawerBrandCopy}>
                    <Text style={styles.drawerBrand}>BoardPoint</Text>
                    <Text style={styles.drawerBrandSub}>ADMIN PANEL</Text>
                  </View>
                </View>

                {db ? <SignedInAdmin /> : null}
              </View>

              <ScrollView
                style={styles.drawerList}
                contentContainerStyle={styles.drawerListContent}
                showsVerticalScrollIndicator={false}
              >
                {NAV_ITEMS.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const badgeValue = item.badge ? badges[item.badge] : 0;
                  return (
                    <Pressable
                      key={item.href}
                      onPress={() => navigate(item.href)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        badgeValue > 0 ? `${item.label}, ${badgeValue} need attention` : item.label
                      }
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.drawerItem,
                        active && styles.drawerItemActive,
                        pressed && !active && styles.drawerItemPressed,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={active ? adminColors.textOnPrimary : adminColors.darkBrown}
                      />
                      <Text
                        style={[styles.drawerItemLabel, active && styles.drawerItemLabelActive]}
                        numberOfLines={2}
                      >
                        {item.label}
                      </Text>
                      {badgeValue > 0 ? (
                        <View
                          style={[
                            styles.drawerBadge,
                            active && styles.drawerBadgeActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.drawerBadgeLabel,
                              active && styles.drawerBadgeLabelActive,
                            ]}
                          >
                            {badgeValue > 99 ? '99+' : badgeValue}
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 14 }]}>
                <Pressable
                  onPress={() => void handleSignOut()}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out of the admin panel"
                  style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
                >
                  <Ionicons name="log-out-outline" size={18} color={adminColors.darkBrown} />
                  <Text style={styles.signOutLabel}>Sign out</Text>
                </Pressable>
              </View>
            </Animated.View>
          </>
        ) : null}
      </View>
    </AdminNavContext.Provider>
  );
}

function SignedInAdmin() {
  const admin = useAdminActor();
  if (!admin) return null;

  return (
    <View style={styles.drawerAdmin}>
      <Avatar name={admin.fullName} size={38} />
      <View style={styles.drawerAdminCopy}>
        <Text style={styles.drawerAdminName} numberOfLines={1}>
          {admin.fullName}
        </Text>
        <Text style={styles.drawerAdminRole} numberOfLines={1}>
          Super admin · {admin.title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: adminColors.background,
  },
  header: {
    backgroundColor: adminColors.cream,
    borderBottomWidth: 1,
    borderBottomColor: '#EBCBA8',
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: adminRadii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(74, 52, 37, 0.08)',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: adminType.subheading,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.2,
  },
  headerBrand: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: adminColors.textSecondary,
    textTransform: 'uppercase',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 5,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: adminColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: adminColors.textInverse,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: adminColors.overlay,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: adminColors.surface,
    borderRightWidth: 1,
    borderRightColor: adminColors.border,
    shadowColor: adminColors.shadow,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 12,
  },
  drawerHeader: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: adminColors.cream,
    borderBottomWidth: 1,
    borderBottomColor: '#EBCBA8',
    gap: 16,
  },
  drawerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerLogo: {
    width: 40,
    height: 40,
    borderRadius: adminRadii.full,
    backgroundColor: adminColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBrandCopy: {
    flex: 1,
  },
  drawerBrand: {
    fontSize: 19,
    fontWeight: '800',
    color: adminColors.darkBrown,
    letterSpacing: -0.3,
  },
  drawerBrandSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: adminColors.textSecondary,
  },
  drawerAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: adminColors.surface,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    padding: 10,
  },
  drawerAdminCopy: {
    flex: 1,
  },
  drawerAdminName: {
    fontSize: adminType.body,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  drawerAdminRole: {
    fontSize: adminType.tiny,
    color: adminColors.textSecondary,
    fontWeight: '600',
  },
  drawerList: {
    flex: 1,
  },
  drawerListContent: {
    padding: 12,
    gap: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  drawerItemActive: {
    backgroundColor: adminColors.primary,
    borderColor: adminColors.primary,
    ...cardShadow,
  },
  drawerItemPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: adminType.body,
    fontWeight: '700',
    color: adminColors.darkBrown,
  },
  drawerItemLabelActive: {
    color: adminColors.textOnPrimary,
  },
  drawerBadge: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: adminRadii.full,
    backgroundColor: adminColors.cream,
    borderWidth: 1,
    borderColor: '#EBCBA8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBadgeActive: {
    backgroundColor: adminColors.surface,
    borderColor: adminColors.surface,
  },
  drawerBadgeLabel: {
    fontSize: adminType.tiny,
    fontWeight: '800',
    color: adminColors.darkBrown,
  },
  drawerBadgeLabelActive: {
    color: adminColors.textOnPrimary,
  },
  drawerFooter: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: adminColors.border,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    borderColor: adminColors.borderStrong,
    backgroundColor: adminColors.surface,
  },
  signOutPressed: {
    backgroundColor: adminColors.surfacePressed,
  },
  signOutLabel: {
    fontSize: adminType.body,
    fontWeight: '700',
    color: adminColors.darkBrown,
  },
});

/** Routes the drawer highlights for detail screens. */
export const DRAWER_NAV_ITEMS = NAV_ITEMS;
