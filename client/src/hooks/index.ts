// Export all custom hooks
export { useAppLoading } from './useAppLoading';
export { useDatabase } from './useDatabase';  
export { useUserAuth, type User } from './useUserAuth';
export { useThemeManager, type Theme } from './useThemeManager';
export { useNetworkValidation } from './useNetworkValidation';

// Re-export the main context hooks for convenience
export {
  useApp,
  useDb,
  useUser,
  useTheme,
  useNetwork,
  useAppLoadingStatus,
  AppProvider,
} from '../context/AppContext';
