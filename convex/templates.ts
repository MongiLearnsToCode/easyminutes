import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new template
export const createTemplate = mutation({
  args: {
    userId: v.optional(v.id("users")), // null for system default templates
    name: v.string(),
    description: v.optional(v.string()),
    sections: v.array(
      v.object({
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
      })
    ),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("templates", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      sections: args.sections,
      isDefault: false,
      isPublic: args.isPublic,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return templateId;
  },
});

// Get template by ID
export const getTemplate = query({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

// Get templates for a user
export const getUserTemplates = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("templates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sections: v.optional(
      v.array(
        v.object({
          id: v.string(),
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
        })
      )
    ),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;

    await ctx.db.patch(templateId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete template
export const deleteTemplate = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.templateId);
  },
});

// Get default templates
export const getDefaultTemplates = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();
  },
});

// Mark template as default
export const markTemplateAsDefault = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.templateId, {
      isDefault: true,
      updatedAt: Date.now(),
    });
  },
});

// Get public templates
export const getPublicTemplates = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();
  },
});

// Get all available templates for a user (user's templates + public templates + default templates)
export const getAvailableTemplates = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Get user's own templates
    const userTemplates = await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get default templates
    const defaultTemplates = await ctx.db
      .query("templates")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();

    // Get public templates from other users
    const publicTemplates = await ctx.db
      .query("templates")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .filter((q) => q.neq(q.field("userId"), args.userId))
      .collect();

    return {
      userTemplates,
      defaultTemplates,
      publicTemplates,
    };
  },
});

// Increment template usage count
export const incrementTemplateUsage = mutation({
  args: { templateId: v.id("templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) return;

    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
      updatedAt: Date.now(),
    });
  },
});

// Create default system templates
export const createDefaultTemplates = mutation({
  handler: async (ctx) => {
    // Check if default templates already exist
    const existingDefaults = await ctx.db
      .query("templates")
      .withIndex("by_default", (q) => q.eq("isDefault", true))
      .collect();

    if (existingDefaults.length > 0) {
      return; // Default templates already exist
    }

    const now = Date.now();

    // Standard Business Meeting Template
    await ctx.db.insert("templates", {
      userId: undefined,
      name: "Standard Business Meeting",
      description: "Default template for standard business meetings with all essential sections",
      isDefault: true,
      isPublic: true,
      sections: [
        {
          id: "attendees",
          title: "Attendees",
          order: 1,
          isRequired: true,
          placeholder: "List all meeting attendees",
          type: "attendees",
        },
        {
          id: "agenda",
          title: "Agenda",
          order: 2,
          isRequired: true,
          placeholder: "Meeting agenda items",
          type: "list",
        },
        {
          id: "discussion",
          title: "Discussion",
          order: 3,
          isRequired: true,
          placeholder: "Key discussion points and topics covered",
          type: "text",
        },
        {
          id: "decisions",
          title: "Decisions Made",
          order: 4,
          isRequired: false,
          placeholder: "Important decisions reached during the meeting",
          type: "decisions",
        },
        {
          id: "action_items",
          title: "Action Items",
          order: 5,
          isRequired: false,
          placeholder: "Tasks assigned with owners and due dates",
          type: "action_items",
        },
      ],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Project Standup Template
    await ctx.db.insert("templates", {
      userId: undefined,
      name: "Project Standup",
      description: "Template for daily standups and project status meetings",
      isDefault: true,
      isPublic: true,
      sections: [
        {
          id: "attendees",
          title: "Attendees",
          order: 1,
          isRequired: true,
          placeholder: "Team members present",
          type: "attendees",
        },
        {
          id: "completed",
          title: "Completed Since Last Meeting",
          order: 2,
          isRequired: true,
          placeholder: "What was completed since the last standup",
          type: "list",
        },
        {
          id: "planned",
          title: "Planned for Today/Next",
          order: 3,
          isRequired: true,
          placeholder: "What's planned for today or next period",
          type: "list",
        },
        {
          id: "blockers",
          title: "Blockers & Issues",
          order: 4,
          isRequired: false,
          placeholder: "Any blockers or issues that need resolution",
          type: "list",
        },
        {
          id: "action_items",
          title: "Action Items",
          order: 5,
          isRequired: false,
          placeholder: "Follow-up tasks and assignments",
          type: "action_items",
        },
      ],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Client Meeting Template
    await ctx.db.insert("templates", {
      userId: undefined,
      name: "Client Meeting",
      description: "Template for client meetings and presentations",
      isDefault: true,
      isPublic: true,
      sections: [
        {
          id: "attendees",
          title: "Attendees",
          order: 1,
          isRequired: true,
          placeholder: "Client and team attendees",
          type: "attendees",
        },
        {
          id: "objectives",
          title: "Meeting Objectives",
          order: 2,
          isRequired: true,
          placeholder: "Goals and objectives for this client meeting",
          type: "list",
        },
        {
          id: "presentation",
          title: "Presentation & Discussion",
          order: 3,
          isRequired: true,
          placeholder: "Key points presented and discussed",
          type: "text",
        },
        {
          id: "feedback",
          title: "Client Feedback",
          order: 4,
          isRequired: false,
          placeholder: "Feedback received from the client",
          type: "text",
        },
        {
          id: "next_steps",
          title: "Next Steps",
          order: 5,
          isRequired: true,
          placeholder: "Agreed upon next steps and follow-ups",
          type: "action_items",
        },
      ],
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});
