import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { getSavedAddress } from '../src/storage/storage';

export default function Index() {
  useEffect(() => {
    getSavedAddress().then((address) => {
      if (address) {
        router.replace('/(tabs)/collections');
      } else {
        router.replace('/onboarding/postcode');
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#1a4fa8" />
    </View>
  );
}
