'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { posthog, trackPageView } from '@/lib/posthog';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views
    if (posthog) {
      const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
      
      // Track page view with PostHog
      posthog.capture('$pageview', {
        $current_url: url,
        page_name: pathname,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}


