# CI/CD Pipeline Setup Guide

This guide provides detailed steps for implementing a CI/CD pipeline for EasyMinutes to automate testing and deployment processes.

## 1. Set up Automated Testing Pipeline

Automated testing is crucial for maintaining code quality and catching issues before they reach production.

### GitHub Actions Setup

1. Create a `.github` directory in your project root:
   ```bash
   mkdir -p .github/workflows
   ```

2. Create a workflow file for running tests:
   ```yaml
   # .github/workflows/test.yml
   name: Run Tests
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       strategy:
         matrix:
           node-version: [18.x, 20.x]
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Use Node.js ${{ matrix.node-version }}
         uses: actions/setup-node@v3
         with:
           node-version: ${{ matrix.node-version }}
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run linting
         run: npm run lint
       
       - name: Run type checking
         run: npm run type-check
       
       - name: Run tests
         run: npm test
       
       - name: Run build
         run: npm run build
   ```

### Configure Testing Scripts

1. Update your `package.json` to include testing scripts:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage",
       "lint": "next lint",
       "type-check": "tsc --noEmit"
     }
   }
   ```

2. Install testing dependencies:
   ```bash
   npm install --save-dev jest @types/jest ts-jest
   ```

3. Create a Jest configuration file:
   ```javascript
   // jest.config.js
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     collectCoverageFrom: [
       'src/**/*.{ts,tsx}',
       '!src/**/*.d.ts',
     ],
     coverageDirectory: 'coverage',
     testMatch: [
       '**/__tests__/**/*.{ts,tsx}',
       '**/?(*.)+(spec|test).{ts,tsx}',
     ],
   };
   ```

### Writing Tests for EasyMinutes

1. Create a test directory structure:
   ```
   src/
   ├── __tests__/
   │   ├── components/
   │   ├── hooks/
   │   ├── lib/
   │   └── utils/
   ```

2. Write unit tests for key components:
   ```javascript
   // src/__tests__/components/text-paste-box.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react';
   import { TextPasteBox } from '@/components/text-paste-box';
   
   describe('TextPasteBox', () => {
     it('renders correctly', () => {
       render(<TextPasteBox onGenerate={jest.fn()} />);
       expect(screen.getByLabelText('Meeting Notes')).toBeInTheDocument();
       expect(screen.getByPlaceholderText('Paste your meeting notes here...')).toBeInTheDocument();
     });
   
     it('calls onGenerate when button is clicked', () => {
       const mockGenerate = jest.fn();
       render(<TextPasteBox onGenerate={mockGenerate} />);
       
       const textarea = screen.getByLabelText('Meeting Notes');
       fireEvent.change(textarea, { target: { value: 'Test meeting notes' } });
       
       const button = screen.getByRole('button', { name: 'Generate Minutes' });
       fireEvent.click(button);
       
       expect(mockGenerate).toHaveBeenCalledWith('Test meeting notes');
     });
   });
   ```

3. Write tests for Convex functions:
   ```javascript
   // src/__tests__/convex/gemini.test.ts
   import { processMeetingNotes } from '@/convex/gemini';
   
   describe('processMeetingNotes', () => {
     it('processes meeting notes correctly', async () => {
       const mockCtx = {
         db: {
           insert: jest.fn(),
         },
         env: {
           GEMINI_API_KEY: 'test-key',
         },
       };
       
       const args = {
         text: 'Test meeting notes',
         userId: 'test-user',
       };
       
       // Mock the Gemini API call
       global.fetch = jest.fn(() =>
         Promise.resolve({
           json: () => Promise.resolve({
             candidates: [{
               content: {
                 parts: [{
                   text: JSON.stringify({
                     title: 'Test Meeting',
                     executiveSummary: 'Test summary',
                     actionMinutes: 'Test action minutes',
                     attendees: [],
                     decisions: [],
                     risks: [],
                     actionItems: [],
                     observations: [],
                   }),
                 }],
               },
             }],
           }),
         } as any)
       );
       
       const result = await processMeetingNotes(mockCtx as any, args);
       
       expect(result.success).toBe(true);
       expect(result.meetingMinutes).toBeDefined();
       expect(mockCtx.db.insert).toHaveBeenCalled();
     });
   });
   ```

### Test Coverage

1. Configure coverage thresholds in your Jest configuration:
   ```javascript
   // jest.config.js
   module.exports = {
     // ... other config
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
       },
     },
   };
   ```

2. Add a coverage script to your `package.json`:
   ```json
   {
     "scripts": {
       "test:coverage": "jest --coverage"
     }
   }
   ```

## 2. Configure Automatic Deployments on Main Branch Pushes

Automated deployments ensure that changes are quickly and consistently deployed to production.

### Vercel Deployment with GitHub Actions

1. Create a deployment workflow:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20.x'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run tests
         run: npm test
       
       - name: Deploy to Vercel
         uses: amondnet/vercel-action@v25
         with:
           vercel-token: ${{ secrets.VERCEL_TOKEN }}
           vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
           vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
           vercel-args: '--prod'
   ```

### Convex Deployment

1. Add Convex deployment to your workflow:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20.x'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run tests
         run: npm test
       
       - name: Deploy to Convex
         run: npx convex deploy --prod
         env:
           CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
       
       - name: Deploy to Vercel
         uses: amondnet/vercel-action@v25
         with:
           vercel-token: ${{ secrets.VERCEL_TOKEN }}
           vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
           vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
           vercel-args: '--prod'
   ```

### Environment Variables for Deployment

1. Set up secrets in your GitHub repository:
   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add the following secrets:
     - `VERCEL_TOKEN` - Your Vercel token
     - `VERCEL_ORG_ID` - Your Vercel organization ID
     - `VERCEL_PROJECT_ID` - Your Vercel project ID
     - `CONVEX_DEPLOY_KEY` - Your Convex deployment key

## 3. Set up Staging Environment for Testing

A staging environment allows you to test changes in a production-like environment before deploying to production.

### Configure Staging in Vercel

1. Create a staging environment in Vercel:
   - In your Vercel project, go to "Settings" → "Environments"
   - Create a new environment called "staging"
   - Configure it to deploy from a "staging" branch

2. Create a staging workflow:
   ```yaml
   # .github/workflows/staging.yml
   name: Deploy to Staging
   
   on:
     push:
       branches: [ staging ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20.x'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run tests
         run: npm test
       
       - name: Deploy to Vercel Staging
         uses: amondnet/vercel-action@v25
         with:
           vercel-token: ${{ secrets.VERCEL_TOKEN }}
           vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
           vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
           vercel-args: '--target=staging'
   ```

### Environment-Specific Configuration

1. Create environment-specific configuration files:
   ```bash
   # .env.staging
   NEXT_PUBLIC_CONVEX_URL=https://your-staging-convex-url.convex.cloud
   NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your-staging-store-id
   ```

2. Update your Next.js configuration to support multiple environments:
   ```javascript
   // next.config.js
   module.exports = {
     env: {
       NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
       NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID,
     },
   };
   ```

### Staging Environment Variables

1. Set up staging secrets in your GitHub repository:
   - Add staging-specific secrets:
     - `VERCEL_TOKEN_STAGING` - Your Vercel token for staging
     - `VERCEL_ORG_ID_STAGING` - Your Vercel organization ID for staging
     - `VERCEL_PROJECT_ID_STAGING` - Your Vercel project ID for staging

2. Update your staging workflow to use staging secrets:
   ```yaml
   # .github/workflows/staging.yml
   name: Deploy to Staging
   
   on:
     push:
       branches: [ staging ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20.x'
           cache: 'npm'
       
       - name: Install dependencies
         run: npm ci
       
       - name: Run tests
         run: npm test
       
       - name: Deploy to Vercel Staging
         uses: amondnet/vercel-action@v25
         with:
           vercel-token: ${{ secrets.VERCEL_TOKEN_STAGING }}
           vercel-org-id: ${{ secrets.VERCEL_ORG_ID_STAGING }}
           vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
           vercel-args: '--target=staging'
   ```

### Testing the Staging Environment

1. Create a staging branch:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. Test the deployment:
   - Make a small change to your code
   - Commit and push to the staging branch
   - Verify that the staging deployment workflow runs
   - Check that your changes are deployed to the staging environment

### Promoting from Staging to Production

1. Merge staging to main for production deployment:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. Alternatively, use pull requests:
   - Create a pull request from staging to main
   - Have team members review the changes
   - Merge the pull request to trigger production deployment

## CI/CD Best Practices

1. Keep your workflows fast:
   - Use caching to speed up dependency installation
   - Run only necessary tests for each workflow
   - Parallelize jobs when possible

2. Use environment-specific configurations:
   - Separate environment variables for development, staging, and production
   - Different databases or services for each environment

3. Implement proper error handling:
   - Fail fast on test failures
   - Notify team members of deployment failures
   - Rollback mechanisms for failed deployments

4. Monitor deployments:
   - Track deployment success rates
   - Monitor application performance after deployments
   - Set up alerts for failed deployments

## Production CI/CD Checklist

Before going live, ensure you've completed the following:

- [ ] Set up automated testing pipeline with GitHub Actions
- [ ] Configure automatic deployments on main branch pushes
- [ ] Set up staging environment for testing
- [ ] Configure environment-specific variables
- [ ] Implement proper error handling in workflows
- [ ] Set up monitoring for CI/CD pipeline
- [ ] Train team members on CI/CD processes
- [ ] Document rollback procedures