import { Utxo } from '@types';

export const mockUtxos: Utxo[] = [
  {
    id: 1,
    txHash: "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    outputIndex: 0,
    address: "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
    amount: "5000000",
    dataHash: "hash123456789",
    plutusData: "d8799fa1b2c3d4e5f6ff",
    context: "membership_intent"
  },
  {
    id: 2,
    txHash: "b2c3d4e5f67890123456789012345678901234567890123456789012345678901",
    outputIndex: 1,
    address: "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
    amount: "10000000",
    dataHash: "hash234567890",
    plutusData: "d8799fb1c2d3e4f5g6ff",
    context: "member"
  },
  {
    id: 3,
    txHash: "c3d4e5f678901234567890123456789012345678901234567890123456789012",
    outputIndex: 0,
    address: "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
    amount: "2000000",
    dataHash: "hash345678901",
    plutusData: "d8799fc1d2e3f4g5h6ff",
    context: "proposal"
  }
];

export const mockWalletData = {
  address: "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x",
  balance: {
    lovelace: "50000000",
    assets: []
  },
  utxos: mockUtxos.map(utxo => ({
    input: {
      txHash: utxo.txHash,
      outputIndex: utxo.outputIndex
    },
    output: {
      address: utxo.address,
      amount: [{ unit: "lovelace", quantity: utxo.amount }],
      dataHash: utxo.dataHash,
      plutusData: utxo.plutusData
    }
  }))
};

export const mockDatabaseStates = {
  empty: {
    utxos: [],
    ambassadors: []
  },
  loading: {
    utxos: null,
    ambassadors: null
  },
  populated: {
    utxos: mockUtxos,
    ambassadors: []
  },
  error: {
    utxos: null,
    ambassadors: null,
    error: "Database connection failed"
  }
};

export const mockWorkerResponses = {
  success: {
    db: new Uint8Array([1, 2, 3, 4, 5]) // Mock database export
  },
  error: {
    error: "Failed to fetch data from API"
  },
  empty: {
    db: new Uint8Array([])
  }
};

export const mockAuthStates = {
  disconnected: {
    user: null,
    isAuthenticated: false,
    userAddress: null,
    userRoles: [],
    userWallet: null
  },
  connected: {
    user: {
      wallet: {} as any, // Mock wallet object
      roles: ['member'],
      address: mockWalletData.address
    },
    isAuthenticated: true,
    userAddress: mockWalletData.address,
    userRoles: ['member'],
    userWallet: {} as any
  },
  admin: {
    user: {
      wallet: {} as any,
      roles: ['admin', 'member'],
      address: mockWalletData.address
    },
    isAuthenticated: true,
    userAddress: mockWalletData.address,
    userRoles: ['admin', 'member'],
    userWallet: {} as any
  }
};

// Helper function to create mock fetch responses
export const createMockResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  redirected: false,
  statusText: ok ? 'OK' : 'Error',
  type: 'basic' as ResponseType,
  url: '',
  clone: () => createMockResponse(data, ok, status),
  body: null,
  bodyUsed: false
});

// Mock API responses
export const mockApiResponses = {
  ambassadors: {
    success: mockUtxos,
    empty: [],
    error: { error: "Failed to fetch ambassadors" }
  },
  utxos: {
    success: mockUtxos,
    empty: [],
    error: { error: "Failed to fetch UTXOs" }
  },
  admin: {
    success: { message: "Action completed successfully", txHash: "abc123" },
    error: { error: "Unauthorized or action failed" }
  }
};
