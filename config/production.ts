export default {
  dbConfig: {
    entities: ['dist/src/entities/**/*.js'],
    synchronize: true,
  },
  auth: {
    accessExpires: Number.parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES as string, 10) || '5m',
  },
  mailService: {
    service: process.env.MAIL_SERVICE_NAME || 'SendGrid',
    auth: {
      user: process.env.MAIL_SERVICE_AUTH_USER || 'fat_mike',
      pass: process.env.MAIL_SERVICE_AUTH_PASSWORD || 'ptushki2006',
    },
  },
};
