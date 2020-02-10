/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import config from 'config';
import { createTransport } from 'nodemailer';

import { passwordChangeMail, passwordResetMail } from '../templates/mail';

const {
  // name,
  service,
  senderMail,
  auth,
  subject: { passwordChange, passwordReset },
} = config.get('mailService');

export interface MailService {
  sendChangeRequestMail(token: string, email: string, host: string): Promise<void>;
  sendResetCompleteMail(email: string): Promise<void>;
}

export abstract class MailServiceFactory {
  abstract createMailService(): MailService;
}

export class DummyMailService implements MailService {
  public sendChangeRequestMail(_token: string, _email: string, _host: string): Promise<void> {
    console.log('dummy sent Change request mail');
    return Promise.resolve();
  }

  public sendResetCompleteMail(_email: string): Promise<void> {
    console.log('dummy sent Reset complete mail');
    return Promise.resolve();
  }
}

export class SendGridMailService implements MailService {
  public constructor() {
    this.smtpTransport = createTransport({ service, auth });
  }

  private smtpTransport: ReturnType<typeof createTransport>;

  public sendChangeRequestMail(token: string, email: string, host: string): Promise<void> {
    const mailOptions = {
      to: email,
      from: senderMail,
      subject: passwordChange,
      text: passwordChangeMail(host, token),
    };
    return this.smtpTransport.sendMail(mailOptions);
  }

  public sendResetCompleteMail(email: string): Promise<void> {
    const mailOptions = {
      to: email,
      from: senderMail,
      subject: passwordReset,
      text: passwordResetMail(email),
    };
    return this.smtpTransport.sendMail(mailOptions);
  }
}

export class DummyMailServiceFactory extends MailServiceFactory {
  public createMailService(): DummyMailService {
    return new DummyMailService();
  }
}

export class SendGridMailServiceFactory extends MailServiceFactory {
  public createMailService(): SendGridMailService {
    return new SendGridMailService();
  }
}

let mailService: MailService | null;

export const getMailServiceInstance = (): MailService => {
  if (mailService === null) {
    throw new Error('mail service was not initiated');
  }
  return mailService;
};

export function initMailService(creator?: MailServiceFactory): void {
  if (creator) {
    mailService = creator.createMailService();
    return;
  }
  mailService = new DummyMailService();
}
