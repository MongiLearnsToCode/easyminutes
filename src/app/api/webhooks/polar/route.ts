import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement Polar.sh webhook logic
    // This will be implemented in later tasks

    await request.json();
    const signature = request.headers.get("x-polar-signature");
    
    // TODO: Verify webhook signature
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: "Polar webhook endpoint ready",
      received: true,
    });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "polar-webhook",
    status: "ready",
    methods: ["POST"],
    description: "Handle Polar.sh subscription events and updates",
  });
}
