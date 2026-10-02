import { Platform } from 'react-native';
import { ownerApi } from '@/api/owner';

function isExpoGo(): boolean {
  try {
    const { isRunningInExpoGo } = require('expo');
    return typeof isRunningInExpoGo === 'function' ? isRunningInExpoGo() : false;
  } catch {
    return false;
  }
}

/**
 * Safely registers Expo push token with backend.
 * Gracefully ignores Android Expo Go where remote push notifications were removed in SDK 53+.
 */
export async function registerPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  // Remote push notifications are completely unsupported in Android Expo Go
  if (Platform.OS === 'android' && isExpoGo()) {
    console.log(
      '[Push] Running in Android Expo Go: remote push notifications disabled. Use a development build for native push notifications.'
    );
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    if (tokenData?.data) {
      await ownerApi.registerPushToken(tokenData.data, Platform.OS as 'android' | 'ios');
      return tokenData.data;
    }
  } catch (e) {
    console.warn('[Push] Error registering push token:', e);
  }
  return null;
}

/**
 * Safely unregisters Expo push token with backend.
 */
export async function unregisterPushNotificationsAsync(): Promise<void> {
  if (Platform.OS === 'web') return;

  if (Platform.OS === 'android' && isExpoGo()) {
    return;
  }

  try {
    const Notifications = require('expo-notifications');
    const tokenData = await Notifications.getExpoPushTokenAsync();
    if (tokenData?.data) {
      await ownerApi.deletePushToken(tokenData.data);
    }
  } catch (e) {
    console.warn('[Push] Error unregistering push token:', e);
  }
}
