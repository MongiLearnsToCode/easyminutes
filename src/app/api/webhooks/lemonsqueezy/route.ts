import { NextRequest, NextResponse } from 'next/server';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_WEBHOOK_SECRET } from '@/lib/lemonsqueezy';

// Initialize LemonSqueezy client
lemonSqueezySetup({
  apiKey: LEMON_SQUEEZY_API_KEY,
});

// Webhook handler for LemonSqueezy events
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const rawBody = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    
    // In a real implementation, we would verify the signature
    // For now, we'll skip this step
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.meta.event_name;
    const data = payload.data;
    
    console.log('LemonSqueezy webhook received:', eventType, data);
    
    // Handle different event types
    switch (eventType) {
      case 'order_created':
        // Handle new order
        await handleOrderCreated(data);
        break;
      case 'subscription_created':
        // Handle new subscription
        await handleSubscriptionCreated(data);
        break;
      case 'subscription_expired':
        // Handle expired subscription
        await handleSubscriptionExpired(data);
        break;
      case 'subscription_cancelled':
        // Handle cancelled subscription
        await handleSubscriptionCancelled(data);
        break;
      case 'subscription_renewed':
        // Handle renewed subscription
        await handleSubscriptionRenewed(data);
        break;
      default:
        console.log('Unhandled LemonSqueezy event:', eventType);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing LemonSqueezy webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Webhook handler for LemonSqueezy events
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const rawBody = await request.text();
    const signature = request.headers.get('X-Signature') || '';
    
    // In a real implementation, we would verify the signature
    // For now, we'll skip this step
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.meta.event_name;
    const data = payload.data;
    
    console.log('LemonSqueezy webhook received:', eventType, data);
    
    // Handle different event types
    switch (eventType) {
      case 'order_created':
        // Handle new order
        await handleOrderCreated(data);
        break;
      case 'subscription_created':
        // Handle new subscription
        await handleSubscriptionCreated(data);
        break;
      case 'subscription_expired':
        // Handle expired subscription
        await handleSubscriptionExpired(data);
        break;
      case 'subscription_cancelled':
        // Handle cancelled subscription
        await handleSubscriptionCancelled(data);
        break;
      case 'subscription_renewed':
        // Handle renewed subscription
        await handleSubscriptionRenewed(data);
        break;
      default:
        console.log('Unhandled LemonSqueezy event:', eventType);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing LemonSqueezy webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle order created event
async function handleOrderCreated(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  const customerId = data.attributes.customer_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatusInConvex(userId, true, customerId);
    
    // Track subscription conversion event
    await trackSubscriptionEvent({
      userId,
      eventType: 'conversion',
      previousPlan: 'free',
      newPlan: 'pro',
      timestamp: Date.now(),
    });
  }
}

// Handle subscription created event
async function handleSubscriptionCreated(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  const customerId = data.attributes.customer_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatusInConvex(userId, true, customerId);
    
    // Track subscription conversion event
    await trackSubscriptionEvent({
      userId,
      eventType: 'conversion',
      previousPlan: 'free',
      newPlan: 'pro',
      timestamp: Date.now(),
    });
  }
}

// Handle subscription expired event
async function handleSubscriptionExpired(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatusInConvex(userId, false, null);
    
    // Track subscription expiration event
    await trackSubscriptionEvent({
      userId,
      eventType: 'expiration',
      previousPlan: 'pro',
      newPlan: 'free',
      timestamp: Date.now(),
    });
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatusInConvex(userId, false, null);
    
    // Track subscription cancellation event
    await trackSubscriptionEvent({
      userId,
      eventType: 'cancellation',
      previousPlan: 'pro',
      newPlan: 'free',
      timestamp: Date.now(),
    });
  }
}

// Handle subscription renewed event
async function handleSubscriptionRenewed(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  
  if (userId) {
    // Track subscription renewal event
    await trackSubscriptionEvent({
      userId,
      eventType: 'renewal',
      previousPlan: 'pro',
      newPlan: 'pro',
      timestamp: Date.now(),
    });
  }
}

// Function to update user's Pro status in Convex and Clerk
async function updateProStatusInConvex(userId: string, isPro: boolean, customerId: string | null) {
  try {
    // In a real implementation, we would make a request to our Convex backend
    // to update the user's Pro status using the updateUserProStatus mutation
    
    // For now, we'll just log the action
    console.log('Updating Pro status in Convex and Clerk for user:', userId, 'isPro:', isPro, 'customerId:', customerId);
    
    // In a real implementation, this would look something like:
    // const result = await fetch('/api/convex', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     mutation: 'updateUserProStatus',
    //     args: { userId, isPro, customerId }
    //   })
    // });
    // return await result.json();
    
    return { success: true };
  } catch (error) {
    console.error('Error updating Pro status in Convex and Clerk:', error);
    return { success: false, error: 'Failed to update Pro status in Convex and Clerk' };
  }
}

// Function to track subscription events
async function trackSubscriptionEvent(event: {
  userId: string;
  eventType: 'conversion' | 'cancellation' | 'expiration' | 'renewal';
  previousPlan: 'free' | 'pro';
  newPlan: 'free' | 'pro';
  timestamp: number;
}) {
  try {
    // In a real implementation, we would make a request to our Convex backend
    // to track the subscription event
    
    // For now, we'll just log the action
    console.log('Tracking subscription event:', event);
    
    // In a real implementation, this would look something like:
    // const result = await fetch('/api/convex', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     mutation: 'trackSubscriptionEvent',
    //     args: event
    //   })
    // });
    // return await result.json();
    
    return { success: true };
  } catch (error) {
    console.error('Error tracking subscription event:', error);
    return { success: false, error: 'Failed to track subscription event' };
  }
}