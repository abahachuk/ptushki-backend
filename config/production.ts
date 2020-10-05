export default {
  dbConfig: {
    entities: ['dist/src/entities/**/*.js'],
    synchronize: true,
  },
  auth: {
    accessExpires: Number.parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES as string, 10) || '5m',
    resetExpires: process.env.JWT_RESET_TOKEN_EXPIRES || '1h',
  },
  mailService: {
    service: process.env.MAIL_SERVICE_NAME || 'SES',
  },
};
