'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthSuccessPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) {
      return;
    }

    // Once initialized, check if authenticated
    if (isAuthenticated) {
      // Successfully authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // Not authenticated, redirect to login
      router.push('/login?error=oauth_auth_failed');
    }
  }, [isAuthenticated, isInitialized, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Completing your login...</p>
      </div>
    </div>
  );
}
