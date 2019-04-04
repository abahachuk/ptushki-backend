import crypto from 'crypto';
import config from 'config';
import { promisify } from 'util';

const {
  secret,
  hashingIterations,
  // for salt is recommended more then 16 bytes
  saltSize,
  // it's hash length.
  // and general recommendation is to keep it
  // equal to double size of salt
  hashLength,
  hashingMethod,
} = config.get('userCrypto');

const secretHex = secret.toString('hex');

const randomBytes = promisify(crypto.randomBytes);
const pbkdf2 = promisify(crypto.pbkdf2);

async function hasher(password: string, salt: string): Promise<string> {
  const hash = await pbkdf2(password, salt + secretHex, hashingIterations, hashLength, hashingMethod);
  return hash.toString('hex');
}

async function getSaltAndHash(password: string): Promise<{ salt: string; hash: string }> {
  const salt: string = (await randomBytes(saltSize)).toString('hex');
  const hash = await hasher(password, salt);
  return {
    salt,
    hash,
  };
}

async function isCorrect(password: string, salt: string, hash: string): Promise<boolean> {
  const generatedHash = await hasher(password, salt);
  return hash === generatedHash;
}

export { getSaltAndHash, isCorrect };
