import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileSettings } from './profile-settings';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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

// Mock the API - this will use the mock file
jest.mock('@/convex/_generated/api');

describe('ProfileSettings', () => {
  const mockUser = {
    id: 'user_123',
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    imageUrl: 'https://example.com/avatar.jpg',
    primaryEmailAddress: {
      emailAddress: 'john@example.com',
    },
  };

  const mockConvexUser = {
    _id: 'convex_user_123',
    clerkId: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    defaultTemplateId: 'template_1',
  };

  const mockTemplatesData = {
    defaultTemplates: [
      { _id: 'template_1', name: 'Standard Meeting', isDefault: true },
      { _id: 'template_2', name: 'Standup', isDefault: true },
    ],
    userTemplates: [
      { _id: 'template_3', name: 'My Custom Template', isDefault: false },
    ],
    publicTemplates: [
      { _id: 'template_4', name: 'Community Template', isDefault: false },
    ],
  };

  const mockUpdateProfile = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({ user: mockUser });
    mockUseQuery.mockImplementation((query) => {
      if (query === 'users.getUserByClerkId') {
        return mockConvexUser;
      }
      if (query === 'templates.getAvailableTemplates') {
        return mockTemplatesData;
      }
      return null;
    });
    mockUseMutation.mockReturnValue(mockUpdateProfile);
  });

  it('should render profile settings form', () => {
    render(<ProfileSettings />);

    expect(screen.getByText('Profile Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Default Meeting Template')).toBeInTheDocument();
  });

  it('should populate form with user data', () => {
    render(<ProfileSettings />);

    const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
    const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement;

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
  });

  it('should render available templates', () => {
    render(<ProfileSettings />);

    // Open the select dropdown
    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Standard Meeting (System Default)')).toBeInTheDocument();
    expect(screen.getByText('Standup (System Default)')).toBeInTheDocument();
    expect(screen.getByText('My Custom Template (Custom)')).toBeInTheDocument();
    expect(screen.getByText('Community Template (Community)')).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);

    render(<ProfileSettings />);

    const firstNameInput = screen.getByLabelText('First Name');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        userId: 'convex_user_123',
        firstName: 'Johnny',
        lastName: 'Doe',
        defaultTemplateId: 'template_1',
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Profile updated',
      description: 'Your profile settings have been saved successfully.',
    });
  });

  it('should handle form submission error', async () => {
    mockUpdateProfile.mockRejectedValue(new Error('Update failed'));

    render(<ProfileSettings />);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    });
  });

  it('should show loading state when user data is not available', () => {
    mockUseQuery.mockImplementation((query) => {
      if (query === 'users.getUserByClerkId') {
        return null; // Simulate loading state
      }
      return mockTemplatesData;
    });

    render(<ProfileSettings />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should handle template selection change', () => {
    render(<ProfileSettings />);

    // Open the select dropdown
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Select a different template
    fireEvent.click(screen.getByText('Standup (System Default)'));

    // The form should update (we can verify this by checking if save button becomes enabled)
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).not.toBeDisabled();
  });
});
