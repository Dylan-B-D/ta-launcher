// RoutesView.tsx
import { useState, useEffect, useRef } from 'react';
import { Button, Table, Text, Space, Fieldset, Divider, useMantineTheme, ScrollArea, Paper, Group, Modal } from '@mantine/core';
import { invoke } from '@tauri-apps/api/tauri';
import RouteFilters from '../components/RouteFilters';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState('');

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
        setScrollAreaHeight(windowHeight - mainContainerTopOffset - otherElementsHeight - 133);
      }
    };

    window.addEventListener('resize', updateScrollAreaHeight);
    updateScrollAreaHeight();

    return () => window.removeEventListener('resize', updateScrollAreaHeight);
  }, []);


  const confirmDelete = async () => {
    try {
      for (const file of selectedRows) {
        await invoke('delete_route_file', { file: file });
      }
      fetchRoutes();
      setSelectedRows(new Set());
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };


  const handleDeleteClick = () => {
    if (selectedRows.size > 0) {
      setIsDeleteModalOpen(true);
    } else {
      console.error("No files selected for deletion.");
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
    <div ref={mainContainerRef}>
      <div ref={filtersRef}>
        <RouteFilters filters={filters} handleFilterChange={handleFilterChange} />
      </div>

      <Space h="md" />

      <div ref={controlsRef}>
        <Fieldset legend='Controls' style={{ padding: '1rem' }}>
          <Group> {/* Adjust the spacing value as needed */}
            <Button>View Selected</Button>
            <Button>Mirror Selected</Button>
            <Button onClick={deselectAll}>Deselect All</Button>
            <Button onClick={handleDeleteClick} style={{ background: theme.colors.mutedRed[2], color: theme.colors.dark[6] }}>
              Delete Selected
            </Button>
          </Group>
        </Fieldset>
      </div>

      <Space h="md" />

      <Paper>
        <Text>Click on a row to select or deselect it.</Text>
        <Divider my="sm" />
        <div>
        <ScrollArea style={{ height: `${scrollAreaHeight}px` }}>
          <Table>
            <thead>
              <tr style={{textAlign: 'left'}}>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Game Mode</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Map</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Side</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Class</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Username</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Route Name</th>
                <th style={{ position: 'sticky', top: 0, background: theme.colors.dark[6]}}>Route Time</th>
              </tr>
            </thead>
              <tbody style={{ userSelect: 'none' }}>
                {filteredRoutes.map((route, index) => (
                  <tr
                    key={index}
                    style={{
                      textShadow: selectedRows.has(route.file_name) ? '1px 1px 2px black, 0 0 1em black, 0 0 0.2em black': 'none',
                      backgroundColor: selectedRows.has(route.file_name) ? theme.colors.mutedGreen[6] : 'transparent',
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'rgba(255, 255, 255,0.075)',
                    }}
                    onClick={() => handleRowSelect(route.file_name)} // Ensure this handler is set correctly
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
          </ScrollArea>

        </div>
      </Paper>
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="lg" // Adjust the size to large
      >
        <Text>Are you sure you want to delete the following route files?</Text>
        <ScrollArea style={{ maxHeight: '200px' }}> {/* Adjust height as needed */}
          <ul>
            {Array.from(selectedRows).map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </ScrollArea>
        <Group mt="md">
          <Button variant="default" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          <Button color="red" onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>

    </div>
  );
};

export default RoutesView;
