import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { signAccessToken, verifyRefreshToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const dbRefreshToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!dbRefreshToken || dbRefreshToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Expired refresh token' }, { status: 401 });
    }

    const accessToken = signAccessToken(payload.userId);

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
