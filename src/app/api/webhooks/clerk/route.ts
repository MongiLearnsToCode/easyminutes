import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { api } from "../../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for webhook usage
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    // Attempt to verify the incoming webhook
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as {
        type: string;
        data: {
          id: string;
          email_addresses?: Array<{ email_address: string }>;
          first_name?: string;
          last_name?: string;
          image_url?: string;
        };
      };
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new NextResponse("Error occurred -- webhook verification failed", {
        status: 400,
      });
    }

    // Handle the webhook event
    const { type, data } = evt;

    console.log(`Clerk webhook received: ${type}`);

    switch (type) {
      case "user.created":
      case "user.updated":
        await handleUserUpsert(data);
        break;
      case "user.deleted":
        await handleUserDeletion(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

async function handleUserUpsert(userData: {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}) {
  try {
    // Extract user data from Clerk webhook payload
    const clerkId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address;
    const firstName = userData.first_name;
    const lastName = userData.last_name;
    const imageUrl = userData.image_url;

    if (!clerkId || !email) {
      console.error("Missing required user data from Clerk webhook");
      return;
    }

    // Upsert user in Convex database
    await convex.mutation(api.users.upsertUser, {
      clerkId,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      imageUrl: imageUrl || undefined,
    });

    console.log(`User ${clerkId} upserted in Convex database`);
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

async function handleUserDeletion(userData: { id: string }) {
  try {
    const clerkId = userData.id;

    if (!clerkId) {
      console.error("Missing user ID from Clerk deletion webhook");
      return;
    }

    // Delete user and all associated data from Convex database
    await convex.mutation(api.users.deleteUserAccount, {
      clerkId,
    });

    console.log(`User ${clerkId} deleted from Convex database`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
