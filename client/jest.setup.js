import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock MeshSDK wallet functionality
jest.mock('@meshsdk/react', () => ({
  useWallet: () => ({
    wallet: null,
    connected: false,
    connecting: false,
    name: '',
    account: null,
    address: '',
    setPersist: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  }),
  MeshProvider: ({ children }) => children,
  WalletProvider: ({ children }) => children,
}));

// Mock Cardano-related modules
jest.mock('@meshsdk/core', () => ({
  stringToHex: jest.fn((str) => Buffer.from(str).toString('hex')),
  hexToString: jest.fn((hex) => Buffer.from(hex, 'hex').toString()),
  IWallet: jest.fn(),
  UTxO: jest.fn(),
}));

// Mock SQL.js
jest.mock('sql.js', () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.resolve({
      Database: jest.fn(() => ({
        prepare: jest.fn(() => ({
          run: jest.fn(),
          step: jest.fn(() => false),
          getAsObject: jest.fn(() => ({})),
          bind: jest.fn(),
          free: jest.fn(),
        })),
        run: jest.fn(),
        export: jest.fn(() => new Uint8Array()),
      })),
    }),
  ),
}));

// Mock Web Workers
Object.defineProperty(window, 'Worker', {
  value: class Worker {
    constructor(url) {
      this.url = url;
      this.onmessage = null;
      this.onerror = null;
    }
    postMessage(data) {
      // Mock worker response
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage({ data: { db: [] } });
        }
      }, 10);
    }
    terminate() {}
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
