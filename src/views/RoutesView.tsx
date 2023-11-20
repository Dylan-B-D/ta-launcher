// RoutesView.tsx
import { useState, useEffect, useRef } from 'react';
import { Button, Table, Text, Space, Fieldset, Divider, useMantineTheme, ScrollArea, Paper } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import RouteFilters from '../components/RouteFilters';
import { hexToRgba } from '../utils';

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
  const theme = useMantineTheme();
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [scrollAreaHeight, setScrollAreaHeight] = useState<number>(0);

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

  useEffect(() => {
    const updateScrollAreaHeight = () => {
      const windowHeight = window.innerHeight;
      const filtersHeight = filtersRef.current?.offsetHeight || 0;
      const controlsHeight = controlsRef.current?.offsetHeight || 0;
      const otherElementsHeight = filtersHeight + controlsHeight;

      if (mainContainerRef.current) {
        const mainContainerTopOffset = mainContainerRef.current.getBoundingClientRect().top;
        setScrollAreaHeight(windowHeight - mainContainerTopOffset - otherElementsHeight-133);
      }
    };

    window.addEventListener('resize', updateScrollAreaHeight);
    updateScrollAreaHeight();

    return () => window.removeEventListener('resize', updateScrollAreaHeight);
  }, []);

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

  const columnWidths = {
    gameMode: '15%',
    map: '15%',
    side: '10%',
    class: '10%',
    username: '15%',
    routeName: '20%',
    routeTime: '15%',
  };

  return (
    <div ref={mainContainerRef}>
      <div ref={filtersRef}>
        <RouteFilters filters={filters} handleFilterChange={handleFilterChange} />
      </div>
  
      <Space h="md" />
  
      <div ref={controlsRef}>
        <Fieldset legend='Controls'>
          <Button>View Selected</Button>
          <Button>Mirror Selected</Button>
          <Button onClick={deselectAll}>Deselect All</Button>
          <Button style={{ background: theme.colors.mutedRed[2], color: theme.colors.dark[6] }}>Delete Selected</Button>
        </Fieldset>
      </div>

      <Space h="md" />
  
      <Paper>
        <Text>Click on a row to select or deselect it.</Text>
        <Divider my="sm" />
        <div>
          <Table>
            <thead>
              <tr>
                <th style={{ width: '15%', textAlign: 'left' }}>Game Mode</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Map</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Side</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Class</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Username</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Route Name</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Route Time</th>
              </tr>
            </thead>
          </Table>
          <ScrollArea style={{ height: `${scrollAreaHeight}px` }}>
  <Table>
    <tbody style={{ userSelect: 'none' }}>
      {filteredRoutes.map((route, index) => (
        <tr 
          key={index}
          style={{
            backgroundColor: selectedRows.has(route.file_name) ? '#f0f0f0' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => handleRowSelect(route.file_name)} // Ensure this handler is set correctly
        >
          <td style={{ width: columnWidths.gameMode }}>{route.game_mode}</td>
          <td style={{ width: columnWidths.map }}>{route.map}</td>
          <td style={{ width: columnWidths.side }}>{route.side}</td>
          <td style={{ width: columnWidths.class }}>{route.class}</td>
          <td style={{ width: columnWidths.username }}>{route.username}</td>
          <td style={{ width: columnWidths.routeName }}>{route.route_name}</td>
          <td style={{ width: columnWidths.routeTime }}>{route.time}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</ScrollArea>

        </div>
      </Paper>
    </div>
  );
  
};

export default RoutesView;
