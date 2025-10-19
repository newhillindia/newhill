import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { UserRole } from '@prisma/client';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  redirectTo = '/unauthorized' 
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [session, status, allowedRoles, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
