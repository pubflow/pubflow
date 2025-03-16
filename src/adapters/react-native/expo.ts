// src/adapters/react-native/expo.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { ExpoStorage } from './utils/expo';

export interface ExpoPubFlowConfig {
  baseUrl: string;
  useSecureStorage?: boolean;
  deviceInfo?: boolean;
}

export function createExpoPubFlow(config: ExpoPubFlowConfig) {
  const storage = config.useSecureStorage ? new ExpoStorage() : new NativeStorage();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Platform': Platform.OS,
    'X-App-Version': Constants.expoConfig?.version || '1.0.0'
  };

  if (config.deviceInfo) {
    headers['X-Device-Name'] = Device.deviceName;
    headers['X-Device-Type'] = Device.deviceType;
    headers['X-OS-Version'] = Device.osVersion;
  }

  return new PubFlow({
    ...config,
    storage,
    headers
  });
}
