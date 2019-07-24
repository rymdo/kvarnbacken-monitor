import * as React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { common } from "./../Constants";

export interface ButtonBottomProps {
  text: string;
  icon: string;
  onPress: () => void;
}

export interface ButtonBottomState {}

export class ButtonBottom extends React.Component<
  ButtonBottomProps,
  ButtonBottomState
> {
  constructor(props: ButtonBottomProps) {
    super(props);
    this.state = {};
  }

  private onPress = () => {
    this.props.onPress();
  };

  public render() {
    const { text, icon } = this.props;

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.buttonContainer} onPress={this.onPress}>
          <>
            <Icon
              name={`${icon}`}
              size={styles.buttonText.fontSize}
              color={styles.buttonText.color}
            />
            <View style={{ paddingHorizontal: 5 }} />
            <Text style={styles.buttonText}>{`${text}`}</Text>
          </>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: common.backgroundColorSecondary,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    backgroundColor: common.backgroundColorPrimary,
    borderRadius: 10
  },
  buttonText: {
    fontSize: common.text.fontSize.h3,
    color: common.text.color.primary
  }
});
