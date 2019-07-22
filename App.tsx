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
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import {
  BarCodeScannerModal,
  BarCodeScannerResult
} from "./src/components/BarCodeScannerModal";
import { EgainService, ListSensorValue } from "./src/services/Egain";
import { StorageService, Store } from "./src/services/Storage";
import Constants from "expo-constants";
import { common } from "./src/Constants";

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

  private getTemperatureView = (): JSX.Element => {
    const { apartment } = this.state;
    if (this.isLoading()) {
      return <></>;
    }
    if (!this.hasApartmentReading()) {
      return (
        <Text style={styles.textNoApartment}>Scan QR with button below</Text>
      );
    }
    const { temperature, date } = apartment.readingLatest;
    return (
      <CurrentTemperature temperature={temperature} date={date} unit={Unit.C} />
    );
  };

  private showScanner = () => {
    this.setState({
      scanner: {
        ...this.state.scanner,
        show: true
      }
    });
  };

  private hideScanner = () => {
    this.setState({
      scanner: {
        ...this.state.scanner,
        show: false
      }
    });
  };

  private onPressAddApartmentButton = () => {
    if (!this.isSimulator()) {
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

  private onScannerResult = (result: BarCodeScannerResult) => {
    this.setState({
      apartment: {
        ...this.state.apartment,
        guid: result.guid
      }
    });
    this.hideScanner();
  };

  private onScannerCancel = () => {
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
      const reading = await this.egainService.getLatestReading(guid);
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

  public render(): JSX.Element {
    const { scanner } = this.state;

    if (this.isLoading()) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size={"large"} color={common.text.color.primary} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          {this.getTemperatureView()}
        </View>
        <View style={styles.containerAddApartment}>
          <AddApartmentButton
            onPress={this.onPressAddApartmentButton}
            isLoading={scanner.show}
          />
        </View>
        <BarCodeScannerModal
          isVisible={scanner.show}
          onResult={this.onScannerResult}
          onCancel={this.onScannerCancel}
        />
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
    backgroundColor: common.backgroundColorPrimary,
    alignItems: "center",
    justifyContent: "center"
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
    alignSelf: "stretch",
    backgroundColor: common.backgroundColorSecondary,
    alignItems: "center",
    justifyContent: "center"
  },
  textNoApartment: {
    color: common.text.color.primary,
    fontSize: common.text.fontSize.h4
  }
});
