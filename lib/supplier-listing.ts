type SupplierListingDetails = { imageUrl?: string; supplierCostCents?: number }

function metaValue(html: string, name: string) {
  for (const tag of html.match(/<meta\s+[^>]*>/gi) || []) {
    const key = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1]?.toLowerCase()
    if (key !== name.toLowerCase()) continue
    const value = tag.match(/content=["']([^"']+)["']/i)?.[1]
    if (value) return value.replace(/&amp;/gi, '&').trim()
  }
  return undefined
}

function safeSourceUrl(value: string) {
  const url = new URL(value)
  const hostname = url.hostname.toLowerCase()
  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || hostname === 'localhost' || hostname.endsWith('.local') || /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) throw new Error('The supplier source URL is not safe to retrieve.')
  return url
}

export function defaultMarkupPercent() {
  const value = Number(process.env.DEFAULT_PRODUCT_MARKUP_PERCENT || 25)
  return Number.isFinite(value) && value >= 0 && value <= 200 ? value : 25
}

export function sellingPriceFromCost(supplierCostCents: number, markupPercent = defaultMarkupPercent()) {
  return Math.round(supplierCostCents * (1 + markupPercent / 100))
}

export async function extractSupplierListingDetails(sourceUrl: string): Promise<SupplierListingDetails> {
  const source = safeSourceUrl(sourceUrl)
  const response = await fetch(source, { headers: { 'User-Agent': 'ConnectNetwork listing verifier/1.0' }, signal: AbortSignal.timeout(15_000), cache: 'no-store' })
  if (!response.ok) throw new Error(`The supplier page could not be read (${response.status}).`)
  const html = await response.text()
  const image = metaValue(html, 'og:image') || metaValue(html, 'twitter:image')
  const imageUrl = image ? new URL(image, source).toString() : undefined
  const price = metaValue(html, 'product:price:amount') || metaValue(html, 'og:price:amount')
  const currency = metaValue(html, 'product:price:currency') || metaValue(html, 'og:price:currency')
  const numericPrice = price ? Number(price.replace(/[^0-9.,]/g, '').replace(',', '.')) : NaN
  const supplierCostCents = (currency === 'ZAR' || !currency) && Number.isFinite(numericPrice) && numericPrice > 0 ? Math.round(numericPrice * 100) : undefined
  return { imageUrl, supplierCostCents }
}
