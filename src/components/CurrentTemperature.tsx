import * as React from "react";
import { View, StyleSheet, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { common } from "./../Constants";

export enum Unit {
  C,
  F
}

export interface CurrentTemperatureProps {
  temperature: number;
  date: Date;
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
    const { temperature, date } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.textTemperature}>
          {`${temperature} ${this.getUnitSuffixShort()}`}
        </Text>
        <Text style={styles.textDate}>{this.dateToFormatedTime(date)}</Text>
      </View>
    );
  }

  private getUnitSuffixShort(): string {
    const degreeSymbol = "\u00B0";
    switch (this.props.unit) {
      case Unit.C: {
        return `${degreeSymbol}C`;
      }
      case Unit.F: {
        return `${degreeSymbol}F`;
      }
      default: {
        throw new Error("invalid unit");
      }
    }
  }

  private dateToFormatedTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    };
    return date.toLocaleDateString("sv-SE", options);
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: common.borderRadius
  },
  textTemperature: {
    fontSize: RFValue(80),
    marginLeft: 20,
    marginRight: 20,
    justifyContent: "center",
    alignContent: "center"
  },
  textDate: {
    fontSize: RFValue(20),
    marginLeft: 20,
    marginRight: 20,
    justifyContent: "center",
    alignContent: "center"
  }
});
