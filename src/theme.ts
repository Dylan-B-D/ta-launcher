// theme.ts
import { MantineTheme, createTheme } from "@mantine/core";

declare module "@mantine/core" {
  interface MantineTheme {
    secondaryColor: string;
    tertiaryColor: string;
  }
}

const createAppTheme = (primaryColor: string, secondaryColor: string, tertiaryColor: string) => {
  const primaryFontFamily = '"Nunito Sans", sans-serif';
  const secondaryFontFamily = '"Roboto", sans-serif';

  return createTheme({
    fontFamily: primaryFontFamily,

    //  https://mantine.dev/colors-generator/
    //  Colors for UI components, try to keep intensity range normalised.
    //  Intensity ranges should be from light to dark.
    //  Default colors are set in ./context/ThemeContext.tsx

    colors: {
      mutedBlue: [
        "#729FCA",
        "#6A96BC",
        "#628BAF",
        "#5A80A1",
        "#527594",
        "#4A6A86",
        "#425F79",
        "#3B546B",
        "#34495E",
        "#2C3E50",
      ],
      
      mutedAmber: [
        "#FFF3E9",
        "#FFE8D4",
        "#FFD2BE",
        "#F3BCA8",
        "#D8A593",
        "#BD8F7D",
        "#A27A68",
        "#876452",
        "#6C4F3D",
        "#50392C",
      ],
      
      mutedRed: [
        "#DB9090",
        "#CC8484",
        "#BD7878",
        "#AE6C6C",
        "#9F6060",
        "#905454",
        "#814848",
        "#723C3C",
        "#633030",
        "#542424",
      ],
      
      mutedGreen: [
        "#72C9AA",
        "#6ABC9E",
        "#62AF92",
        "#5AA186",
        "#52947A",
        "#4A866E",
        "#427962",
        "#3B6B56",
        "#345E4A",
        "#2C503E",
      ],
      
      mutedPurple: [
        "#9872C9",
        "#8D6ABC",
        "#8262AF",
        "#775AA1",
        "#6C5294",
        "#614A86",
        "#564279",
        "#4B3B6B",
        "#40345E",
        "#352C50",
      ],
      
      mutedOrange: [
        "#C9989F",
        "#BC8E92",
        "#AF8485",
        "#A17A78",
        "#94706C",
        "#86645A",
        "#795A4E",
        "#6B5041",
        "#5E4634",
        "#503C2C",
      ],
      
      mutedTeal: [
        "#72C9C1",
        "#6ABCB4",
        "#62AFA7",
        "#5AA19A",
        "#52948D",
        "#4A8680",
        "#427973",
        "#3B6B66",
        "#345E59",
        "#2C504C",
      ],
      
      mutedPink: [
        "#C972C5",
        "#BC6AB8",
        "#AF62AA",
        "#A15A9D",
        "#94528F",
        "#864A81",
        "#794273",
        "#6B3B65",
        "#5E3457",
        "#502C48",
      ],
      
    },
    primaryColor,
    secondaryColor,
    tertiaryColor,
    components: {
      Button: {
        styles: (theme: MantineTheme) => ({
          root: {
            fontFamily: secondaryFontFamily,
            color: theme.colors[theme.secondaryColor][5],
            backgroundColor: theme.colors[theme.primaryColor][5],
            borderColor: theme.colors[theme.tertiaryColor][5],
          },
        }),
      },
    },
  });
};

export default createAppTheme;
