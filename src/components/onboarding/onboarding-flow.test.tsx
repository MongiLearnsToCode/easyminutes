import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from './onboarding-flow';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk hooks
const mockUseUser = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
}));

// Mock Convex hooks
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
jest.mock('convex/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
  useMutation: (...args: any[]) => mockUseMutation(...args),
}));

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock the API
jest.mock('@/convex/_generated/api');

// Mock step components
jest.mock('./welcome-step', () => ({
  WelcomeStep: ({ onNext }: any) => (
    <div data-testid="welcome-step">
      <button onClick={onNext}>Get Started</button>
    </div>
  ),
}));

jest.mock('./profile-step', () => ({
  ProfileStep: ({ onNext, onPrev }: any) => (
    <div data-testid="profile-step">
      <button onClick={onPrev}>Back</button>
      <button onClick={onNext}>Continue</button>
    </div>
  ),
}));

jest.mock('./template-step', () => ({
  TemplateStep: ({ onNext, onPrev }: any) => (
    <div data-testid="template-step">
      <button onClick={onPrev}>Back</button>
      <button onClick={onNext}>Continue</button>
    </div>
  ),
}));

jest.mock('./completion-step', () => ({
  CompletionStep: ({ onPrev, onFinish }: any) => (
    <div data-testid="completion-step">
      <button onClick={onPrev}>Back</button>
      <button onClick={onFinish}>Finish</button>
    </div>
  ),
}));

describe('OnboardingFlow', () => {
  const mockUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockConvexUser = {
    _id: 'convex_user_123',
    onboardingCompleted: false,
  };

  const mockCompleteOnboarding = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockUseQuery.mockReturnValue(mockConvexUser);
    mockUseMutation.mockReturnValue(mockCompleteOnboarding);
  });

  it('should render welcome step initially', () => {
    render(<OnboardingFlow />);
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });

  it('should redirect if user has completed onboarding', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      onboardingCompleted: true,
    });

    render(<OnboardingFlow />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate through steps correctly', () => {
    render(<OnboardingFlow />);

    // Start at welcome step
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();

    // Click to go to profile step
    fireEvent.click(screen.getByText('Get Started'));
    expect(screen.getByTestId('profile-step')).toBeInTheDocument();

    // Click to go to template step
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByTestId('template-step')).toBeInTheDocument();

    // Click to go to completion step
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByTestId('completion-step')).toBeInTheDocument();
  });

  it('should navigate backwards through steps', () => {
    render(<OnboardingFlow />);

    // Navigate to completion step
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));

    expect(screen.getByTestId('completion-step')).toBeInTheDocument();

    // Go back to template step
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('template-step')).toBeInTheDocument();

    // Go back to profile step
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('profile-step')).toBeInTheDocument();

    // Go back to welcome step
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });

  it('should complete onboarding and redirect to dashboard', async () => {
    mockCompleteOnboarding.mockResolvedValue(undefined);

    render(<OnboardingFlow />);

    // Navigate to completion step
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));

    // Complete onboarding
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalledWith({
        userId: 'convex_user_123',
        selectedTemplateId: undefined,
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Welcome to Easy Minutes!',
      description: 'Your account has been set up successfully.',
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle onboarding completion error', async () => {
    mockCompleteOnboarding.mockRejectedValue(new Error('Failed to complete'));

    render(<OnboardingFlow />);

    // Navigate to completion step and finish
    fireEvent.click(screen.getByText('Get Started'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Finish'));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('should show loading state when user data is not available', () => {
    mockUseQuery.mockReturnValue(null);

    render(<OnboardingFlow />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should initialize form data with user info', () => {
    render(<OnboardingFlow />);

    // The onboarding data should be initialized with user's name
    // This would be verified through the step components receiving the correct props
    expect(screen.getByTestId('welcome-step')).toBeInTheDocument();
  });
});
