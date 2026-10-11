import type { ReactNode } from 'react';
import {
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './ScreenContainer.styles';

type Props = {
  children: ReactNode;
  /** When false the children render in a plain flex container (no scrolling). */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

/**
 * Standard full-screen scaffold: warm background, dark status bar, safe-area
 * aware padding and the centered 520px-max content column.
 */
export function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const padding = { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 };

  return (
    <View style={[styles.root, style]}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, padding, contentContainerStyle]}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, padding, contentContainerStyle]}>
          <View style={styles.inner}>{children}</View>
        </View>
      )}
    </View>
  );
}
