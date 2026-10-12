import { Stack } from 'expo-router';
import { AdminHeader, AdminNavProvider } from '@/components/admin/nav';
import { AdminToastProvider } from '@/components/admin/toast';
import { adminColors } from '@/theme/admin';

/**
 * Admin shell: a stack of module screens wrapped in the drawer navigation and
 * a toast host for success/error feedback after administrative actions.
 */
export default function AdminLayout() {
  return (
    <AdminToastProvider>
      <AdminNavProvider>
        <Stack
          screenOptions={{
            header: (props) => <AdminHeader navigation={props.navigation} />,
            contentStyle: { backgroundColor: adminColors.background },
            headerShadowVisible: false,
          }}
        />
      </AdminNavProvider>
    </AdminToastProvider>
  );
}
