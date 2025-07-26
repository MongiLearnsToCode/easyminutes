import { render } from '@testing-library/react';
import { AuthGuard } from './auth-guard';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk hooks
const mockUseSession = jest.fn();
const mockUseClerk = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useSession: () => mockUseSession(),
  useClerk: () => mockUseClerk(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClerk.mockReturnValue({ signOut: jest.fn() });
  });

  it('should render children when authenticated and auth is required', () => {
    mockUseSession.mockReturnValue({ sessionId: 'test-session-id' });
    
    const { getByText } = render(
      <AuthGuard requireAuth={true}>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(getByText('Protected content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to sign-in when not authenticated and auth is required', () => {
    mockUseSession.mockReturnValue({ sessionId: null });
    
    render(
      <AuthGuard requireAuth={true}>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('should render children when not authenticated and auth is not required', () => {
    mockUseSession.mockReturnValue({ sessionId: null });
    
    const { getByText } = render(
      <AuthGuard requireAuth={false}>
        <div>Public content</div>
      </AuthGuard>
    );

    expect(getByText('Public content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when authenticated and auth is not required', () => {
    mockUseSession.mockReturnValue({ sessionId: 'test-session-id' });
    
    render(
      <AuthGuard requireAuth={false}>
        <div>Public content</div>
      </AuthGuard>
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
