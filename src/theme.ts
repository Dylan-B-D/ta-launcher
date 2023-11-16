// theme.ts
import { createTheme } from "@mantine/core";

export const darkTheme = createTheme({
  // Color palette
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
      "#50392C", // Dark, rich amber
      "#6C4F3D", // Dark muted amber
      "#876452", // Deep muted amber
      "#A27A68", // Rich muted amber
      "#BD8F7D", // Mid-tone muted amber
      "#D8A593", // Neutral muted amber
      "#F3BCA8", // Light muted amber
      "#FFD2BE", // Very light muted amber
      "#FFE8D4", // Pale muted amber
      "#FFF3E9", // Almost white amber
    ],


    // Additional muted colors
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

    mutedPurple: [
      "#423C52",
      "#504862",
      "#5E5472",
      "#6C6082",
      "#7A6C92",
      "#8878A2",
      "#9684B2",
      "#A490C2",
      "#B29CD2",
      "#C0A8E2",
    ],


    lightGray: [
      "#f8f9fa", // Very light gray
      "#f2f3f4", // Slightly darker
      "#eceef0", // Light gray
      "#e6e8eb", // Mid-light gray
      "#dfe1e3", // Neutral gray
      "#d9dbdd", // Slightly darker gray
      "#d3d5d7", // Darker gray
      "#cdced0", // Medium gray
      "#c7c8c9", // Medium-dark gray
      "#c1c2c3", // Darkest shade in light gray range
    ],

    darkGray: [
      "#0a0b0d", // Almost black
      "#131415", // Very dark gray
      "#1c1d1f", // Darker gray
      "#252729", // Dark gray
      "#2e3032", // Mid-dark gray
      "#37393b", // Neutral dark gray
      "#404346", // Slightly lighter gray
      "#494c4f", // Medium-dark gray
      "#525559", // Medium gray
      "#5b5e61", // Lightest shade in dark gray range
    ],

  },

  // Customize other theme properties as desired
  primaryColor: "mutedBlue", // Using the muted blue as the primary color
  shadows: {
    md: "0px 2px 4px rgba(0, 0, 0, 0.5)", // Custom shadow
    xl: "0px 4px 8px rgba(0, 0, 0, 0.6)", // Custom shadow
  },
  headings: {
    fontFamily: "Arial, sans-serif", // Custom font for headings
    sizes: {
      h1: { fontSize: "24px", fontWeight: "500" },
      h2: { fontSize: "20px", fontWeight: "500" },
    },
  },
});
