import * as React from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { ButtonBottom } from "./src/components/ButtonBottom";
import { EgainService, ListSensorValue } from "./src/services/Egain";
import { StorageService, StoreContent } from "./src/services/Storage";
import Constants from "expo-constants";
import { common } from "./src/Constants";
import { Scanner, ScannerResult } from "./src/components/Scanner";

export interface AppProps {}

export interface AppState {
  scanner: {
    show: boolean;
  };
  egain: {
    loading: boolean;
  };
  store: {
    loading: boolean;
  };
  apartment: {
    guid: string | undefined;
    readingLatest: ListSensorValue | undefined;
  };
}

export enum Screen {
  LOADING,
  NO_APARTMENT,
  SCANNER,
  CURRENT_TEMPERATURE
}

export class AppContainer extends React.Component<AppProps, AppState> {
  private readonly storageService: StorageService;
  private readonly egainService: EgainService;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      scanner: {
        show: false
      },
      egain: {
        loading: false
      },
      store: {
        loading: false
      },
      apartment: {
        guid: undefined,
        readingLatest: undefined
      }
    };
    this.egainService = new EgainService();
    this.storageService = new StorageService();
  }

  componentDidMount = () => {
    // this.loadStorage();
  };

  componentDidUpdate = (prevProps: AppProps, prevState: AppState) => {
    const guidChanged = (): boolean => {
      return prevState.apartment.guid !== this.state.apartment.guid;
    };
    if (guidChanged() && Constants.isDevice) {
      this.updateTemperature(this.state.apartment.guid);
    }
  };

  private loadStorage = async (): Promise<void> => {
    console.debug("App.loadStorage");
    try {
      const storage = await this.storageService.load();
      if (storage.apartment.guid) {
        this.setState({
          apartment: {
            ...this.state.apartment,
            guid: storage.apartment.guid
          }
        });
      }
    } catch (error) {
      console.debug(`App.loadStorage.error: ${error}`);
      this.resetStorage();
    }
  };

  private resetStorage = async (): Promise<void> => {
    console.debug("App.resetStorage");
    try {
      await this.storageService.clean();
    } catch (error) {
      console.error(`App.resetStorage.error: ${error}`);
    }
  };

  private saveToStorage = async (): Promise<void> => {
    console.debug("App.saveToStorage");
    try {
      const storage: StoreContent = {
        apartment: {
          guid: this.state.apartment.guid
        }
      };
      await this.storageService.store(storage);
    } catch (error) {
      console.error(`App.saveToStorage.error: ${error}`);
      this.resetStorage();
    }
  };

  private isSimulator = (): boolean => {
    return !Constants.isDevice;
  };

  private isLoading = (): boolean => {
    const { egain, store } = this.state;
    return egain.loading || store.loading;
  };

  private hasApartmentReading = (): boolean => {
    const { apartment } = this.state;
    return !!(apartment.guid && !!apartment.readingLatest);
  };

  private showScanner = () => {
    console.debug("App.showScanner");
    this.setState({
      scanner: {
        ...this.state.scanner,
        show: true
      }
    });
  };

  private hideScanner = () => {
    console.debug("App.hideScanner");
    this.setState({
      scanner: {
        ...this.state.scanner,
        show: false
      }
    });
  };

  private onPressAddApartmentButton = () => {
    if (this.isSimulator()) {
      return this.SIMULATOR_onPressAddApartmentButton();
    }
    this.showScanner();
  };

  private SIMULATOR_onPressAddApartmentButton = () => {
    this.setState({
      egain: {
        ...this.state.egain,
        loading: true
      }
    });
    setTimeout(() => {
      this.setState({
        apartment: {
          ...this.state.apartment,
          guid: "1234",
          readingLatest: {
            temperature: 22.3,
            humidity: 40,
            date: new Date()
          }
        },
        egain: {
          ...this.state.egain,
          loading: false
        }
      });
    }, 1000);
    return;
  };

  private onScannerResult = (result: ScannerResult) => {
    console.debug("App.onScannerResult");
    this.setState({
      apartment: {
        ...this.state.apartment,
        guid: result.guid
      }
    });
    this.hideScanner();
  };

  private onScannerError = (error: Error) => {
    console.debug("App.onScannerError");
    this.hideScanner();
  };

  private updateTemperature = async (guid: string): Promise<void> => {
    console.log(`App: updateTemperature [guid: ${guid}]`);
    if (!guid) {
      console.error("App: updateTemperature - guid not set");
      return;
    }
    try {
      this.setState({
        egain: {
          ...this.state.egain,
          loading: true
        }
      });
      const reading = await this.egainService.getLatestReadingQuick(guid);
      console.log(
        `App: updateTemperature [Temp: ${reading.temperature} Date: ${
          reading.date
        }]`
      );
      this.setState({
        apartment: {
          ...this.state.apartment,
          readingLatest: reading
        }
      });
      this.saveToStorage();
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        egain: {
          ...this.state.egain,
          loading: false
        }
      });
    }
  };

  private getTopView(): JSX.Element {
    switch (this.getCurrentScreen()) {
      case Screen.LOADING: {
        return (
          <View style={styles.containerContentLoading}>
            <ActivityIndicator
              size={"large"}
              color={common.text.color.primary}
            />
          </View>
        );
      }
      case Screen.NO_APARTMENT: {
        return (
          <View style={styles.containerContentNoApartment}>
            <Text style={styles.text}>Scan QR with button below</Text>
          </View>
        );
      }
      case Screen.SCANNER: {
        return (
          <View style={styles.containerContentScanner}>
            <Scanner
              onResult={(result: ScannerResult) => {
                console.debug(`App.getScannerView.Scanner.onResult: ${result}`);
                this.onScannerResult(result);
              }}
              onError={(error: Error) => {
                console.debug(`App.getScannerView.Scanner.onError: ${error}`);
                this.onScannerError(error);
              }}
            />
          </View>
        );
      }
      case Screen.CURRENT_TEMPERATURE: {
        const { apartment } = this.state;
        const { temperature, date } = apartment.readingLatest;
        return (
          <View style={styles.containerContentCurrentTemperature}>
            <CurrentTemperature
              temperature={temperature}
              date={date}
              unit={Unit.C}
            />
          </View>
        );
      }
    }
  }

  private getBottomView(): JSX.Element {
    switch (this.getCurrentScreen()) {
      case Screen.LOADING: {
        return (
          <ButtonBottom
            text={"Loading"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getBottomView.LOADING.ButtonBottom.onPress");
            }}
          />
        );
      }
      case Screen.NO_APARTMENT: {
        return (
          <ButtonBottom
            text={"Scan"}
            icon={"qrcode"}
            onPress={() => {
              console.debug(
                "App.getBottomView.NO_APARTMENT.ButtonBottom.onPress"
              );
              this.onPressAddApartmentButton();
            }}
          />
        );
      }
      case Screen.SCANNER: {
        return (
          <ButtonBottom
            text={"Cancel"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getBottomView.SCANNER.ButtonBottom.onPress");
            }}
          />
        );
      }
      case Screen.CURRENT_TEMPERATURE: {
        return (
          <ButtonBottom
            text={"Scan"}
            icon={"qrcode"}
            onPress={() => {
              console.debug(
                "App.getBottomView.CURRENT_TEMPERATURE.ButtonBottom.onPress"
              );
              this.onPressAddApartmentButton();
            }}
          />
        );
      }
    }
  }

  private getCurrentScreen(): Screen {
    if (this.isLoading()) {
      return Screen.LOADING;
    }
    if (this.state.scanner.show) {
      return Screen.SCANNER;
    }
    if (!this.hasApartmentReading()) {
      return Screen.NO_APARTMENT;
    }
    return Screen.CURRENT_TEMPERATURE;
  }

  public render(): JSX.Element {
    return (
      <View style={styles.container}>
        <View style={styles.containerTop}>{this.getTopView()}</View>
        <View style={styles.containerBottom}>{this.getBottomView()}</View>
      </View>
    );
  }
}

export default function App() {
  return (
    <React.Fragment>
      <SafeAreaView style={styles.safeAreaTop} />
      <SafeAreaView style={styles.safeAreaBottom}>
        <StatusBar barStyle="default" />
        <AppContainer />
      </SafeAreaView>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: common.backgroundColorSecondary,
    paddingTop: Platform.OS === "android" ? 25 : 0
  },
  safeAreaBottom: {
    flex: 1,
    backgroundColor: common.backgroundColorSecondary
  },
  container: {
    flex: 1,
    backgroundColor: common.backgroundColorPrimary
  },
  containerTop: {
    flex: 6,
    width: "100%"
  },
  containerBottom: {
    flex: 1
  },
  containerContent: {
    flex: 6,
    width: "100%"
  },
  containerContentLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  containerContentNoApartment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  containerContentCurrentTemperature: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  containerContentScanner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  containerBottomBar: {
    flex: 1
  },
  containerTemperature: {
    flex: 10,
    alignSelf: "stretch",
    backgroundColor: common.backgroundColorPrimary,
    alignItems: "center",
    justifyContent: "center"
  },
  containerAddApartment: {
    flex: 2,
    alignSelf: "stretch"
  },
  text: {
    color: common.text.color.primary,
    fontSize: common.text.fontSize.h4
  }
});
