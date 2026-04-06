import { getSavedAddress, setSavedAddress, clearSavedAddress, getReminderPrefs, setReminderPrefs } from '../src/storage/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tests run with Platform.OS = 'ios' (see mock), so AsyncStorage is used.
beforeEach(() => {
  jest.clearAllMocks();
});

describe('address storage', () => {
  const address = { displayName: '112 Midhurst Road', uprn: '12068516', councilId: 'ealing' as const };

  it('saves and retrieves an address', async () => {
    await setSavedAddress(address);
    const result = await getSavedAddress();
    expect(result).toEqual(address);
  });

  it('returns null when no address is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await getSavedAddress();
    expect(result).toBeNull();
  });

  it('clears the saved address', async () => {
    await setSavedAddress(address);
    await clearSavedAddress();
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });
});

describe('reminder preferences', () => {
  it('returns defaults when nothing is stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const prefs = await getReminderPrefs();
    expect(prefs.enabled).toBe(true);
    expect(prefs.hoursBefore).toBe(6);
    expect(prefs.enabledBinTypes).toContain('black');
    expect(prefs.enabledBinTypes).toContain('blue');
    expect(prefs.enabledBinTypes).toContain('food');
  });

  it('saves and retrieves preferences', async () => {
    const prefs = { enabled: false, hoursBefore: 24, enabledBinTypes: ['black' as const] };
    await setReminderPrefs(prefs);
    const result = await getReminderPrefs();
    expect(result.enabled).toBe(false);
    expect(result.hoursBefore).toBe(24);
    expect(result.enabledBinTypes).toEqual(['black']);
  });
});
