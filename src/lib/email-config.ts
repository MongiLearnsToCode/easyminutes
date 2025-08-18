// Email configuration
export const EMAIL_CONFIG = {
  // SMTP settings (to be configured in environment variables)
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  // Default sender
  from: process.env.EMAIL_FROM || 'noreply@easyminutes.com',
  
  // Check if email is configured
  isConfigured: () => {
    return !!(
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    );
  },
};