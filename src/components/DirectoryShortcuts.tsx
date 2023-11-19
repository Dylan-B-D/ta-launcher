import { Paper, Button, Group } from '@mantine/core';

const DirectoryButtonsSection = () => {
  const handleOpenFolder = (folderType: string) => {
    // Logic to open different directories
  };

  return (
    <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
      <Group>
        <Button onClick={() => handleOpenFolder('config')}>Open Config Dir</Button>
        <Button onClick={() => handleOpenFolder('routes')}>Open Routes Sub-Dir</Button>
        <Button onClick={() => handleOpenFolder('hudmodules')}>Open HUD Modules Sub-Dir</Button>
        <Button onClick={() => handleOpenFolder('game')}>Open Game Dir</Button>
        <Button onClick={() => handleOpenFolder('launcher')}>Open Launcher Dir</Button>
      </Group>
    </Paper>
  );
};

export default DirectoryButtonsSection;
