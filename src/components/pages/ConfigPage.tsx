import { Center, Grid, Group, Space, Text } from "@mantine/core";
import { ConfigCard } from "../ConfigCard";
import { configPresets } from "../../data/configPresets";
import { fetchConfigFiles, handleInputChange, handleSensitivityChange } from "../../utils/utils";
import ConfigSettingsTable from "../ConfigSettingsTable";
import { iniFields, inputIniFields } from "../../data/iniFields";
import SensitivityCalculator from "../SensitivityCalculator";
import NotificationPopup from "../NotificationPopup";
import { useEffect, useState } from "react";
import { Notification } from "../../interfaces";
import { useConfig } from "../../contexts/ConfigContext";

const ConfigPage = () => {
  const { config } = useConfig();
  const [iniValues, setIniValues] = useState<{ [key: string]: boolean | number }>({});
  const allFields = [...iniFields, ...inputIniFields];
  const third = Math.ceil(allFields.length / 3); // Divides fields into 3 columns
  const [notification, setNotification] = useState<Notification>({
    visible: false,
    message: '',
    title: '',
    color: '',
    icon: null,
  });

  useEffect(() => {
    fetchConfigFiles(setIniValues);
  }, []);
  
  return (
    <>
      {/* Notification Popup */}
      <NotificationPopup
        visible={notification.visible}
        message={notification.message}
        title={notification.title}
        color={notification.color}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
        icon={notification.icon}
      />
      <Center style={{ flexDirection: 'column', textAlign: 'center', height: '100%', width: '100%', overflow: 'hidden' }}>
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
                  await fetchConfigFiles(setIniValues);
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
          onSensitivityChange={(value) => handleSensitivityChange(value, iniValues, config, (fileKey, key, value) => handleInputChange(fileKey, key, value, setIniValues))}
        />

      </Center>
    </>
  );
};

export default ConfigPage;
