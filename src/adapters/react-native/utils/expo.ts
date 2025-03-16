// src/adapters/react-native/utils/expo.ts
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export class ExpoStorage {
  private readonly SESSION_KEY = 'pubflow_session';
  private readonly TOKEN_KEY = 'pubflow_token';

  async getSession(): Promise<any> {
    try {
      const data = await SecureStore.getItemAsync(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setSession(session: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        this.SESSION_KEY,
        JSON.stringify(session)
      );
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.SESSION_KEY);
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }
}
