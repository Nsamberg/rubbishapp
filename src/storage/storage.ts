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

// Cookies persist across iOS PWA sessions; localStorage does not.
function setCookie(name: string, value: string) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
}

const store = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return getCookie(key);
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') { setCookie(key, value); return; }
    return AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') { deleteCookie(key); return; }
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
