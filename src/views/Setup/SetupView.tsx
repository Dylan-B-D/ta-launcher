// SetupView.tsx

import {  useState } from 'react';
import { Button, Text, useMantineTheme } from '@mantine/core';
import { open } from '@tauri-apps/api/dialog';
import classes from './SetupView.module.css';

const SetupView = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const theme = useMantineTheme();

  const selectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Executables', extensions: ['exe'] }],
    });

    if (selected) {
      setSelectedFile(selected as string);
    }
  };

  return (
    <div className={classes.container}>
      <Button 
      variant="filled" 
      className={classes.customButton}
      style={{  }}
      fullWidth 
      mt="md" 
      radius="xs"
      onClick={selectFile}
      >
        Select Executable
      </Button>
      {selectedFile && (
        <Text className={classes.selectedFile}>
          Selected File: {selectedFile}
        </Text>
      )}
    </div>
  );
};

export default SetupView;
