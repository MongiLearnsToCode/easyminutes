export type Id<TableName extends string> = string & { __tableName: TableName };

export interface DataModel {
  users: {
    _id: Id<"users">;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionTier: "free" | "pro" | "business";
    subscriptionStatus: "active" | "inactive" | "canceled";
    monthlyTranscriptions: number;
    storageUsedMB: number;
    defaultTemplateId?: string;
    onboardingCompleted: boolean;
    notificationPreferences: {
      emailOnTranscriptionComplete: boolean;
      emailOnShareAccess: boolean;
      emailOnSubscriptionUpdates: boolean;
      inAppNotifications: boolean;
    };
  };
  templates: {
    _id: Id<"templates">;
    name: string;
    description: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };
  meetings: {
    _id: Id<"meetings">;
    userId: Id<"users">;
    title: string;
    content: string;
    participants: string[];
    createdAt: number;
  };
}
