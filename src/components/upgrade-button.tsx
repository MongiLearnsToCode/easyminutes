'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateProCheckoutUrl } from '@/lib/lemonsqueezy-checkout';
import { useUser } from '@clerk/clerk-react';

interface UpgradeButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function UpgradeButton({ 
  variant = 'default', 
  size = 'default',
  className 
}: UpgradeButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const result = await generateProCheckoutUrl(
        user.id,
        user.emailAddresses[0]?.emailAddress || '',
        `${user.firstName || ''} ${user.lastName || ''}`.trim()
      );
      
      if (result.success && result.checkoutUrl) {
        // Redirect to the checkout URL
        window.location.href = result.checkoutUrl;
      } else {
        // Handle error
        alert('Failed to generate checkout URL. Please try again.');
      }
    } catch (error) {
      console.error('Error generating checkout URL:', error);
      alert('Failed to generate checkout URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleUpgrade}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? 'Redirecting to checkout...' : 'Upgrade to Pro'}
    </Button>
  );
}