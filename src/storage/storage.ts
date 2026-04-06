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

export async function getSavedAddress(): Promise<SavedAddress | null> {
  const raw = await AsyncStorage.getItem(KEYS.SAVED_ADDRESS);
  if (!raw) return null;
  return JSON.parse(raw) as SavedAddress;
}

export async function setSavedAddress(address: SavedAddress): Promise<void> {
  await AsyncStorage.setItem(KEYS.SAVED_ADDRESS, JSON.stringify(address));
}

export async function clearSavedAddress(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SAVED_ADDRESS);
}

export async function getReminderPrefs(): Promise<ReminderPreferences> {
  const raw = await AsyncStorage.getItem(KEYS.REMINDER_PREFS);
  if (!raw) return DEFAULT_REMINDER_PREFS;
  return { ...DEFAULT_REMINDER_PREFS, ...JSON.parse(raw) } as ReminderPreferences;
}

export async function setReminderPrefs(prefs: ReminderPreferences): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER_PREFS, JSON.stringify(prefs));
}
