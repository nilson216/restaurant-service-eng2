'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RedirectHome() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      router.push('/restaurantes-cadastrados');
    } else {
      router.push('/login');
    }
  }, [isLoaded, userId, router]);

  return null;
}
