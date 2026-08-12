export interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone?: string;
  title?: string;
}

export interface Contact extends ContactInfo {
  id: string;
  createdAt: string;
  emailSent: boolean;
  hubspotId?: string;
  cardImageUrl?: string;
  eventId?: string;
  eventDateId?: string;
  eventName?: string;
  eventDateLabel?: string;
}

export interface EmailTemplate {
  subject: string;
  greeting: string;
  body: string;
  calendlyText: string;
  calendlyLink: string;
  websiteLink: string;
  senderName: string;
  signature: string;
}

export type EmailSettings = EmailTemplate;

export interface EventDate {
  id: string;
  label: string;
  date: string;
}

export interface EventConfig {
  id: string;
  name: string;
  dates: EventDate[];
  template: EmailTemplate;
}

export interface AppSettings {
  events: EventConfig[];
}
