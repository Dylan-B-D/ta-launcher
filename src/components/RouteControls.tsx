import React from 'react';
import { Group, Button, Paper } from '@mantine/core';

interface RouteControlsProps {
  onShowNonPackageRoutes: () => void;
  onMirrorSelected: () => void;
  onViewSelected: () => void;
  onDeleteSelected: () => void; 
}

const RouteControls: React.FC<RouteControlsProps> = ({ 
  onShowNonPackageRoutes, 
  onMirrorSelected, 
  onViewSelected,
  onDeleteSelected 
}) => (
  <Paper>
    <Group>
      <Button variant="outline" onClick={onShowNonPackageRoutes}>Show Non-Package Routes</Button>
      <Button variant="outline" onClick={onMirrorSelected}>Mirror Selected</Button>
      <Button variant="outline" onClick={onViewSelected}>View Selected</Button>
      <Button variant="outline" onClick={onDeleteSelected}>Delete Selected</Button> {/* Add this button */}
    </Group>
  </Paper>
);

export default RouteControls;


