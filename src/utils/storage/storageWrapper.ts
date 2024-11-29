import { StorageError } from './storageError';

interface StorageWrapper {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

class LocalStorageWrapper implements StorageWrapper {
  private fallbackStorage: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
  }

  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
      }
      return this.fallbackStorage.get(key) || null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      throw new StorageError('Failed to read from storage', { cause: error });
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
      } else {
        this.fallbackStorage.set(key, value);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Try to clear old data if quota is exceeded
        this.clearOldData();
        try {
          if (this.isLocalStorageAvailable) {
            localStorage.setItem(key, value);
          } else {
            this.fallbackStorage.set(key, value);
          }
          return;
        } catch (retryError) {
          throw new StorageError('Storage quota exceeded', { cause: retryError });
        }
      }
      throw new StorageError('Failed to write to storage', { cause: error });
    }
  }

  removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      } else {
        this.fallbackStorage.delete(key);
      }
    } catch (error) {
      throw new StorageError('Failed to remove item from storage', { cause: error });
    }
  }

  clear(): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.clear();
      } else {
        this.fallbackStorage.clear();
      }
    } catch (error) {
      throw new StorageError('Failed to clear storage', { cause: error });
    }
  }

  private clearOldData(): void {
    if (!this.isLocalStorageAvailable) return;

    const keys = Object.keys(localStorage);
    const oldestFirst = keys.sort((a, b) => {
      const aTime = this.getTimestampFromKey(a);
      const bTime = this.getTimestampFromKey(b);
      return aTime - bTime;
    });

    // Remove oldest 20% of items
    const itemsToRemove = Math.ceil(oldestFirst.length * 0.2);
    oldestFirst.slice(0, itemsToRemove).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private getTimestampFromKey(key: string): number {
    try {
      const value = localStorage.getItem(key);
      if (!value) return 0;
      const data = JSON.parse(value);
      return new Date(data.timestamp || data.updatedAt || data.createdAt || 0).getTime();
    } catch {
      return 0;
    }
  }
}

export const storage = new LocalStorageWrapper();