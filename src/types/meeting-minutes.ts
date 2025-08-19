export interface Attendee {
  name: string;
  role: string;
}

export interface Decision {
  description: string;
  madeBy: string;
  date: string;
}

export interface Risk {
  description: string;
  mitigation: string;
}

export interface ActionItem {
  description: string;
  owner: string;
  deadline: string;
}

export interface Observation {
  description: string;
}

export interface MeetingMinutes {
  title: string;
  executiveSummary: string;
  actionMinutes?: string;
  attendees: Attendee[];
  decisions: Decision[];
  risks: Risk[];
  actionItems: ActionItem[];
  observations: Observation[];
}