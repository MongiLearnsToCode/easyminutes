import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

// API endpoint to update a user's metadata in Clerk
export async function POST(request: NextRequest) {
  try {
    const { userId, plan } = await request.json();
    
    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing userId or plan' }, { status: 400 });
    }
    
    // Update the user's public metadata in Clerk
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        plan: plan
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata in Clerk:', error);
    return NextResponse.json({ error: 'Failed to update user metadata' }, { status: 500 });
  }
}