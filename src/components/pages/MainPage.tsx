import { Container, Grid, Card, Text, Group, Title, List } from "@mantine/core";
import { IoOpenOutline } from "react-icons/io5";
import { invoke } from "@tauri-apps/api/core";

const ReleaseNotesCard = () => (
  <Card shadow="sm" padding="md" mb="md">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title order={4}>Version 0.1.1-beta2</Title>
      <Text size="sm" c="dimmed">
        Last updated: 2024.08.05
      </Text>
    </div>
    <List fz='sm' c='dimmed' mt="sm">
      <List.Item>Removed drop down from header.</List.Item>
      <List.Item>Fixed python check causing flicker.</List.Item>
      <List.Item>Fixed button sizes in config manager.</List.Item>
      <List.Item>Enabled Auto-Updater.</List.Item>
    </List>
  </Card>
);

const MainPage = () => {

  const openDirectory = async (pathType: string) => {
    try {
      await invoke("open_directory", { pathType });
    } catch (error) {
      console.error("Failed to open directory:", error);
    }
  };

  return (
    <Container mt='md' >
      <ReleaseNotesCard />
      <Grid mt="sm" gutter="md">
        <Grid.Col span={6}>
          <Card
            className="card-custom"
            shadow="sm"
            padding="sm"
            onClick={() => openDirectory("config")}
            style={() => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            })}
          >
            <Group justify='space-between'>
              <Text fw={500}>Config Folder</Text>
              <IoOpenOutline style={{ fontSize: '24px' }} />
            </Group>
            <Text size="sm" c="dimmed">
              Contains INI files, TAMods config, presets, and routes.
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            className="card-custom"
            shadow="sm"
            padding="sm"
            onClick={() => openDirectory("launcher_config")}
            style={() => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            })}
          >
            <Group justify='space-between'>
              <Text fw={500}>Launcher Config</Text>
              <IoOpenOutline style={{ fontSize: '24px' }} />
            </Group>
            <Text size="sm" c="dimmed">
              Contains TAMods DLLs, launcher configuration, and downloaded packages.
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            className="card-custom"
            shadow="sm"
            padding="sm"
            onClick={() => openDirectory("game_folder")}
            style={() => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            })}
          >
            <Group justify='space-between'>
              <Text fw={500}>Game Folder</Text>
              <IoOpenOutline style={{ fontSize: '24px' }} />
            </Group>
            <Text size="sm" c="dimmed">
              The folder containing the main game executable and assets.
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            className="card-custom"
            shadow="sm"
            padding="sm"
            onClick={() => openDirectory("tribes")}
            style={() => ({
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
            })}
          >
            <Group justify='space-between'>
              <Text fw={500}>Tribes Install Folder</Text>
              <IoOpenOutline style={{ fontSize: '24px' }} />
            </Group>
            <Text size="sm" c="dimmed">
              The location of your Tribes installation.
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default MainPage;
