import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Collection, ReminderPreferences } from '../api/types';
import { scheduleNotificationsForCollections } from '../notifications/scheduler';

interface UseNotificationsReturn {
  permissionGranted: boolean;
  scheduleAll: (collections: Collection[], prefs: ReminderPreferences) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((status) => {
      setPermissionGranted(status.granted);
    });
  }, []);

  const scheduleAll = useCallback(
    async (collections: Collection[], prefs: ReminderPreferences) => {
      if (!permissionGranted) return;
      await scheduleNotificationsForCollections(collections, prefs);
    },
    [permissionGranted]
  );

  return { permissionGranted, scheduleAll };
}
