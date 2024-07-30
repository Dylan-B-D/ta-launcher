import React from 'react';
import { Table, Tooltip, Switch, NumberInput, rem, useMantineTheme, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Field } from '../interfaces';

interface ConfigSettingsTableProps {
  fields: Field[];
  iniValues: { [key: string]: boolean | number };
  handleInputChange: (key: string, value: boolean | number) => void;
}

const ConfigSettingsTable: React.FC<ConfigSettingsTableProps> = ({ fields, iniValues, handleInputChange }) => {
  const theme = useMantineTheme();

  const renderInputField = (field: Field) => {
    if (field.type === 'boolean') {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Switch
            checked={iniValues[field.key] as boolean}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(field.key, event.currentTarget.checked)
            }
            size="md"
            onLabel="On"
            offLabel="Off"
            color="teal"
            thumbIcon={
              iniValues[field.key] ? (
                <IconCheck
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.teal[6]}
                  stroke={3}
                />
              ) : (
                <IconX
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.red[6]}
                  stroke={3}
                />
              )
            }
          />
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NumberInput
            value={iniValues[field.key] as number}
            onChange={(value: string | number) =>
              handleInputChange(field.key, Number(value) || 0)
            }
            size="xs"
            w={75}
            variant="filled"
            radius={0}
            style={{ marginBottom: '-3px', marginTop: '-3px' }} // Fix for NumberInput height to match Switch
          />
        </div>
      );
    }
  };

  return (
    <Box style={{ width: '100%' }}>
      <Table striped withTableBorder withRowBorders={false} style={{ tableLayout: 'fixed', width: '100%' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: 'left', width: '72%', padding: '4px' }}>Setting</Table.Th>
            <Table.Th style={{ textAlign: 'right', width: '28%', padding: '4px' }}>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fields.map(field => (
            <Table.Tr key={field.key} style={{ padding: '4px 0' }}>
              <Table.Td style={{ textAlign: 'left', padding: '4px' }}>
                <Tooltip label={field.description} withArrow>
                  <div>{field.displayName}</div>
                </Tooltip>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right', padding: '4px' }}>
                {renderInputField(field)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

export default ConfigSettingsTable;
