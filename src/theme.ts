import { createTheme } from "@mantine/core";

const createAppTheme = () => {
  return createTheme({
    fontFamily: 'Maven Pro, sans-serif',
    components: {
      Modal: {
        styles: () => ({
          content: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(5px)',
            backgroundImage: 'radial-gradient(circle at bottom right,rgba(12,133,153, 0.2), rgba(9,146,104, 0.3))',
          },
        }),
      },
      Card: {
        styles: () => ({
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(8px)',
            backgroundImage: 'radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))',
          }
        }),
      },
      Badge: {
        styles: () => ({
          root: {
            backdropFilter: 'blur(8px)',
            backgroundImage: 'radial-gradient(circle at bottom right,rgba(122,133,153, 0.1), rgba(9,146,104, 0.1))',
          }
        }),
      },
      Tooltip: {
        styles: () => ({
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
          },
        }),
      },
      Menu: {
        styles: () => ({
          dropdown: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }),
      },
    },
  });
};


export default createAppTheme;