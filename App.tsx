import * as React from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import {
  BarCodeScannerModal,
  BarCodeScannerResult
} from "./src/components/BarCodeScannerModal";
import { EgainService, ListSensorValue } from "./src/services/Egain";
import {
  getStatusBarHeight,
  getBottomSpace
} from "react-native-iphone-x-helper";
import Constants from "expo-constants";

export interface AppProps {}

export interface AppState {
  showBarCodeScannerModal: boolean;
  apartmentId: string | undefined;
  reading: ListSensorValue | undefined;
  loading: boolean;
}

export class AppContainer extends React.Component<AppProps, AppState> {
  private readonly egainService: EgainService;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      showBarCodeScannerModal: false,
      apartmentId: undefined,
      reading: undefined,
      loading: false
    };
    this.egainService = new EgainService();
  }

  public render() {
    const {
      showBarCodeScannerModal,
      apartmentId,
      reading,
      loading
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : apartmentId ? (
            <CurrentTemperature
              temperature={reading ? reading.Temp : 0.0}
              date={reading ? reading.Date : new Date()}
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
                this.showBarCodeScannerModal();
              } else {
                this.setState({
                  apartmentId: "1234",
                  reading: { Temp: 22.2, Hum: 40, Date: new Date() }
                });
              }
            }}
            isLoading={showBarCodeScannerModal}
          />
        </View>
        <BarCodeScannerModal
          isVisible={showBarCodeScannerModal}
          onResult={this.onBarCodeScannerResult}
          onCancel={this.onBarCodeScannerCancel}
        />
      </View>
    );
  }

  private showBarCodeScannerModal = () => {
    this.setState({
      showBarCodeScannerModal: true
    });
  };

  private hideBarCodeScannerModal = () => {
    this.setState({
      showBarCodeScannerModal: false
    });
  };

  private onBarCodeScannerResult = (result: BarCodeScannerResult) => {
    this.setState({
      apartmentId: result.id
    });
    this.updateTemperature(result.id);
    this.hideBarCodeScannerModal();
  };

  private onBarCodeScannerCancel = () => {
    this.hideBarCodeScannerModal();
  };

  private updateTemperature = async (guid: string): Promise<void> => {
    if (!guid) {
      console.error("App: updateTemperature - guid not set");
      return;
    }
    try {
      this.setState({ loading: true });
      const reading = await this.egainService.getLatestReading(guid);
      console.log(
        `App: updateTemperature [Temp: ${reading.Temp} Date: ${reading.Date}]`
      );
      this.setState({ reading });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ loading: false });
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
