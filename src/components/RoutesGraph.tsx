import React from 'react';
import Plot from 'react-plotly.js';

const LocationChart = ({ locations }) => {
  if (!locations || locations.length === 0) {
    return <p>No location data available.</p>;
  }

  const data = locations.map((loc, index) => {
    return {
      x: loc.map(point => point.x),
      y: loc.map(point => point.y),
      z: loc.map(point => point.z),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 4,
        line: {
          color: `rgba(75, 192, 192, ${0.2 + (index * 0.1) % 1})`,
          width: 1
        },
        opacity: 0.8
      },
      name: `Route ${index + 1}`
    };
  });

  const layout = {
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    },
    scene: {
      xaxis: { title: 'X Axis' },
      yaxis: { title: 'Y Axis' },
      zaxis: { title: 'Z Axis' },
      aspectratio: { x: 1, y: 1, z: 0.33 } // Compressing the Z-axis to 1/3rd
    }
  };

  return <Plot data={data} layout={layout} />;
};

export default LocationChart;
