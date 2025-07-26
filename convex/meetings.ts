import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new meeting record
export const createMeeting = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    date: v.optional(v.number()),
    templateId: v.id("templates"),
    originalFileName: v.optional(v.string()),
    fileSizeMB: v.optional(v.number()),
    audioFileStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const meetingId = await ctx.db.insert("meetings", {
      userId: args.userId,
      title: args.title,
      date: args.date || now,
      templateId: args.templateId,
      originalFileName: args.originalFileName,
      fileSizeMB: args.fileSizeMB,
      audioFileStorageId: args.audioFileStorageId,
      rawTranscript: undefined,
      structuredMinutes: "", // Will be populated by AI processing
      processingStatus: "uploading",
      attendees: [],
      tags: [],
      isArchived: false,
      shareSettings: {
        isPublic: false,
        passwordProtected: false,
      },
      createdAt: now,
      updatedAt: now,
    });

    return meetingId;
  },
});

// Update meeting processing status
export const updateMeetingStatus = mutation({
  args: {
    meetingId: v.id("meetings"),
    status: v.union(
      v.literal("uploading"),
      v.literal("transcribing"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetingId, {
      processingStatus: args.status,
      processingError: args.error,
      updatedAt: Date.now(),
    });
  },
});

// Update meeting with transcription result
export const updateMeetingTranscript = mutation({
  args: {
    meetingId: v.id("meetings"),
    rawTranscript: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetingId, {
      rawTranscript: args.rawTranscript,
      processingStatus: "generating",
      updatedAt: Date.now(),
    });
  },
});

// Update meeting with structured minutes
export const updateMeetingMinutes = mutation({
  args: {
    meetingId: v.id("meetings"),
    structuredMinutes: v.string(),
    attendees: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      structuredMinutes: args.structuredMinutes,
      processingStatus: "completed",
      updatedAt: Date.now(),
    };

    if (args.attendees) {
      updateData.attendees = args.attendees;
    }

    if (args.duration) {
      updateData.duration = args.duration;
    }

    await ctx.db.patch(args.meetingId, updateData);

    // Create notification for user
    const meeting = await ctx.db.get(args.meetingId);
    if (meeting) {
      await ctx.db.insert("notifications", {
        userId: meeting.userId,
        type: "transcription_complete",
        title: "Meeting transcription completed",
        message: `Your meeting "${meeting.title}" has been processed and is ready for editing.`,
        isRead: false,
        meetingId: args.meetingId,
        createdAt: Date.now(),
      });
    }
  },
});

// Get meeting by ID
export const getMeeting = query({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetingId);
  },
});

// Get meetings for a user with pagination and filtering
export const getUserMeetings = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let meetings = await ctx.db
      .query("meetings")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Filter out archived meetings if not requested
    if (!args.includeArchived) {
      meetings = meetings.filter(meeting => !meeting.isArchived);
    }

    return meetings;
  },
});

// Search meetings by title and content
export const searchMeetings = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("isArchived"), true))
      .take(limit);

    // Simple text search (in a real app, you might use a more sophisticated search)
    const searchTermLower = args.searchTerm.toLowerCase();

    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(searchTermLower) ||
        meeting.structuredMinutes.toLowerCase().includes(searchTermLower) ||
        meeting.attendees.some((attendee) => attendee.toLowerCase().includes(searchTermLower)) ||
        meeting.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
    );
  },
});

// Update meeting metadata
export const updateMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
    title: v.optional(v.string()),
    date: v.optional(v.number()),
    attendees: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    structuredMinutes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { meetingId, ...updates } = args;

    await ctx.db.patch(meetingId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Archive/unarchive meeting
export const archiveMeeting = mutation({
  args: {
    meetingId: v.id("meetings"),
    isArchived: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetingId, {
      isArchived: args.isArchived,
      updatedAt: Date.now(),
    });
  },
});

// Delete meeting and all associated data
export const deleteMeeting = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    // Delete action items for this meeting
    const actionItems = await ctx.db
      .query("actionItems")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    for (const actionItem of actionItems) {
      await ctx.db.delete(actionItem._id);
    }

    // Delete share access logs
    const accessLogs = await ctx.db
      .query("shareAccessLogs")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();

    for (const log of accessLogs) {
      await ctx.db.delete(log._id);
    }

    // Delete the meeting
    await ctx.db.delete(args.meetingId);
  },
});

// Generate shareable link
export const generateShareableLink = mutation({
  args: {
    meetingId: v.id("meetings"),
    expiresAt: v.optional(v.number()),
    passwordProtected: v.optional(v.boolean()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a unique share ID
    const shareId = crypto.randomUUID();
    const shareableLink = `share/${shareId}`;

    await ctx.db.patch(args.meetingId, {
      shareSettings: {
        isPublic: true,
        shareableLink,
        expiresAt: args.expiresAt,
        passwordProtected: args.passwordProtected || false,
        password: args.password,
      },
      updatedAt: Date.now(),
    });

    return shareableLink;
  },
});

// Get meeting by shareable link
export const getMeetingByShareLink = query({
  args: { shareLink: v.string() },
  handler: async (ctx, args) => {
    const meeting = await ctx.db
      .query("meetings")
      .withIndex("by_shareable_link", (q) => q.eq("shareSettings.shareableLink", args.shareLink))
      .first();

    if (!meeting) return null;

    // Check if link has expired
    if (meeting.shareSettings.expiresAt && meeting.shareSettings.expiresAt < Date.now()) {
      return null;
    }

    return meeting;
  },
});

// Log share access
export const logShareAccess = mutation({
  args: {
    meetingId: v.id("meetings"),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("shareAccessLogs", {
      meetingId: args.meetingId,
      accessedAt: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      country: args.country,
      city: args.city,
    });

    // Notify meeting owner
    const meeting = await ctx.db.get(args.meetingId);
    if (meeting) {
      await ctx.db.insert("notifications", {
        userId: meeting.userId,
        type: "share_accessed",
        title: "Meeting accessed",
        message: `Your shared meeting "${meeting.title}" was accessed.`,
        isRead: false,
        meetingId: args.meetingId,
        createdAt: Date.now(),
      });
    }
  },
});

// Revoke shareable link
export const revokeShareableLink = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetingId, {
      shareSettings: {
        isPublic: false,
        passwordProtected: false,
      },
      updatedAt: Date.now(),
    });
  },
});

// Get meetings by processing status (for monitoring)
export const getMeetingsByStatus = query({
  args: {
    status: v.union(
      v.literal("uploading"),
      v.literal("transcribing"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    return await ctx.db
      .query("meetings")
      .withIndex("by_processing_status", (q) => q.eq("processingStatus", args.status))
      .order("desc")
      .take(limit);
  },
});

// Get meeting statistics for a user
export const getUserMeetingStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalMeetings = meetings.length;
    const archivedMeetings = meetings.filter((m) => m.isArchived).length;
    const completedMeetings = meetings.filter((m) => m.processingStatus === "completed").length;
    const processingMeetings = meetings.filter((m) =>
      ["uploading", "transcribing", "generating"].includes(m.processingStatus)
    ).length;
    const failedMeetings = meetings.filter((m) => m.processingStatus === "failed").length;

    // Calculate total duration
    const totalDuration = meetings
      .filter((m) => m.duration)
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentMeetings = meetings.filter((m) => m.createdAt > thirtyDaysAgo).length;

    return {
      totalMeetings,
      archivedMeetings,
      completedMeetings,
      processingMeetings,
      failedMeetings,
      totalDurationMinutes: totalDuration,
      recentMeetings,
    };
  },
});
