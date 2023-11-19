import React, { useState, useEffect, ChangeEvent } from 'react';
import { TextInput, Text, Switch, Space, Group } from '@mantine/core';

interface SensitivityConverterProps {
  FOVSetting: number | null;
  mouseSensitivity: number | null;
}

const SensitivityConverter: React.FC<SensitivityConverterProps> = ({ FOVSetting, mouseSensitivity }) => {
    const [dpi, setDpi] = useState<number | null>(null);
    const [cmPer360, setCmPer360] = useState<number | null>(null);
    const [useInches, setUseInches] = useState<boolean>(false);
    const maxFOV = 120;
    const localStorageKey = 'userDpi';

    useEffect(() => {
        // Load DPI from local storage
        const savedDpi = localStorage.getItem(localStorageKey);
        if (savedDpi) {
            setDpi(parseFloat(savedDpi));
        }
    }, []);

    useEffect(() => {
        if (mouseSensitivity && FOVSetting && dpi) {
            const fovScale = maxFOV / FOVSetting;
            const constant = 40.0148 * 7.8 * 400;
            const result = (constant / (dpi * mouseSensitivity)) * fovScale;
            setCmPer360(result);
        }
    }, [mouseSensitivity, FOVSetting, dpi]);

    const handleDpiChange = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const numericValue = value ? parseFloat(value) : null;
      setDpi(numericValue);

      // Save DPI to local storage
      if (numericValue !== null) {
          localStorage.setItem(localStorageKey, numericValue.toString());
      } else {
          localStorage.removeItem(localStorageKey);
      }
    };

    const displayValue = cmPer360 !== null ? cmPer360.toFixed(2) : 'N/A';
    const convertedValue = useInches ? (parseFloat(displayValue) / 2.54).toFixed(2) : displayValue;
    const unit = useInches ? "inches" : "cm";

    return (
        <div>
            <Group>
                <Switch
                    checked={useInches}
                    onChange={() => setUseInches(!useInches)}
                    label={useInches ? "inches" : "cm"}
                />
            </Group>
            <Space h="xs" />
            <TextInput
                label="DPI"
                type="number"
                value={dpi ?? ''}
                onChange={handleDpiChange}
            />
            <Space h="xs" />
            <Text component="span" size="md" style={{ alignSelf: 'center' }}>
                Sensitivity: {convertedValue} {unit} per 360°
            </Text>
        </div>
    );
};

export default SensitivityConverter;
