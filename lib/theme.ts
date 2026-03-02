import { createTheme, MantineColorsTuple } from '@mantine/core';

const teal: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b',
];

const blue: MantineColorsTuple = [
  '#e3f2fd',
  '#bbdefb',
  '#90caf9',
  '#64b5f6',
  '#42a5f5',
  '#2196f3',
  '#1e88e5',
  '#1976d2',
  '#1565c0',
  '#0d47a1',
];

export const theme = createTheme({
  primaryColor: 'teal',
  colors: {
    teal,
    blue,
  },
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
