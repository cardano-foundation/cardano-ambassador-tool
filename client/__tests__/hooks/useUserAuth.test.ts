import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { mockAuthStates, mockWalletData } from '../fixtures/mockUtxos';

// Mock the MeshSDK useWallet hook
const mockWalletState = {
  wallet: null as any,
  connected: false,
  connecting: false,
  name: '',
  account: null,
  address: '',
  setPersist: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('@meshsdk/react', () => ({
  useWallet: () => mockWalletState,
}));

// Mock the auth roles resolver
const mockResolveRoles = jest.fn();
jest.mock('@/lib/auth/roles', () => ({
  resolveRoles: mockResolveRoles,
}));

describe('useUserAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.localStorage.setItem as jest.Mock).mockClear();
    (window.localStorage.removeItem as jest.Mock).mockClear();
    
    // Reset wallet state
    Object.assign(mockWalletState, {
      wallet: null,
      connected: false,
      connecting: false,
      name: '',
      account: null,
      address: '',
    });
  });

  it('should initialize with no user when localStorage is empty', () => {
    const { result } = renderHook(() => useUserAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userAddress).toBeNull();
    expect(result.current.userRoles).toEqual([]);
    expect(result.current.userWallet).toBeNull();
  });

  it('should load user from localStorage on mount', () => {
    const storedUser = mockAuthStates.connected.user;
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(storedUser));

    const { result } = renderHook(() => useUserAuth());
    
    expect(result.current.user).toEqual(storedUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userAddress).toBe(storedUser.address);
    expect(result.current.userRoles).toEqual(storedUser.roles);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useUserAuth());
    
    expect(result.current.user).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse stored user data:', expect.any(SyntaxError));
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
    
    consoleSpy.mockRestore();
  });

  it('should set wallet persistence on mount', () => {
    renderHook(() => useUserAuth());
    
    expect(mockWalletState.setPersist).toHaveBeenCalledWith(true);
  });

  it('should fetch roles when wallet connects', async () => {
    const mockWallet = { name: 'TestWallet' };
    const mockRoles = ['member', 'contributor'];
    
    mockResolveRoles.mockResolvedValue(mockRoles);
    
    const { result, rerender } = renderHook(() => useUserAuth());
    
    // Simulate wallet connection
    act(() => {
      Object.assign(mockWalletState, {
        wallet: mockWallet,
        address: mockWalletData.address,
      });
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockResolveRoles).toHaveBeenCalledWith(mockWalletData.address);
      expect(result.current.user?.address).toBe(mockWalletData.address);
      expect(result.current.user?.roles).toEqual(mockRoles);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle role resolution failure gracefully', async () => {
    const mockWallet = { name: 'TestWallet' };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockResolveRoles.mockRejectedValue(new Error('Role resolution failed'));
    
    const { result, rerender } = renderHook(() => useUserAuth());
    
    act(() => {
      Object.assign(mockWalletState, {
        wallet: mockWallet,
        address: mockWalletData.address,
      });
    });
    
    rerender();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to resolve user roles:', expect.any(Error));
      expect(result.current.user?.roles).toEqual([]);
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    consoleSpy.mockRestore();
  });

  it('should not fetch roles when address is empty', async () => {
    const mockWallet = { name: 'TestWallet' };
    
    const { rerender } = renderHook(() => useUserAuth());
    
    act(() => {
      Object.assign(mockWalletState, {
        wallet: mockWallet,
        address: '', // Empty address
      });
    });
    
    rerender();
    
    await waitFor(() => {
      expect(mockResolveRoles).not.toHaveBeenCalled();
    });
  });

  // Note: setUser function was removed from useUserAuth hook as user state is now managed internally
  // through wallet connection and session management

  it('should provide correct computed values for admin user', () => {
    const adminUser = mockAuthStates.admin.user;
    (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(adminUser));

    const { result } = renderHook(() => useUserAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userRoles).toEqual(['admin', 'member']);
    expect(result.current.userAddress).toBe(adminUser.address);
    expect(result.current.userWallet).toBe(adminUser.wallet);
  });

  it('should handle wallet disconnection', async () => {
    // Start with connected wallet
    Object.assign(mockWalletState, {
      wallet: { name: 'TestWallet' },
      address: mockWalletData.address,
    });
    
    mockResolveRoles.mockResolvedValue(['member']);

    const { result, rerender } = renderHook(() => useUserAuth());
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    // Simulate wallet disconnection
    act(() => {
      Object.assign(mockWalletState, {
        wallet: null,
        address: '',
      });
    });
    
    rerender();
    
    // Note: The hook doesn't automatically clear user on wallet disconnect
    // This might be intended behavior to maintain user session
    expect(result.current.user).not.toBeNull();
  });

  it('should handle multiple rapid address changes', async () => {
    const { result, rerender } = renderHook(() => useUserAuth());
    
    const addresses = [
      'addr_test1_address1',
      'addr_test1_address2',
      'addr_test1_address3',
    ];
    
    mockResolveRoles.mockResolvedValue(['member']);
    
    // Rapidly change addresses
    for (const address of addresses) {
      act(() => {
        Object.assign(mockWalletState, {
          wallet: { name: 'TestWallet' },
          address,
        });
      });
      rerender();
    }
    
    await waitFor(() => {
      expect(result.current.user?.address).toBe(addresses[addresses.length - 1]);
    });
  });
});
