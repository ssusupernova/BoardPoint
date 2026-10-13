/**
 * Chunked private key/value storage.
 *
 * The admin database (including document metadata) lives in SecureStore on
 * device and in localStorage on web. SecureStore caps a single value at ~2KB
 * on Android, so large documents are split into fixed-size chunks under one
 * logical key. Nothing here ever produces a URL — identity documents are only
 * reachable through the in-app, audited viewer.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1500;
const NAMESPACE = 'boardpoint.admin.';
const CHARTER_KEY = `${NAMESPACE}db.size`;

/** Kept in memory when secure storage is unavailable (e.g. simulators). */
const memoryFallback = new Map<string, string>();

let storageAvailable: boolean | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (storageAvailable !== null) return storageAvailable;
  if (Platform.OS === 'web') {
    storageAvailable = true;
    return true;
  }
  try {
    storageAvailable = await SecureStore.isAvailableAsync();
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

export async function readPrivateValue(key: string): Promise<string | null> {
  const fullKey = NAMESPACE + key;
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(fullKey) ?? memoryFallback.get(fullKey) ?? null;
    } catch {
      return memoryFallback.get(fullKey) ?? null;
    }
  }
  if (!(await canUseSecureStore())) return memoryFallback.get(fullKey) ?? null;

  try {
    const sizeRaw = await SecureStore.getItemAsync(`${fullKey}.size`);
    if (sizeRaw === null) return memoryFallback.get(fullKey) ?? null;
    const size = Number(sizeRaw);
    if (!Number.isFinite(size) || size <= 0) return null;
    const chunkCount = Math.ceil(size / CHUNK_SIZE);
    let value = '';
    for (let index = 0; index < chunkCount; index += 1) {
      const chunk = await SecureStore.getItemAsync(`${fullKey}.chunk.${index}`);
      if (chunk === null) return null;
      value += chunk;
    }
    return value;
  } catch {
    return memoryFallback.get(fullKey) ?? null;
  }
}

export async function writePrivateValue(key: string, value: string): Promise<void> {
  const fullKey = NAMESPACE + key;
  memoryFallback.set(fullKey, value);

  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(fullKey, value);
    } catch {
      // Memory fallback already holds the value for this session.
    }
    return;
  }
  if (!(await canUseSecureStore())) return;

  try {
    const previousRaw = await SecureStore.getItemAsync(`${fullKey}.size`);
    const previousChunks = previousRaw ? Math.ceil(Number(previousRaw) / CHUNK_SIZE) : 0;
    const nextChunks = Math.ceil(value.length / CHUNK_SIZE);

    for (let index = nextChunks; index < previousChunks; index += 1) {
      await SecureStore.deleteItemAsync(`${fullKey}.chunk.${index}`);
    }
    for (let index = 0; index < nextChunks; index += 1) {
      const chunk = value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${fullKey}.chunk.${index}`, chunk);
    }
    await SecureStore.setItemAsync(`${fullKey}.size`, String(value.length));
  } catch {
    // In-memory copy keeps the session working even if writes fail.
  }
}

export async function deletePrivateValue(key: string): Promise<void> {
  const fullKey = NAMESPACE + key;
  memoryFallback.delete(fullKey);
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.removeItem(fullKey);
    } catch {
      /* ignore */
    }
    return;
  }
  if (!(await canUseSecureStore())) return;
  try {
    const sizeRaw = await SecureStore.getItemAsync(`${fullKey}.size`);
    await SecureStore.deleteItemAsync(`${fullKey}.size`);
    if (sizeRaw) {
      const chunkCount = Math.ceil(Number(sizeRaw) / CHUNK_SIZE);
      for (let index = 0; index < chunkCount; index += 1) {
        await SecureStore.deleteItemAsync(`${fullKey}.chunk.${index}`);
      }
    }
    await SecureStore.deleteItemAsync(fullKey);
  } catch {
    /* ignore */
  }
}

export const PRIVATE_STORAGE_KEYS = {
  database: 'db',
  charter: CHARTER_KEY,
} as const;
