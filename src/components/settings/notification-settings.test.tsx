import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from './notification-settings';

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

// Mock the API - this will use the mock file
jest.mock('@/convex/_generated/api');

describe('NotificationSettings', () => {
  const mockUser = {
    id: 'user_123',
    fullName: 'John Doe',
  };

  const mockConvexUser = {
    _id: 'convex_user_123',
    clerkId: 'user_123',
    notificationPreferences: {
      emailOnTranscriptionComplete: true,
      emailOnShareAccess: true,
      emailOnSubscriptionUpdates: false,
      inAppNotifications: true,
    },
  };

  const mockUpdateNotificationPreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockUseQuery.mockReturnValue(mockConvexUser);
    mockUseMutation.mockReturnValue(mockUpdateNotificationPreferences);
  });

  it('should render notification settings form', () => {
    render(<NotificationSettings />);

    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    expect(screen.getByText('Transcription Complete')).toBeInTheDocument();
    expect(screen.getByText('Share Access')).toBeInTheDocument();
    expect(screen.getByText('Subscription Updates')).toBeInTheDocument();
    expect(screen.getByText('Browser Notifications')).toBeInTheDocument();
  });

  it('should populate form with current preferences', () => {
    render(<NotificationSettings />);

    const transcriptionSwitch = screen.getByRole('switch', { name: /transcription complete/i });
    const shareAccessSwitch = screen.getByRole('switch', { name: /share access/i });
    const subscriptionSwitch = screen.getByRole('switch', { name: /subscription updates/i });
    const inAppSwitch = screen.getByRole('switch', { name: /browser notifications/i });

    expect(transcriptionSwitch).toBeChecked();
    expect(shareAccessSwitch).toBeChecked();
    expect(subscriptionSwitch).not.toBeChecked();
    expect(inAppSwitch).toBeChecked();
  });

  it('should handle preference changes', () => {
    render(<NotificationSettings />);

    const subscriptionSwitch = screen.getByRole('switch', { name: /subscription updates/i });
    fireEvent.click(subscriptionSwitch);

    // Should enable the save button
    const saveButton = screen.getByText('Save Preferences');
    expect(saveButton).not.toBeDisabled();
  });

  it('should handle form submission successfully', async () => {
    mockUpdateNotificationPreferences.mockResolvedValue(undefined);

    render(<NotificationSettings />);

    // Change a preference
    const subscriptionSwitch = screen.getByRole('switch', { name: /subscription updates/i });
    fireEvent.click(subscriptionSwitch);

    // Submit the form
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith({
        userId: 'convex_user_123',
        preferences: {
          emailOnTranscriptionComplete: true,
          emailOnShareAccess: true,
          emailOnSubscriptionUpdates: true, // Changed from false to true
          inAppNotifications: true,
        },
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Preferences updated',
      description: 'Your notification settings have been saved successfully.',
    });
  });

  it('should handle form submission error', async () => {
    mockUpdateNotificationPreferences.mockRejectedValue(new Error('Update failed'));

    render(<NotificationSettings />);

    // Change a preference and submit
    const subscriptionSwitch = screen.getByRole('switch', { name: /subscription updates/i });
    fireEvent.click(subscriptionSwitch);

    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update your notification preferences. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('should show loading state when user data is not available', () => {
    mockUseQuery.mockReturnValue(null);

    render(<NotificationSettings />);

    expect(screen.getByText('Loading notification settings...')).toBeInTheDocument();
  });

  it('should disable save button when no changes are made', () => {
    render(<NotificationSettings />);

    const saveButton = screen.getByText('Save Preferences');
    expect(saveButton).toBeDisabled();
  });

  it('should show privacy notice', () => {
    render(<NotificationSettings />);

    expect(screen.getByText('Privacy & Data')).toBeInTheDocument();
    expect(screen.getByText(/We respect your privacy/)).toBeInTheDocument();
    expect(screen.getByText(/Critical security and account notifications/)).toBeInTheDocument();
  });
});
