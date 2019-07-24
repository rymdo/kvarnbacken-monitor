import { AsyncStorage } from "react-native";
import Constants from "expo-constants";

export interface StoreContent {
  apartment: {
    guid: string;
  };
}

export class StorageService {
  private readonly STORE_KEY = `STORAGE:${Constants.deviceName}`;

  public clean = async (): Promise<void> => {
    await AsyncStorage.removeItem(this.STORE_KEY);
  };

  public store = async (store: StoreContent): Promise<void> => {
    const storeJSON = JSON.stringify(store);
    await AsyncStorage.setItem(this.STORE_KEY, storeJSON);
  };

  public load = async (): Promise<StoreContent> => {
    const storeJSON = await AsyncStorage.getItem(this.STORE_KEY);
    if (!storeJSON) {
      throw new Error("StorageService: load: not initialized");
    }
    if (storeJSON.length < this.getMinimumStoreSize()) {
      throw new Error("StorageService: load: loaded storage corrupted");
    }
    const store: StoreContent = JSON.parse(storeJSON);
    return store;
  };

  private getMinimumStoreSize(): number {
    const emptyStore: StoreContent = {
      apartment: {
        guid: ""
      }
    };
    return JSON.stringify(emptyStore).length;
  }
}
