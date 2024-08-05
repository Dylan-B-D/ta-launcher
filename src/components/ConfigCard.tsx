import { Paper, Text, Group, Box } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { CheckConfigResult, ReplaceConfigResult } from "../interfaces";
import classes from "./CardGradient.module.css";
import { confirm } from "@tauri-apps/plugin-dialog";
import { Notification } from "../interfaces";

interface ConfigCardProps {
  title: string;
  author: string;
  description: string;
  configId: string;
  setNotification: (notification: Notification) => void;
  fetchConfigFiles: () => void;
}

export function ConfigCard({
  title,
  author,
  description,
  configId,
  setNotification,
  fetchConfigFiles,
}: ConfigCardProps) {
  const handleSelectConfig = async () => {
    try {
      const result = (await invoke("check_config", {
        configVariant: configId,
      })) as CheckConfigResult;

      if (result.exists) {
        const confirmed = await confirm(
          "A config file already exists. This will replace it. \nAre you sure?",
          {
            title: "Confirmation",
            kind: "warning",
          }
        );
        if (confirmed) {
          const replaceResult = (await invoke("replace_config", {
            configVariant: configId,
          })) as ReplaceConfigResult;
          setNotification({
            visible: true,
            message: replaceResult.message,
            icon: <IconCheck />,
            color: "green",
            title: "Success",
          });
        } else {
          console.log("User cancelled the operation");
        }
      } else {
        setNotification({
          visible: true,
          message: "Preset Loaded",
          icon: <IconCheck />,
          color: "green",
          title: "Success",
        });
      }
    } catch (error) {
      setNotification({
        visible: true,
        message: "Error handling the configuration file.",
        icon: <IconX />,
        color: "red",
        title: "Error",
      });
      console.error("Error handling the configuration file:", error);
    }
    fetchConfigFiles();
  };

  return (
    <Paper
      radius="sm"
      className={classes.card}
      p={0}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
      onClick={handleSelectConfig}
    >
      <Group
        justify="space-between"
        align="start"
        wrap="nowrap"
        p={0}
        style={{ padding: "2px 8px" }}
      >
        <Box
          style={{
            paddingLeft: 10,
            paddingRight: 5,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box style={{ display: "flex", flexDirection: "column" }}>
            <Text size="sm" fw={600} lineClamp={1}>
              {title}
            </Text>
          </Box>
          <Text size="xs" c="dimmed" lineClamp={1}>
            by {author}
          </Text>
        </Box>
      </Group>
      <Box
        style={{ flex: 1, paddingLeft: 10, paddingRight: 2, paddingBottom: 2 }}
      >
        <Text c="dimmed" size="xs" lineClamp={2} style={{ textAlign: "left" }}>
          {description}
        </Text>
      </Box>
    </Paper>
  );
}
