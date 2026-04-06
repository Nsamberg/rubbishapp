import { useCallback, useEffect, useState } from 'react';
import { SavedAddress } from '../api/types';
import { clearSavedAddress, getSavedAddress, setSavedAddress } from '../storage/storage';

interface UseAddressReturn {
  address: SavedAddress | null;
  loading: boolean;
  save: (address: SavedAddress) => Promise<void>;
  clear: () => Promise<void>;
}

export function useAddress(): UseAddressReturn {
  const [address, setAddress] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedAddress()
      .then(setAddress)
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async (addr: SavedAddress) => {
    await setSavedAddress(addr);
    setAddress(addr);
  }, []);

  const clear = useCallback(async () => {
    await clearSavedAddress();
    setAddress(null);
  }, []);

  return { address, loading, save, clear };
}
