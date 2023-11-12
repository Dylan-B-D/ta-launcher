// ColorBox.tsx
import { useMantineTheme } from '@mantine/core';

const ColorBox = () => {
  const theme = useMantineTheme();

  const boxStyle = {
    width: '100px',
    height: '100px',
    backgroundColor: theme.colors.mutedBlue[5], // Using the fifth shade of mutedBlue
    color: theme.colors.lightGray[0], // Light text color for contrast
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.md,
    margin: '10px',
  };

  return <div style={boxStyle}>Box</div>;
};

export default ColorBox;
