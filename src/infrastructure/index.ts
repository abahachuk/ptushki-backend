import config from 'config';
import { Container } from 'inversify';
import { TYPES } from './types';
import { MailSender, DummyMailSender, SendGridMailSender } from '../services/mail-service/MailSender';

const { service } = config.get('mailService');

const mailSenderMap: { [key: string]: { new (...args: string[]): MailSender } } = {
  Dummy: DummyMailSender,
  SendGrid: SendGridMailSender,
};

const container = new Container();

container.bind<MailSender>(TYPES.MailSender).to(mailSenderMap[service]);

export { container };
