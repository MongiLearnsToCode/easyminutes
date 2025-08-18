import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    freeGenerationsUsed: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  
  meetingMinutes: defineTable({
    userId: v.string(),
    title: v.string(),
    executiveSummary: v.string(),
    actionMinutes: v.string(),
    attendees: v.array(
      v.object({
        name: v.string(),
        role: v.string(),
      })
    ),
    decisions: v.array(
      v.object({
        description: v.string(),
        madeBy: v.string(),
        date: v.string(),
      })
    ),
    risks: v.array(
      v.object({
        description: v.string(),
        mitigation: v.string(),
      })
    ),
    actionItems: v.array(
      v.object({
        description: v.string(),
        owner: v.string(),
        deadline: v.string(),
      })
    ),
    observations: v.array(
      v.object({
        description: v.string(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Versioning fields
    version: v.optional(v.number()),
    parentId: v.optional(v.id("meetingMinutes")),
    isLatest: v.optional(v.boolean()),
  }).index("by_userId", ["userId"])
    .index("by_parentId", ["parentId"])
    .index("by_userId_and_isLatest", ["userId", "isLatest"]),
  
  // Table for storing shareable links
  shareableLinks: defineTable({
    minutesId: v.id("meetingMinutes"),
    userId: v.string(),
    shareId: v.string(), // Unique identifier for the shareable link
    expiresAt: v.optional(v.number()), // Optional expiration time
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_minutesId", ["minutesId"])
    .index("by_shareId", ["shareId"])
    .index("by_userId", ["userId"]),
  
  // Table for tracking processing times
  processingTimeEvents: defineTable({
    userId: v.string(),
    processingTimeMs: v.number(),
    success: v.boolean(),
    inputType: v.union(v.literal("text"), v.literal("file"), v.literal("audio")),
    timestamp: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),
  
  // Table for user analytics
  userAnalytics: defineTable({
    userId: v.string(),
    totalGenerations: v.number(),
    successfulGenerations: v.number(),
    failedGenerations: v.number(),
    totalProcessingTimeMs: v.number(),
    under2MinuteGenerations: v.number(),
    proConversions: v.optional(v.number()),
    firstProConversionAt: v.optional(v.number()),
    totalEdits: v.optional(v.number()),
    totalExports: v.optional(v.number()),
    totalShares: v.optional(v.number()),
    totalEmails: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
  
  // Table for tracking subscription events
  subscriptionEvents: defineTable({
    userId: v.string(),
    eventType: v.union(
      v.literal("conversion"), // Free user converted to Pro
      v.literal("cancellation"), // Pro user cancelled subscription
      v.literal("expiration"), // Pro subscription expired
      v.literal("renewal") // Pro subscription renewed
    ),
    previousPlan: v.union(v.literal("free"), v.literal("pro")),
    newPlan: v.union(v.literal("free"), v.literal("pro")),
    timestamp: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_eventType", ["eventType"]),
  
  // Table for tracking user activity events
  userActivityEvents: defineTable({
    userId: v.string(),
    activityType: v.union(
      v.literal("generate_minutes"),
      v.literal("edit_minutes"),
      v.literal("export_minutes"),
      v.literal("share_minutes"),
      v.literal("email_minutes")
    ),
    timestamp: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_activityType", ["activityType"]),
});