
import { Table, Checkbox, Paper } from '@mantine/core';

interface Route {
    id: number;
    gameMode: string;
    map: string;
    side: string;
    class: string;
    username: string;
    routeName: string;
    time: string;
    selected: boolean;
  }

  interface RouteTableProps {
    routes: Route[];
    onSelectRoute: (routeId: number) => void;
  }
  
  const RouteTable: React.FC<RouteTableProps> = ({ routes, onSelectRoute }) => (
  <Paper>
    <Table>
      <thead>
        <tr>
          {/* Apply a consistent text alignment style to header cells */}
          <th style={{ textAlign: 'left' }}>Select</th>
          <th style={{ textAlign: 'left' }}>Game Mode</th>
          <th style={{ textAlign: 'left' }}>Map</th>
          <th style={{ textAlign: 'left' }}>Side</th>
          <th style={{ textAlign: 'left' }}>Class</th>
          <th style={{ textAlign: 'left' }}>Username</th>
          <th style={{ textAlign: 'left' }}>Route Name</th>
          <th style={{ textAlign: 'left' }}>Time</th>
        </tr>
      </thead>
      <tbody>
        {routes.map((route) => (
          <tr key={route.id}>
            {/* Apply the same text alignment style to data cells */}
            <td style={{ textAlign: 'left' }}>
              <Checkbox checked={route.selected} onChange={() => onSelectRoute(route.id)} />
            </td>
            <td style={{ textAlign: 'left' }}>{route.gameMode}</td>
            <td style={{ textAlign: 'left' }}>{route.map}</td>
            <td style={{ textAlign: 'left' }}>{route.side}</td>
            <td style={{ textAlign: 'left' }}>{route.class}</td>
            <td style={{ textAlign: 'left' }}>{route.username}</td>
            <td style={{ textAlign: 'left' }}>{route.routeName}</td>
            <td style={{ textAlign: 'left' }}>{route.time}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Paper>
);

export default RouteTable;


