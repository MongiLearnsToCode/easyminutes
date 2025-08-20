// Import the necessary modules
import { httpRouter } from "convex/server";

// Create an HTTP router
const http = httpRouter();

// Simple health check endpoint
http.route({
  path: "/api/health",
  method: "GET",
  handler: async (ctx) => {
    return new Response("OK", { status: 200 });
  },
});

// Export the HTTP router
export default http;