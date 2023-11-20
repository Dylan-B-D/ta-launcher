// RouteFilters.tsx
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
            placeholder={filterKey}
            value={filters[filterKey as keyof typeof filters]}
            onChange={handleFilterChange(filterKey)}
            style={{ flex: 1, minWidth: '150px'}}
          />
        ))}
      </Group>
    </Fieldset>
  );
};

export default RouteFilters;
