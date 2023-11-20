import React from 'react';
import { Group, TextInput, Paper } from '@mantine/core';

// Define a type for the filters object
export interface Filters {
  gameMode: string;
  map: string;
  side: string;
  class: string;
  username: string;
  routeName: string;
  time: string;
}

// Define a type for the props
interface RouteFiltersProps {
  filters: Filters;
  onFilterChange: (filterName: string, value: string) => void;
}

const RouteFilters: React.FC<RouteFiltersProps> = ({ filters, onFilterChange }) => (
  <Paper>
    <Group>
      {/* Each TextInput updates the respective filter */}
      <TextInput placeholder="Game Mode" value={filters.gameMode} onChange={(e) => onFilterChange('gameMode', e.target.value)} />
      <TextInput placeholder="Map" value={filters.map} onChange={(e) => onFilterChange('map', e.target.value)} />
      <TextInput placeholder="Side" value={filters.side} onChange={(e) => onFilterChange('side', e.target.value)} />
      <TextInput placeholder="Class" value={filters.class} onChange={(e) => onFilterChange('class', e.target.value)} />
      <TextInput placeholder="Username" value={filters.username} onChange={(e) => onFilterChange('username', e.target.value)} />
      <TextInput placeholder="Route Name" value={filters.routeName} onChange={(e) => onFilterChange('routeName', e.target.value)} />
      <TextInput placeholder="Route Time" value={filters.time} onChange={(e) => onFilterChange('time', e.target.value)} />
    </Group>
  </Paper>
);

export default RouteFilters;

