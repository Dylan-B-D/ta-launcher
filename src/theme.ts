// theme.ts
import { MantineTheme, createTheme } from "@mantine/core";
import { useThemeContext } from "./context/ThemeContext";

declare module "@mantine/core" {
  interface MantineTheme {
    secondaryColor: string;
    highlightColor: string;
  }
}

const createAppTheme = () => {
  const { primaryColor } = useThemeContext();
  return createTheme({
    fontFamily: "Nunito Sans",

    // https://mantine.dev/colors-generator/
    // Colors for UI components, try to keep intensity range normalised.
    // Intensity ranges should be from light to dark.

    colors: {
      mutedBlue: [
        "#2C3E50",
        "#34495E",
        "#3B546B",
        "#425F79",
        "#4A6A86",
        "#527594",
        "#5A80A1",
        "#628BAF",
        "#6A96BC",
        "#729FCA",
      ],
      mutedAmber: [
        "#50392C",
        "#6C4F3D",
        "#876452",
        "#A27A68",
        "#BD8F7D",
        "#D8A593",
        "#F3BCA8",
        "#FFD2BE",
        "#FFE8D4",
        "#FFF3E9",
      ],
      mutedRed: [
        "#542424",
        "#633030",
        "#723C3C",
        "#814848",
        "#905454",
        "#9F6060",
        "#AE6C6C",
        "#BD7878",
        "#CC8484",
        "#DB9090",
      ],
      mutedGreen: [
        "#2C503E",
        "#345E4A",
        "#3B6B56",
        "#427962",
        "#4A866E",
        "#52947A",
        "#5AA186",
        "#62AF92",
        "#6ABC9E",
        "#72C9AA",
      ],
      mutedPurple: [
        "#352C50",
        "#40345E",
        "#4B3B6B",
        "#564279",
        "#614A86",
        "#6C5294",
        "#775AA1",
        "#8262AF",
        "#8D6ABC",
        "#9872C9",
      ],
      mutedOrange: [
        "#503C2C",
        "#5E4634",
        "#6B5041",
        "#795A4E",
        "#86645A",
        "#94706C",
        "#A17A78",
        "#AF8485",
        "#BC8E92",
        "#C9989F",
      ],
      mutedTeal: [
        "#2C504C",
        "#345E59",
        "#3B6B66",
        "#427973",
        "#4A8680",
        "#52948D",
        "#5AA19A",
        "#62AFA7",
        "#6ABCB4",
        "#72C9C1",
      ],
      mutedPink: [
        "#502C48",
        "#5E3457",
        "#6B3B65",
        "#794273",
        "#864A81",
        "#94528F",
        "#A15A9D",
        "#AF62AA",
        "#BC6AB8",
        "#C972C5",
      ],
    },
    primaryColor,
    secondaryColor: "mutedAmber",
    highlightColor: "mutedRed",
    components: {
      Button: {
        styles: (theme: MantineTheme) => ({
          root: {
            color: theme.colors[theme.secondaryColor][5],
            backgroundColor: theme.colors[theme.primaryColor][5],
            borderColor: theme.colors[theme.highlightColor][5],
          },
        }),
      },
    },
  });
};

export default createAppTheme;
