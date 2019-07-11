import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import {
  BarCodeScannerModal,
  BarCodeScannerResult
} from "./src/components/BarCodeScannerModal";
import { EgainService } from "./src/services/Egain";

export interface AppProps {}

export interface AppState {
  showBarCodeScannerModal: boolean;
  apartmentId: string | undefined;
  temperature: number | undefined;
}

export class AppContainer extends React.Component<AppProps, AppState> {
  private readonly egainService: EgainService;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      showBarCodeScannerModal: false,
      apartmentId: undefined,
      temperature: undefined
    };
    this.egainService = new EgainService();
  }

  public render() {
    const { showBarCodeScannerModal, temperature } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          <CurrentTemperature
            value={temperature ? temperature : 0.0}
            unit={Unit.C}
          />
        </View>
        <View style={styles.containerAddApartment}>
          <AddApartmentButton
            onPress={() => {
              this.showBarCodeScannerModal();
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
      const temperature = await this.egainService.getLatestTemperature(guid);
      this.setState({ temperature });
    } catch (e) {
      console.error(e);
    }
  };
}

export default function App() {
  return <AppContainer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 30
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
