import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

// Base selectors
export const selectUIState = (state: RootState) => state.ui;

// Theme selectors
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectIsThemeInitialized = (state: RootState) => state.ui.isThemeInitialized;

// Memoized derived theme selectors
export const selectIsDark = createSelector(selectTheme, (theme) => theme === 'dark');
export const selectIsLight = createSelector(selectTheme, (theme) => theme === 'light');

// Loading selectors
export const selectIsAppLoading = (state: RootState) => state.ui.isAppLoading;
export const selectIsInitialLoad = (state: RootState) => state.ui.isInitialLoad;

// Memoized loading selector
export const selectShouldShowLoading = createSelector(
  [selectIsAppLoading, selectIsInitialLoad],
  (isAppLoading, isInitialLoad) => isAppLoading && isInitialLoad,
);

// Transaction confirmation selectors
export const selectTxConfirmation = (state: RootState) => state.ui.txConfirmation;
export const selectIsTxConfirmationVisible = (state: RootState) =>
  state.ui.txConfirmation.isVisible;
export const selectTxConfirmationHash = (state: RootState) => state.ui.txConfirmation.txHash;
