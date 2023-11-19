import { useState } from 'react';
import { Paper, Text, Button } from '@mantine/core';

const LogFileSection = () => {
  const [logSize, setLogSize] = useState('10MB'); // Placeholder value

  const handleClearLog = () => {
    // Logic to clear log
  };

  return (
    <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
      <Text>Game Log Folder Size: {logSize}</Text>
      <Button onClick={handleClearLog}>Clear Log</Button>
    </Paper>
  );
};

export default LogFileSection;
