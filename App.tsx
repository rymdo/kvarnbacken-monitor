import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";
import { AddApartmentButton } from "./src/components/AddApartmentButton";

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.containerTemperature}>
        <CurrentTemperature value={22.1} unit={Unit.C} />
      </View>
      <View style={styles.containerAddApartment}>
        <AddApartmentButton onPress={() => {}} isLoading={false} />
      </View>
    </View>
  );
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
