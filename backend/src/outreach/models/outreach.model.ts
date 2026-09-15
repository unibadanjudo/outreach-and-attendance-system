export enum ContactMethod {
  PHONE_CALL = 'PHONE_CALL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_PERSON = 'IN_PERSON',
  OTHER = 'OTHER',
}

export enum OutreachStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  RESPONDED = 'RESPONDED',
  NO_RESPONSE = 'NO_RESPONSE',
  WILL_RETURN = 'WILL_RETURN',
  NOT_INTERESTED = 'NOT_INTERESTED',
  TEMPORARILY_UNAVAILABLE = 'TEMPORARILY_UNAVAILABLE',
  UNKNOWN = 'UNKNOWN',
}

export enum OutreachPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Outreach {
  id: string;
  memberId: string;
  contactedBy: string;
  contactedAt: string;
  contactMethod: ContactMethod;
  status: OutreachStatus;
  message: string;
  response?: string;
  nextFollowUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
