import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { getCouncil } from '../../src/api/council';
import { AddressResult } from '../../src/api/types';

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export default function PostcodeScreen() {
  const [postcode, setPostcode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    const trimmed = postcode.trim();
    if (!UK_POSTCODE_REGEX.test(trimmed)) {
      Alert.alert('Invalid postcode', 'Please enter a valid UK postcode, e.g. W13 9TP');
      return;
    }

    setLoading(true);
    try {
      const council = getCouncil('ealing');
      const addresses: AddressResult[] = await council.getAddresses(trimmed);
      if (addresses.length === 0) {
        Alert.alert('No addresses found', 'No addresses were found for this postcode. Please check and try again.');
        return;
      }
      router.push({
        pathname: '/onboarding/select-address',
        params: { addresses: JSON.stringify(addresses), postcode: trimmed },
      });
    } catch {
      Alert.alert('Error', 'Could not look up addresses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🗑️</Text>
        <Text style={styles.title}>Rubbish Collection</Text>
        <Text style={styles.subtitle}>
          Enter your postcode to find your bin collection days
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. W13 9TP"
          placeholderTextColor="#999"
          value={postcode}
          onChangeText={(text) => setPostcode(text.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleLookup}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLookup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Find my address</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#1a4fa8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
