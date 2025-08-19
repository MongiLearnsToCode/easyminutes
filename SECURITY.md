# Security Hardening Guide

This guide provides detailed steps for implementing security measures in EasyMinutes to ensure a production-ready application.

## 1. Generate Production Session Secrets

Session secrets are used to sign and encrypt session cookies, ensuring that they cannot be tampered with by malicious users.

### Generating Secure Secrets

1. Generate a secure session secret using OpenSSL:
   ```bash
   openssl rand -base64 32
   ```

2. For even stronger security, you can generate a 64-byte secret:
   ```bash
   openssl rand -base64 64
   ```

3. Add the generated secret to your environment variables:
   - In your `.env.production` file, set:
     ```
     NEXTAUTH_SECRET=your_generated_secret_here
     ```

4. Ensure the secret is properly configured in your application:
   - The `NEXTAUTH_SECRET` environment variable is automatically used by NextAuth.js (which Clerk is built on)
   - For Convex, you may need to configure session secrets in your Convex dashboard if using Convex sessions

### Secret Rotation

For production environments, it's recommended to rotate your session secrets periodically:

1. Generate a new secret
2. Deploy the new secret to your production environment
3. Keep the old secret active for a period of time to allow existing sessions to expire naturally
4. Remove the old secret after all sessions have expired

## 2. Configure CORS Policies for Production Domains

Cross-Origin Resource Sharing (CORS) policies control which domains are allowed to make requests to your application.

### Next.js CORS Configuration

For Next.js applications, CORS is typically handled at the API route level or through middleware.

1. If you have custom API routes that need CORS configuration, you can use the `cors` package:
   ```bash
   npm install cors
   npm install @types/cors --save-dev
   ```

2. Create a CORS middleware for specific API routes:
   ```javascript
   // pages/api/your-endpoint.js
   import Cors from 'cors';
   import { withSentry } from '@sentry/nextjs';

   // Initialize the cors middleware
   const cors = Cors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
     credentials: true,
   });

   // Helper method to wait for a middleware to execute before continuing
   function runMiddleware(req, res, fn) {
     return new Promise((resolve, reject) => {
       fn(req, res, (result) => {
         if (result instanceof Error) {
           return reject(result);
         }
         return resolve(result);
       });
     });
   }

   async function handler(req, res) {
     // Run the cors middleware
     await runMiddleware(req, res, cors);

     // Your API logic here
     res.status(200).json({ message: 'Success' });
   }

   export default withSentry(handler);
   ```

3. For a global CORS configuration in Next.js, you can use middleware (for Next.js 12+):
   ```javascript
   // middleware.js
   import { NextResponse } from 'next/server';

   export function middleware(request) {
     const response = NextResponse.next();
     
     // Set CORS headers
     response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://yourdomain.com');
     response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
     response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
     response.headers.set('Access-Control-Allow-Credentials', 'true');
     
     return response;
   }

   export const config = {
     matcher: '/api/:path*',
   };
   ```

### Convex CORS Configuration

Convex automatically handles CORS for most use cases, but you can configure specific settings in your Convex dashboard:

1. In your Convex dashboard, navigate to your project settings
2. Go to the "CORS" section
3. Add your production domain(s) to the allowed origins:
   - For example: `https://yourdomain.com`
   - If you have a staging environment: `https://staging.yourdomain.com`
   - For local development: `http://localhost:3000` (only for development)
4. Configure the allowed methods and headers as needed

### Webhook CORS Considerations

For webhooks from external services like LemonSqueezy:
1. Webhooks are server-to-server requests, so CORS doesn't apply to them
2. However, you should validate webhook requests using secrets to ensure they're legitimate

### Testing CORS Configuration

1. After deploying your CORS configuration, test it using curl or a browser:
   ```bash
   curl -H "Origin: https://yourdomain.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS \
        https://yourdomain.com/api/your-endpoint
   ```

2. Check that the response includes the appropriate CORS headers:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

## 3. Set up Rate Limiting for API Endpoints

Rate limiting helps prevent abuse of your API endpoints and protects against denial-of-service attacks.

### Next.js Rate Limiting

1. Install a rate limiting library like `express-rate-limit`:
   ```bash
   npm install express-rate-limit
   ```

2. Create a rate limiter middleware:
   ```javascript
   // lib/rate-limiter.js
   import rateLimit from 'express-rate-limit';

   // Create a rate limiter
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again later.',
   });

   export default limiter;
   ```

3. Apply the rate limiter to specific API routes:
   ```javascript
   // pages/api/your-endpoint.js
   import limiter from '../../lib/rate-limiter';

   export default async function handler(req, res) {
     // Apply rate limiting
     await new Promise((resolve, reject) => {
       limiter(req, res, (err) => {
         if (err) {
           reject(err);
         } else {
           resolve();
         }
       });
     });

     // Your API logic here
   }
   ```

### Convex Rate Limiting

Convex has built-in rate limiting, but you can implement additional application-level rate limiting:

1. Create a Convex function to track request counts:
   ```javascript
   // convex/rateLimit.js
   import { mutation } from './_generated/server';
   import { v } from 'convex/values';

   export const trackRequest = mutation({
     args: {
       ip: v.string(),
       endpoint: v.string(),
     },
     handler: async (ctx, args) => {
       // Track the request in your database
       // Implement your rate limiting logic here
     },
   });
   ```

2. Check rate limits in your Convex functions:
   ```javascript
   // convex/yourFunction.js
   import { query } from './_generated/server';
   import { trackRequest } from './rateLimit';

   export const yourFunction = query({
     args: { /* your args */ },
     handler: async (ctx, args) => {
       // Check rate limit
       const ip = ctx.headers.get('x-forwarded-for') || 'unknown';
       await trackRequest({ ip, endpoint: 'yourFunction' });
       
       // Your function logic here
     },
   });
   ```

### Specific Rate Limits for Different Endpoints

Different endpoints may require different rate limits:

1. For the AI processing endpoint (which is resource-intensive):
   ```javascript
   const aiProcessingLimiter = rateLimit({
     windowMs: 60 * 60 * 1000, // 1 hour
     max: 5, // limit each IP to 5 requests per hour
     message: 'Too many AI processing requests. Please try again later.',
   });
   ```

2. For authentication endpoints:
   ```javascript
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // limit each IP to 5 requests per windowMs
     message: 'Too many authentication attempts. Please try again later.',
   });
   ```

3. For webhooks (which should have higher limits):
   ```javascript
   const webhookLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100, // Higher limit for webhooks
     message: 'Too many webhook requests.',
   });
   ```

## Additional Security Measures

### Environment Variables

1. Never commit sensitive environment variables to your repository
2. Use different environment variables for development, staging, and production
3. Regularly rotate API keys and secrets

### Dependency Security

1. Regularly update dependencies to patch security vulnerabilities:
   ```bash
   npm audit
   npm audit fix
   ```

2. Use tools like `npm audit` or `yarn audit` to identify vulnerabilities

### Input Validation

1. Always validate and sanitize user inputs
2. Use libraries like `zod` for schema validation (which is already used in this project)
3. Implement proper error handling that doesn't expose sensitive information

### HTTPS Enforcement

1. Ensure your application is only accessible over HTTPS
2. Configure your web server or CDN to redirect HTTP requests to HTTPS
3. Use HTTP Strict Transport Security (HSTS) headers

## Production Security Checklist

Before going live, ensure you've completed the following:

- [ ] Generated and configured secure session secrets
- [ ] Configured CORS policies for production domains
- [ ] Implemented rate limiting for API endpoints
- [ ] Verified that sensitive environment variables are not committed to the repository
- [ ] Updated all dependencies to their latest secure versions
- [ ] Implemented proper input validation and sanitization
- [ ] Configured HTTPS enforcement
- [ ] Set up monitoring for security events
- [ ] Conducted a security audit of the application