import { createTheme } from "@mantine/core";

const createAppTheme = () => {
  return createTheme({
    fontFamily: "Maven Pro, sans-serif",
    components: {
      Modal: {
        styles: () => ({
          content: {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(5px)",
            backgroundImage:
              "radial-gradient(circle at bottom right,rgba(12,133,153, 0.2), rgba(9,146,104, 0.3))",
          },
        }),
      },
      Card: {
        styles: () => ({
          root: {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
            backgroundImage:
              "radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))",
          },
        }),
      },
      Paper: {
        styles: () => ({
          root: {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
            backgroundImage:
              "radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
        }),
      },
      Fieldset: {
        styles: () => ({
          root: {
            border: "none",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
            backgroundImage:
              "radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
          },
        }),
      },
      Badge: {
        styles: () => ({
          root: {
            backdropFilter: "blur(8px)",
            backgroundImage:
              "radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
        }),
      },
      ActionIcon: {
        styles: () => ({
          root: {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.75)",
          },
        }),
      },
      Tooltip: {
        styles: () => ({
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            color: "white",
          },
        }),
      },
      Menu: {
        styles: () => ({
          dropdown: {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          },
        }),
      },
      Table: {
        styles: () => ({
          table: {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          },
        }),
      },
      SegmentedControl: {
        styles: () => ({
          root: {
            backgroundColor: "none",
            outline: "none",
            padding: "0",
            border: "none",
            margin: "0",
          },
          control: {
            backgroundColor: "rgba(200, 200, 200, 0.15)",
          },
        }),
      },
      Stepper: {
        styles: () => ({
          stepIcon: {
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          },
          separator: {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
          },
          stepLabel: {
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
          },
        }),
      },
      Text: {
        styles: () => ({
          root: {
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.35)",
          },
        }),
      },
      Title: {
        styles: () => ({
          root: {
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.25)",
          },
        }),
      },
    },
  });
};

export default createAppTheme;
