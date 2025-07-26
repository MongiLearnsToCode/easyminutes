export const api = {
  users: {
    getUserByClerkId: 'users.getUserByClerkId',
    updateUserProfile: 'users.updateUserProfile',
    updateNotificationPreferences: 'users.updateNotificationPreferences',
    getUserUsageStats: 'users.getUserUsageStats',
    completeOnboarding: 'users.completeOnboarding',
  },
  templates: {
    getAvailableTemplates: 'templates.getAvailableTemplates',
    getDefaultTemplates: 'templates.getDefaultTemplates',
  },
};

export type { Id } from './dataModel';
