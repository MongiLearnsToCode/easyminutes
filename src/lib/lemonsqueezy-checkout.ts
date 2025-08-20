'use client';

import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { 
  LEMON_SQUEEZY_API_KEY, 
  LEMON_SQUEEZY_STORE_ID, 
  PRO_PLAN_VARIANT_ID 
} from '@/lib/lemonsqueezy';

// Function to generate a checkout URL for the Pro plan
export async function generateProCheckoutUrl(userId: string, userEmail: string, userName: string) {
  lemonSqueezySetup({
    apiKey: LEMON_SQUEEZY_API_KEY,
  });

  try {
    // Create a checkout session
    const { data: checkout, error } = await createCheckout(LEMON_SQUEEZY_STORE_ID, PRO_PLAN_VARIANT_ID, {
      checkoutData: {
        custom: {
          user_id: userId,
        },
      },
      checkoutOptions: {
        embed: true,
      },
      productOptions: {
        redirectUrl: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) {
      throw error;
    }

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