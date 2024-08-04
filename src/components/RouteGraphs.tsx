import React from 'react';
import Plot, { PlotParams } from 'react-plotly.js';

interface Point {
  x: number;
  y: number;
  z: number;
}


type LocationsArray = Point[][];

interface LocationChartProps {
  locations: LocationsArray;
}

const LocationChart: React.FC<LocationChartProps> = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return <p>No location data available.</p>;
  }


  const data: PlotParams['data'] = locations.map((loc, index) => ({
    x: loc.map(point => point.x),
    y: loc.map(point => point.y),
    z: loc.map(point => point.z),
    mode: 'lines',
    type: 'scatter3d',
    line: {
        width: 4,
      },
    marker: {
      line: {
        width: 2,
        color: `rgba(75, 192, 192, ${0.2 + (index * 0.1) % 1})`,
      },
    },
    name: `Route ${index + 1}`
  }));

  const layout = {
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9,
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      xaxis: {
        title: 'X Axis',
        color: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: 'Y Axis',
        color: 'rgba(0,0,0,0)',
      },
      zaxis: {
        title: 'Z Axis',
        color: 'rgba(0,0,0,0)',
      },
      aspectratio: { x: 1, y: 1, z: 0.30 }
    }
  };
  
  
  return <Plot data={data} layout={layout} />;
  
};

export default LocationChart;