import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock Convex
jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  ConvexProvider: ({ children }) => children,
}));

// Mock Next.js web APIs
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: new Map(Object.entries(options?.headers || {})),
  text: jest.fn().mockResolvedValue(options?.body || ''),
  json: jest.fn().mockResolvedValue(JSON.parse(options?.body || '{}')),
}));

global.Response = jest.fn().mockImplementation((body, options) => ({
  status: options?.status || 200,
  ok: (options?.status || 200) >= 200 && (options?.status || 200) < 300,
  text: jest.fn().mockResolvedValue(body),
  json: jest.fn().mockResolvedValue(JSON.parse(body || '{}')),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_CONVEX_URL = "https://test-convex-url.convex.cloud";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-supabase-url.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-supabase-anon-key";

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
