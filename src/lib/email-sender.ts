import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from './email-config';
import { MeetingMinutes } from '@/types/meeting-minutes';

// Create a transporter using the email configuration
const transporter = nodemailer.createTransporter({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: EMAIL_CONFIG.secure,
  auth: {
    user: EMAIL_CONFIG.auth.user,
    pass: EMAIL_CONFIG.auth.pass,
  },
});

// Function to send meeting minutes via email
export async function sendMeetingMinutesEmail(
  to: string,
  subject: string,
  minutes: MeetingMinutes, // The meeting minutes object
  attachments?: Array<{ filename: string; content: Buffer }>
) {
  try {
    // Check if email is configured
    if (!EMAIL_CONFIG.isConfigured()) {
      throw new Error('Email service is not configured');
    }
    
    // Format the meeting minutes as HTML
    const htmlContent = formatMeetingMinutesAsHtml(minutes);
    
    // Send the email
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html: htmlContent,
      attachments,
    });
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Function to format meeting minutes as HTML
function formatMeetingMinutesAsHtml(minutes: MeetingMinutes): string {
  // Create a professional HTML template for the meeting minutes
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${minutes.title}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2F5496;
          border-bottom: 2px solid #2F5496;
          padding-bottom: 10px;
          text-align: center;
        }
        h2 {
          color: #2F5496;
          margin-top: 30px;
          border-left: 4px solid #2F5496;
          padding-left: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        .attendee {
          display: inline-block;
          background-color: #f0f5ff;
          padding: 8px 12px;
          margin: 5px;
          border-radius: 4px;
          border: 1px solid #d9e1f2;
        }
        .decision, .risk, .action-item, .observation {
          background-color: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 4px;
          border-left: 4px solid #2F5496;
        }
        .meta {
          text-align: center;
          color: #666;
          margin: 20px 0;
          font-style: italic;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f0f5ff;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #888;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${minutes.title}</h1>
        
        <div class="meta">
          Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        <div class="section">
          <h2>Executive Summary & Action Minutes</h2>
          <p>${minutes.executiveSummary}</p>
          ${minutes.actionMinutes ? `<p><strong>Action Minutes:</strong> ${minutes.actionMinutes}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>Attendees</h2>
          <div>
            ${minutes.attendees.map((attendee) => 
              `<span class=\"attendee\">${attendee.name} - ${attendee.role}</span>`
            ).join('')}
          </div>
        </div>
        
        <div class="section">
          <h2>Decisions Made</h2>
          ${minutes.decisions.map((decision, index) => 
            `<div class="decision">
              <p><strong>${index + 1}. ${decision.description}</strong></p>
              <p>Made by: ${decision.madeBy} | Date: ${decision.date}</p>
            </div>`
          ).join('')}
        </div>
        
        <div class="section">
          <h2>Risks & Mitigations</h2>
          ${minutes.risks.map((risk, index) => 
            `<div class=\"risk\">
              <p><strong>Risk ${index + 1}: ${risk.description}</strong></p>
              <p><strong>Mitigation:</strong> ${risk.mitigation}</p>
            </div>`
          ).join('')}
        </div>
        
        <div class="section">
          <h2>Action Items</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${minutes.actionItems.map((item, index) => 
                `<tr>
                  <td>${index + 1}</td>
                  <td>${item.description}</td>
                  <td>${item.owner}</td>
                  <td>${item.deadline}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h2>Observations & Insights</h2>
          ${minutes.observations.map((observation, index) => 
            `<div class=\"observation\">
              <p>${index + 1}. ${observation.description}</p>
            </div>`
          ).join('')}
        </div>
        
        <div class="footer">
          <p>Generated by EasyMinutes - Fortune 500 Standard Meeting Minutes</p>
          <p>This document contains confidential information.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}