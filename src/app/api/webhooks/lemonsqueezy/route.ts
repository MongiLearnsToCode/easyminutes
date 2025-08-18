import { NextRequest, NextResponse } from 'next/server';
import { LemonsqueezyClient } from '@lemonsqueezy/lemonsqueezy.js';
import { LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_WEBHOOK_SECRET } from '@/lib/lemonsqueezy';
import { updateProStatus } from '@/lib/pro-status';

// Initialize LemonSqueezy client
const client = new LemonsqueezyClient(LEMON_SQUEEZY_API_KEY);

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
    await updateProStatus(userId, true, customerId);
  }
}

// Handle subscription created event
async function handleSubscriptionCreated(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  const customerId = data.attributes.customer_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatus(userId, true, customerId);
  }
}

// Handle subscription expired event
async function handleSubscriptionExpired(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatus(userId, false, null);
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(data: any) {
  const userId = data.attributes.custom_data?.user_id;
  
  if (userId) {
    // Update user's Pro status in Convex
    await updateProStatus(userId, false, null);
  }
}