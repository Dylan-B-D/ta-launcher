import React, { useState, useEffect } from 'react';
import { Paper, Group, Text, Switch, NumberInput, Divider } from '@mantine/core';
import { useConfig } from '../contexts/ConfigContext';

interface SensitivityCalculatorProps {
    mouseSensitivity: number;
    FOVSetting: number;
    onSensitivityChange: (value: number) => void;
}

const SensitivityCalculator: React.FC<SensitivityCalculatorProps> = ({
    mouseSensitivity,
    FOVSetting,
    onSensitivityChange
}) => {
    const [distance360, setDistance360] = useState(0);
    const  { config, setConfig } = useConfig();
    const dpi = config.dpi;
    const units = config.units;

    const maxFOV = 120;

    const handleDpiChange = (
        value: number,
    ) => {
        setConfig(prev => ({ ...prev, dpi: value }));
    };

    useEffect(() => {
        if (mouseSensitivity && FOVSetting && dpi) {
            const fovScale = maxFOV / FOVSetting;
            const constant = 124_846.176;
            let result = (constant / (dpi * mouseSensitivity)) * fovScale;

            if (units === 'Imperial') {
                result /= 2.54;
            }

            setDistance360(Number(result.toFixed(2)));
        }
    }, [mouseSensitivity, FOVSetting, dpi, units]);

    const getDistanceLabel = () => (units === 'Imperial' ? 'in per 360°' : 'cm per 360°');

    const handleDistance360Change = (value: number) => {
        setDistance360(value);
        onSensitivityChange(value);
    };

    return (
<Paper w='100%' mt="xs" shadow="xs" radius="xs" withBorder style={{ padding: '4px', marginBottom: '-10px' }}>
    <Group gap="xs" align="center">
        <Text fw={500} style={{ marginRight: 'auto' }}>Sensitivity Calculator</Text>
        <Divider orientation="vertical" />
        <Group gap="xs" style={{ flex: 1, justifyContent: 'left' }}>
            <Switch
                size="lg"
                onLabel="Inch" offLabel="CM"
                color="gray"
                checked={units === 'Imperial'}
                onChange={(event) => setConfig(prev => ({ ...prev, units: event.currentTarget.checked ? 'Imperial' : 'Metric' }))}
            />
                    <Divider orientation="vertical" />
        </Group>

        <Group gap="0" align="center">
            <Text fz='sm' >Enter Mouse DPI:</Text>
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
            <Text fz='sm'>{getDistanceLabel()}</Text>
        </Group>
    </Group>
</Paper>
    );
};

export default SensitivityCalculator;