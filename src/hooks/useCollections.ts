import { useCallback, useEffect, useState } from 'react';
import { Collection } from '../api/types';
import { getCouncil } from '../api/council';
import { getSavedAddress } from '../storage/storage';

interface UseCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCollections(): UseCollectionsReturn {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await getSavedAddress();
      if (!address) {
        setError('No address saved');
        return;
      }
      const council = getCouncil(address.councilId);
      const results = await council.getCollections(address.uprn);
      const sorted = results.sort(
        (a, b) => a.collectionDate.getTime() - b.collectionDate.getTime()
      );
      setCollections(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { collections, loading, error, refresh: fetch };
}
