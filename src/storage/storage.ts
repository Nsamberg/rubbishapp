import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BinType, ReminderPreferences, SavedAddress } from '../api/types';

const KEYS = {
  SAVED_ADDRESS: 'rubbishapp_saved_address',
  REMINDER_PREFS: 'rubbishapp_reminder_prefs',
} as const;

const DEFAULT_REMINDER_PREFS: ReminderPreferences = {
  enabled: true,
  hoursBefore: 6,
  enabledBinTypes: ['black', 'blue', 'food'] as BinType[],
};

// IndexedDB is the most persistent storage on iOS standalone PWA.
// localStorage and cookies can be cleared when the app is closed.
const IDB_NAME = 'rubbishapp';
const IDB_STORE = 'keyval';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const store = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return idbGet(key);
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') return idbSet(key, value);
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') return idbDelete(key);
    return AsyncStorage.removeItem(key);
  },
};

export async function getSavedAddress(): Promise<SavedAddress | null> {
  const raw = await store.getItem(KEYS.SAVED_ADDRESS);
  if (!raw) return null;
  return JSON.parse(raw) as SavedAddress;
}

export async function setSavedAddress(address: SavedAddress): Promise<void> {
  await store.setItem(KEYS.SAVED_ADDRESS, JSON.stringify(address));
}

export async function clearSavedAddress(): Promise<void> {
  await store.removeItem(KEYS.SAVED_ADDRESS);
}

export async function getReminderPrefs(): Promise<ReminderPreferences> {
  const raw = await store.getItem(KEYS.REMINDER_PREFS);
  if (!raw) return DEFAULT_REMINDER_PREFS;
  return { ...DEFAULT_REMINDER_PREFS, ...JSON.parse(raw) } as ReminderPreferences;
}

export async function setReminderPrefs(prefs: ReminderPreferences): Promise<void> {
  await store.setItem(KEYS.REMINDER_PREFS, JSON.stringify(prefs));
}
