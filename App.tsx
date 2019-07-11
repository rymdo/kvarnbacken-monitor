import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import {
  BarCodeScannerModal,
  BarCodeScannerResult
} from "./src/components/BarCodeScannerModal";

import axios, { AxiosInstance } from "axios";

interface ListSensorValue {
  Date: string;
  Hum: number;
  Temp: number;
}

export interface AppProps {}

export interface AppState {
  showBarCodeScannerModal: boolean;
  apartmentId: string | undefined;
  sensorValue: ListSensorValue | undefined;
}

export class AppContainer extends React.Component<AppProps, AppState> {
  private axoisInstance: AxiosInstance;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      showBarCodeScannerModal: false,
      apartmentId: undefined,
      sensorValue: undefined
    };

    this.axoisInstance = axios.create({
      baseURL: "http://install.egain.se/Home/",
      timeout: 1000
    });
  }

  public render() {
    const { showBarCodeScannerModal, sensorValue } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          <CurrentTemperature
            value={sensorValue ? sensorValue.Temp : 0.0}
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
    this.updateApartment(result.id);
    this.hideBarCodeScannerModal();
  };

  private onBarCodeScannerCancel = () => {
    this.hideBarCodeScannerModal();
  };

  private updateApartment = async (guid: string): Promise<void> => {
    if (!guid) {
      console.error("App: updateApartment - guid not set");
      return;
    }
    try {
      const resp = await this.axoisInstance.post("ListSensorValues", {
        guid,
        daysAgo: 1
      });
      const sensorValues: ListSensorValue[] = resp.data as ListSensorValue[];
      const lastValue = sensorValues.pop();
      this.setState({ sensorValue: lastValue });
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
