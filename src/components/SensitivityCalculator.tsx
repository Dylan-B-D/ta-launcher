import React, { useState, useEffect } from "react";
import { Paper, Group, Text, NumberInput, Divider } from "@mantine/core";
import { useConfig } from "../contexts/ConfigContext";

interface SensitivityCalculatorProps {
  mouseSensitivity: number;
  FOVSetting: number;
  onSensitivityChange: (value: number) => void;
}

const SensitivityCalculator: React.FC<SensitivityCalculatorProps> = ({
  mouseSensitivity,
  FOVSetting,
  onSensitivityChange,
}) => {
  const [distance360, setDistance360] = useState(0);
  const { config, setConfig } = useConfig();
  const dpi = config.dpi;

  const maxFOV = 120;

  const handleDpiChange = (value: number) => {
    setConfig((prev) => ({ ...prev, dpi: value }));
  };

  useEffect(() => {
    if (mouseSensitivity && FOVSetting && dpi) {
      const fovScale = maxFOV / FOVSetting;
      const constant = 124_846.176; // Bruteforce constant
      const result = (constant / (dpi * mouseSensitivity)) * fovScale;

      setDistance360(Number(result.toFixed(2)));
    }
  }, [mouseSensitivity, FOVSetting, dpi]);

  const getDistanceLabel = () => "cm per 360°";

  const handleDistance360Change = (value: number) => {
    setDistance360(value);
    onSensitivityChange(value);
  };

  return (
    <Paper
      w="100%"
      mt="xs"
      shadow="xs"
      radius="md"
      style={{ padding: "4px 8px", marginBottom: "-10px" }}
    >
      <Group gap="xs" align="center">
        <Text fw={400} style={{ marginRight: "auto" }}>
          Sensitivity Calculator
        </Text>
        <Group gap="0" align="center">
          <Text fz="sm" style={{ paddingRight: 4 }}>Mouse DPI </Text>
          <NumberInput
            variant="filled"
            size="xs"
            value={dpi}
            onChange={(value) => handleDpiChange(Number(value))}
            style={{ maxWidth: 90 }}
          />
        </Group>
        <Divider orientation="vertical" />
        <Group gap="xs" align="center">
          <NumberInput
            variant="filled"
            size="xs"
            value={distance360}
            onChange={(value) => handleDistance360Change(Number(value))}
            style={{ maxWidth: 90 }}
          />
          <Text fz="sm">{getDistanceLabel()}</Text>
        </Group>
      </Group>
    </Paper>
  );
};

export default SensitivityCalculator;
