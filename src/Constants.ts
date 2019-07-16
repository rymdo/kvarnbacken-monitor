import { RFValue } from "react-native-responsive-fontsize";

export const colors = {
  green_1: "#0c9a5c",
  green_2: "#086b40",
  white_1: "#ffffff"
};

export const common = {
  backgroundColorPrimary: colors.green_1,
  backgroundColorSecondary: colors.white_1,
  backgroundColorTertiary: colors.green_2,
  text: {
    fontSize: {
      h1: RFValue(80),
      h2: RFValue(60),
      h3: RFValue(40),
      h4: RFValue(20),
      h5: RFValue(10),
      body: RFValue(20)
    },
    color: {
      primary: colors.white_1,
      secondary: colors.green_1
    }
  }
};
