import * as React from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import { common } from "../Constants";

export const BARCODE_TYPE_QRCODE = "org.iso.QRCode";

export interface BarCodeScannerEvent {
  type: string;
  data: string;
  [key: string]: any;
}

export interface ScannerResult {
  guid: string;
}

export interface ScannerProps {
  onResult: (result: ScannerResult) => void;
  onError: (error: Error) => void;
}

export interface ScannerState {
  hasLoaded: boolean;
  isLoading: boolean;
}

export class Scanner extends React.Component<ScannerProps, ScannerState> {
  private readonly defaultState: ScannerState = {
    hasLoaded: false,
    isLoading: false
  };

  constructor(props: ScannerProps) {
    super(props);
    this.state = { ...this.defaultState };
  }

  componentDidMount() {
    console.log("Scanner: componentDidMount");
    this.startLoad();
  }

  private onResult = (result: ScannerResult) => {
    console.log(`Scanner: onResult [id: ${result.guid}]`);
    this.props.onResult(result);
  };

  private onError = (error: Error) => {
    console.log("Scanner: onError");
    this.props.onError(error);
  };

  private startLoad(): void {
    console.log("Scanner: startLoad");
    this.setState({
      ...this.defaultState
    });
    this.load();
  }

  private async load(): Promise<void> {
    console.log("Scanner: load");
    try {
      const response: Permissions.PermissionResponse = await Permissions.askAsync(
        Permissions.CAMERA
      );
      if (response.status !== Permissions.PermissionStatus.GRANTED) {
        return this.onLoadFailed("Failed to get camera permission");
      }
      this.onLoadSuccess();
    } catch (e) {
      return this.onLoadFailed("Failed to request permission for camera");
    }
  }

  private onLoadSuccess = () => {
    console.log("Scanner: onLoadSuccess");
    this.setState({
      hasLoaded: true,
      isLoading: false
    });
  };

  private onLoadFailed = (reason: string) => {
    console.log("Scanner: onLoadFailed");
    Alert.alert(`${reason}`, "", [
      {
        text: "Ok",
        onPress: () => {
          this.onError(new Error(`Scanner: onLoadFailed ${reason}`));
        }
      }
    ]);
  };

  private onBarCodeScannedEvent = (params: BarCodeScannerEvent) => {
    console.log("Scanner: onBarCodeScannedEvent");
    const prefix = "http://install.egain.se?gid=";
    const { type, data } = params;

    if (type !== BARCODE_TYPE_QRCODE) {
      return;
    }

    if (!data.startsWith(prefix)) {
      return;
    }

    const guid = data.split(prefix).pop();

    if (guid.length < 10) {
      return;
    }

    this.onResult({ guid });
  };

  private getLoadingView(): JSX.Element {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  public render() {
    const { isLoading, hasLoaded } = this.state;
    const showLoading: boolean = !hasLoaded || isLoading;

    if (showLoading) {
      return this.getLoadingView();
    }

    return (
      <BarCodeScanner
        onBarCodeScanned={this.onBarCodeScannedEvent}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%"
  }
});
