// Mock Firebase configuration for self-hosted deployment
// This replaces Firebase functionality with stubs

interface MockFirebaseApp {
  name: string;
  options: any;
}

interface MockAuth {
  currentUser: null;
  signOut: () => Promise<void>;
}

interface MockFirestore {
  collection: (path: string) => any;
  doc: (path: string) => any;
}

interface MockStorage {
  ref: (path?: string) => any;
}

// Mock Firebase app
const mockApp: MockFirebaseApp = {
  name: '[DEFAULT]',
  options: {}
};

// Mock auth
const mockAuth: MockAuth = {
  currentUser: null,
  signOut: async () => {
    console.log('Mock Firebase Auth: Sign out called');
  }
};

// Mock Firestore
const mockDb: MockFirestore = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ empty: true, docs: [] })
    })
  }),
  doc: (path: string) => ({
    get: () => Promise.resolve({ exists: false, data: () => null }),
    set: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve()
  })
};

// Mock Storage
const mockStorage: MockStorage = {
  ref: (path?: string) => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
    getDownloadURL: () => Promise.resolve(''),
    delete: () => Promise.resolve()
  })
};

// Export the mocks with the same interface as Firebase
export const app = mockApp;
export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;