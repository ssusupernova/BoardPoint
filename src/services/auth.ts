import { useSyncExternalStore } from 'react';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { setAuthPersistence, supabase } from '@/backend/config/supabase';

export type UserRole = 'user' | 'renter' | 'landlord' | 'super_admin';

export class AuthNotConfiguredError extends Error {
  constructor(feature: string) {
    super(`${feature} isn't configured in Supabase yet.`);
    this.name = 'AuthNotConfiguredError';
  }
}

export interface SignInCredentials {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthSession {
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

export interface SignUpCredentials {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role?: 'renter' | 'landlord';
}

export interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
  error: string | null;
}

export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<AuthSession>;
  signInWithGoogle(): Promise<AuthSession>;
  signUp(credentials: SignUpCredentials): Promise<AuthSession | null>;
  resetPassword(identifier: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(updates: { fullName?: string }): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  updateEmail(newEmail: string, currentPassword: string): Promise<void>;
}

interface ProfileRow {
  role: 'renter' | 'landlord' | 'super_admin';
  full_name: string;
  username: string | null;
  account_status: 'active' | 'suspended' | 'deactivated';
}

interface UsernameAuthResponse {
  session?: {
    access_token: string;
    refresh_token: string;
  };
  ok?: boolean;
}

let authState: AuthState = { session: null, hydrated: false, error: null };
let authRevision = 0;
const listeners = new Set<() => void>();

function setAuthState(next: AuthState): void {
  authState = next;
  for (const listener of listeners) listener();
}

function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuthState(): AuthState {
  return authState;
}

export function useAuthSession(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);
}

async function toBoardPointSession(session: SupabaseSession): Promise<AuthSession> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name, username, account_status')
    .eq('id', session.user.id)
    .single<ProfileRow>();

  if (error) throw new Error(`Couldn't load your BoardPoint profile: ${error.message}`);
  if (!data) throw new Error("Couldn't load your BoardPoint profile.");
  if (data.account_status !== 'active') {
    throw new Error('This account is not active. Contact BoardPoint support.');
  }
  if (!session.user.email) {
    throw new Error('The signed-in account does not have a verified email address.');
  }

  return {
    user: {
      id: session.user.id,
      fullName: data.full_name,
      email: session.user.email,
      username: data.username ?? '',
      role: data.role,
    },
  };
}

async function syncAuthState(session: SupabaseSession | null): Promise<void> {
  const revision = ++authRevision;
  if (!session) {
    setAuthState({ session: null, hydrated: true, error: null });
    return;
  }

  try {
    const boardPointSession = await toBoardPointSession(session);
    if (revision === authRevision) {
      setAuthState({ session: boardPointSession, hydrated: true, error: null });
    }
  } catch (error) {
    if (revision !== authRevision) return;
    const message = error instanceof Error ? error.message : 'Unable to load your profile.';
    console.error('Unable to restore the Supabase session:', error);
    setAuthState({ session: null, hydrated: true, error: message });
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  void Promise.resolve().then(() => syncAuthState(session));
});

void supabase.auth
  .getSession()
  .then(({ data, error }) => {
    if (error) throw error;
    return syncAuthState(data.session);
  })
  .catch((error: unknown) => {
    console.error('Unable to restore the Supabase session:', error);
    setAuthState({
      session: null,
      hydrated: true,
      error: error instanceof Error ? error.message : 'Unable to restore your session.',
    });
  });

async function signInWithUsername(username: string, password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<UsernameAuthResponse>(
    'username-auth',
    { body: { action: 'sign_in', username, password } },
  );
  if (error || !data?.session) {
    throw new Error('Invalid username or password.');
  }

  const { error: sessionError } = await supabase.auth.setSession(data.session);
  if (sessionError) throw sessionError;
}

export const authService: AuthService = {
  async signIn({ identifier, password, rememberMe }) {
    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) throw new Error('Please enter your email or username.');
    if (!password) throw new Error('Please enter your password.');

    await supabase.auth.signOut();
    setAuthPersistence(rememberMe);

    if (normalizedIdentifier.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedIdentifier.toLowerCase(),
        password,
      });
      if (error) throw error;
    } else {
      await signInWithUsername(normalizedIdentifier, password);
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw new Error('Sign-in did not establish a session.');

    const session = await toBoardPointSession(data.session);
    setAuthState({ session, hydrated: true, error: null });
    return session;
  },

  async signInWithGoogle() {
    throw new AuthNotConfiguredError('Google sign-in');
  },

  async signUp({ fullName, username, email, password, role = 'renter' }) {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
      throw new Error('Username must be 3-30 characters using letters, numbers, dots, underscores, or hyphens.');
    }

    setAuthPersistence(true);
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: normalizedUsername,
          role,
        },
      },
    });
    if (error) throw error;
    if (!data.session) return null;

    const session = await toBoardPointSession(data.session);
    setAuthState({ session, hydrated: true, error: null });
    return session;
  },

  async resetPassword(identifier) {
    const { error } = await supabase.functions.invoke<UsernameAuthResponse>(
      'username-auth',
      { body: { action: 'request_password_reset', identifier: identifier.trim() } },
    );
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAuthState({ session: null, hydrated: true, error: null });
  },

  async updateProfile({ fullName }) {
    if (!fullName) return;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error('You are signed out. Please sign in again.');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', userData.user.id);
    if (error) throw error;

    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    await syncAuthState(data.session);
  },

  async changePassword(currentPassword, newPassword) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const email = userData.user?.email;
    if (!email) throw new Error('You are signed out. Please sign in again.');

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verificationError) throw new Error('Your current password is incorrect.');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async updateEmail(newEmail, currentPassword) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const email = userData.user?.email;
    if (!email) throw new Error('You are signed out. Please sign in again.');

    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (verificationError) throw new Error('Your password is incorrect.');

    const { error } = await supabase.auth.updateUser({ email: newEmail.trim().toLowerCase() });
    if (error) throw error;
  },
};
