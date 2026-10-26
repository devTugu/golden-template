import type {
  InviteEmailPayload,
  PasswordResetEmailPayload,
} from '@application/ports/notification.port';

export type CapturedNotification =
  | { type: 'password_reset'; payload: PasswordResetEmailPayload; at: string }
  | { type: 'invite'; payload: InviteEmailPayload; at: string };

const captured: CapturedNotification[] = [];

export const NotificationCaptureStore = {
  reset(): void {
    captured.length = 0;
  },
  push(entry: CapturedNotification): void {
    captured.push(entry);
  },
  list(): CapturedNotification[] {
    return [...captured];
  },
  latestPasswordResetUrl(): string | undefined {
    const item = [...captured]
      .reverse()
      .find((n) => n.type === 'password_reset');
    return item?.payload.resetUrl;
  },
};
