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
    },
  });
};


export default createAppTheme;