import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

export enum Unit {
  C,
  F,
  K
}

export interface CurrentTemperatureProps {
  value: number;
  unit: Unit;
}

export interface CurrentTemperatureState {}

export class CurrentTemperature extends React.Component<
  CurrentTemperatureProps,
  CurrentTemperatureState
> {
  constructor(props: CurrentTemperatureProps) {
    super(props);
    this.state = {};
  }

  public render() {
    const { value } = this.props;
    return (
      <View style={styles.container}>
        <Text
          style={styles.text}
        >{`${value} ${this.getUnitSuffixShort()}`}</Text>
      </View>
    );
  }

  private getUnitSuffixShort(): string {
    switch (this.props.unit) {
      case Unit.C: {
        return "C";
      }
      case Unit.F: {
        return "F";
      }
      case Unit.K: {
        return "K";
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    borderRadius: 20
  },
  text: {
    fontSize: RFValue(100),
    marginLeft: 20,
    marginRight: 20
  }
});
