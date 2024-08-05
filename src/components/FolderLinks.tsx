import { Grid, Card, Text, Group } from "@mantine/core";
import { IoOpenOutline } from "react-icons/io5";
import { openDirectory } from "../utils/utils";

const FolderLinks = () => {
  return (
    <Grid mt="sm" gutter="md">
      <Grid.Col span={6}>
        <Card
          className="card-custom"
          shadow="sm"
          padding="sm"
          onClick={() => openDirectory("config")}
          style={() => ({
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          })}
        >
          <Group justify="space-between">
            <Text fw={500}>Config Folder</Text>
            <IoOpenOutline style={{ fontSize: "24px" }} />
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          })}
        >
          <Group justify="space-between">
            <Text fw={500}>Launcher Config</Text>
            <IoOpenOutline style={{ fontSize: "24px" }} />
          </Group>
          <Text size="sm" c="dimmed">
            Contains TAMods DLLs, launcher configuration, and downloaded
            packages.
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          })}
        >
          <Group justify="space-between">
            <Text fw={500}>Game Folder</Text>
            <IoOpenOutline style={{ fontSize: "24px" }} />
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
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            cursor: "pointer",
          })}
        >
          <Group justify="space-between">
            <Text fw={500}>Tribes Install Folder</Text>
            <IoOpenOutline style={{ fontSize: "24px" }} />
          </Group>
          <Text size="sm" c="dimmed">
            The location of your Tribes installation.
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default FolderLinks;
