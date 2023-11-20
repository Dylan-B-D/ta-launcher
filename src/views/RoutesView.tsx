// RoutesView.tsx
import { useState, useEffect } from 'react';
import { Paper, Button, Table, Text } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import RouteFilters from '../components/RouteFilters'; // Ensure this path is correct

interface Route {
  game_mode: string;
  map: string;
  side: string;
  class: string;
  username: string;
  route_name: string;
  time: string;
  file_name: string;
}

const RoutesView = () => {
  const [filters, setFilters] = useState({
    gameMode: '',
    map: '',
    side: '',
    class: '',
    username: '',
    routeName: '',
    routeTime: '',
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data: Route[] = await invoke('get_route_files');
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleFilterChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const deselectAll = () => {
    setSelectedRows(new Set());
  };

  const handleRowSelect = (fileName: string) => {
    setSelectedRows(prev => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(fileName)) {
        newSelectedRows.delete(fileName);
      } else {
        newSelectedRows.add(fileName);
      }
      return newSelectedRows;
    });
  };

  const filteredRoutes = routes.filter(route =>
    route.game_mode.toLowerCase().includes(filters.gameMode.toLowerCase()) &&
    route.map.toLowerCase().includes(filters.map.toLowerCase()) &&
    route.side.toLowerCase().includes(filters.side.toLowerCase()) &&
    route.class.toLowerCase().includes(filters.class.toLowerCase()) &&
    route.username.toLowerCase().includes(filters.username.toLowerCase()) &&
    route.route_name.toLowerCase().includes(filters.routeName.toLowerCase()) &&
    route.time.toLowerCase().includes(filters.routeTime.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem' }}>
      <RouteFilters filters={filters} handleFilterChange={handleFilterChange} />

      <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
        <Button>Button 4</Button>
        <Button onClick={deselectAll}>Deselect All</Button>
      </Paper>

      <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
        <Text>Click on a row to select or deselect it.</Text>
      </Paper>

      <Paper style={{ padding: '1rem' }}>
        <Table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Game Mode</th>
              <th style={{ textAlign: 'left' }}>Map</th>
              <th style={{ textAlign: 'left' }}>Side</th>
              <th style={{ textAlign: 'left' }}>Class</th>
              <th style={{ textAlign: 'left' }}>Username</th>
              <th style={{ textAlign: 'left' }}>Route Name</th>
              <th style={{ textAlign: 'left' }}>Route Time</th>
            </tr>
          </thead>
          <tbody style={{ userSelect: 'none' }}>
            {filteredRoutes.map((route, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: selectedRows.has(route.file_name) ? '#f0f0f0' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => handleRowSelect(route.file_name)}
              >
                <td>{route.game_mode}</td>
                <td>{route.map}</td>
                <td>{route.side}</td>
                <td>{route.class}</td>
                <td>{route.username}</td>
                <td>{route.route_name}</td>
                <td>{route.time}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
    </div>
  );
};

export default RoutesView;
