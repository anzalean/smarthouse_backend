import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { env } from './env.js';

const googleOAuthClient = new OAuth2Client({
  clientId: env('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: env('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: env('GOOGLE_AUTH_REDIRECT_URL'),
});

// Generate authorization URL for frontend redirect
export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
  });

// Exchange authorization code for tokens
export const validateCode = async code => {
  try {
    const { tokens } = await googleOAuthClient.getToken(code);

    if (!tokens.id_token) {
      throw createHttpError(401, 'Invalid Google authorization code');
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      isVerified: payload.email_verified || false,
      picture: payload.picture,
      fullPayload: payload,
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw createHttpError(401, 'Failed to validate Google authorization');
  }
};

// Verify Google ID token received from client
export const verifyGoogleIdToken = async idToken => {
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: env('GOOGLE_AUTH_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      isVerified: payload.email_verified || false,
      picture: payload.picture,
      fullPayload: payload,
    };
  } catch (error) {
    console.error('Google ID token verification error:', error);
    throw createHttpError(401, 'Invalid Google ID token');
  }
};

export const getFullNameFromGoogleTokenPayload = payload => {
  let fullName = 'Guest';
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }
  return fullName;
};
