# Google Authentication Integration Guide

This guide explains how to integrate the Google Authentication feature with the frontend application.

## Overview

There are two main ways to implement Google authentication in the frontend:

1. **OAuth Flow** - Redirects to Google login page, then back to your app
2. **Google Sign-In Button** - Uses Google's JavaScript library for a "Sign in with Google" button

## Prerequisites

- Make sure your Google Cloud Console project has OAuth 2.0 client ID configured
- In your frontend app, add `@react-oauth/google` package if using React

## Implementation Options

### Option 1: OAuth Flow

#### Backend Endpoints:

- `GET /api/auth/google/url` - Get the Google OAuth URL
- `GET /api/auth/google/callback` - Handles the Google callback with authorization code

#### Frontend Implementation:

```javascript
// Get the OAuth URL from backend
const getGoogleAuthUrl = async () => {
  const response = await fetch('/api/auth/google/url');
  const data = await response.json();

  // Redirect user to Google login page
  window.location.href = data.url;
};

// Create a button to trigger the OAuth flow
<button onClick={getGoogleAuthUrl}>Sign in with Google</button>;
```

Google will redirect back to your backend's callback URL with a code parameter. The backend will:

1. Exchange the code for tokens
2. Verify the token and get user information
3. Create or update the user in the database
4. Return authentication cookies and user data

### Option 2: Google Sign-In Button (Recommended)

#### Backend Endpoints:

- `POST /api/auth/google/login` - Verify the Google ID token and authenticate user

#### Frontend Implementation (React):

1. Install required packages:

```bash
npm install @react-oauth/google
```

2. Set up the Google OAuth Provider in your app:

```jsx
// main.jsx or App.jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

// Get the client ID from environment
const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

3. Implement the Google login button:

```jsx
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

function LoginPage() {
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setLoading(true);

      try {
        // Send the ID token to your backend
        const response = await fetch('/api/auth/google/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: tokenResponse.access_token,
          }),
          credentials: 'include', // Important for cookies
        });

        if (response.ok) {
          const data = await response.json();
          // Handle successful login (store user, redirect, etc.)
          console.log('Google login successful:', data.user);
          // Redirect to main page or dashboard
          window.location.href = '/main';
        } else {
          console.error('Google login failed');
        }
      } catch (error) {
        console.error('Error during Google login:', error);
      } finally {
        setLoading(false);
      }
    },
    onError: error => {
      console.error('Google login error:', error);
    },
  });

  return (
    <button onClick={() => googleLogin()} disabled={loading}>
      {loading ? 'Loading...' : 'Sign in with Google'}
    </button>
  );
}
```

## Environment Variables

For the frontend, you need to set up the following environment variable:

```
VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
```

## Notes for Implementation

1. Make sure the callback URL in Google Cloud Console matches the one in your backend configuration.
2. Ensure your backend's CORS settings allow requests from your frontend domain.
3. If using cookies for authentication, make sure they are set with the appropriate settings (`SameSite`, `Secure`, etc.).
4. Test both sign-in and sign-up flows to ensure new and existing users are handled correctly.

## Troubleshooting

- **Invalid Redirect URI**: Ensure the redirect URI in Google Cloud Console matches the one in your backend configuration.
- **Token Verification Issues**: Check that the client IDs in frontend and backend match.
- **Cookies Not Set**: Ensure you're making requests with `credentials: 'include'` and your backend sets cookies properly.
- **CORS Issues**: Make sure your backend allows requests from your frontend domain.

For additional assistance, consult the [Google Sign-In documentation](https://developers.google.com/identity/gsi/web/guides/overview).
