import { useEffect, useState } from "react";
import { Container, Button, TextInput, Stepper, Group, Space, Center, Title, Text, SegmentedControl, Divider, Grid } from "@mantine/core";
import { open } from '@tauri-apps/plugin-dialog';
import { saveConfig } from "../../utils/config";
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { CgWebsite } from 'react-icons/cg';
import { CardGradient } from "../CardGradient";
import { invoke } from "@tauri-apps/api/core";

interface FirstTimeSetupProps {
  onComplete: () => void;
}

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [active, setActive] = useState(0);
  const [config, setConfig] = useState({
    gamePath: "",
    packages: [] as string[],
    loginServer: "Community",
    iniConfig: "",
    launchMethod: "Non-Steam",
    dllVersion: "Release",
  });

  const [fileFound, setFileFound] = useState<null | boolean>(null);

  const nextStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current < 5 ? current + 1 : current));
  };

  const prevStep = () => {
    checkAndFindGamePath();
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  const resources = [
    {
      title: "Tribes Ascend Community Hub",
      description: "Active North American Discord Server, used for Mixers and PUGs.",
      link: "https://discord.com/invite/dd8JgzJ",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'cyan', to: 'blue' },
    },
    {
      title: "EU GOTY Community",
      description: "Inactive EU Discord Server, used for PUGs.",
      link: "https://discord.com/invite/e7T8Pxs",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'gray', to: 'darkgray' },
    },
    {
      title: "TAServer Discord",
      description: "Griffon's Discord, used for the community login server, and server hosting.",
      link: "https://discord.com/invite/8enekHQ",
      icon: FaDiscord,
      gradient: { deg: 135, from: 'teal', to: 'green' },
    },
    {
      title: "TAMods",
      description: "Info about TAMods, and guides on writing hud modules and scripts.",
      link: "https://www.tamods.org/",
      icon: CgWebsite,
      gradient: { deg: 135, from: 'blue', to: 'indigo' },
    },
    {
      title: "Dodge's Domain",
      description: "Additional information on game setup, and resources for community map development",
      link: "https://www.dodgesdomain.com/",
      icon: CgWebsite,
      gradient: { deg: 135, from: 'green', to: 'lime' },
    },
    {
      title: "TA Server GitHub",
      description: "Host Your Own Servers",
      link: "https://github.com/Griffon26/taserver/",
      icon: FaGithub,
      gradient: { deg: 135, from: 'red', to: 'orange' },
    },
  ];

  const handleSetup = async (e: React.FormEvent) => {
    checkAndFindGamePath();
    e.preventDefault();
    // Save configuration to a file
    await saveConfig(config);
    // localStorage.setItem("isFirstTime", "false");
    onComplete();
  };

  const selectFile = async () => {
    try {
      const selected = await open();

      if (selected && typeof selected.path === "string" && selected.path.endsWith(".exe")) {
        setConfig((prevConfig) => ({ ...prevConfig, gamePath: selected.path }));
        setFileFound(true);
      } else {
        setFileFound(false);
      }
    } catch (error) {
      console.error("Error selecting file:", error); // Log any errors
    }
  };

  const findGamePath = async () => {
    try {
      const path = await invoke<string>("find_path");
      if (path) {
        setConfig((prevConfig) => ({ ...prevConfig, gamePath: path }));
        setFileFound(true);
      } else {
        setFileFound(false);
      }
    } catch (error) {
      console.error("Failed to find game path:", error);
      setFileFound(false);
    }
  };

  useEffect(() => {
    findGamePath();
  }, []);

  const checkAndFindGamePath = () => {
    if (config.gamePath === "") {
      findGamePath();
    }
  };

  return (
    <Container p={0} fluid style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Stepper p={"md"} color="teal" size="sm" active={active} onStepClick={setActive}>

          {/* ----------- Welcome ----------- */}
          <Stepper.Step label="Welcome">
            <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
              <Title order={2}>First-time Setup</Title>
              <Text size="sm" c="dimmed">
                Any options changed here can be modified later. For additional assistance, ask for help in the Discord server or message 'evxl.' on Discord. Here are some links that may be useful:
              </Text>
              <Grid mt="md">
                {resources.map((resource, index) => (
                  <Grid.Col span={4} key={index}>
                    <CardGradient
                      icon={resource.icon}
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
          <Stepper.Step label="Game Path">
            <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
              <Text size="sm" mt="md" c="dimmed">
                <strong>Note:</strong> A Tribes: Ascend installation is required. (<strong>Recommended:</strong> Steam version)
              </Text>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <Button
                  component="a"
                  href="steam://install/17080"
                  variant="outline"
                  color="cyan"
                >
                  Install Tribes: Ascend through Steam
                </Button>
                <Button
                  component="a"
                  href="https://library.theexiled.pwnageservers.com/file.php?id=2962"
                  target="_blank"
                  variant="outline"
                  color="cyan"
                >
                  Install Tribes: Ascend as a standalone from The Exiled
                </Button>
              </div>
              <Text size="sm" c="dimmed" mt="md">
                The launcher will try to automatically detect the game path if installed through steam. If it doesn't, you can manually enter the path to the TribesAscend.exe executable.
              </Text>
              <Text size="sm" c="dimmed">
                The executable is usually located in: '..\Tribes\Binaries\Win32\TribesAscend.exe'
              </Text>
            </Center>
            <Space h="lg" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TextInput
                style={{ flexGrow: 1 }}
                value={config.gamePath}
                onChange={(e) => setConfig({ ...config, gamePath: e.currentTarget.value })}
                placeholder="Enter game path..."
              />
              <Button color="cyan" onClick={selectFile}>Choose File</Button>
            </div>
            <Space h="lg" />
            <Center>
              <Button color="cyan" onClick={findGamePath}>Find Steam Game Path</Button>
            </Center>
          </Stepper.Step>

          {/* ----------- Packages ----------- */}
          <Stepper.Step label="Packages">
            <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
              <Text size="sm" mt="md" c="dimmed">
                If you do <strong>NOT</strong> wish to use <strong>TAMods</strong>, and you do <strong>NOT</strong> want to play on <strong>GOTY servers</strong>, then you can skip this step.
              </Text>
              <Text size="sm" c="dimmed">
                Otherwise, you will need the following packages:
              </Text>
            </Center>
            <Text size="sm" mt="md" c="dimmed">
              <strong>Minimum </strong>(GOTY and TAMODs): TAMods Core Library
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Recommended:</strong> TAMods Core Library, TAMods Standard Library, Community Made Maps, and Recommended GOTY Routes Library
            </Text>

            <Space h="lg" />
          </Stepper.Step>

          {/* ----------- Launch Options ----------- */}
          <Stepper.Step label="Options">
            <Title order={4}>Launch Method</Title>
            <Text size="sm" c="dimmed">
              <strong>Non-Steam:</strong> Launches executable directly, and can inject based on game events.
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Steam:</strong> Launches the game through Steam, and injects using a timer.
            </Text>
            <Space h="sm" />
            <SegmentedControl
              value={config.launchMethod}
              onChange={(value) => setConfig({ ...config, launchMethod: value })}
              data={["Non-Steam", "Steam"]}
            />
            <Text size="sm" c="dimmed">
              Recommended: Non-Steam
            </Text>

            <Divider my="md" />

            <Title order={4}>Login Server</Title>
            <Text size="sm" c="dimmed">
              Select a server to connect to.
            </Text>
            <Text size="sm" mt={"xs"} c="dimmed">
              <strong>Community:</strong> Community login server hosted by Griffon.
            </Text>
            <Text size="sm" c="dimmed">
              <strong>PUG:</strong> PUG login server hosted by Dodge. Used for organised and competitive play with custom rulesets.
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Custom:</strong> Enter a custom login server to connect to.
            </Text>
            <Space h="sm" />
            <SegmentedControl
              value={config.loginServer}
              onChange={(value) => setConfig({ ...config, loginServer: value })}
              data={["Community", "PUG", "Custom"]}
            />

            <Divider my="md" />

            <Title order={4}>DLL Version</Title>
            <Text size="sm" c="dimmed">
              <strong>Release:</strong> The latest stable version of TAMods.
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Note:</strong> Other versions are mostly used for testing purposes.
            </Text>
            <Space h="sm" />
            <SegmentedControl
              value={config.dllVersion}
              onChange={(value) => setConfig({ ...config, dllVersion: value })}
              data={["Release", "Beta", "Edge", "Custom"]}
            />
            <Text size="sm" c="dimmed">
              Recommended: Release
            </Text>
          </Stepper.Step>

          {/* ----------- Config Options ----------- */}
          <Stepper.Step label="Config">
            <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%' }}>
              <Title order={2}>Optional Config Settings</Title>
              <Text size="sm" mt="md" c="dimmed">
                You may skip this step if you would like to use the default config, and change setting in-game.
              </Text>
            </Center>
            <Space h="lg" />

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
          zIndex: 1000,
        }}
        justify="center"
      >
        <Button color="cyan" radius="xl" variant="subtle" size="sm" onClick={prevStep}>Back</Button>
        {active === 4 ? (
          <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={handleSetup}>Finish</Button>
        ) : (
          <Button radius="xl" variant="gradient" gradient={{ from: 'cyan', to: 'teal', deg: 253 }} size="sm" onClick={nextStep}>Next</Button>
        )}
      </Group>
    </Container>
  );
};

export default FirstTimeSetup;
