import { MeetingMinutes } from "./gemini";

// Function to validate and normalize meeting minutes
export function validateAndNormalizeMeetingMinutes(data: any): MeetingMinutes {
  // Validate title
  const title = typeof data.title === 'string' ? data.title.trim() : 'Untitled Meeting';
  
  // Validate executive summary
  const executiveSummary = typeof data.executiveSummary === 'string' ? data.executiveSummary.trim() : '';
  
  // Validate action minutes
  const actionMinutes = typeof data.actionMinutes === 'string' ? data.actionMinutes.trim() : '';
  
  // Validate attendees
  let attendees: MeetingMinutes['attendees'] = [];
  if (Array.isArray(data.attendees)) {
    attendees = data.attendees
      .filter((attendee: any) => 
        attendee && 
        typeof attendee.name === 'string' && 
        typeof attendee.role === 'string'
      )
      .map((attendee: any) => ({
        name: attendee.name.trim() || 'Unknown Attendee',
        role: attendee.role.trim() || 'Participant'
      }));
  }
  
  // Validate decisions
  let decisions: MeetingMinutes['decisions'] = [];
  if (Array.isArray(data.decisions)) {
    decisions = data.decisions
      .filter((decision: any) => 
        decision && 
        typeof decision.description === 'string' &&
        typeof decision.madeBy === 'string' &&
        typeof decision.date === 'string'
      )
      .map((decision: any) => ({
        description: decision.description.trim() || 'No description provided',
        madeBy: decision.madeBy.trim() || 'Unspecified',
        date: validateDate(decision.date) || new Date().toISOString().split('T')[0]
      }));
  }
  
  // Validate risks
  let risks: MeetingMinutes['risks'] = [];
  if (Array.isArray(data.risks)) {
    risks = data.risks
      .filter((risk: any) => 
        risk && 
        typeof risk.description === 'string' &&
        typeof risk.mitigation === 'string'
      )
      .map((risk: any) => ({
        description: risk.description.trim() || 'No description provided',
        mitigation: risk.mitigation.trim() || 'No mitigation specified'
      }));
  }
  
  // Validate action items
  let actionItems: MeetingMinutes['actionItems'] = [];
  if (Array.isArray(data.actionItems)) {
    actionItems = data.actionItems
      .filter((item: any) => 
        item && 
        typeof item.description === 'string' &&
        typeof item.owner === 'string' &&
        typeof item.deadline === 'string'
      )
      .map((item: any) => ({
        description: item.description.trim() || 'No description provided',
        owner: item.owner.trim() || 'Unassigned',
        deadline: validateDate(item.deadline) || getDefaultDeadline()
      }));
  }
  
  // Validate observations
  let observations: MeetingMinutes['observations'] = [];
  if (Array.isArray(data.observations)) {
    observations = data.observations
      .filter((observation: any) => 
        observation && 
        typeof observation.description === 'string'
      )
      .map((observation: any) => ({
        description: observation.description.trim() || 'No observation provided'
      }));
  }
  
  return {
    title,
    executiveSummary,
    actionMinutes,
    attendees,
    decisions,
    risks,
    actionItems,
    observations
  };
}

// Helper function to validate date format
function validateDate(dateString: string): string | null {
  if (!dateString) return null;
  
  // Try to parse the date
  const date = new Date(dateString);
  
  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Return in YYYY-MM-DD format
  return date.toISOString().split('T')[0];
}

// Helper function to get a default deadline (2 weeks from now)
function getDefaultDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
}

// Function to ensure all required fields are present
export function ensureCompleteMeetingMinutes(data: Partial<MeetingMinutes>): MeetingMinutes {
  return {
    title: data.title || 'Untitled Meeting',
    executiveSummary: data.executiveSummary || '',
    actionMinutes: data.actionMinutes || '',
    attendees: Array.isArray(data.attendees) ? data.attendees : [],
    decisions: Array.isArray(data.decisions) ? data.decisions : [],
    risks: Array.isArray(data.risks) ? data.risks : [],
    actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
    observations: Array.isArray(data.observations) ? data.observations : []
  };
}