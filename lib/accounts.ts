import { kv } from '@vercel/kv';
import { User } from '@/lib/types';
import { getJWTPayload, encrypt } from './encryption';

/**
 * Increments a string by one character. 'a' -> 'z' then 'A' -> 'Z' then '0' -> '9'.
 * If the string is '9', then it adds a new character: 'aa'.
 * @param prevString The string to increment.
 * @returns The incremented string.
 */
export function incrementString(prevString: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prevString;
  let carry = true;
  let i = result.length - 1;

  while (carry && i >= 0) {
    const currentChar = result[i];
    const currentIndex = chars.indexOf(currentChar);

    if (currentIndex === chars.length - 1) {
      result = result.substring(0, i) + chars[0] + result.substring(i + 1);
      i--;
    } else {
      result = result.substring(0, i) + chars[currentIndex + 1] + result.substring(i + 1);
      carry = false;
    }
  }
  if (carry) {
    result = 'a' + result;
  }
  return result;
}


export async function getUser(email: string) {
  const user = await kv.hgetall<User>(`user:${email}`)
  return user
}

export async function getNextSafeShortUserID() {
  // Fetch the current short ID and increment it atomically
  const result = await kv.eval(`
    local current = redis.call('GET', 'current_sid')
    if not current then
      current = 'a'
    else
      current = redis.call('GET', 'current_sid')
    end
    local next = redis.call('EVAL', "return require('accounts').incrementString(ARGV[1])", 0, current)
    redis.call('SET', 'current_sid', next)
    return next
  `, []) as string;

  return result;
}

export async function createUser(account: any) {
  const payload = getJWTPayload(account.id_token)

  const newUser = {
    id: account.providerAccountId,
    email: payload.email,
    given_name: payload.given_name || '',
    family_name: payload.family_name || '',
    image: payload.picture || '',
    accessToken: await encrypt(account.access_token),
    refreshToken: await encrypt(account.refresh_token),
    expiresAt: account.expires_at,
  };

  try {
    await kv.hmset(`user:${payload.email}`, newUser);
    console.log(`User account created for ${payload.email}`);
  } catch (error) {
    console.error('Error creating user account:', error);
  }
}

export async function updateUserLogin(account: any, existingUser: User) {

  try {
    await kv.hset(`user:${existingUser.email}`, {
      accessToken: await encrypt(account.access_token),
      refreshToken: await encrypt(account.refresh_token),
      expiresAt: account.expires_at,
    });

    console.log(`User account updated for ${existingUser.email}`);
  } catch (error) {
    console.error('Error updating user account:', error);
  }
}


export async function ensureAccountCreated(account: any) {
  const payload = getJWTPayload(account.id_token)
  const existingUser = await getUser(payload.email);
  console.log('eu', existingUser)
  if (!existingUser) {
    createUser(account)
  } else {
    updateUserLogin(account, existingUser)
  }
}

export async function getUpdatedAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    const data = await response.json();

    return data.access_token;
  } catch (error) {
    // TODO: Handle this error properly and all the potential edge cases:
    // Network issue - i.g. Google endpoint is down
    // Refresh token expired / revoked, we need to notify the user to re-login
    // to ensure their links are active with an email.
    // In the meantime, we need to display a message to the user scheduling.
    console.error('Error refreshing access token:', error);
    return null;
  }
}

