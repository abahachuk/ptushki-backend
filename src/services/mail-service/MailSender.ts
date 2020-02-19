/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import config from 'config';
import { createTransport } from 'nodemailer';
import { passwordChangeMail, passwordResetMail } from '../../templates/mail';

const {
  service,
  senderMail,
  auth,
  subject: { passwordChange, passwordReset },
} = config.get('mailService');

export interface MailSender {
  sendChangeRequestMail(token: string, email: string): Promise<void>;
  sendResetCompleteMail(email: string): Promise<void>;
}

export class DummyMailSender implements MailSender {
  public sendChangeRequestMail(_token: string, _email: string): Promise<void> {
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

  public sendChangeRequestMail(token: string, email: string): Promise<void> {
    const mailOptions = {
      to: email,
      from: senderMail,
      subject: passwordChange,
      text: passwordChangeMail(token),
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
