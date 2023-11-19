import { Paper, Button, Group } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';

const DirectoryButtonsSection = () => {
  const handleOpenFolder = async (folderType: string) => {
    try {
      if (folderType === 'config') {
        await invoke('open_config_dir');
      } else if (folderType === 'routes') {
        await invoke('open_routes_sub_dir');
      } else if (folderType === 'hudmodules') {
        await invoke('open_hud_modules_sub_dir');
      } else if (folderType === 'game') {
        // Logic for opening the game directory
        // await invoke('open_game_dir');
      } else if (folderType === 'launcher') {
        await invoke('open_launcher_dir');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  return (
    <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
      <Group>
        <Button onClick={() => handleOpenFolder('config')}>Open Config Dir</Button>
        <Button onClick={() => handleOpenFolder('routes')}>Open Routes Sub-Dir</Button>
        <Button onClick={() => handleOpenFolder('hudmodules')}>Open HUD Modules Sub-Dir</Button>
        {/* <Button disabled onClick={() => handleOpenFolder('game')}>Open Game Dir</Button>  */}
        <Button onClick={() => handleOpenFolder('launcher')}>Open Launcher Dir</Button>
      </Group>
    </Paper>
  );
};

export default DirectoryButtonsSection;