import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';
import axios from 'axios';

const API_ROOT = process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:8010';

export async function GET(request: NextRequest) {
  try {
    // Get the Auth0 session
    const session = await auth0.getSession();

    console.log('OAuth Login Handler - Session:', session ? 'Found' : 'Not found');

    if (!session || !session.user) {
      console.error('No session or user found');
      return NextResponse.redirect(new URL('/login?error=no_session', request.url));
    }

    const auth0User = session.user;
    console.log('Auth0 User:', {
      email: auth0User.email,
      name: auth0User.name,
      sub: auth0User.sub,
    });

    // Sync user with your backend
    try {
      const userData = {
        email: auth0User.email,
        name: auth0User.name || auth0User.email?.split('@')[0],
        picture: auth0User.picture,
        sub: auth0User.sub, // Auth0 user ID
      };

      console.log('Calling backend API with:', userData);

      // Make direct axios call to capture cookies from response
      const backendResponse = await axios.post(`${API_ROOT}/v1/users/oauth/google`, userData, {
        withCredentials: true,
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      console.log('Backend API success:', backendResponse.data);

      // Extract cookies from backend response
      const setCookieHeaders = backendResponse.headers['set-cookie'];

      // Create redirect response
      const redirectResponse = NextResponse.redirect(new URL('/auth/oauth-success', request.url));

      // Forward cookies to browser
      if (setCookieHeaders) {
        if (Array.isArray(setCookieHeaders)) {
          setCookieHeaders.forEach(cookie => {
            redirectResponse.headers.append('Set-Cookie', cookie);
          });
        } else {
          redirectResponse.headers.append('Set-Cookie', setCookieHeaders);
        }
      }

      return redirectResponse;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error syncing user with backend:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // If user creation fails, redirect to login with error
      const errorMessage = error.response?.data?.message || error.message || 'oauth_failed';
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url));
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}
