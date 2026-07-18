import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://connectnetwork.co.za'
  const pages = ['','/about','/products','/opportunity','/compensation','/delivery','/faq','/contact','/why']
  return pages.map(p => ({ url: base + p, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }))
}
