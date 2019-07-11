import * as React from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Alert,
  TouchableHighlight
} from "react-native";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";

export const BARCODE_TYPE_QRCODE = "org.iso.QRCode";

export interface BarCodeEvent {
  type: string;
  data: string;
  [key: string]: any;
}

export interface BarCodeScannerResult {
  id: string;
}

export interface BarCodeScannerProps {
  isVisible: boolean;
  onResult: (result: BarCodeScannerResult) => void;
  onCancel: () => void;
}

export interface BarCodeScannerState {
  hasLoaded: boolean;
  isLoading: boolean;
  isDone: boolean;
}

export class BarCodeScannerModal extends React.Component<
  BarCodeScannerProps,
  BarCodeScannerState
> {
  private readonly defaultState: BarCodeScannerState = {
    hasLoaded: false,
    isLoading: false,
    isDone: false
  };

  constructor(props: BarCodeScannerProps) {
    super(props);
    this.state = { ...this.defaultState };
  }

  private onShow = () => {
    console.log("BarCodeScannerModal: onShow");
    this.startLoad();
  };

  private onRequestClose = () => {
    console.log("BarCodeScannerModal: onRequestClose");
    this.onCancel();
  };

  private onResult = (result: BarCodeScannerResult) => {
    console.log(`BarCodeScannerModal: onResult [id: ${result.id}]`);
    this.setState({ ...this.defaultState, isDone: true });
    this.props.onResult(result);
  };

  private onCancel = () => {
    console.log("BarCodeScannerModal: onCancel");
    this.setState({ ...this.defaultState, isDone: true });
    this.props.onCancel();
  };

  private startLoad(): void {
    console.log("BarCodeScannerModal: startLoad");
    this.setState({
      ...this.defaultState
    });
    this.load();
  }

  private async load(): Promise<void> {
    console.log("BarCodeScannerModal: load");
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
    console.log("BarCodeScannerModal: onLoadSuccess");
    this.setState({
      hasLoaded: true,
      isLoading: false,
      isDone: false
    });
  };

  private onLoadFailed = (reason: string) => {
    console.log("BarCodeScannerModal: onLoadFailed");
    Alert.alert(`${reason}`, "", [
      {
        text: "Ok",
        onPress: () => {
          this.setState({
            ...this.defaultState
          });
          this.props.onCancel();
        }
      }
    ]);
  };

  private onBarCodeScannedEvent = (params: BarCodeEvent) => {
    console.log("BarCodeScannerModal: onBarCodeScannedEvent");

    const { isDone } = this.state;

    if (isDone) {
      return;
    }

    const prefix = "http://install.egain.se?gid=";

    const { type, data } = params;

    if (type !== BARCODE_TYPE_QRCODE) {
      return;
    }

    if (!data.startsWith(prefix)) {
      return;
    }

    const id = data.split(prefix).pop();

    if (id.length < 10) {
      return;
    }

    this.onResult({ id });
  };

  private getCameraView(): JSX.Element {
    return (
      <BarCodeScanner
        onBarCodeScanned={this.onBarCodeScannedEvent}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  private getLoadingView(): JSX.Element {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  private getLoadedView(): JSX.Element {
    return (
      <View style={styles.container}>
        <View style={{ flex: 6 }}>{this.getCameraView()}</View>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <TouchableHighlight onPress={this.onCancel}>
            <Text>Hide Modal</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  public render() {
    const { isVisible } = this.props;
    const { isLoading, hasLoaded } = this.state;

    const showLoading: boolean = !hasLoaded || isLoading;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onShow={this.onShow}
        onRequestClose={this.onRequestClose}
      >
        {showLoading ? this.getLoadingView() : this.getLoadedView()}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  }
});
