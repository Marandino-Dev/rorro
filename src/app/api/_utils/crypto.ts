import crypto from 'crypto';


const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = cipher.update(text);

  const completeEncryption = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + completeEncryption.toString('hex');
}

function decrypt(text: string) {
  const textParts = text.split(':'); // take away the IV
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = decipher.update(encryptedText);

  const completeDecryption = Buffer.concat([decrypted, decipher.final()]);

  return completeDecryption.toString();
}

module.exports = { decrypt, encrypt };
