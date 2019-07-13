import * as React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import {
  BarCodeScannerModal,
  BarCodeScannerResult
} from "./src/components/BarCodeScannerModal";
import { EgainService, ListSensorValue } from "./src/services/Egain";
import { StorageService, Store } from "./src/services/Storage";
import {
  getStatusBarHeight,
  getBottomSpace
} from "react-native-iphone-x-helper";
import Constants from "expo-constants";

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

  private isLoading = (): boolean => {
    const { egain, store } = this.state;
    return egain.loading || store.loading;
  };

  public render() {
    const { scanner, apartment } = this.state;

    if (this.isLoading()) {
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>;
    }

    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          {apartment.guid ? (
            <CurrentTemperature
              temperature={
                apartment.readingLatest ? apartment.readingLatest.Temp : 0.0
              }
              date={
                apartment.readingLatest
                  ? apartment.readingLatest.Date
                  : new Date()
              }
              unit={Unit.C}
            />
          ) : (
            <Text>Scan QR with button below</Text>
          )}
        </View>
        <View style={styles.containerAddApartment}>
          <AddApartmentButton
            onPress={() => {
              if (Constants.isDevice) {
                this.showScanner();
              } else {
                this.setState({
                  apartment: {
                    ...this.state.apartment,
                    guid: "1234",
                    readingLatest: { Temp: 22.2, Hum: 40, Date: new Date() }
                  }
                });
              }
            }}
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
        `App: updateTemperature [Temp: ${reading.Temp} Date: ${reading.Date}]`
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
}

export default function App() {
  return <AppContainer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: getStatusBarHeight(),
    marginBottom: getBottomSpace()
  },
  containerTemperature: {
    flex: 10,
    alignSelf: "stretch",
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center"
  },
  containerAddApartment: {
    flex: 2,
    alignSelf: "stretch",
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: "center"
  }
});
