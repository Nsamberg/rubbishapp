import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AddressResult } from '../../src/api/types';
import { setSavedAddress } from '../../src/storage/storage';

export default function SelectAddressScreen() {
  const { addresses: rawAddresses, postcode } = useLocalSearchParams<{
    addresses: string;
    postcode: string;
  }>();

  const addresses: AddressResult[] = rawAddresses ? JSON.parse(rawAddresses) : [];

  const handleSelect = async (address: AddressResult) => {
    await setSavedAddress({
      displayName: address.displayName,
      uprn: address.uprn,
      councilId: 'ealing',
    });
    // Small delay to ensure IDB transaction fully commits before navigation on iOS PWA
    await new Promise((r) => setTimeout(r, 100));
    router.replace('/(tabs)/collections');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Select your address</Text>
        <Text style={styles.subtitle}>{postcode?.toUpperCase()}</Text>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.uprn}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.displayName}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#1a4fa8',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
    letterSpacing: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemText: {
    fontSize: 15,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 22,
    color: '#aaa',
    marginLeft: 8,
  },
  separator: {
    height: 8,
  },
});
