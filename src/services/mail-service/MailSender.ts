/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import config from 'config';
import { createTransport } from 'nodemailer';
import { passwordChangeMail, passwordResetMail } from '../../templates/mail';

const { service, senderMail, auth } = config.get('mailService');

export interface MailSender {
  sendChangeRequestMail(email: string, token: string): Promise<void>;
  sendResetCompleteMail(email: string): Promise<void>;
}

export class DummyMailSender implements MailSender {
  public sendChangeRequestMail(_email: string, _token: string): Promise<void> {
    console.log('dummy sent Change request mail');
    return Promise.resolve();
  }

  public sendResetCompleteMail(_email: string): Promise<void> {
    console.log('dummy sent Reset complete mail');
    return Promise.resolve();
  }
}

export class SendGridMailSender implements MailSender {
  public constructor() {
    this.smtpTransport = createTransport({ service, auth });
  }

  private smtpTransport: ReturnType<typeof createTransport>;

  public sendChangeRequestMail(to: string, token: string): Promise<void> {
    const { subject, body } = passwordChangeMail(token);
    const mailOptions = {
      to,
      from: senderMail,
      subject,
      text: body,
    };
    return this.smtpTransport.sendMail(mailOptions);
  }

  public sendResetCompleteMail(to: string): Promise<void> {
    const { subject, body } = passwordResetMail(to);
    const mailOptions = {
      to,
      from: senderMail,
      subject,
      text: body,
    };
    return this.smtpTransport.sendMail(mailOptions);
  }
}
