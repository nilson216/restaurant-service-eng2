import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (refreshToken) {
    // Optional: Delete from database
    await db.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  const response = NextResponse.json({ message: 'Logged out' });

  // Clear cookie
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
