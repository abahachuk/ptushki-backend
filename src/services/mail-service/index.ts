import config from 'config';
import { MailSender, DummyMailSender, SendGridMailSender } from './MailSender';

const { service } = config.get('mailService');

const mailSenderMap: { [key: string]: { new (...args: string[]): MailSender } } = {
  Dummy: DummyMailSender,
  SendGrid: SendGridMailSender,
};

export class MailService {
  private mailSender: MailSender;

  public constructor(sender: MailSender) {
    this.mailSender = sender;
  }

  public sendChangeRequestMail(token: string, email: string): Promise<void> {
    return this.mailSender.sendChangeRequestMail(token, email);
  }

  public sendResetCompleteMail(email: string): Promise<void> {
    return this.mailSender.sendResetCompleteMail(email);
  }
}

let mailService: MailService | null;

export const getMailServiceInstance = (): MailService => {
  console.log('------------getMailServiceInstance');
  if (mailService === null) {
    throw new Error('mail service was not initiated');
  }
  return mailService;
};

export function initMailService(): void {
  console.log('------------initMailService', service);

  const senderInstance = new mailSenderMap[service]();
  mailService = new MailService(senderInstance);
}
