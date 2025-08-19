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
2. Go to the \"CORS\" section
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
   curl -H \"Origin: https://yourdomain.com\" \\
        -H \"Access-Control-Request-Method: POST\" \\
        -H \"Access-Control-Request-Headers: X-Requested-With\" \\
        -X OPTIONS \\
        https://yourdomain.com/api/your-endpoint
   ```

2. Check that the response includes the appropriate CORS headers:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

## 3. Set up Rate Limiting for API Endpoints

Rate limiting helps prevent abuse of your API endpoints and protects against denial-of-service attacks.

### Next.js Rate Limiting

For Next.js applications, we'll implement rate limiting using a combination of in-memory storage and Redis for production environments.

1. Install the required packages:
   ```bash
   npm install express-rate-limit
   # For production with Redis:
   npm install rate-limiter-flexible
   ```

2. Create a rate limiter configuration:
   ```javascript
   // lib/rate-limiter.js
   import { RateLimiterMemory } from 'rate-limiter-flexible';
   
   // For production, you would use RateLimiterRedis with a Redis store
   const rateLimiter = new RateLimiterMemory({
     points: 10, // 10 requests
     duration: 60, // per 1 minute
   });
   
   export async function rateLimiterMiddleware(req, res, next) {
     try {
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       await rateLimiter.consume(ip);
       next();
     } catch (error) {
       res.status(429).json({ error: 'Too many requests, please try again later.' });
     }
   }
   ```

3. Apply rate limiting to specific API routes:
   ```javascript
   // pages/api/your-endpoint.js
   import { rateLimiterMiddleware } from '../../lib/rate-limiter';
   
   export default async function handler(req, res) {
     // Apply rate limiting
     await new Promise((resolve, reject) => {
       rateLimiterMiddleware(req, res, (err) => {
         if (err) {
           reject(err);
         } else {
           resolve();
         }
       });
     });
   
     // Your API logic here
     res.status(200).json({ message: 'Success' });
   }
   ```

4. For production with Redis:
   ```javascript
   // lib/rate-limiter-redis.js
   import { RateLimiterRedis } from 'rate-limiter-flexible';
   import Redis from 'ioredis';
   
   const redisClient = new Redis(process.env.REDIS_URL);
   
   const rateLimiter = new RateLimiterRedis({
     storeClient: redisClient,
     keyPrefix: 'rateLimit',
     points: 10, // 10 requests
     duration: 60, // per 1 minute
   });
   
   export async function rateLimiterMiddleware(req, res, next) {
     try {
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       await rateLimiter.consume(ip);
       next();
     } catch (error) {
       res.status(429).json({ error: 'Too many requests, please try again later.' });
     }
   }
   ```

### Convex Rate Limiting

Convex has built-in rate limiting, but you can implement additional application-level rate limiting for specific functions:

1. Create a Convex function to track request counts:
   ```javascript
   // convex/rateLimit.js
   import { mutation, query } from './_generated/server';
   import { v } from 'convex/values';
   
   // Table to store rate limit data
   // This would be defined in your schema:
   // rateLimits: defineTable({
   //   key: v.string(), // IP address or user ID
   //   count: v.number(),
   //   resetTime: v.number(),
   // }).index(\"by_key\", [\"key\"])
   
   export const incrementRateLimit = mutation({
     args: {
       key: v.string(),
       limit: v.number(),
       windowMs: v.number(),
     },
     handler: async (ctx, args) => {
       const now = Date.now();
       const resetTime = now + args.windowMs;
       
       // Try to get existing rate limit record
       const existing = await ctx.db
         .query('rateLimits')
         .withIndex('by_key', q => q.eq('key', args.key))
         .unique();
       
       if (existing) {
         // Check if we're still in the window
         if (existing.resetTime > now) {
           // Increment the count
           if (existing.count >= args.limit) {
             throw new Error('Rate limit exceeded');
           }
           
           await ctx.db.patch(existing._id, {
             count: existing.count + 1,
           });
         } else {
           // Reset the count
           await ctx.db.patch(existing._id, {
             count: 1,
             resetTime,
           });
         }
       } else {
         // Create a new rate limit record
         await ctx.db.insert('rateLimits', {
           key: args.key,
           count: 1,
           resetTime,
         });
       }
     },
   });
   
   export const checkRateLimit = query({
     args: {
       key: v.string(),
     },
     handler: async (ctx, args) => {
       const existing = await ctx.db
         .query('rateLimits')
         .withIndex('by_key', q => q.eq('key', args.key))
         .unique();
       
       if (!existing) {
         return { allowed: true, count: 0, resetTime: 0 };
       }
       
       const now = Date.now();
       if (existing.resetTime <= now) {
         return { allowed: true, count: 0, resetTime: 0 };
       }
       
       return {
         allowed: existing.count < 10, // Default limit
         count: existing.count,
         resetTime: existing.resetTime,
       };
     },
   });
   ```

2. Check rate limits in your Convex functions:
   ```javascript
   // convex/yourFunction.js
   import { query } from './_generated/server';
   import { incrementRateLimit } from './rateLimit';
   
   export const yourFunction = query({
     args: { /* your args */ },
     handler: async (ctx, args) => {
       // Check rate limit
       const ip = ctx.headers.get('x-forwarded-for') || 'unknown';
       try {
         await incrementRateLimit({
           key: `function_yourFunction_${ip}`,
           limit: 5, // 5 requests
           windowMs: 60 * 1000, // per minute
         });
       } catch (error) {
         throw new Error('Rate limit exceeded for this function');
       }
       
       // Your function logic here
     },
   });
   ```

### Specific Rate Limits for Different Endpoints

Different endpoints may require different rate limits based on their resource intensity:

1. For the AI processing endpoint (which is resource-intensive):
   ```javascript
   // lib/ai-rate-limiter.js
   import { RateLimiterMemory } from 'rate-limiter-flexible';
   
   const aiProcessingLimiter = new RateLimiterMemory({
     points: 2, // 2 requests
     duration: 60 * 60, // per hour
   });
   
   export async function aiRateLimiterMiddleware(req, res, next) {
     try {
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       await aiProcessingLimiter.consume(ip);
       next();
     } catch (error) {
       res.status(429).json({
         error: 'Too many AI processing requests. Please try again later.',
         retryAfter: 60 * 60 // seconds
       });
     }
   }
   ```

2. For authentication endpoints:
   ```javascript
   // lib/auth-rate-limiter.js
   import { RateLimiterMemory } from 'rate-limiter-flexible';
   
   const authLimiter = new RateLimiterMemory({
     points: 5, // 5 requests
     duration: 15 * 60, // per 15 minutes
   });
   
   export async function authRateLimiterMiddleware(req, res, next) {
     try {
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       await authLimiter.consume(ip);
       next();
     } catch (error) {
       res.status(429).json({
         error: 'Too many authentication attempts. Please try again later.',
         retryAfter: 15 * 60 // seconds
       });
     }
   }
   ```

3. For webhooks (which should have higher limits):
   ```javascript
   // lib/webhook-rate-limiter.js
   import { RateLimiterMemory } from 'rate-limiter-flexible';
   
   const webhookLimiter = new RateLimiterMemory({
     points: 100, // 100 requests
     duration: 60, // per minute
   });
   
   export async function webhookRateLimiterMiddleware(req, res, next) {
     try {
       const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
       await webhookLimiter.consume(ip);
       next();
     } catch (error) {
       res.status(429).json({
         error: 'Too many webhook requests.',
         retryAfter: 60 // seconds
       });
     }
   }
   ```

### Implementation in EasyMinutes

For EasyMinutes, we should implement rate limiting on the following endpoints:

1. **AI Processing Endpoint** (`/api/gemini/processMeetingNotes`):
   - Restrictive rate limiting (2 requests per hour per IP)
   - This is a resource-intensive operation

2. **Authentication Endpoints**:
   - Moderate rate limiting (5 requests per 15 minutes per IP)
   - Prevents brute force attacks

3. **Webhook Endpoints** (`/api/webhooks/lemonsqueezy`):
   - Higher rate limiting (100 requests per minute per IP)
   - These are server-to-server requests

4. **File Upload Endpoints**:
   - Moderate rate limiting (10 requests per minute per IP)
   - Prevents abuse of file upload functionality

### Monitoring Rate Limiting

1. Log rate limiting events for monitoring:
   ```javascript
   // In your rate limiting middleware
   if (rateLimitExceeded) {
     console.log(`Rate limit exceeded for IP: ${ip} on endpoint: ${req.url}`);
     // Send to your analytics service
   }
   ```

2. Set up alerts for excessive rate limiting events:
   - Monitor for IPs that are frequently hitting rate limits
   - This could indicate abusive behavior or a need to adjust limits

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