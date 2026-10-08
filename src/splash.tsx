import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import { useAuthSession } from '@/services/auth';

SplashScreen.preventAutoHideAsync();

type Props = {
  /** False until fonts are loaded (or failed to load). */
  fontsReady: boolean;
};

export function SplashScreenController({ fontsReady }: Props) {
  const { hydrated } = useAuthSession();

  useEffect(() => {
    if (!hydrated || !fontsReady) return;
    void SplashScreen.hideAsync();
  }, [hydrated, fontsReady]);

  return null;
}
