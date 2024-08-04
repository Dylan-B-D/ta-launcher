import React from 'react';
import { Fieldset, TextInput, Group } from '@mantine/core';

interface RouteFiltersProps {
  filters: {
    gameMode: string;
    map: string;
    side: string;
    class: string;
    username: string;
    routeName: string;
    routeTime: string;
  };
  handleFilterChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RouteFilters: React.FC<RouteFiltersProps> = ({ filters, handleFilterChange }) => {
  return (
    <Fieldset legend="Filters">
      <Group grow>
        {Object.keys(filters).map((filterKey) => (
          <TextInput
            key={filterKey}
            size='xs'
            placeholder={filterKey}
            value={filters[filterKey as keyof typeof filters]}
            onChange={handleFilterChange(filterKey)}
            styles={{
                input: { padding: '2px', fontSize: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)' },
              }}
          />
        ))}
      </Group>
    </Fieldset>
  );
};

export default RouteFilters;