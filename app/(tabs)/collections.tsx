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

  if (loading && collections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bin Collections</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a4fa8" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && collections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bin Collections</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <EmptyState
          icon="⚠️"
          title="Couldn't load collections"
          message={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bin Collections</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        {error && (
          <Text style={styles.errorBanner}>Could not refresh — showing cached data</Text>
        )}
      </View>

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
            icon="✅"
            title="No upcoming collections"
            message="No collection dates are currently scheduled."
          />
        }
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
    fontSize: 13,
    color: '#c0392b',
    marginTop: 4,
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
