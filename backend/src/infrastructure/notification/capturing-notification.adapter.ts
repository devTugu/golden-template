import { Injectable } from '@nestjs/common';
import {
  ContactNotificationPayload,
  INotificationPort,
  InviteEmailPayload,
  PasswordResetEmailPayload,
} from '@application/ports/notification.port';
import { NoopNotificationAdapter } from './noop-notification.adapter';
import { NotificationCaptureStore } from './notification-capture.store';

@Injectable()
export class CapturingNotificationAdapter implements INotificationPort {
  constructor(private readonly noop: NoopNotificationAdapter) {}

  sendContactNotification(payload: ContactNotificationPayload): Promise<void> {
    return this.noop.sendContactNotification(payload);
  }

  sendContactAutoReply(payload: ContactNotificationPayload): Promise<void> {
    return this.noop.sendContactAutoReply(payload);
  }

  async sendPasswordResetEmail(
    payload: PasswordResetEmailPayload,
  ): Promise<void> {
    NotificationCaptureStore.push({
      type: 'password_reset',
      payload,
      at: new Date().toISOString(),
    });
    await this.noop.sendPasswordResetEmail();
  }

  async sendInviteEmail(payload: InviteEmailPayload): Promise<void> {
    NotificationCaptureStore.push({
      type: 'invite',
      payload,
      at: new Date().toISOString(),
    });
    await this.noop.sendInviteEmail();
  }
}
