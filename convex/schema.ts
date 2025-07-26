import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table for storing user profiles and subscription info
  users: defineTable({
    // Clerk user ID for authentication integration
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    
    // Subscription management
    subscriptionTier: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    subscriptionStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled")),
    subscriptionId: v.optional(v.string()), // Polar.sh subscription ID
    
    // Usage tracking for freemium limits
    monthlyTranscriptions: v.number(),
    storageUsedMB: v.number(),
    lastUsageReset: v.number(), // timestamp for monthly reset
    
    // User preferences
    defaultTemplateId: v.optional(v.id("templates")),
    notificationPreferences: v.object({
      emailOnTranscriptionComplete: v.boolean(),
      emailOnShareAccess: v.boolean(),
      emailOnSubscriptionUpdates: v.boolean(),
      inAppNotifications: v.boolean(),
    }),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_subscription_id", ["subscriptionId"]),

  // Meeting minutes table for storing transcribed and processed meetings
  meetings: defineTable({
    userId: v.id("users"),
    
    // Basic meeting info
    title: v.string(),
    date: v.number(), // timestamp
    duration: v.optional(v.number()), // in minutes
    
    // Meeting content
    rawTranscript: v.optional(v.string()), // original transcribed text
    structuredMinutes: v.string(), // AI-processed structured minutes
    templateId: v.id("templates"),
    
    // File information
    originalFileName: v.optional(v.string()),
    fileSizeMB: v.optional(v.number()),
    audioFileStorageId: v.optional(v.id("_storage")), // Convex file storage
    
    // Processing status
    processingStatus: v.union(
      v.literal("uploading"),
      v.literal("transcribing"), 
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    processingError: v.optional(v.string()),
    
    // Meeting participants and metadata
    attendees: v.array(v.string()),
    tags: v.array(v.string()),
    
    // Sharing and collaboration
    isArchived: v.boolean(),
    shareSettings: v.object({
      isPublic: v.boolean(),
      shareableLink: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      passwordProtected: v.boolean(),
      password: v.optional(v.string()),
    }),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_shareable_link", ["shareSettings.shareableLink"])
    .index("by_processing_status", ["processingStatus"]),

  // Templates table for meeting minute structure templates
  templates: defineTable({
    userId: v.optional(v.id("users")), // null for system default templates
    
    // Template info
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.boolean(), // system default templates
    isPublic: v.boolean(), // can be used by other users
    
    // Template structure
    sections: v.array(v.object({
      id: v.string(), // unique section identifier
      title: v.string(),
      order: v.number(),
      isRequired: v.boolean(),
      placeholder: v.optional(v.string()),
      type: v.union(
        v.literal("text"),
        v.literal("list"),
        v.literal("attendees"),
        v.literal("action_items"),
        v.literal("decisions")
      ),
    })),
    
    // Usage statistics
    usageCount: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_default", ["isDefault"])
    .index("by_public", ["isPublic"]),

  // Action items extracted from meetings
  actionItems: defineTable({
    meetingId: v.id("meetings"),
    userId: v.id("users"), // meeting owner
    
    // Action item details
    title: v.string(),
    description: v.optional(v.string()),
    assignedTo: v.optional(v.string()), // person name
    dueDate: v.optional(v.number()), // timestamp
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed")),
    
    // Position in the meeting minutes
    sectionId: v.string(),
    order: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_user", ["userId"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_due_date", ["dueDate"])
    .index("by_status", ["status"]),

  // Share access logs for tracking who accessed shared minutes
  shareAccessLogs: defineTable({
    meetingId: v.id("meetings"),
    
    // Access details
    accessedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    // Location info (if available)
    country: v.optional(v.string()),
    city: v.optional(v.string()),
  })
    .index("by_meeting", ["meetingId"])
    .index("by_accessed_at", ["accessedAt"]),

  // Notifications for users
  notifications: defineTable({
    userId: v.id("users"),
    
    // Notification content
    type: v.union(
      v.literal("transcription_complete"),
      v.literal("share_accessed"),
      v.literal("subscription_update"),
      v.literal("storage_limit_warning"),
      v.literal("usage_limit_warning")
    ),
    title: v.string(),
    message: v.string(),
    
    // Notification state
    isRead: v.boolean(),
    
    // Related entities
    meetingId: v.optional(v.id("meetings")),
    
    // Timestamps
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_type", ["type"]),
});
