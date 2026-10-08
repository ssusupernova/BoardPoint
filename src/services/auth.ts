/**
 * BoardPoint authentication service.
 *
 * Local, on-device auth: accounts live in SecureStore (localStorage on web)
 * keyed per account, passwords are stored as salted SHA-256 digests, and the
 * signed-in session is held in a small observable store so screens and the
 * router guards can react to sign-in/out.
 *
 * To plug in a real backend (e.g. Supabase Auth):
 *   1. Create a client exported from `lib/supabase.ts`.
 *   2. Replace the body of signIn / signUp / signInWithGoogle / resetPassword
 *      with the matching `supabase.auth` call and keep returning an
 *      `AuthSession`.
 */

import { useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { storageGet, storageSet } from '@/services/storage';

export class AuthNotConfiguredError extends Error {
  constructor(feature: string) {
    super(
      `${feature} isn't connected yet. BoardPoint auth gets wired up here once the backend is configured.`
    );
    this.name = 'AuthNotConfiguredError';
  }
}

export interface SignInCredentials {
  /** Email address or display/username value entered in the identifier field. */
  identifier: string;
  password: string;
  /** Mirrors the "Remember me" checkbox; persists the session across restarts. */
  rememberMe: boolean;
}

export interface AuthSession {
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role?: 'renter' | 'landlord';
  };
}

export interface SignUpCredentials {
  fullName: string;
  /** Email address used to create the account. */
  email: string;
  password: string;
  role?: 'renter' | 'landlord';
}

export interface AuthState {
  session: AuthSession | null;
  /** False until the persisted session has been read from storage. */
  hydrated: boolean;
}

export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<AuthSession>;
  signInWithGoogle(): Promise<AuthSession>;
  signUp(credentials: SignUpCredentials): Promise<AuthSession>;
  resetPassword(identifier: string): Promise<void>;
  signOut(): Promise<void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  username: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  role?: 'renter' | 'landlord';
}

type AccountIndexEntry = Pick<StoredAccount, 'id' | 'email' | 'username'>;

/* ---------------------------------------------------------------- storage */

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

async function readAccount(id: string): Promise<StoredAccount | null> {
  const raw = await storageGet(`account.${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAccount;
  } catch {
    return null;
  }
}

async function loadAccounts(): Promise<StoredAccount[]> {
  const raw = await storageGet('accounts.index');
  if (!raw) return [];
  let index: AccountIndexEntry[];
  try {
    index = JSON.parse(raw) as AccountIndexEntry[];
  } catch {
    return [];
  }
  const accounts = await Promise.all(index.map((entry) => readAccount(entry.id)));
  return accounts.filter((account): account is StoredAccount => account !== null);
}

async function saveAccount(account: StoredAccount): Promise<void> {
  await storageSet(`account.${account.id}`, JSON.stringify(account));

  const raw = await storageGet('accounts.index');
  let index: AccountIndexEntry[] = [];
  if (raw) {
    try {
      index = JSON.parse(raw) as AccountIndexEntry[];
    } catch {
      index = [];
    }
  }
  index.push({ id: account.id, email: account.email, username: account.username });
  await storageSet('accounts.index', JSON.stringify(index));
}

/* ------------------------------------------------------------ store state */

let authState: AuthState = { session: null, hydrated: false };
const listeners = new Set<() => void>();

function setAuthState(next: AuthState): void {
  authState = next;
  for (const listener of listeners) listener();
}

function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthState(): AuthState {
  return authState;
}

export function useAuthSession(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);
}

function toSession(account: StoredAccount): AuthSession {
  return {
    user: {
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      username: account.username,
      role: account.role ?? 'renter',
    },
  };
}

async function restoreSession(): Promise<void> {
  let session: AuthSession | null = null;
  try {
    const raw = await storageGet('session');
    if (raw) session = JSON.parse(raw) as AuthSession;
  } catch {
    session = null;
  }
  setAuthState({ session: authState.session ?? session, hydrated: true });
}

void restoreSession();

/* --------------------------------------------------------------- service */

export const authService: AuthService = {
  async signIn({ identifier, password, rememberMe }) {
    const id = identifier.trim().toLowerCase();
    if (!id) throw new Error('Please enter your email or username.');
    if (!password) throw new Error('Please enter your password.');

    const accounts = await loadAccounts();
    const emailHits = accounts.filter((account) => account.email.toLowerCase() === id);
    const usernameHits = accounts.filter((account) => account.username.toLowerCase() === id);
    const hits = emailHits.length > 0 ? emailHits : usernameHits;

    if (hits.length === 0) {
      throw new Error("We couldn't find an account for that email or username.");
    }
    if (hits.length > 1) {
      throw new Error(
        'More than one account uses that username. Sign in with your email address instead.'
      );
    }

    const account = hits[0];
    const passwordHash = await hashPassword(password, account.salt);
    if (passwordHash !== account.passwordHash) {
      throw new Error('That password is incorrect. Please try again.');
    }

    const session = toSession(account);
    await storageSet('session', rememberMe ? JSON.stringify(session) : null);
    setAuthState({ session, hydrated: true });
    return session;
  },

  async signInWithGoogle() {
    throw new AuthNotConfiguredError('Google sign-in');
  },

  async signUp({ fullName, email, password, role }) {
    const name = fullName.trim();
    const mail = email.trim().toLowerCase();
    if (!name) throw new Error('Please enter your full name.');
    if (!EMAIL_PATTERN.test(mail)) throw new Error('Please enter a valid email address.');
    if (password.length < 8) {
      throw new Error('Your password must be at least 8 characters long.');
    }

    const accounts = await loadAccounts();
    if (accounts.some((account) => account.email.toLowerCase() === mail)) {
      throw new Error('An account with that email already exists. Try logging in instead.');
    }

    const salt = Crypto.randomUUID();
    const account: StoredAccount = {
      id: Crypto.randomUUID(),
      fullName: name,
      email: mail,
      username: mail.split('@')[0],
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
      role: role ?? 'renter',
    };
    await saveAccount(account);

    const session = toSession(account);
    await storageSet('session', JSON.stringify(session));
    setAuthState({ session, hydrated: true });
    return session;
  },

  async signOut() {
    await storageSet('session', null);
    setAuthState({ session: null, hydrated: true });
  },

  async resetPassword() {
    throw new AuthNotConfiguredError('Password recovery');
  },
};
