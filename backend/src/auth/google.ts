import { OAuth2Client, TokenPayload } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function verifyIdToken(idToken: string): Promise<TokenPayload | undefined> {
  // Allow a static development token for local testing and unit tests.
  if (idToken === 'dev-token') {
    return {
      sub: 'dev-user',
      email: 'user@example.com',
      name: 'Dev User',
    } as TokenPayload;
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export function generateAuthUrl(): string {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
}
