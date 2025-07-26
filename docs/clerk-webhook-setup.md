# Clerk Webhook Setup Documentation

## Overview

The Clerk webhook integration ensures that user data is automatically synchronized between Clerk authentication and the Convex database whenever users are created, updated, or deleted.

## Implementation Details

### Webhook Endpoint

- **URL**: `/api/webhooks/clerk`
- **Method**: `POST`
- **Location**: `src/app/api/webhooks/clerk/route.ts`

### Supported Events

1. **user.created** - When a new user signs up
2. **user.updated** - When user profile data changes  
3. **user.deleted** - When a user account is deleted

### Security

- Uses Svix library for webhook signature verification
- Requires `CLERK_WEBHOOK_SECRET` environment variable
- Validates all webhook headers (svix-id, svix-timestamp, svix-signature)

### Database Integration

The webhook automatically:

- **Creates users** with default settings (free tier, enabled notifications)
- **Updates user profiles** when data changes in Clerk
- **Deletes users** and all associated data (meetings, templates, notifications) when accounts are removed

### Configuration Required

1. **Environment Variables**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret_here
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

2. **Clerk Dashboard Configuration**:
   - Navigate to Clerk Dashboard → Webhooks
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to your environment variables

## Testing

- Unit tests verify webhook dependencies and configuration
- Tests ensure proper mocking of Clerk webhook verification
- Integration with Convex database operations is tested

## Error Handling

- Returns 400 for missing webhook headers
- Returns 400 for failed signature verification
- Returns 500 for internal server errors
- Logs all webhook events and errors for debugging

## Database Schema Impact

Creates and manages records in the `users` table with:

- Clerk user ID mapping
- User profile information (name, email, image)
- Subscription tier and status
- Usage tracking for freemium limits
- Notification preferences
- Timestamps for creation and updates
