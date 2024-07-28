import { useContext, useEffect, useState } from "react";
import { Container, Button, Stepper, Group, Space, Center, Title, Text, Grid, rem, RingProgress } from "@mantine/core";
import { loadConfig, saveConfig } from "../../utils/config";
import { CardGradient } from "../CardGradient";
import { discordResources, usefulResources } from "../../data/usefulResources";
import { IconAlertCircle, IconCircleX } from '@tabler/icons-react';
import { ConfigCard } from "../ConfigCard";
import { configPresets } from "../../data/configPresets";
import { ConfigFile, ConfigState, FirstTimeSetupProps } from "../../interfaces";
import { iniFields, inputIniFields } from "../../data/iniFields";
import ConfigSettingsTable from "../ConfigSettingsTable";
import SensitivityCalculator from "../SensitivityCalculator";
import { GamePathStep } from "../GamePathStep";
import NotificationPopup from "../NotificationPopup";
import LaunchOptions from "../LaunchOptionsStep";
import { checkAndFindGamePath, fetchConfigFiles, findGamePath, handleDpiChange, handleGamePathChange, handleInputChange, handleSensitivityChange } from "../../utils/utils";
import PackagesTable from "../PackageTable";
import { DownloadContext } from "../../contexts/DownloadContext";

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [active, setActive] = useState(0);
  const [, setFileFound] = useState<null | boolean>(null);
  const [gamePathError, setGamePathError] = useState(false);
  const [, setTribesIni] = useState<ConfigFile | null>(null);
  const [, setTribesInputIni] = useState<ConfigFile | null>(null);
  const [iniValues, setIniValues] = useState<{ [key: string]: boolean | number }>({});
  const allFields = [...iniFields, ...inputIniFields];
  const third = Math.ceil(allFields.length / 3); // Divides fields into 3 columns
  const { getTotalSize, getOverallProgress, getQueue } = useContext(DownloadContext);
  const downloadPercentage = (getOverallProgress() / getTotalSize()) * 100;
  const [config, setConfig] = useState<ConfigState>({
    gamePath: "",
    loginServer: "Community",
    launchMethod: "Non-Steam",
    dllVersion: "Release",
    dpi: 800,
  });
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    title: string;
    color: string;
    icon: JSX.Element | null;
  }>({
    visible: false,
    message: '',
    title: '',
    color: '',
    icon: null,
  });

  // Initilize: Game Path, Config Files, Config Values and Packages
  useEffect(() => {
    findGamePath(setConfig, setFileFound);
    fetchConfigFiles(setTribesIni, setTribesInputIni, setIniValues);
    loadConfig(setConfig);
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    checkAndFindGamePath(config, setConfig, setFileFound);

    // Check if there are downloads in progress
    const queueLength = getQueue().length;
    if (queueLength > 0) {
      setNotification({
        visible: true,
        message: `There are ${queueLength} downloads in progress. Please wait for them to finish before proceeding.`,
        title: "Downloads In Progress",
        color: "orange",
        icon: <IconAlertCircle />,
      });
      return;
    }

    // Check for empty config values
    const emptyFields = Object.entries(config)
      .filter(([, value]) => value === "")
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
    // localStorage.setItem("isFirstTime", "false");
    onComplete();
  };

  useEffect(() => {
    if (active === 1) {
      setGamePathError(config.gamePath.trim() === '');
    }
  }, [active, config.gamePath]);

  const nextStep = () => {
    checkAndFindGamePath(config, setConfig, setFileFound);
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const prevStep = () => {
    checkAndFindGamePath(config, setConfig, setFileFound);
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <>
      <NotificationPopup
        visible={notification.visible}
        message={notification.message}
        title={notification.title}
        color={notification.color}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
        icon={notification.icon}
      />
      <Container p={0} fluid style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Stepper p={"md"} color="teal" size="sm" active={active} onStepClick={setActive}>

            {/* ----------- Welcome ----------- */}
            <Stepper.Step label="Welcome">
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
                <Title order={2}>First-time Setup</Title>
                <Text size="sm" c="dimmed">
                  Any options changed here can be modified later. For additional assistance, ask for help in one of the following Discord servers or message 'evxl.' on Discord.
                </Text>
                <Title mt="md" order={5}>Discord Links</Title>
                <Grid mt="4px">
                  {discordResources.map((resource, index) => (
                    <Grid.Col span={4} key={index}>
                      <CardGradient
                        icon={resource.icon}
                        image={resource.image}
                        gradient={resource.gradient}
                        title={resource.title}
                        description={resource.description}
                        link={resource.link}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
                <Title mt="md" order={5}>Useful Resource Links</Title>
                <Grid mt="4px">
                  {usefulResources.map((resource, index) => (
                    <Grid.Col span={4} key={index}>
                      <CardGradient
                        icon={resource.icon}
                        image={resource.image}
                        gradient={resource.gradient}
                        title={resource.title}
                        description={resource.description}
                        link={resource.link}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Center>
            </Stepper.Step>

            {/* ----------- Game Path ----------- */}
            <Stepper.Step
              label="Game Path"
              color={gamePathError ? "red" : "teal"}
              completedIcon={gamePathError ? <IconCircleX style={{ width: rem(20), height: rem(20) }} /> : undefined}
            >
              <GamePathStep
                config={config}
                setConfig={setConfig}
                setFileFound={setFileFound}
                gamePathError={gamePathError}
                handleGamePathChange={(value) => handleGamePathChange(value, setConfig, setGamePathError)}
                findGamePath={() => findGamePath(setConfig, setFileFound)}
              />

            </Stepper.Step>

            {/* ----------- Packages ----------- */}
            <Stepper.Step label="Packages">
              <PackagesTable config={config} />
            </Stepper.Step>

            {/* ----------- Launch Options ----------- */}
            <Stepper.Step label="Options">
              <LaunchOptions config={config} setConfig={setConfig} />

            </Stepper.Step>

            {/* ----------- Config Options ----------- */}
            <Stepper.Step label="Config">
              <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%', width: '100%' }}>
                <Text c="dimmed" size="sm">
                  <strong>Tribes.ini Presets:</strong> Select a preset to apply (if you want).
                </Text>
                <Text c="dimmed" size="sm">
                  *INI files are graphics config files that let you change more options that in-game.
                </Text>
                <Grid mt="xs" gutter="xs">
                  {configPresets.map((config) => (
                    <Grid.Col span={4} key={config.id}>
                      <ConfigCard
                        title={config.displayName}
                        author={config.author}
                        description={config.description}
                        configId={config.id}
                        setNotification={setNotification}
                        fetchConfigFiles={async () => {
                          await fetchConfigFiles(setTribesIni, setTribesInputIni, setIniValues);
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
                <Space h="xs" />
                <Group align="flex-start" gap='sm' grow style={{ width: '100%' }}>
                  <ConfigSettingsTable
                    fields={iniFields.slice(0, third)}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('main', key, value, setIniValues)}
                  />
                  <ConfigSettingsTable
                    fields={iniFields.slice(third, third * 2)}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('main', key, value, setIniValues)}
                  />
                  <ConfigSettingsTable
                    fields={inputIniFields}
                    iniValues={iniValues}
                    handleInputChange={(key, value) => handleInputChange('input', key, value, setIniValues)}
                  />
                </Group>

                <SensitivityCalculator
                  mouseSensitivity={iniValues.MouseSensitivity as number}
                  FOVSetting={iniValues.FOVSetting as number}
                  dpi={config.dpi}
                  onDpiChange={(value) => handleDpiChange(value, setConfig)}
                  onSensitivityChange={(value) => handleSensitivityChange(value, iniValues, config, handleInputChange, setIniValues)}
                />

              </Center>
            </Stepper.Step>
          </Stepper>
        </div>
        <Group
          p={"xs"}
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "rgba(128, 128, 128, 0.1)",
            borderTop: "solid 1px rgba(128, 128, 128, 0.25)",
            zIndex: 999,
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {getQueue().length > 0 ? (
            <RingProgress
              size={35}
              thickness={2}
              roundCaps
              label={
              <Text size="sm" ta="center">
                {Math.floor(downloadPercentage)}
              </Text>
              }
              sections={[
                { value: downloadPercentage, color: 'teal' }
              ]}
              style={{ margin: 0 }}
            />
          ) : (
            <div style={{ width: 30 }}></div> // Placeholder to maintain space
          )}
          <Group>
            <Button color="cyan" radius="xl" variant="subtle" size="sm" onClick={prevStep}>Back</Button>
            {active === 4 ? (
              <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={handleSetup}>Finish</Button>
            ) : (
              <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={nextStep}>Next</Button>
            )}
          </Group>
        </Group>
      </Container></>
  );
};

export default FirstTimeSetup;