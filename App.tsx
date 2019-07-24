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
import { StorageService, Store } from "./src/services/Storage";
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
    this.loadStorage();
  };

  componentDidUpdate = (prevProps: AppProps, prevState: AppState) => {
    const guidChanged = (): boolean => {
      return prevState.apartment.guid !== this.state.apartment.guid;
    };
    if (guidChanged() && Constants.isDevice) {
      this.updateTemperature(this.state.apartment.guid);
    }
  };

  private loadStorage = async (): Promise<void> => {};

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

  private getLoadingView(): JSX.Element {
    return (
      <View style={styles.container}>
        <View style={styles.containerContent}>
          <View style={styles.containerContentLoading}>
            <ActivityIndicator
              size={"large"}
              color={common.text.color.primary}
            />
          </View>
        </View>
        <View style={styles.containerBottomBar}>
          <ButtonBottom
            text={"Loading"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getLoadingView.ButtonBottom.onPress");
            }}
          />
        </View>
      </View>
    );
  }

  private getNoApartmentView(): JSX.Element {
    return (
      <View style={styles.container}>
        <View style={styles.containerContent}>
          <View style={styles.containerContentNoApartment}>
            <Text style={styles.text}>Scan QR with button below</Text>
          </View>
        </View>
        <View style={styles.containerBottomBar}>
          <ButtonBottom
            text={"Scan"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getNoApartmentView.ButtonBottom.onPress");
              this.onPressAddApartmentButton();
            }}
          />
        </View>
      </View>
    );
  }

  private getTemperatureView(): JSX.Element {
    const { apartment } = this.state;
    const { temperature, date } = apartment.readingLatest;
    return (
      <View style={styles.container}>
        <View style={styles.containerContent}>
          <View style={styles.containerContentCurrentTemperature}>
            <CurrentTemperature
              temperature={temperature}
              date={date}
              unit={Unit.C}
            />
          </View>
        </View>
        <View style={styles.containerBottomBar}>
          <ButtonBottom
            text={"Scan"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getTemperatureView.ButtonBottom.onPress");
              this.onPressAddApartmentButton();
            }}
          />
        </View>
      </View>
    );
  }

  private getScannerView(): JSX.Element {
    return (
      <View style={styles.container}>
        <View style={styles.containerContent}>
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
        </View>
        <View style={styles.containerBottomBar}>
          <ButtonBottom
            text={"Cancel"}
            icon={"qrcode"}
            onPress={() => {
              console.debug("App.getScannerView.ButtonBottom.onPress");
              this.hideScanner();
            }}
          />
        </View>
      </View>
    );
  }

  public render(): JSX.Element {
    if (this.isLoading()) {
      return this.getLoadingView();
    }
    if (this.state.scanner.show) {
      return this.getScannerView();
    }
    if (!this.hasApartmentReading()) {
      return this.getNoApartmentView();
    }
    return this.getTemperatureView();
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
