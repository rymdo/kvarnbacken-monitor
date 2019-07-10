import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import { RFValue } from "react-native-responsive-fontsize";
import { commonButtonStyle } from "./../Constants";

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
          title="Solid Button"
          loading={isLoading}
          icon={
            <Icon
              name="qrcode"
              size={stylesButtonIcon.size}
              color={stylesButtonIcon.color}
            />
          }
          buttonStyle={styles.buttonContainer}
          titleStyle={styles.buttonText}
          onPress={onPress}
        />
      </View>
    );
  }
}

const stylesFontSize = RFValue(50);

const stylesButtonIcon = {
  size: stylesFontSize,
  color: "white"
};

const styles = StyleSheet.create({
  container: {},
  buttonContainer: {
    borderRadius: commonButtonStyle.borderRadius
  },
  buttonText: {
    fontSize: stylesFontSize
  }
});
