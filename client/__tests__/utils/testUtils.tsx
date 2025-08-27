import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock the cn utility function to avoid complex imports
export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Custom render function that can be extended with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, options);

export * from '@testing-library/react';
export { customRender as render };
