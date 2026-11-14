import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!configuredSupabaseUrl || !supabaseKey) {
  throw new Error(
    "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before starting BoardPoint.",
  );
}

let parsedSupabaseUrl: URL;
try {
  parsedSupabaseUrl = new URL(configuredSupabaseUrl);
} catch {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL must be a valid absolute URL.');
}
const normalizedPath = parsedSupabaseUrl.pathname.replace(/\/+$/, '');
if (normalizedPath === '/rest/v1') {
  console.warn(
    'EXPO_PUBLIC_SUPABASE_URL should be the project root, not the REST endpoint. Removing /rest/v1.',
  );
  parsedSupabaseUrl.pathname = '';
} else if (normalizedPath !== '') {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL must be the Supabase project root URL (without an API path).',
  );
}
if (
  parsedSupabaseUrl.search
  || parsedSupabaseUrl.hash
  || parsedSupabaseUrl.username
  || parsedSupabaseUrl.password
) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL must not contain credentials, a query, or a fragment.',
  );
}
const supabaseUrl = parsedSupabaseUrl.origin;

let persistAuthSession = true;
const transientSessions = new Map<string, string>();

const authStorage = {
  async getItem(key: string) {
    if (!persistAuthSession) return transientSessions.get(key) ?? null;
    return (await AsyncStorage.getItem(key)) ?? transientSessions.get(key) ?? null;
  },
  async setItem(key: string, value: string) {
    if (persistAuthSession) {
      await AsyncStorage.setItem(key, value);
    } else {
      transientSessions.set(key, value);
    }
  },
  async removeItem(key: string) {
    transientSessions.delete(key);
    await AsyncStorage.removeItem(key);
  },
};

export function setAuthPersistence(rememberMe: boolean): void {
  persistAuthSession = rememberMe;
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
