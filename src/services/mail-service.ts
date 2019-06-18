import config from 'config';
import nodemailer from 'nodemailer';

import { passwordChangeMail, passwordResetMail } from '../templates/mail';

const {
  name,
  service,
  senderMail,
  auth,
  subject: { passwordChange, passwordReset },
} = config.get('mailService');

export const sendChangeRequestMail = async (token: string, email: string, host: string) => {
  const smtpTransport = nodemailer.createTransport({
    name,
    service,
    auth,
  });
  const mailOptions = {
    to: email,
    from: senderMail,
    subject: passwordChange,
    text: passwordChangeMail(host, token),
  };
  smtpTransport.sendMail(mailOptions);
};

export const sendResetCompleteMail = async (email: string) => {
  const smtpTransport = nodemailer.createTransport({
    name,
    service,
    auth,
  });
  const mailOptions = {
    to: email,
    from: senderMail,
    subject: passwordReset,
    text: passwordResetMail(email),
  };
  smtpTransport.sendMail(mailOptions);
};
