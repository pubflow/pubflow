// src/adapters/react-native/expo.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { ExpoStorage } from './utils/expo';
import { NativeStorage } from './utils/storage';
import { ReactNativeStorageAdapter } from './utils/storageAdapter';
import { PubFlow } from '../..';

export interface ExpoPubFlowConfig {
  baseUrl: string;
  useSecureStorage?: boolean;
  deviceInfo?: boolean;
}

export function createExpoPubFlow(config: ExpoPubFlowConfig) {
  const nativeStorage = config.useSecureStorage ? new ExpoStorage() : new NativeStorage();
  // Wrap the native storage with our adapter to implement the Storage interface
  const storage = new ReactNativeStorageAdapter(nativeStorage);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Platform': Platform.OS,
    'X-App-Version': Constants.expoConfig?.version || '1.0.0'
  };

  if (config.deviceInfo) {
    // Add null checks for Device properties
    if (Device.deviceName) {
      headers['X-Device-Name'] = Device.deviceName;
    }
    
    if (Device.deviceType) {
      headers['X-Device-Type'] = String(Device.deviceType);
    }
    
    if (Device.osVersion) {
      headers['X-OS-Version'] = Device.osVersion;
    }
  }

  return new PubFlow({
    ...config,
    storage,
    headers
  });
}
