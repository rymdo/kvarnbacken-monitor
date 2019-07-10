import * as React from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Alert,
  TouchableHighlight
} from "react-native";

export interface BarCodeScannerProps {
  isVisible: boolean;
  onAdd: (id: string) => void;
  onCancel: () => void;
}

export interface BarCodeScannerState {}

export class BarCodeScannerModal extends React.Component<
  BarCodeScannerProps,
  BarCodeScannerState
> {
  constructor(props: BarCodeScannerProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { isVisible, onAdd, onCancel } = this.props;

    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.props.isVisible}
          onRequestClose={onCancel}
        >
          <View style={{ marginTop: 22 }}>
            <View>
              <Text>Hello World!</Text>

              <TouchableHighlight
                onPress={() => {
                  onAdd("hej");
                }}
              >
                <Text>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {}
});
