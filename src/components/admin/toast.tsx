import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adminColors, adminRadii, adminType, toneStyles, type AdminTone } from '@/theme/admin';
import type { IconName } from './primitives';

export interface ToastInput {
  tone: AdminTone;
  message: string;
}

interface ToastContextValue {
  show: (toast: ToastInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => undefined,
  success: () => undefined,
  error: () => undefined,
  info: () => undefined,
});

const TONE_ICONS: Record<AdminTone, IconName> = {
  success: 'checkmark-circle',
  danger: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
  primary: 'checkmark-circle',
  neutral: 'information-circle',
};

/**
 * Lightweight feedback banner for success / error states that follow an
 * action. Positioned above the bottom edge so it never covers the header.
 */
export function AdminToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastInput | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(16));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 16, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (input: ToastInput) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast(input);
      opacity.setValue(0);
      translateY.setValue(16);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, 4000);
    },
    [hide, opacity, translateY]
  );

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message: string) => show({ tone: 'success', message }),
      error: (message: string) => show({ tone: 'danger', message }),
      info: (message: string) => show({ tone: 'info', message }),
    }),
    [show]
  );

  const palette = toast ? toneStyles[toast.tone] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && palette ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            styles.toast,
            {
              bottom: insets.bottom + 20,
              backgroundColor: palette.background,
              borderColor: palette.border,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Ionicons name={TONE_ICONS[toast.tone]} size={18} color={palette.foreground} />
          <Text style={[styles.toastText, { color: palette.foreground }]} numberOfLines={3}>
            {toast.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useAdminToast(): ToastContextValue {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: adminRadii.md,
    borderWidth: 1,
    shadowColor: adminColors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    fontSize: adminType.small,
    fontWeight: '700',
    lineHeight: 18,
  },
});
