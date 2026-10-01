import asyncio
import ipaddress
import json
import re
import socket
from datetime import datetime, timezone
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title='ConnectNetwork Crawl4AI provider')

class ExtractRequest(BaseModel):
    url: str

def public_http_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {'http', 'https'} or not parsed.hostname:
        raise HTTPException(400, 'A public http or https supplier URL is required.')
    if parsed.hostname.lower() in {'localhost', 'localhost.localdomain'}:
        raise HTTPException(400, 'Local supplier URLs are not allowed.')
    try:
        address = ipaddress.ip_address(parsed.hostname)
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:
            raise HTTPException(400, 'Private supplier URLs are not allowed.')
    except ValueError:
        try:
            for entry in socket.getaddrinfo(parsed.hostname, None):
                address = ipaddress.ip_address(entry[4][0])
                if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:
                    raise HTTPException(400, 'Supplier host resolves to a private address.')
        except socket.gaierror as error:
            raise HTTPException(400, f'Could not resolve supplier host: {error}')
    return value

def first_product_json_ld(soup: BeautifulSoup) -> dict:
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            values = json.loads(script.get_text(strip=True))
        except json.JSONDecodeError:
            continue
        candidates = values if isinstance(values, list) else values.get('@graph', [values]) if isinstance(values, dict) else []
        for item in candidates:
            if isinstance(item, dict) and (item.get('@type') == 'Product' or 'Product' in item.get('@type', [])):
                return item
    return {}

def images_from(product: dict, soup: BeautifulSoup, page_url: str) -> list[str]:
    values = product.get('image', [])
    if isinstance(values, str): values = [values]
    if isinstance(values, dict): values = [values.get('url')]
    og = soup.select_one('meta[property="og:image"]')
    if og and og.get('content'): values.append(og['content'])
    return list(dict.fromkeys(value for value in values if isinstance(value, str) and value.startswith(('https://', 'http://'))))

def zar_price_cents(product: dict, soup: BeautifulSoup) -> int | None:
    offers = product.get('offers', {})
    if isinstance(offers, list): offers = offers[0] if offers else {}
    currency = str(offers.get('priceCurrency') or '').upper()
    price = offers.get('price') or offers.get('lowPrice')
    if currency != 'ZAR' or price is None: return None
    try: return round(float(str(price).replace(',', '')) * 100)
    except ValueError: return None

@app.get('/health')
async def health():
    return {'ok': True}

@app.post('/extract')
async def extract(request: ExtractRequest):
    url = public_http_url(request.url)
    try:
        async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
            result = await crawler.arun(url=url, config=CrawlerRunConfig(word_count_threshold=1))
    except Exception as error:
        raise HTTPException(502, f'Crawl failed: {error}')
    if not result.success:
        raise HTTPException(502, f'Crawl failed: {result.error_message or "supplier page could not be read"}')

    soup = BeautifulSoup(result.html or '', 'html.parser')
    product = first_product_json_ld(soup)
    price_cents = zar_price_cents(product, soup)
    if not price_cents:
        raise HTTPException(422, 'No verifiable ZAR price was found in the supplier product data.')
    fallback_name = soup.title.get_text(strip=True) if soup.title else ''
    name = str(product.get('name') or fallback_name).strip()
    if not name:
        raise HTTPException(422, 'No product name was found.')
    offers = product.get('offers', {})
    if isinstance(offers, list): offers = offers[0] if offers else {}
    availability = str(offers.get('availability') or '').rsplit('/', 1)[-1] or None
    return {
        'sourceUrl': url,
        'supplierName': str(product.get('brand', {}).get('name') if isinstance(product.get('brand'), dict) else product.get('brand') or urlparse(url).hostname),
        'supplierWebsite': f'{urlparse(url).scheme}://{urlparse(url).netloc}',
        'productName': name,
        'productDescription': str(product.get('description') or '')[:4000],
        'sourcePriceCents': price_cents,
        'currency': 'ZAR',
        'imageUrls': images_from(product, soup, url),
        'availability': availability,
        'checkedAt': datetime.now(timezone.utc).isoformat(),
    }

@app.post('/discover')
async def discover(request: ExtractRequest):
    url = public_http_url(request.url)
    try:
        async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
            result = await crawler.arun(url=url, config=CrawlerRunConfig(word_count_threshold=1))
    except Exception as error:
        raise HTTPException(502, f'Crawl failed: {error}')
    if not result.success:
        raise HTTPException(502, f'Crawl failed: {result.error_message or "source page could not be read"}')

    soup = BeautifulSoup(result.html or '', 'html.parser')
    origin = urlparse(url)
    candidates = []
    for anchor in soup.select('a[href]'):
        href = anchor.get('href', '')
        if href.startswith('/'):
            href = f'{origin.scheme}://{origin.netloc}{href}'
        parsed = urlparse(href)
        if parsed.scheme not in {'http', 'https'} or parsed.netloc != origin.netloc:
            continue
        path = parsed.path.lower()
        if any(token in path for token in ('product', 'products', '/p/', 'item', 'sku')):
            candidates.append(href.split('#')[0])
    return {'productUrls': list(dict.fromkeys(candidates))[:20]}
