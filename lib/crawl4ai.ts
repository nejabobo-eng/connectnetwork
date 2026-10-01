export type CrawledSupplierProduct = {
  sourceUrl: string
  supplierName?: string
  supplierWebsite?: string
  productName: string
  productDescription?: string
  sourcePriceCents: number
  currency: 'ZAR'
  imageUrls: string[]
  availability?: string
  checkedAt: string
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export async function crawlSupplierProduct(sourceUrl: string): Promise<CrawledSupplierProduct> {
  if (!validHttpUrl(sourceUrl)) throw new Error('Enter a valid supplier product URL.')
  const serviceUrl = process.env.CRAWL4AI_SERVICE_URL
  if (!serviceUrl) throw new Error('Crawl4AI service is not configured. Set CRAWL4AI_SERVICE_URL after deploying the crawler service.')

  const response = await fetch(new URL('/extract', serviceUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: sourceUrl }),
    cache: 'no-store',
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json().catch(() => ({})) as Partial<CrawledSupplierProduct> & { error?: string }
  if (!response.ok) throw new Error(body.error || 'Crawl4AI could not extract this supplier page.')

  const price = Number(body.sourcePriceCents)
  const images = Array.isArray(body.imageUrls) ? body.imageUrls.filter((value): value is string => typeof value === 'string' && validHttpUrl(value)) : []
  if (!body.productName || !Number.isInteger(price) || price <= 0 || body.currency !== 'ZAR' || !images.length) {
    throw new Error('Crawl4AI returned incomplete product data. A ZAR price and direct product image are required.')
  }

  return {
    sourceUrl,
    supplierName: typeof body.supplierName === 'string' ? body.supplierName : undefined,
    supplierWebsite: typeof body.supplierWebsite === 'string' ? body.supplierWebsite : undefined,
    productName: body.productName,
    productDescription: typeof body.productDescription === 'string' ? body.productDescription : undefined,
    sourcePriceCents: price,
    currency: 'ZAR',
    imageUrls: images,
    availability: typeof body.availability === 'string' ? body.availability : undefined,
    checkedAt: typeof body.checkedAt === 'string' ? body.checkedAt : new Date().toISOString(),
  }
}

export function categorizeCrawledProduct(name: string, description = '') {
  const text = `${name} ${description}`.toLowerCase()
  if (/phone|laptop|charger|headphone|camera|usb|computer|tablet/.test(text)) return 'Electronics'
  if (/mattress|kettle|storage|lamp|clean|kitchen|furniture/.test(text)) return 'Home & Living'
  if (/shirt|dress|shoe|bag|jacket|fashion/.test(text)) return 'Fashion'
  if (/skin|beauty|hair|makeup|personal care/.test(text)) return 'Beauty & Personal Care'
  if (/vitamin|supplement|wellness|health|fitness/.test(text)) return 'Health & Wellness'
  if (/baby|toddler|child|kids|toy/.test(text)) return 'Baby & Kids'
  if (/sport|gym|bicycle|outdoor|camping/.test(text)) return 'Sports & Outdoors'
  if (/car|automotive|vehicle|tyre|motor/.test(text)) return 'Automotive'
  if (/tool|drill|hardware|power tool/.test(text)) return 'Tools & Hardware'
  if (/office|printer|stationery|desk/.test(text)) return 'Office & Business'
  if (/food|beverage|coffee|tea|snack/.test(text)) return 'Food & Beverage'
  return 'Other'
}

export async function discoverSupplierProductUrls(catalogueUrl: string) {
  const serviceUrl = process.env.CRAWL4AI_SERVICE_URL
  if (!serviceUrl) throw new Error('Crawl4AI service is not configured. Set CRAWL4AI_SERVICE_URL after deploying the crawler service.')
  const response = await fetch(new URL('/discover', serviceUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: catalogueUrl }),
    cache: 'no-store',
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json().catch(() => ({})) as { productUrls?: unknown; error?: string }
  if (!response.ok) throw new Error(body.error || 'Crawl4AI could not find product links from this approved source.')
  const productUrls = Array.isArray(body.productUrls) ? body.productUrls.filter((value): value is string => typeof value === 'string' && validHttpUrl(value)) : []
  if (!productUrls.length) throw new Error('Crawl4AI found no product links at this approved source.')
  return productUrls.slice(0, 12)
}
