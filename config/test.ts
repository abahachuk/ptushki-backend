export default {
  dbConfig: {
    dropSchema: true,
  },
  userCrypto: {
    secret: 'secret',
    hashingIterations: 10,
    saltSize: 2,
    hashLength: 2,
    hashingMethod: 'sha512',
  },
};
