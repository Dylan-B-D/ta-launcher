import { useEffect, useState } from "react";
import {
  Container,
  Button,
  Stepper,
  Group,
  Center,
  Title,
  Text,
  rem,
  Paper,
} from "@mantine/core";
import { IconAlertCircle, IconCircleX } from "@tabler/icons-react";
import { FirstTimeSetupProps, Notification } from "../../interfaces";

import { GamePathStep } from "../GamePathStep";
import NotificationPopup from "../NotificationPopup";
import LaunchOptions from "../LaunchOptionsStep";
import { checkAndFindGamePath, findGamePath } from "../../utils/utils";
import PackagesTable from "../PackageTable";
import { useDownloadContext } from "../../contexts/DownloadContext";
import { useConfig } from "../../contexts/ConfigContext";
import UsefulResources from "../UsefulResources";
import DownloadProgressIndicator from "../DownloadProgressIndicator";
import ConfigStep from "../ConfigStep";

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [active, setActive] = useState(0);
  const [gamePathError, setGamePathError] = useState(false);
  const { getQueue } = useDownloadContext();
  const { config, setConfig, saveConfig } = useConfig();
  const queueLength = getQueue().length;
  const [notification, setNotification] = useState<Notification>({
    visible: false,
    message: "",
    title: "",
    color: "",
    icon: null,
  });

  // Initilize: Game Path, and Config Files
  useEffect(() => {
    findGamePath(setConfig);
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    checkAndFindGamePath(config, setConfig);

    // Check if there are downloads in progress
    if (getQueue().length > 0) {
      setNotification({
        visible: true,
        message: `There are ${queueLength} downloads in progress. Please wait for them to finish before proceeding.`,
        title: "Downloads In Progress",
        color: "orange",
        icon: <IconAlertCircle />,
      });
      return;
    }

  // Check for empty config values: "gamePath", "customServerIP", and "customDLLPath"
  const requiredFields = ["gamePath", "customServerIP", "customDLLPath"];
  const emptyFields = Object.entries(config)
    .filter(([key, value]) => {
      if (!requiredFields.includes(key)) return false;
      if (key === "customServerIP" && config.loginServer !== "Custom")
        return false;
      if (key === "customDLLPath" && config.dllVersion !== "Custom")
        return false;
      return value === "";
    })
    .map(([key]) => key);

  if (emptyFields.length > 0) {
    setNotification({
      visible: true,
      message: `You cannot continue without: ${emptyFields.join(", ")}`,
      title: "Missing Configuration",
      color: "red",
      icon: <IconAlertCircle />,
    });
    return;
  }

    await saveConfig(config);
    localStorage.setItem("isFirstTime", "false");
    onComplete();
  };

  useEffect(() => {
    if (active === 1) {
      setGamePathError(config.gamePath.trim() === "");
    }
  }, [active, config.gamePath]);

  const nextStep = () => {
    checkAndFindGamePath(config, setConfig);
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const prevStep = () => {
    checkAndFindGamePath(config, setConfig);
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <>
      {/* Notification Popup */}
      <NotificationPopup
        visible={notification.visible}
        message={notification.message}
        title={notification.title}
        color={notification.color}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        icon={notification.icon}
      />
      <Container
        bg={
          "radial-gradient(circle at top center, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), " +
          "radial-gradient(circle at bottom center, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), " +
          "radial-gradient(circle at top left, rgba(120, 128, 128, 0.6), transparent), " +
          "radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.6), transparent), " +
          "url('/images/bg1.jpg') no-repeat center center / cover"
        }
        p={0}
        fluid
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Stepper
            p={"md"}
            color="teal"
            size="sm"
            active={active}
            onStepClick={setActive}
          >
            {/* ----------- Welcome ----------- */}
            <Stepper.Step label="Welcome">
              <Center
                style={{
                  flexDirection: "column",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <Title order={2}>First-Time Setup</Title>
                <Text size="sm" c="dimmed">
                  Any options changed here can be modified later. For additional
                  assistance, ask for help in one of the following Discord
                  servers or message 'evxl.' on Discord.
                </Text>
                <UsefulResources />
              </Center>
            </Stepper.Step>

            {/* ----------- Game Path ----------- */}
            <Stepper.Step
              label="Game Path"
              color={gamePathError ? "red" : "teal"}
              completedIcon={
                gamePathError ? (
                  <IconCircleX style={{ width: rem(20), height: rem(20) }} />
                ) : undefined
              }
            >
              <GamePathStep
                gamePathError={gamePathError}
                setGamePathError={setGamePathError}
              />
            </Stepper.Step>

            {/* ----------- Packages ----------- */}
            <Stepper.Step label="Packages">
              <PackagesTable />
            </Stepper.Step>

            {/* ----------- Launch Options ----------- */}
            <Stepper.Step label="Options">
              <Paper p="lg" bg="rgba(255,255,255,0.04)" radius="lg">
                <LaunchOptions />
              </Paper>
            </Stepper.Step>

            {/* ----------- Config Options ----------- */}
            <Stepper.Step label="Config">
              <ConfigStep />
            </Stepper.Step>
          </Stepper>
        </div>

        {/* ----------- Footer ----------- */}
        <Group
          p="xs"
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "rgba(128, 128, 128, 0.04)",
            backdropFilter: "blur(6px)",
            borderTop: "solid 1px rgba(128, 128, 128, 0.25)",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {queueLength > 0 ? (
            <DownloadProgressIndicator />
          ) : (
            <div style={{ width: 30 }}></div> // Placeholder to maintain space
          )}
          <Group>
            <Button
              color="cyan"
              radius="xl"
              variant="subtle"
              size="sm"
              onClick={prevStep}
            >
              Back
            </Button>
            {active === 4 ? (
              <Button
                radius="md"
                variant="gradient"
                gradient={{ from: "cyan", to: "teal", deg: 253 }}
                size="sm"
                onClick={handleSetup}
                style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)" }}
              >
                Finish
              </Button>
            ) : (
              <Button
                radius="md"
                variant="gradient"
                gradient={{ from: "cyan", to: "teal", deg: 253 }}
                size="sm"
                onClick={nextStep}
                style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)" }}
              >
                Next
              </Button>
            )}
          </Group>
        </Group>
      </Container>
    </>
  );
};

export default FirstTimeSetup;
