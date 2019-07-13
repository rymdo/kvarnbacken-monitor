import { AsyncStorage } from "react-native";
import Constants from "expo-constants";

export interface Store {
  apartment: {
    guid: string;
  };
}

export class StorageService {
  private readonly STORE_KEY = `STORAGE:${Constants.deviceName}`;

  public clean = async (): Promise<void> => {
    await AsyncStorage.removeItem(this.STORE_KEY);
  };

  public store = async (store: Store): Promise<void> => {
    const storeJSON = JSON.stringify(store);
    await AsyncStorage.setItem(this.STORE_KEY, storeJSON);
  };

  public load = async (): Promise<Store> => {
    const storeJSON = await AsyncStorage.getItem(this.STORE_KEY);
    if (!storeJSON) {
      throw new Error("StorageService: load: not initialized");
    }
    if (storeJSON.length < this.getMinimumStoreSize()) {
      throw new Error("StorageService: load: loaded storage corrupted");
    }
    const store: Store = JSON.parse(storeJSON);
    return store;
  };

  private getMinimumStoreSize(): number {
    const emptyStore: Store = {
      apartment: {
        guid: ""
      }
    };
    return JSON.stringify(emptyStore).length;
  }
}
