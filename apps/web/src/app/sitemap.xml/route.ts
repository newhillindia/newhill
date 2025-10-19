import { NextRequest, NextResponse } from 'next/server';
import { generateSitemap, generateRobotsTxt } from '@/lib/seo';

export async function GET(request: NextRequest) {
  try {
    const sitemap = await generateSitemap();
    
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

