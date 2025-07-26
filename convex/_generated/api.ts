export const api = {
  users: {
    getUserByClerkId: 'users.getUserByClerkId',
    updateUserProfile: 'users.updateUserProfile',
    updateNotificationPreferences: 'users.updateNotificationPreferences',
    getUserUsageStats: 'users.getUserUsageStats',
  },
  templates: {
    getAvailableTemplates: 'templates.getAvailableTemplates',
  },
};

export type { Id } from './dataModel';
