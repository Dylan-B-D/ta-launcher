import { Divider, Space, SegmentedControl, Title, Text } from '@mantine/core';
import { useConfig } from '../contexts/ConfigContext';


const LaunchOptions = () => {
  const { config, setConfig } = useConfig();
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title order={4}>Launch Method</Title>
        <Text size="sm" c="dimmed"><strong>Recommended:</strong> Non-Steam</Text>
      </div>
      <Text size="sm" c="dimmed">
        <strong>Non-Steam:</strong> Launches the executable directly, and can inject based on game events.
      </Text>
      <Text size="sm" c="dimmed">
        <strong>Steam:</strong> Launches the game through Steam, using a timer for injection.
      </Text>
      <Space h="sm" />
      <SegmentedControl
        color="cyan"
        value={config.launchMethod}
        onChange={(value) => setConfig((prev: any) => ({ ...prev, launchMethod: value }))}
        data={["Non-Steam", "Steam"]}
      />

      <Divider my="xs" />

      <Title order={4}>Login Server</Title>
      <Text size="sm" c="dimmed">
        Select a server to connect to:
      </Text>
      <Text size="sm" c="dimmed">
        <strong>Community:</strong> Community login server hosted by Griffon.
      </Text>
      <Text size="sm" c="dimmed">
        <strong>PUG:</strong> PUG login server hosted by Dodge, used for organized and competitive play with custom rulesets.
      </Text>
      <Text size="sm" c="dimmed">
        <strong>Custom:</strong> Allows connection to a custom login server.
      </Text>
      <Space h="sm" />
      <SegmentedControl
        color="cyan"
        value={config.loginServer}
        onChange={(value) => setConfig((prev: any) => ({ ...prev, loginServer: value }))}
        data={["Community", "PUG", "Custom"]}
      />

      <Divider my="xs" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title order={4}>DLL Version</Title>
        <Text size="sm" c="dimmed"><strong>Recommended:</strong> Release</Text>
      </div>
      <Text size="sm" c="dimmed">
        <strong>Release:</strong> The latest stable version of TAMods.
      </Text>
      <Text size="sm" c="dimmed">
        <strong>Note:</strong> Other versions are primarily used for testing purposes.
      </Text>
      <Space h="sm" />
      <SegmentedControl
        color="cyan"
        value={config.dllVersion}
        onChange={(value) => setConfig((prev: any) => ({ ...prev, dllVersion: value }))}
        data={["Release", "Beta", "Edge"]}
      />
    </>
  );
}

export default LaunchOptions;
