import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BinType, ReminderPreferences, SavedAddress } from '../api/types';

const KEYS = {
  SAVED_ADDRESS: '@rubbishapp/saved_address',
  REMINDER_PREFS: '@rubbishapp/reminder_prefs',
} as const;

const DEFAULT_REMINDER_PREFS: ReminderPreferences = {
  enabled: true,
  hoursBefore: 6,
  enabledBinTypes: ['black', 'blue', 'food'] as BinType[],
};

// On web, AsyncStorage doesn't persist reliably — use localStorage directly.
const store = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
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
