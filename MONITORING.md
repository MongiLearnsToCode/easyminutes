# Monitoring Setup Guide

This guide provides detailed steps for implementing monitoring in EasyMinutes to ensure a production-ready application with proper observability.

## 1. Configure Error Tracking (Sentry.io)

Error tracking is crucial for identifying and fixing issues in your application before they affect users.

### Setting up Sentry.io

1. Sign up for a [Sentry.io](https://sentry.io/) account if you don't already have one

2. Create a new project:
   - Click "Create Project"
   - Select "React" as the platform for the frontend
   - Select "Node.js" as the platform for the backend (Convex functions)
   - Give your project a name (e.g., "EasyMinutes")

3. Install the Sentry SDKs:
   ```bash
   # For Next.js frontend
   npm install @sentry/nextjs
   
   # For Convex backend (if using Sentry directly)
   npm install @sentry/node
   ```

4. Configure Sentry for Next.js:
   - Run the Sentry setup wizard:
     ```bash
     npx @sentry/wizard -i nextjs
     ```
   - This will create a `sentry.client.config.js` and `sentry.server.config.js` file
   - It will also modify your `next.config.js` file

5. Configure the Sentry client:
   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
     integrations: [
       new Sentry.Replay({
         maskAllText: true,
         blockAllMedia: true,
       }),
     ],
   });
   ```

6. Configure the Sentry server:
   ```javascript
   // sentry.server.config.js
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   ```

7. Update your environment variables:
   - Add `NEXT_PUBLIC_SENTRY_DSN` to your `.env.production` file with the DSN from your Sentry project

8. Instrument your code:
   - Sentry automatically captures many errors, but you can also manually capture exceptions:
     ```javascript
     import * as Sentry from "@sentry/nextjs";
     
     try {
       // Your code here
     } catch (error) {
       Sentry.captureException(error);
     }
     ```

### Sentry for Convex Functions

For Convex functions, you can integrate Sentry by:

1. Initializing Sentry in your Convex functions:
   ```javascript
   // convex/yourFunction.js
   import * as Sentry from "@sentry/node";
   
   // Initialize Sentry with your DSN
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
   });
   
   export const yourFunction = mutation({
     args: { /* your args */ },
     handler: async (ctx, args) => {
       try {
         // Your function logic here
       } catch (error) {
         Sentry.captureException(error);
         throw error;
       }
     },
   });
   ```

2. Add `SENTRY_DSN` to your Convex environment variables:
   ```bash
   npx convex env set SENTRY_DSN your_sentry_dsn_here
   ```

### Sentry Best Practices

1. Set appropriate sample rates:
   - For performance traces, start with a lower sample rate (e.g., 10-25%)
   - For replays, use a low session sample rate but 100% on error

2. Use environments:
   - Configure Sentry to distinguish between development, staging, and production environments
   - Set the environment in your Sentry initialization:
     ```javascript
     Sentry.init({
       dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
       environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
     });
     ```

3. Set up alerting:
   - Configure alerts in Sentry to notify you of new issues or spikes in error rates
   - Create custom alert rules based on your application's specific needs

## 2. Set up Performance Monitoring

Performance monitoring helps you understand how your application is performing and identify bottlenecks.

### Web Vitals Monitoring with Sentry

Sentry automatically captures Web Vitals, but you can also configure custom performance monitoring:

1. Instrument your code to track custom transactions:
   ```javascript
   import * as Sentry from "@sentry/nextjs";
   
   const transaction = Sentry.startTransaction({
     name: "meeting-minutes-generation",
   });
   
   try {
     // Your AI processing code here
   } finally {
     transaction.finish();
   }
   ```

2. Track API calls:
   ```javascript
   import * as Sentry from "@sentry/nextjs";
   
   const span = Sentry.getCurrentHub().getScope().getSpan();
   const childSpan = span?.startChild({
     op: "api",
     description: "gemini-api-call",
   });
   
   try {
     // Your API call here
   } finally {
     childSpan?.finish();
   }
   ```

### Custom Performance Metrics for EasyMinutes

For EasyMinutes, we should track performance metrics for the following key operations:

1. AI Processing Time:
   ```javascript
   // In your Convex function for AI processing
   export const processMeetingNotes = mutation({
     args: { 
       text: v.string(),
       userId: v.string(),
     },
     handler: async (ctx, args) => {
       const startTime = Date.now();
       
       try {
         // Record start time for performance monitoring
         const processingStartTime = Date.now();
         
         // Your AI processing code here
         const result = await processWithGemini(args.text);
         
         // Record end time and calculate duration
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - processingStartTime;
         
         // Log performance metric
         console.log(`AI processing completed in ${processingDuration}ms`);
         
         // Store performance data for analytics
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: true,
           inputType: "text",
           timestamp: Date.now(),
         });
         
         return result;
       } catch (error) {
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - startTime;
         
         // Store performance data for failed requests
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: false,
           inputType: "text",
           timestamp: Date.now(),
         });
         
         throw error;
       }
     },
   });
   ```

2. File Upload Processing Time:
   ```javascript
   // In your file upload handler
   export const processFileUpload = mutation({
     args: { 
       fileData: v.bytes(),
       fileType: v.string(),
       userId: v.string(),
     },
     handler: async (ctx, args) => {
       const startTime = Date.now();
       
       try {
         // Process file upload
         const text = await extractTextFromFile(args.fileData, args.fileType);
         
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - startTime;
         
         // Log performance metric
         console.log(`File processing completed in ${processingDuration}ms`);
         
         // Store performance data
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: true,
           inputType: "file",
           timestamp: Date.now(),
         });
         
         return { text, processingTime: processingDuration };
       } catch (error) {
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - startTime;
         
         // Store performance data for failed requests
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: false,
           inputType: "file",
           timestamp: Date.now(),
         });
         
         throw error;
       }
     },
   });
   ```

3. Audio Transcription Time:
   ```javascript
   // In your audio processing handler
   export const transcribeAudioAndProcessMeetingNotes = mutation({
     args: {
       audioData: v.bytes(),
       audioMimeType: v.string(),
       userId: v.string(),
     },
     handler: async (ctx, args) => {
       const startTime = Date.now();
       
       try {
         // Transcribe audio
         const transcribedText = await simulateAudioTranscription(
           args.audioData, 
           args.audioMimeType
         );
         
         // Process transcribed text
         const processingResult = await processMeetingNotes({
           text: transcribedText,
           userId: args.userId,
         });
         
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - startTime;
         
         // Log performance metric
         console.log(`Audio processing completed in ${processingDuration}ms`);
         
         // Store performance data
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: true,
           inputType: "audio",
           timestamp: Date.now(),
         });
         
         return processingResult;
       } catch (error) {
         const processingEndTime = Date.now();
         const processingDuration = processingEndTime - startTime;
         
         // Store performance data for failed requests
         await ctx.db.insert("processingTimeEvents", {
           userId: args.userId,
           processingTimeMs: processingDuration,
           success: false,
           inputType: "audio",
           timestamp: Date.now(),
         });
         
         throw error;
       }
     },
   });
   ```

4. Frontend Performance Tracking:
   ```javascript
   // In your frontend components
   import * as Sentry from "@sentry/nextjs";
   
   // Track user interactions
   const handleGenerateMinutes = async (text) => {
     const transaction = Sentry.startTransaction({
       name: "generate-meeting-minutes",
     });
     
     try {
       // Start measuring
       const startTime = performance.now();
       
       // Call the Convex function
       const result = await processMeetingNotes({ text, userId });
       
       // End measuring
       const endTime = performance.now();
       const duration = endTime - startTime;
       
       console.log(`Meeting minutes generated in ${duration}ms`);
       
       return result;
     } catch (error) {
       Sentry.captureException(error);
       throw error;
     } finally {
       transaction.finish();
     }
   };
   ```

### Performance Monitoring with Custom Analytics

In addition to Sentry, we can use the existing analytics infrastructure in EasyMinutes to track performance:

1. Track processing times in the existing `processingTimeEvents` table:
   - This is already partially implemented in the code examples above
   - The data is stored in Convex and can be queried for analytics

2. Create analytics queries to monitor performance:
   ```javascript
   // convex/getPerformanceAnalytics.js
   import { query } from "./_generated/server";
   
   export const getPerformanceAnalytics = query({
     args: {},
     handler: async (ctx) => {
       // Get average processing times
       const processingTimes = await ctx.db.query("processingTimeEvents").collect();
       
       const avgProcessingTime = processingTimes.reduce(
         (sum, event) => sum + event.processingTimeMs, 
         0
       ) / processingTimes.length;
       
       // Get success rate
       const successfulRequests = processingTimes.filter(event => event.success).length;
       const successRate = successfulRequests / processingTimes.length;
       
       // Get processing times by input type
       const processingTimesByType = {
         text: processingTimes
           .filter(event => event.inputType === "text")
           .reduce((sum, event) => sum + event.processingTimeMs, 0) / 
           processingTimes.filter(event => event.inputType === "text").length,
         file: processingTimes
           .filter(event => event.inputType === "file")
           .reduce((sum, event) => sum + event.processingTimeMs, 0) / 
           processingTimes.filter(event => event.inputType === "file").length,
         audio: processingTimes
           .filter(event => event.inputType === "audio")
           .reduce((sum, event) => sum + event.processingTimeMs, 0) / 
           processingTimes.filter(event => event.inputType === "audio").length,
       };
       
       return {
         avgProcessingTime,
         successRate,
         processingTimesByType,
         totalRequests: processingTimes.length,
       };
     },
   });
   ```

3. Display performance metrics in the analytics dashboard:
   ```javascript
   // components/analytics-dashboard.js
   import { useQuery } from "convex/react";
   import { api } from "@/convex/_generated/api";
   
   export function AnalyticsDashboard({ userId }) {
     const performanceAnalytics = useQuery(
       api.getPerformanceAnalytics.getPerformanceAnalytics
     );
     
     return (
       <div>
         <h2>Performance Metrics</h2>
         {performanceAnalytics && (
           <div>
             <p>Average Processing Time: {performanceAnalytics.avgProcessingTime.toFixed(2)}ms</p>
             <p>Success Rate: {(performanceAnalytics.successRate * 100).toFixed(2)}%</p>
             <p>Text Processing: {performanceAnalytics.processingTimesByType.text?.toFixed(2)}ms</p>
             <p>File Processing: {performanceAnalytics.processingTimesByType.file?.toFixed(2)}ms</p>
             <p>Audio Processing: {performanceAnalytics.processingTimesByType.audio?.toFixed(2)}ms</p>
           </div>
         )}
       </div>
     );
   }
   ```

### Performance Alerts

1. Set up alerts for:
   - High error rates in processing functions
   - Slow transaction times (e.g., processing times > 15 seconds)
   - Increased latency in API endpoints
   - Dropped transactions (which might indicate issues with your instrumentation)

2. Configure Sentry alerts:
   - Go to your Sentry project
   - Navigate to "Alerts" → "Create Alert"
   - Set up alerts for:
     - High number of errors in a period
     - High latency in transactions
     - New issues that haven't been seen before

## 3. Configure Uptime Monitoring and Alerts

Uptime monitoring ensures you're notified when your application becomes unavailable.

### Using UptimeRobot

1. Sign up for a [UptimeRobot](https://uptimerobot.com/) account

2. Add a new monitor:
   - Click "Add New Monitor"
   - Select "HTTP(s)" as the monitor type
   - Enter your domain (e.g., https://yourdomain.com)
   - Set the monitoring interval (recommended: 5 minutes)
   - Configure alert contacts (email, SMS, etc.)

3. Create additional monitors for critical endpoints:
   - Main application: https://yourdomain.com
   - API endpoints: https://yourdomain.com/api/gemini/processMeetingNotes
   - Webhook endpoints: https://yourdomain.com/api/webhooks/lemonsqueezy
   - Health check endpoint: https://yourdomain.com/api/health

4. Configure alert contacts:
   - Add email addresses for team members
   - Add SMS numbers for critical alerts
   - Consider integrating with Slack or Discord for team notifications

5. Set up alerting rules:
   - Configure alerts to trigger after 2-3 consecutive failures
   - Set up different alert thresholds for different times (business hours vs. off-hours)

### Using Pingdom

Alternatively, you can use Pingdom for uptime monitoring:

1. Sign up for a [Pingdom](https://www.pingdom.com/) account

2. Add a new check:
   - Enter your URL
   - Configure check frequency
   - Set up alert notifications

### Custom Health Check Endpoint

Create a health check endpoint in your Next.js application:

```javascript
// pages/api/health.js
export default async function handler(req, res) {
  try {
    // Perform basic health checks
    // For example, check if you can connect to Convex
    
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

Then monitor this endpoint with your uptime service.

For a more comprehensive health check, you can verify connectivity to external services:

```javascript
// pages/api/health.js
import { processMeetingNotes } from "@/convex/gemini";

export default async function handler(req, res) {
  try {
    // Perform basic health checks
    const healthChecks = {
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown',
      services: {
        convex: false,
        gemini: false,
      }
    };
    
    // Check Convex connectivity
    try {
      // Perform a simple Convex query or mutation to verify connectivity
      // This is a placeholder - you would implement an actual health check function
      healthChecks.services.convex = true;
    } catch (error) {
      console.error('Convex health check failed:', error);
    }
    
    // Check Gemini API connectivity
    try {
      // Perform a simple Gemini API call to verify connectivity
      // This is a placeholder - you would implement an actual health check function
      healthChecks.services.gemini = true;
    } catch (error) {
      console.error('Gemini health check failed:', error);
    }
    
    const overallStatus = healthChecks.services.convex && healthChecks.services.gemini ? 'ok' : 'degraded';
    
    res.status(overallStatus === 'ok' ? 200 : 503).json({ 
      status: overallStatus,
      ...healthChecks
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Alerting Best Practices

1. Set up multiple notification channels:
   - Email
   - SMS
   - Slack or Discord webhooks
   - PagerDuty for critical alerts

2. Configure escalation policies:
   - Initial alerts to the development team
   - Escalation to on-call personnel if not resolved within a timeframe

3. Set appropriate thresholds:
   - Don't alert on single failures (use multi-point checks)
   - Configure different thresholds for different times (business hours vs. off-hours)

4. Regular review of alerts:
   - Periodically review and adjust alert thresholds
   - Eliminate noisy alerts that don't provide value

5. Test your alerting system:
   - Periodically test that alerts are being sent correctly
   - Verify that all team members are receiving alerts
   - Ensure that escalation policies are working correctly

### Monitoring Dashboard

Create a monitoring dashboard to visualize key metrics:

1. Use Sentry's dashboard features to track:
   - Error rates over time
   - Performance metrics
   - Release health

2. For business metrics, consider integrating with:
   - Google Analytics for user behavior
   - Custom analytics in Convex for tracking user actions

## Production Monitoring Checklist

Before going live, ensure you've completed the following:

- [ ] Configured error tracking with Sentry.io
- [ ] Set up performance monitoring for critical operations
- [ ] Implemented uptime monitoring with external services
- [ ] Created health check endpoints
- [ ] Configured alerting for critical issues
- [ ] Set up escalation policies
- [ ] Verified monitoring in staging environment
- [ ] Trained team members on monitoring and alerting procedures