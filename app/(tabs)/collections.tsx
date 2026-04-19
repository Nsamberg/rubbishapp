import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { BinCard } from '../../src/components/BinCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useCollections } from '../../src/hooks/useCollections';
import { scheduleNotificationsForCollections } from '../../src/notifications/scheduler';
import { getReminderPrefs } from '../../src/storage/storage';

export default function CollectionsScreen() {
  const { collections, loading, error, refresh } = useCollections();

  // Reschedule notifications whenever we have fresh data
  useEffect(() => {
    if (collections.length > 0) {
      getReminderPrefs().then((prefs) => {
        scheduleNotificationsForCollections(collections, prefs);
      });
    }
  }, [collections]);

  // Redirect to onboarding when no address is configured
  useEffect(() => {
    if (!loading && error === 'No address saved') {
      router.replace('/onboarding/postcode');
    }
  }, [loading, error]);

  // Refresh when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bin Collections</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      )}

      {loading && collections.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a4fa8" />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item, index) => {
            const ts = item.collectionDate.getTime();
            return isNaN(ts) ? `${item.binType}-${index}` : `${item.binType}-${item.collectionDate.toISOString()}`;
          }}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <BinCard collection={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor="#1a4fa8"
              colors={['#1a4fa8']}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={error ? '⚠️' : '✅'}
              title={error ? "Couldn't load collections" : 'No upcoming collections'}
              message={error ? 'Pull down to try again.' : 'No collection dates are currently scheduled.'}
              actionLabel={error ? 'Try again' : undefined}
              onAction={error ? refresh : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderLeftWidth: 4,
    borderLeftColor: '#c0392b',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#c0392b',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  separator: {
    height: 12,
  },
});
