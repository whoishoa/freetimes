import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export async function decrypt(text: string): Promise<string> {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function getJWTPayload(token: string) {
  const [, payloadBase64] = token.split('.');
  const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);
  return payload;
}

