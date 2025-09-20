import { renderHook, act, waitFor } from '@testing-library/react';
import { useDatabase } from '@/hooks/useDatabase';
import { mockUtxos, mockWorkerResponses, mockDatabaseStates } from '../fixtures/mockUtxos';

// Mock the worker client
const mockSendMessage = jest.fn();
const mockInitWorker = jest.fn();
const mockOnWorkerMessage = jest.fn();

jest.mock('@/lib/utxoWorkerClient', () => ({
  initUtxoWorker: mockInitWorker,
  sendUtxoWorkerMessage: mockSendMessage,
  onUtxoWorkerMessage: mockOnWorkerMessage,
}));

describe('useDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.localStorage.setItem as jest.Mock).mockClear();
    (window.localStorage.removeItem as jest.Mock).mockClear();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useDatabase());
    
    expect(result.current.dbLoading).toBe(true);
    expect(result.current.membershipIntents).toEqual([]);
  });

  it('should initialize worker and set up message listener', () => {
    renderHook(() => useDatabase());
    
    expect(mockInitWorker).toHaveBeenCalledTimes(1);
    expect(mockOnWorkerMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: 'seedAll',
      apiBaseUrl: 'http://localhost:3000',
      contexts: [
        'member',
        'membership_intent',
        'proposal',
        'proposal_intent',
        'sign_of_approval',
        'ambassadors'
      ],
    });
  });

  it('should handle successful database initialization', async () => {
    let messageHandler: any;
    mockOnWorkerMessage.mockImplementation((handler) => {
      messageHandler = handler;
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useDatabase());

    // Simulate successful worker response
    act(() => {
      messageHandler(mockWorkerResponses.success);
    });

    await waitFor(() => {
      expect(result.current.dbLoading).toBe(false);
    });

    expect(result.current.membershipIntents).toBeDefined();
  });

  it('should handle worker initialization error', async () => {
    mockInitWorker.mockImplementation(() => {
      throw new Error('Worker initialization failed');
    });

    const { result } = renderHook(() => useDatabase());

    await waitFor(() => {
      expect(result.current.dbLoading).toBe(false);
    });
  });

  it('should handle worker message errors', async () => {
    let messageHandler: any;
    mockOnWorkerMessage.mockImplementation((handler) => {
      messageHandler = handler;
      return jest.fn();
    });

    const { result } = renderHook(() => useDatabase());

    // Simulate worker error response
    act(() => {
      messageHandler(mockWorkerResponses.error);
    });

    await waitFor(() => {
      expect(result.current.dbLoading).toBe(false);
    });
  });

  it('should provide syncData function', () => {
    const { result } = renderHook(() => useDatabase());
    
    expect(typeof result.current.syncData).toBe('function');
    
    act(() => {
      result.current.syncData('membership_intent');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      action: 'seed',
      apiBaseUrl: 'http://localhost:3000',
      context: 'membership_intent',
    });
  });

  it('should provide syncAllData function', () => {
    const { result } = renderHook(() => useDatabase());
    
    expect(typeof result.current.syncAllData).toBe('function');
    
    // syncAllData is called automatically during initialization,
    // so we check that it was called at least once
    expect(mockSendMessage).toHaveBeenCalledWith({
      action: 'seedAll',
      apiBaseUrl: 'http://localhost:3000',
      contexts: [
        'member',
        'membership_intent',
        'proposal',
        'proposal_intent',
        'sign_of_approval',
        'ambassadors'
      ],
    });
  });

  it('should provide query function', () => {
    const { result } = renderHook(() => useDatabase());
    
    expect(typeof result.current.query).toBe('function');
  });

  it('should provide getUtxosByContext function', () => {
    const { result } = renderHook(() => useDatabase());
    
    expect(typeof result.current.getUtxosByContext).toBe('function');
  });

  it('should handle loading timeout', async () => {
    // Mock a slow worker that doesn't respond
    mockOnWorkerMessage.mockImplementation(() => {
      // Don't call the handler, simulating no response
      return jest.fn();
    });

    const { result } = renderHook(() => useDatabase());

    // Fast-forward time to trigger timeout
    jest.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(result.current.dbLoading).toBe(false);
    });
  }, 15000);

  it('should cleanup on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockOnWorkerMessage.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useDatabase());
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty database response', async () => {
    let messageHandler: any;
    mockOnWorkerMessage.mockImplementation((handler) => {
      messageHandler = handler;
      return jest.fn();
    });

    const { result } = renderHook(() => useDatabase());

    act(() => {
      messageHandler(mockWorkerResponses.empty);
    });

    await waitFor(() => {
      expect(result.current.dbLoading).toBe(false);
    });
  });
});

// Integration test with mocked SQL.js
describe('useDatabase - SQL integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle database queries correctly', async () => {
    // This test would require more complex mocking of SQL.js
    // For now, we'll test that the hook doesn't crash with query operations
    const { result } = renderHook(() => useDatabase());
    
    expect(() => {
      result.current.query('SELECT * FROM utxos WHERE context = ?', ['membership_intent']);
    }).not.toThrow();
  });
});
