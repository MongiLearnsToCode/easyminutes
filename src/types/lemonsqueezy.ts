export interface LemonSqueezyWebhookData {
  attributes: {
    custom_data?: {
      user_id?: string;
    };
    customer_id?: string;
  };
}

export interface SubscriptionEvent {
  userId: string;
  eventType: 'conversion' | 'cancellation' | 'expiration' | 'renewal';
  previousPlan: 'free' | 'pro';
  newPlan: 'free' | 'pro';
  timestamp: number;
}