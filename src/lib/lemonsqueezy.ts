// LemonSqueezy configuration
export const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY || '';
export const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || '';
export const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

// Pro plan variant ID (this would be the actual variant ID from LemonSqueezy)
export const PRO_PLAN_VARIANT_ID = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID || '';

// Check if LemonSqueezy is configured
export const isLemonSqueezyConfigured = () => {
  return !!LEMON_SQUEEZY_API_KEY && !!LEMON_SQUEEZY_STORE_ID;
};