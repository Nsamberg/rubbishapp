import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { BinType, ReminderPreferences } from '../../src/api/types';
import { useCollections } from '../../src/hooks/useCollections';
import { useNotifications } from '../../src/hooks/useNotifications';
import { clearSavedAddress, getReminderPrefs, getSavedAddress, setReminderPrefs } from '../../src/storage/storage';
import { BIN_CONFIG } from '../../src/utils/binColors';

const BIN_TYPES: BinType[] = ['black', 'blue', 'food'];

const REMINDER_OPTIONS = [
  { label: 'Night before (6 PM)', hours: 6 },
  { label: 'Evening before (8 PM)', hours: 4 },
  { label: '24 hours before', hours: 24 },
  { label: '48 hours before', hours: 48 },
];

export default function SettingsScreen() {
  const [address, setAddress] = useState<{ displayName: string } | null>(null);
  const [prefs, setPrefs] = useState<ReminderPreferences>({
    enabled: true,
    hoursBefore: 6,
    enabledBinTypes: ['black', 'blue', 'food'],
  });
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const { collections } = useCollections();
  const { scheduleAll } = useNotifications();

  const loadData = useCallback(async () => {
    const [savedAddress, savedPrefs] = await Promise.all([
      getSavedAddress(),
      getReminderPrefs(),
    ]);
    setAddress(savedAddress);
    setPrefs(savedPrefs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const showBanner = () => {
    setSavedBanner(true);
    Animated.sequence([
      Animated.timing(bannerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(bannerOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setSavedBanner(false));
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      await setReminderPrefs(prefs);
      await scheduleAll(collections, prefs);
      showBanner();
    } catch {
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAddress = () => {
    Alert.alert(
      'Change address',
      'This will remove your saved address and take you back to the setup screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            await clearSavedAddress();
            router.replace('/onboarding/postcode');
          },
        },
      ]
    );
  };

  const toggleBinType = (binType: BinType) => {
    setPrefs((prev) => {
      const enabled = prev.enabledBinTypes.includes(binType)
        ? prev.enabledBinTypes.filter((t) => t !== binType)
        : [...prev.enabledBinTypes, binType];
      return { ...prev, enabledBinTypes: enabled };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Settings</Text>

        {savedBanner && (
          <Animated.View style={[styles.savedBanner, { opacity: bannerOpacity }]}>
            <Text style={styles.savedBannerText}>✓ Settings saved</Text>
          </Animated.View>
        )}

        {/* Address section */}
        <Text style={styles.sectionTitle}>Your address</Text>
        <View style={styles.card}>
          <Text style={styles.addressText}>
            {address?.displayName ?? 'No address saved'}
          </Text>
          <Pressable style={styles.changeButton} onPress={handleChangeAddress}>
            <Text style={styles.changeButtonText}>Change address</Text>
          </Pressable>
        </View>

        {/* Reminders section */}
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Enable reminders</Text>
            <Switch
              value={prefs.enabled}
              onValueChange={(v) => setPrefs((p) => ({ ...p, enabled: v }))}
              trackColor={{ true: '#1a4fa8' }}
            />
          </View>
        </View>

        {prefs.enabled && (
          <>
            <Text style={styles.sectionTitle}>Remind me</Text>
            <View style={styles.card}>
              {REMINDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.hours}
                  style={styles.row}
                  onPress={() => setPrefs((p) => ({ ...p, hoursBefore: opt.hours }))}
                >
                  <Text style={styles.rowLabel}>{opt.label}</Text>
                  <View
                    style={[
                      styles.radio,
                      prefs.hoursBefore === opt.hours && styles.radioSelected,
                    ]}
                  >
                    {prefs.hoursBefore === opt.hours && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Remind me for</Text>
            <View style={styles.card}>
              {BIN_TYPES.map((binType) => {
                const config = BIN_CONFIG[binType];
                return (
                  <View key={binType} style={styles.row}>
                    <View style={styles.binRow}>
                      <View
                        style={[
                          styles.binDot,
                          { backgroundColor: config.backgroundColor },
                        ]}
                      >
                        <Text style={styles.binDotEmoji}>{config.emoji}</Text>
                      </View>
                      <Text style={styles.rowLabel}>{config.label}</Text>
                    </View>
                    <Switch
                      value={prefs.enabledBinTypes.includes(binType)}
                      onValueChange={() => toggleBinType(binType)}
                      trackColor={{ true: config.backgroundColor }}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSavePrefs}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Save reminder settings'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  rowLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  binRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  binDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  binDotEmoji: {
    fontSize: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#1a4fa8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a4fa8',
  },
  addressText: {
    fontSize: 15,
    color: '#1a1a1a',
    padding: 16,
    paddingBottom: 8,
    lineHeight: 22,
  },
  changeButton: {
    padding: 16,
    paddingTop: 8,
  },
  changeButtonText: {
    fontSize: 15,
    color: '#c0392b',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#1a4fa8',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  savedBanner: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  savedBannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
