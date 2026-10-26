export interface ContactNotificationPayload {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

export interface PasswordResetEmailPayload {
  to: string;
  resetUrl: string;
  locale?: 'en' | 'mn';
}

export interface InviteEmailPayload {
  to: string;
  inviteUrl: string;
  locale?: 'en' | 'mn';
}

export interface INotificationPort {
  sendContactNotification(payload: ContactNotificationPayload): Promise<void>;
  sendContactAutoReply(payload: ContactNotificationPayload): Promise<void>;
  sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void>;
  sendInviteEmail(payload: InviteEmailPayload): Promise<void>;
}
