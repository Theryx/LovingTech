import { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_auth')?.value;
  if (!token) return false;
  return verifyAuthToken(token);
}
