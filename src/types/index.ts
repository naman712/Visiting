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
}

export interface EmailSettings {
  subject: string;
  greeting: string;
  body: string;
  calendlyText: string;
  calendlyLink: string;
  websiteLink: string;
  senderName: string;
  signature: string;
}

export interface AppSettings {
  email: EmailSettings;
}
