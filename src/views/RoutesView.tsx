import { useState } from 'react';
import RouteFilters from '../components/RouteFilters';
import { Filters } from '../components/RouteFilters';
import RouteControls from '../components/RouteControls';
import RouteTable from '../components/RouteTable';
import { Modal, Checkbox, Text, Button, Space } from '@mantine/core';


const initialRoutes = [
  // Add your initial hardcoded routes here
  // Example:
  { id: 1, gameMode: 'TrCTF', map: 'Raindance', side: 'DS', class: 'SLD', username: 'jp', routeName: 'backright', time: '43s', selected: false },
  { id: 2, gameMode: 'TrCTF', map: 'SunStar', side: 'BE', class: 'LHT', username: 'Kigabit', routeName: 'LtR-LoopSetup', time: '51s', selected: false },
  // ...
];

const RoutesView = () => {
  const [routes, setRoutes] = useState(initialRoutes);
  const [filters, setFilters] = useState({
    gameMode: '',
    map: '',
    side: '',
    class: '',
    username: '',
    routeName: '',
    time: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to handle selection of a route
  const handleSelectRoute = (routeId: number) => {
    const updatedRoutes = routes.map(route =>
      route.id === routeId ? { ...route, selected: !route.selected } : route
    );
    setRoutes(updatedRoutes);
  };

  // Function to handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    if (filterName in filters) {
      setFilters(prev => ({ ...prev, [filterName as keyof Filters]: value }));
    }
  };
  

  // Function to filter routes
  const getFilteredRoutes = () => {
    return routes.filter(route => {
      return Object.entries(filters).every(([key, value]) => {
        // Using 'key as keyof Filters' for type assertion
        return value ? route[key as keyof Filters].toString().toLowerCase().includes(value.toLowerCase()) : true;
      });
    });
  };
  

  // Function to delete selected routes
  const deleteSelectedRoutes = () => {
    setRoutes(routes.filter(route => !route.selected));
  };

  return (
    <div>
      <RouteFilters filters={filters} onFilterChange={handleFilterChange} />
      <Space h={'md'}/>
      <RouteControls
        onShowNonPackageRoutes={() => {} /* Placeholder function */}
        onMirrorSelected={() => setIsModalOpen(true)}
        onViewSelected={() => {} /* Placeholder function */}
        onDeleteSelected={deleteSelectedRoutes}
      />
      <Space h={'md'}/>
      <RouteTable routes={getFilteredRoutes()} onSelectRoute={handleSelectRoute} />

      {/* Modal for Mirroring Options */}
      <Modal 
        opened={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Mirroring Options"
      >
        <Text>Choose mirroring options for the selected routes.</Text>
        <Checkbox label="XY Mirror" />
        <Checkbox label="X Mirror" />
        <Checkbox label="Y Mirror" />
        <Button onClick={() => setIsModalOpen(false)}>Apply</Button>
      </Modal>
    </div>
  );
};

export default RoutesView;
