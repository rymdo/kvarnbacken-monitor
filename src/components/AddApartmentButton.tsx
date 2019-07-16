import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { common } from "./../Constants";

export interface AddApartmentProps {
  onPress: () => void;
  isLoading: boolean;
}

export interface AddApartmentState {}

export class AddApartmentButton extends React.Component<
  AddApartmentProps,
  AddApartmentState
> {
  constructor(props: AddApartmentProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { onPress, isLoading } = this.props;

    return (
      <View style={styles.container}>
        <Button
          title="Scan"
          loading={isLoading}
          buttonStyle={styles.buttonContainer}
          titleStyle={styles.buttonText}
          icon={
            <Icon
              name="qrcode"
              size={styles.buttonText.fontSize}
              color={styles.buttonText.color}
              style={{ padding: 5 }}
            />
          }
          onPress={onPress}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
  buttonContainer: {
    backgroundColor: common.backgroundColorPrimary,
    padding: 16
  },
  buttonText: {
    fontSize: common.text.fontSize.h3,
    color: common.text.color.primary
  }
});
