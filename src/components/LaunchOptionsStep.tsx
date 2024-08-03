import { Divider, Space, SegmentedControl, Title, Text, TextInput, Modal, Button } from '@mantine/core';
import { useConfig } from '../contexts/ConfigContext';
import { useEffect, useState } from 'react';
import { useDownloadContext } from '../contexts/DownloadContext';

const LaunchOptions = () => {
  const { config, setConfig } = useConfig();
  const [customServerIP, setCustomServerIP] = useState(config.customServerIP || '');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingDLL, setPendingDLL] = useState('');
  const [pendingVersion, setPendingVersion] = useState('');
  const [downloadRequested, setDownloadRequested] = useState(false);
  const { addToQueue, getCompletedPackages } = useDownloadContext();
  const completedPackages = getCompletedPackages();

  useEffect(() => {
    if (config.loginServer === 'Custom') {
      setCustomServerIP(config.customServerIP || '');
    } else {
      setCustomServerIP('');
    }

    // Check if the current DLL version in config is available; if not, prompt the user
    const packageMap: { [key: string]: string } = {
      Release: 'tamods-dll',
      Beta: 'tamods-dll-beta',
      Edge: 'tamods-dll-edge',
    };

    const currentPackageId = packageMap[config.dllVersion];
    if (config.dllVersion !== 'None' && !completedPackages.has(currentPackageId)) {
      setPendingDLL(currentPackageId);
      setPendingVersion(config.dllVersion);
      setShowModal(true);
    }
  }, [config.loginServer, config.customServerIP, config.dllVersion, completedPackages, setConfig]);

  useEffect(() => {
    if (downloadRequested && completedPackages.has(pendingDLL)) {
      setConfig((prev) => ({ ...prev, dllVersion: pendingVersion }));
      setDownloadRequested(false);
      setPendingDLL('');
      setPendingVersion('');
    }
  }, [completedPackages, pendingDLL, pendingVersion, downloadRequested, setConfig]);

  const handleServerChange = (value: string) => {
    setConfig((prev) => ({ ...prev, loginServer: value }));
    if (value !== 'Custom') {
      setCustomServerIP('');
      setError('');
    }
  };

  const handleCustomIPChange = (value: string) => {
    setCustomServerIP(value);
    setConfig((prev) => ({ ...prev, customServerIP: value }));
    if (value.trim()) {
      setError('');
    }
  };

  const handleBlur = () => {
    if (config.loginServer === 'Custom' && !customServerIP.trim()) {
      setError('Server IP cannot be blank');
    } else {
      setError('');
    }
  };

  const checkAndSetDLLVersion = (version: string) => {
    if (version === 'None') {
      setConfig((prev) => ({ ...prev, dllVersion: 'None' }));
      return;
    }

    const packageMap: { [key: string]: string } = {
      Release: 'tamods-dll',
      Beta: 'tamods-dll-beta',
      Edge: 'tamods-dll-edge',
    };
    const packageId = packageMap[version];

    if (completedPackages.has(packageId)) {
      setConfig((prev) => ({ ...prev, dllVersion: version }));
    } else {
      setPendingDLL(packageId);
      setPendingVersion(version);
      setShowModal(true);
    }
  };

  const handleAddToQueue = () => {
    if (pendingDLL) {
      addToQueue(pendingDLL);
      setDownloadRequested(true);
    }
    setShowModal(false);
  };

  const handleModalCancel = () => {
    setPendingDLL('');
    setPendingVersion('');
    setConfig((prev) => ({ ...prev, dllVersion: 'None' }));
    setShowModal(false);
  };

  return (
    <>
      <Title order={4}>Launch Method</Title>
      <Text size="sm" c="dimmed">
        <strong>Non-Steam:</strong> Launches the executable directly.
      </Text>
      <Text size="sm" c="dimmed">
        <strong>Steam:</strong> Launches the game through the Steam CLI.
      </Text>
      <Space h="sm" />
      <SegmentedControl
        color="rgba(0, 128, 158, 0.7)"
        value={config.launchMethod}
        onChange={(value) => setConfig((prev: any) => ({ ...prev, launchMethod: value }))}
        data={["Non-Steam", "Steam"]}
        style={{
          background: 'linear-gradient(to right, rgba(0, 255, 255, 0.1), rgba(0, 128, 128, 0.1))',
          borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        }}
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SegmentedControl
          color="rgba(0, 128, 158, 0.7)"
          value={config.loginServer}
          onChange={handleServerChange}
          data={["Community", "PUG", "Custom"]}
          style={{
            background: 'linear-gradient(to right, rgba(0, 255, 255, 0.1), rgba(0, 128, 128, 0.1))',
            borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }}
        />
        {config.loginServer === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextInput
              variant='filled'
              value={customServerIP}
              onChange={(event) => handleCustomIPChange(event.currentTarget.value)}
              placeholder="Enter custom IP"
              styles={{
                input: { marginLeft: '12px', padding: '6px', width: '200px', fontSize: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)' },
              }}
              error={!!error}
              onBlur={handleBlur}
              radius='md'
              size='32px'
            />
            {error && (
              <Text fz="sm" c="red" style={{ opacity: 0.9, marginLeft: '10px' }}>
                {error}
              </Text>
            )}
          </div>
        )}
      </div>

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
        color="rgba(0, 128, 158, 0.7)"
        value={config.dllVersion}
        onChange={(value) => checkAndSetDLLVersion(value)}
        data={["Release", "Beta", "Edge", "None"]}
        style={{
          background: 'linear-gradient(to right, rgba(0, 255, 255, 0.1), rgba(0, 128, 128, 0.1))',
          borderRadius: '8px',
          color: 'transparent', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        }}
      />

      <Modal
        opened={showModal}
        onClose={handleModalCancel}
        centered
        withCloseButton={false}
      >
        <Text size="sm">
          The selected DLL version is not downloaded. Would you like to add it to the download queue?
        </Text>
        <Space h="md" />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outline" onClick={handleModalCancel} style={{ marginRight: 10 }}>Cancel</Button>
          <Button onClick={handleAddToQueue}>Download</Button>
        </div>
      </Modal>
    </>
  );
}

export default LaunchOptions;
