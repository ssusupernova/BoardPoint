import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_PREFIX = 'boardpoint.';

export async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_PREFIX + key);
    }
    return await SecureStore.getItemAsync(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

export async function storageSet(key: string, value: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (value === null) {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } else {
        localStorage.setItem(STORAGE_PREFIX + key, value);
      }
      return;
    }
    if (value === null) {
      await SecureStore.deleteItemAsync(STORAGE_PREFIX + key);
    } else {
      await SecureStore.setItemAsync(STORAGE_PREFIX + key, value);
    }
  } catch {
    // Best effort: a failed write only drops persistence, not the running session.
  }
}
