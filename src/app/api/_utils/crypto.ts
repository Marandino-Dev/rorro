import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex'); // Convert from hex to Buffer
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = cipher.update(text);

  const completeEncryption = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + completeEncryption.toString('hex');
}

export function decrypt(text: string) {
  const textParts = text.split(':'); // take away the IV
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const decrypted = decipher.update(encryptedText);

  const completeDecryption = Buffer.concat([decrypted, decipher.final()]);

  return completeDecryption.toString();
}

