export const passwordChangeMail = (token: string): { body: string; subject: string } => ({
  subject: 'Your password has been changed',
  body: `
    You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    http://ptushki.by/reset/${token}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n
  `,
});

export const passwordResetMail = (email: string): { body: string; subject: string } => ({
  subject: 'Your password has been reset',
  body: `
    Hello,\n\n
    This is a confirmation that the password for your account ${email} has just been changed.\n
  `,
});
