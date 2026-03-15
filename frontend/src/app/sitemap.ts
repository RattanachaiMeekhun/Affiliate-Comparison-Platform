import { MetadataRoute } from 'next'
import { fetchProducts, fetchCategories } from '../lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://stacknodes.net'

  // Standard pages
  const routes = ['', '/compare', '/disclosure', '/privacy', '/terms', '/about', '/contact', '/methodology', '/setup-builder'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    })
  )

  try {
    const [products, categories] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
    ])

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    const categoryUrls = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...routes, ...categoryUrls, ...productUrls]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return routes
  }
}
