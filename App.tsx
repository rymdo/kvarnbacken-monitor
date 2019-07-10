import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";
import { BarCodeScannerModal } from "./src/components/BarCodeScannerModal";

export interface AppProps {}

export interface AppState {
  showBarCodeScannerModal: boolean;
}

export class AppContainer extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      showBarCodeScannerModal: false
    };
  }

  public render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerTemperature}>
          <CurrentTemperature value={22.1} unit={Unit.C} />
        </View>
        <View style={styles.containerAddApartment}>
          <AddApartmentButton
            onPress={() => {
              this.showBarCodeScannerModal();
            }}
            isLoading={false}
          />
        </View>
        <BarCodeScannerModal
          isVisible={this.state.showBarCodeScannerModal}
          onAdd={(id: string) => {
            this.hideBarCodeScannerModal();
          }}
          onCancel={() => {
            this.hideBarCodeScannerModal();
          }}
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
