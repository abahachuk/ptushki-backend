import config from 'config';
import { MailSender, DummyMailSender, SesMailSender } from './MailSender';
import { getVerifyMail, getPasswordChangeMail, getPasswordResetMail } from '../../templates/mail';

const { service, from } = config.get('mailService');

const mailSenderMap: { [key: string]: { new (...args: string[]): MailSender } } = {
  Dummy: DummyMailSender,
  SES: SesMailSender,
};

export class MailService {
  private mailSender: MailSender;

  public constructor(sender: MailSender) {
    this.mailSender = sender;
  }

  public sendSignupVerifyMail(email: string, token: string): Promise<void> {
    const { subject, body } = getVerifyMail(token);
    return this.mailSender.sendEmail({ from, to: email, subject, text: body });
  }

  public sendChangeRequestMail(email: string, token: string): Promise<void> {
    const { subject, body } = getPasswordChangeMail(token);
    return this.mailSender.sendEmail({ from, to: email, subject, text: body });
  }

  public sendResetCompleteMail(email: string): Promise<void> {
    const { subject, body } = getPasswordResetMail(email);
    return this.mailSender.sendEmail({ from, to: email, subject, text: body });
  }
}

let mailService: MailService | null = null;

export const getMailServiceInstance = (): MailService => {
  if (mailService === null) {
    throw new Error('mail service was not initiated');
  }
  return mailService;
};

export function initMailService(): void {
  const senderInstance = new mailSenderMap[service]();
  mailService = new MailService(senderInstance);
}
