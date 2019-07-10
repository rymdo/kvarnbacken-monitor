import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CurrentTemperature, Unit } from "./src/components/CurrentTemperature";

export default function App() {
  return (
    <View style={styles.container}>
      <CurrentTemperature value={22.1} unit={Unit.C} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
