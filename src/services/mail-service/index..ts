import { container } from '../../infrastructure';
import { TYPES } from '../../infrastructure/types';
import { MailSender } from './MailSender';

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
  if (mailService === null) {
    throw new Error('mail service was not initiated');
  }
  return mailService;
};

export function initMailService(): void {
  const senderInstance = container.get<MailSender>(TYPES.MailSender);
  mailService = new MailService(senderInstance);
}
