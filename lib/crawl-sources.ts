export const crawlResearchCategories = ['Electronics', 'Home & Living', 'Fashion', 'Beauty & Personal Care', 'Health & Wellness', 'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Tools & Hardware', 'Office & Business', 'Food & Beverage'] as const

type CrawlResearchCategory = typeof crawlResearchCategories[number]

type CrawlSource = {
  name: string
  category: CrawlResearchCategory
  catalogueUrl: string
}

export const approvedCrawlSources: CrawlSource[] = [
  { name: 'Makro', category: 'Home & Living', catalogueUrl: 'https://www.makro.co.za/' },
  { name: 'Superbalist', category: 'Fashion', catalogueUrl: 'https://www.superbalist.com/' },
  { name: 'Clicks', category: 'Beauty & Personal Care', catalogueUrl: 'https://clicks.co.za/' },
  { name: 'Dis-Chem', category: 'Health & Wellness', catalogueUrl: 'https://www.dischem.co.za/' },
  { name: 'Baby City', category: 'Baby & Kids', catalogueUrl: 'https://www.babycity.co.za/' },
  { name: 'Sportsmans Warehouse', category: 'Sports & Outdoors', catalogueUrl: 'https://www.sportsmanswarehouse.co.za/' },
  { name: 'AutoZone', category: 'Automotive', catalogueUrl: 'https://www.autozone.co.za/' },
  { name: 'Builders', category: 'Tools & Hardware', catalogueUrl: 'https://www.builders.co.za/' },
  { name: 'Office National', category: 'Office & Business', catalogueUrl: 'https://www.officenational.co.za/' },
  { name: 'Checkers', category: 'Food & Beverage', catalogueUrl: 'https://www.checkers.co.za/' },
  { name: 'Game', category: 'Electronics', catalogueUrl: 'https://www.game.co.za/' },
  { name: "Hirsch's", category: 'Home & Living', catalogueUrl: 'https://www.hirschs.co.za/' },
  { name: 'Yuppiechef', category: 'Home & Living', catalogueUrl: 'https://www.yuppiechef.com/' },
  { name: 'Mr Price', category: 'Fashion', catalogueUrl: 'https://www.mrp.com/' },
  { name: 'Wellness Warehouse', category: 'Health & Wellness', catalogueUrl: 'https://www.wellnesswarehouse.com/' },
  { name: 'Outdoor Warehouse', category: 'Sports & Outdoors', catalogueUrl: 'https://www.outdoorwarehouse.co.za/' },
  { name: 'Midas', category: 'Automotive', catalogueUrl: 'https://www.midas.co.za/' },
  { name: 'Leroy Merlin', category: 'Tools & Hardware', catalogueUrl: 'https://leroymerlin.co.za/' },
  { name: 'Pick n Pay', category: 'Food & Beverage', catalogueUrl: 'https://www.pnp.co.za/' },]

export function approvedCrawlSourceAt(index: number) {
  return approvedCrawlSources[Math.max(0, index) % approvedCrawlSources.length]
}
