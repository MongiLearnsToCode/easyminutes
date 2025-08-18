'use client';

import { LemonsqueezyClient } from '@lemonsqueezy/lemonsqueezy.js';
import { 
  LEMON_SQUEEZY_API_KEY, 
  LEMON_SQUEEZY_STORE_ID, 
  PRO_PLAN_VARIANT_ID 
} from '@/lib/lemonsqueezy';

// Initialize LemonSqueezy client
const client = new LemonsqueezyClient(LEMON_SQUEEZY_API_KEY);

// Function to generate a checkout URL for the Pro plan
export async function generateProCheckoutUrl(userId: string, userEmail: string, userName: string) {
  try {
    // Create a checkout session
    const checkout = await client.createCheckout(LEMON_SQUEEZY_STORE_ID, PRO_PLAN_VARIANT_ID, {
      checkoutData: {
        custom: {
          user_id: userId,
        },
      },
      customer: {
        email: userEmail,
        name: userName,
      },
      productOptions: {
        redirectUrl: `${window.location.origin}/dashboard`,
      },
    });
    
    return {
      success: true,
      checkoutUrl: checkout.data.attributes.url,
    };
  } catch (error) {
    console.error('Error generating checkout URL:', error);
    return {
      success: false,
      error: 'Failed to generate checkout URL',
    };
  }
}