import { query } from "./_generated/server";

// Example of a protected Convex endpoint
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    
    // If no user is authenticated, throw an error
    if (!identity) {
      throw new Error("Unauthorized: User must be logged in");
    }
    
    // Return user profile information
    return {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});