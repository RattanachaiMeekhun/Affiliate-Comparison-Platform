import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User'],
        disallow: '/',
      },
    ],
    sitemap: 'https://stacknodes.net/sitemap.xml',
  }
}
