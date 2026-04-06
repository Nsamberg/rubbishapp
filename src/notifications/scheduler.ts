import * as Notifications from 'expo-notifications';
import { BinType, Collection, ReminderPreferences } from '../api/types';
import { BIN_CONFIG } from '../utils/binColors';

const NOTIFICATION_ID_PREFIX = 'rubbishapp-';

function getBinNotificationTitle(binType: BinType): string {
  const config = BIN_CONFIG[binType];
  return `${config.emoji} ${config.label} collection tomorrow`;
}

function getBinNotificationBody(binType: BinType): string {
  const config = BIN_CONFIG[binType];
  return `Don't forget to put your ${config.label.toLowerCase()} bin out tonight.`;
}

async function cancelAllManagedNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ours = scheduled.filter((n) => n.identifier.startsWith(NOTIFICATION_ID_PREFIX));
  await Promise.all(ours.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function scheduleNotificationsForCollections(
  collections: Collection[],
  prefs: ReminderPreferences
): Promise<void> {
  await cancelAllManagedNotifications();

  if (!prefs.enabled) return;

  const now = new Date();

  for (const collection of collections) {
    if (!prefs.enabledBinTypes.includes(collection.binType)) continue;

    // Calculate trigger: collection day midnight minus hoursBefore
    const triggerDate = new Date(collection.collectionDate);
    triggerDate.setHours(triggerDate.getHours() - prefs.hoursBefore);

    if (triggerDate <= now) continue;

    const dateKey = collection.collectionDate.toISOString().slice(0, 10);
    const identifier = `${NOTIFICATION_ID_PREFIX}${collection.binType}-${dateKey}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: getBinNotificationTitle(collection.binType),
        body: getBinNotificationBody(collection.binType),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}
