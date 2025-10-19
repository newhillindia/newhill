import { GetServerSideProps } from 'next';

function generateSiteMap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://newhillspices.com';
  
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/faq',
    '/products',
    '/policies/privacy',
    '/policies/terms',
    '/policies/refunds',
    '/policies/gst-faq'
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${staticPages
       .map((page) => {
         return `
       <url>
           <loc>${baseUrl}${page}</loc>
           <lastmod>${new Date().toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>${page === '' ? '1.0' : '0.8'}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;

  return sitemap;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;

