// Import the necessary modules
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// Create an HTTP router
const http = httpRouter();

// Simple health check endpoint
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response("OK", { status: 200 });
  }),
});

// Export the HTTP router
export default http;