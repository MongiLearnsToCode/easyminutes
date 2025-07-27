"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  // Mock data - replace with actual data from your backend
  const billingDetails = {
    accountName: "EasyMinutes Pro Plan",
    billingCycle: "Monthly",
    nextBillingDate: "2024-02-01",
    amountDue: "$19.99",
    billingMethod: "Credit Card",
    cardLastFour: "1234"
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing Details</h1>
        <p className="text-muted-foreground">
          Review your billing information and manage your payment methods
        </p>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{billingDetails.accountName}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                Billing Cycle: {billingDetails.billingCycle}
              </CardDescription>
              <CardDescription>Next Billing: {billingDetails.nextBillingDate}</CardDescription>
              <CardDescription>Amount Due: {billingDetails.amountDue}</CardDescription>
              <CardDescription className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {billingDetails.billingMethod} ending in {billingDetails.cardLastFour}
              </CardDescription>
            </div>
            <div>
              <Button size="sm" variant="outline">
                Update Payment Method
              </Button>
              <Button size="sm">
                View Invoices
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground">
              Need help? Contact support for billing-related inquiries.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

