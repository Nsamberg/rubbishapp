import { StyleSheet, Text, View } from 'react-native';
import { Collection } from '../api/types';
import { BIN_CONFIG } from '../utils/binColors';
import { getRelativeDateLabel } from '../utils/dates';
import { BinIcon } from './BinIcon';

interface BinCardProps {
  collection: Collection;
}

function formatServiceName(service: string): string {
  return service
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(' Wheelie Bin', '')
    .replace(' Box', ' Box');
}

export function BinCard({ collection }: BinCardProps) {
  const config = BIN_CONFIG[collection.binType];
  const dateLabel = getRelativeDateLabel(collection.collectionDate);
  const isToday = dateLabel === 'Today';
  const isTomorrow = dateLabel === 'Tomorrow';
  const isUrgent = isToday || isTomorrow;

  return (
    <View style={[styles.card, isUrgent && styles.cardUrgent]}>
      <BinIcon binType={collection.binType} size={52} />
      <View style={styles.info}>
        <Text style={styles.serviceName}>{formatServiceName(collection.service)}</Text>
        <View style={styles.dateRow}>
          <View
            style={[
              styles.dateBadge,
              { backgroundColor: isUrgent ? config.backgroundColor : '#f0f0f0' },
            ]}
          >
            <Text
              style={[
                styles.dateText,
                { color: isUrgent ? '#fff' : '#555' },
              ]}
            >
              {dateLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUrgent: {
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  info: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
