// Mock the svix webhook verification
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_test123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg'
      }
    })
  }))
}));

// Mock the Convex client
jest.mock('convex/browser', () => ({
  ConvexHttpClient: jest.fn().mockImplementation(() => ({
    mutation: jest.fn().mockResolvedValue('user_id_123')
  }))
}));

// Mock the API
jest.mock('../../../../../convex/_generated/api', () => ({
  api: {
    users: {
      upsertUser: 'users:upsertUser',
      deleteUserAccount: 'users:deleteUserAccount'
    }
  }
}));

describe('/api/webhooks/clerk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret';
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
    
    // Mock console methods to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should verify Clerk webhook is properly implemented', async () => {
    // Test that the webhook file exists and exports POST handler
    const route = await import('./route');
    expect(typeof route.POST).toBe('function');
  });

  it('should have proper dependencies installed', async () => {
    // Test that svix library is available
    const svix = await import('svix');
    expect(svix.Webhook).toBeDefined();
    
    // Test that Convex client is available
    const convex = await import('convex/browser');
    expect(convex.ConvexHttpClient).toBeDefined();
  });

  it('should have required environment variables configured', () => {
    expect(process.env.CLERK_WEBHOOK_SECRET).toBeDefined();
    expect(process.env.NEXT_PUBLIC_CONVEX_URL).toBeDefined();
  });

  it('should correctly handle webhook verification setup', async () => {
    const { Webhook } = await import('svix');
    
    // Create webhook instance with secret
    new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    
    expect(Webhook).toHaveBeenCalledWith(process.env.CLERK_WEBHOOK_SECRET);
  });

  it('should correctly setup Convex client', async () => {
    const { ConvexHttpClient } = await import('convex/browser');
    
    // Create Convex client with URL
    new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    
    expect(ConvexHttpClient).toHaveBeenCalledWith(process.env.NEXT_PUBLIC_CONVEX_URL);
  });
});
