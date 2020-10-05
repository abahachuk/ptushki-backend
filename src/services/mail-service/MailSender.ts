/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTransport } from 'nodemailer';
import aws from 'aws-sdk';

export interface MailPayload {
  to: string;
  from: string;
  subject: string;
  text: string;
}

export interface MailSender {
  sendEmail(payload: MailPayload): Promise<void>;
}

export class DummyMailSender implements MailSender {
  sendEmail(payload: MailPayload): Promise<void> {
    console.log('dummy sent mail with the next payload:', payload);
    return Promise.resolve();
  }
}

export class SesMailSender implements MailSender {
  public constructor() {
    this.smtpTransport = createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01',
        region: 'eu-central-1',
      }),
    });
  }

  private smtpTransport: ReturnType<typeof createTransport>;

  sendEmail(payload: MailPayload): Promise<void> {
    return this.smtpTransport.sendMail(payload);
  }
}
