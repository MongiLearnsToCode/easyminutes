# LemonSqueezy Setup Guide

This guide provides detailed steps for finalizing LemonSqueezy product setup, configuring webhooks, and testing the payment flow for EasyMinutes.

## Prerequisites

Before setting up LemonSqueezy, ensure you have:

1. Completed all environment configuration as documented in `ENVIRONMENT.md`
2. Set up a LemonSqueezy account
3. Created a store in your LemonSqueezy dashboard

## 1. Finalize LemonSqueezy Product Setup (Pro Plan Subscription)

1. Log in to your [LemonSqueezy](https://www.lemonsqueezy.com/) dashboard

2. Navigate to "Products" and create a new product:
   - Click "Create product"
   - Product name: "EasyMinutes Pro"
   - Description: "Unlock all premium features including audio transcription, export options, sharing, and email integration"
   - Image: Upload your product image (optional but recommended)

3. Configure the pricing:
   - Select "Subscription" as the pricing model
   - Set the price to $9.99 per month (or your desired price)
   - Billing interval: Monthly
   - Trial period: Optional (you can offer a 7-day free trial)

4. Configure subscription settings:
   - Setup fee: $0.00 (or your desired setup fee)
   - Currency: USD (or your preferred currency)
   - Renewal: Enable automatic renewals

5. Configure checkout settings:
   - Collect customer name and email address: Enabled
   - Collect customer billing address: Optional (recommended for tax purposes)
   - Show product description: Enabled
   - Show store logo: Enabled (if you have a logo uploaded)

6. Configure access permissions:
   - Since we're using Clerk for user management, you don't need to configure download links or license keys
   - The webhook will handle updating the user's Pro status in our system

7. Save your product

8. Note down the following information from your product:
   - Product ID (found in the product URL: `https://app.lemonsqueezy.com/dashboard/product/{PRODUCT_ID}/overview`)
   - Variant ID (found in the "Variants" tab)
   - Store ID (found in the store settings)

9. Update your environment variables with this information:
   - `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID` - Your LemonSqueezy store ID
   - `LEMON_SQUEEZY_PRO_VARIANT_ID` - The variant ID for your Pro Plan

## 2. Configure Webhook Endpoints in LemonSqueezy Dashboard

1. In your LemonSqueezy dashboard, navigate to "Settings" → "Webhooks"

2. Click "Create webhook"

3. Configure the webhook settings:
   - URL: `https://yourdomain.com/api/webhooks/lemonsqueezy` (replace with your actual domain)
   - Secret: Generate a new secret or use the one from your environment variables (`LEMONSQUEEZY_WEBHOOK_SECRET`)
   - Select all events:
     - `order_created`
     - `subscription_created`
     - `subscription_expired`
     - `subscription_cancelled`
     - `subscription_renewed`

4. Save the webhook

5. Test the webhook:
   - LemonSqueezy provides a "Send test request" button
   - Click this to send a test webhook to your endpoint
   - Check your application logs to verify the webhook was received and processed correctly

6. Verify webhook processing in your application:
   - The webhook handler is implemented in `src/app/api/webhooks/lemonsqueezy/route.ts`
   - It processes different events:
     - `order_created`: Tracks new orders
     - `subscription_created`: Updates user's Pro status to true
     - `subscription_expired`: Updates user's Pro status to false
     - `subscription_cancelled`: Updates user's Pro status to false
     - `subscription_renewed`: Updates user's Pro status to true

7. Check that the webhook handler correctly:
   - Validates the webhook signature using the secret
   - Identifies the user ID from the custom data
   - Updates the user's Pro status in the Convex database
   - Tracks subscription events for analytics

## 3. Test Payment Flow with Test Transactions

1. Enable test mode in LemonSqueezy:
   - In your LemonSqueezy dashboard, ensure test mode is enabled
   - This allows you to test payments without charging real credit cards

2. Generate a test checkout URL:
   - In your product's "Variants" tab, click "Test checkout" for your Pro Plan variant
   - This will generate a checkout URL for testing

3. Test the complete payment flow:
   - Visit the test checkout URL
   - Complete the checkout process using test card details:
     - Card number: 4242 4242 4242 4242
     - Expiry date: Any future date
     - CVC: Any 3 digits
     - Email: Any valid email address

4. Verify the subscription was created:
   - Check your LemonSqueezy dashboard to confirm the test subscription was created
   - Check your application to verify the user's Pro status was updated

5. Test subscription events:
   - In your LemonSqueezy dashboard, you can simulate subscription events:
     - Subscription expiration
     - Subscription cancellation
     - Subscription renewal
   - Verify that these events are correctly processed by your webhook handler

6. Test the user experience:
   - Log in as the test user
   - Verify that Pro features are now accessible:
     - Audio upload functionality
     - Export to PDF/DOCX
     - Share meeting minutes
     - Email meeting minutes
   - Test exporting minutes, sharing, and email functionality

7. Verify analytics tracking:
   - Check that subscription events are being tracked in your analytics
   - Verify that user analytics are being updated correctly

8. Test edge cases:
   - Test what happens when a user cancels their subscription
   - Test what happens when a subscription expires
   - Test what happens when a subscription is renewed

## Troubleshooting

1. Webhook not being received:
   - Check that your webhook URL is correct and publicly accessible
   - Verify your webhook secret matches the one in your environment variables
   - Check your application logs for any errors in processing webhooks

2. User not being upgraded to Pro:
   - Verify that the webhook is correctly updating the user's status in your database
   - Check that the user ID is being correctly passed in the custom data during checkout
   - Verify that the `update_pro_status` Convex function is working correctly

3. Checkout errors:
   - Ensure all required fields are filled out correctly in your product setup
   - Check that your store settings are correctly configured

4. Pro features not accessible:
   - Verify that the user's Pro status is correctly set in the database
   - Check that the frontend is correctly checking the user's Pro status
   - Verify that the feature gating is implemented correctly

## Production Checklist

Before going live, ensure you've completed the following:

- [ ] Disabled test mode in LemonSqueezy
- [ ] Verified all webhook events are being processed correctly
- [ ] Tested the complete payment flow with a real credit card (in test mode)
- [ ] Confirmed that users are correctly upgraded to Pro status
- [ ] Verified that subscription events (cancellation, expiration, renewal) are handled correctly
- [ ] Updated all URLs in your environment variables to use your production domain
- [ ] Confirmed that email notifications are being sent correctly for payment events