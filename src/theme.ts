// theme.ts
import { createTheme } from '@mantine/core';

export const darkTheme = createTheme({
  
  // Color palette
  colors: {
    mutedBlue: [
      '#2C3E50', '#34495E', '#3B546B', '#425F79', '#4A6A86',
      '#527594', '#5A80A1', '#628BAF', '#6A96BC', '#729FCA'
    ],

    // Muted Green Shades
    mutedGreen: [
      '#1E4223', '#28512D', '#316138', '#3C7142', '#47814C',
      '#529156', '#5DA061', '#68AF6B', '#73BE76', '#7ECD80'
    ],

    // Additional muted colors
    mutedRed: [
      '#542424', '#633030', '#723C3C', '#814848', '#905454',
      '#9F6060', '#AE6C6C', '#BD7878', '#CC8484', '#DB9090'
    ],

    mutedPurple: [
      '#423C52', '#504862', '#5E5472', '#6C6082', '#7A6C92',
      '#8878A2', '#9684B2', '#A490C2', '#B29CD2', '#C0A8E2'
    ],

    mutedOrange: [
      '#FFF3E0', // Lightest shade
      '#FFE0B2',
      '#FFCC80',
      '#FFB74D',
      '#FFA726',
      '#FF9800',
      '#FB8C00',
      '#F57C00',
      '#EF6C00',
      '#E65100'  // Darkest shade
    ],
    
    teal: [
      '#E0F2F1', // Lightest shade
      '#B2DFDB',
      '#80CBC4',
      '#4DB6AC',
      '#26A69A',
      '#009688',
      '#00897B',
      '#00796B',
      '#00695C',
      '#004D40'  // Darkest shade
    ],
    
    
    mutedTeal: [
      '#542424', '#633030', '#723C3C', '#814848', '#905454',
      '#9F6060', '#AE6C6C', '#BD7878', '#CC8484', '#DB9090'
    ],

    lightGray: [
      '#f8f9fa', // Very light gray
      '#f2f3f4', // Slightly darker
      '#eceef0', // Light gray
      '#e6e8eb', // Mid-light gray
      '#dfe1e3', // Neutral gray
      '#d9dbdd', // Slightly darker gray
      '#d3d5d7', // Darker gray
      '#cdced0', // Medium gray
      '#c7c8c9', // Medium-dark gray
      '#c1c2c3'  // Darkest shade in light gray range
    ],
    
    
    darkGray: [
      '#0a0b0d', // Almost black
      '#131415', // Very dark gray
      '#1c1d1f', // Darker gray
      '#252729', // Dark gray
      '#2e3032', // Mid-dark gray
      '#37393b', // Neutral dark gray
      '#404346', // Slightly lighter gray
      '#494c4f', // Medium-dark gray
      '#525559', // Medium gray
      '#5b5e61'  // Lightest shade in dark gray range
    ],
    
    
    
    highlight: [
      '#FFC107', // Amber
      '#FF5722', // Deep Orange
      '#F44336', // Red
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#673AB7', // Deep Purple
      '#3F51B5', // Indigo
      '#2196F3', // Blue
      '#03A9F4', // Light Blue
      '#00BCD4', // Cyan
    ],  
  },

  // Customize other theme properties as desired
  primaryColor: 'mutedBlue', // Using the muted blue as the primary color
  shadows: {
    md: '0px 2px 4px rgba(0, 0, 0, 0.5)', // Custom shadow
    xl: '0px 4px 8px rgba(0, 0, 0, 0.6)', // Custom shadow
  },
  headings: {
    fontFamily: 'Arial, sans-serif', // Custom font for headings
    sizes: {
      h1: { fontSize: '24px', fontWeight: '500' },
      h2: { fontSize: '20px', fontWeight: '500' },
    },
  },
});
