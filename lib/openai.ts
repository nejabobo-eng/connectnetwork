const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
export const productCategories = ['Electronics', 'Home & Living', 'Fashion', 'Beauty & Personal Care', 'Health & Wellness', 'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Tools & Hardware', 'Office & Business', 'Food & Beverage', 'Other'] as const

function parseResearchResult(output: string) {
  const cleaned = output.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
  const json = cleaned.startsWith('{') ? cleaned : cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1)
  return JSON.parse(json) as Record<string, unknown>
}

function responseText(body: { output_text?: unknown; output?: unknown }) {
  if (typeof body.output_text === 'string') return body.output_text
  if (!Array.isArray(body.output)) return ''
  for (const item of body.output) {
    if (!item || typeof item !== 'object' || !Array.isArray((item as { content?: unknown }).content)) continue
    for (const content of (item as { content: unknown[] }).content) {
      if (content && typeof content === 'object' && (content as { type?: unknown }).type === 'output_text' && typeof (content as { text?: unknown }).text === 'string') return (content as { text: string }).text
    }
  }
  return ''
}

async function createResponse(key: string, payload: Record<string, unknown>, timeout: number) {
  let response: Response
  let lastConnectionError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal: AbortSignal.timeout(timeout),
      })
      break
    } catch (error) {
      lastConnectionError = error
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1_000))
    }
  }
  if (!response!) {
    const detail = lastConnectionError instanceof Error && lastConnectionError.cause instanceof Error ? lastConnectionError.cause.message : lastConnectionError instanceof Error ? lastConnectionError.message : 'Unknown connection failure'
    throw new Error(`Could not connect to OpenAI after 3 attempts: ${detail}`)
  }
  if (!response.ok) {
    const failure = await response.json().catch(() => ({}))
    const detail = typeof failure?.error?.message === 'string' ? `: ${failure.error.message.slice(0, 180)}` : ''
    throw new Error(`OpenAI request failed: ${response.status}${detail}`)
  }
  const body = await response.json()
  const output = responseText(body)
  if (output) return output
  const status = typeof body.status === 'string' ? body.status : 'unknown'
  const reason = typeof body.incomplete_details?.reason === 'string' ? `, reason: ${body.incomplete_details.reason}` : ''
  throw new Error(`OpenAI returned no text output (status: ${status}${reason})`)
}

export async function runOpportunityResearch(demandSignal: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not configured')
  const research = await createResponse(key, {
    model,
    store: false,
    max_output_tokens: 3_000,
    reasoning: { effort: 'low' },
    tools: [{ type: 'web_search_preview' }],
    instructions: `You are ConnectNetwork research operator. Research one viable supplier opportunity from the demand signal. Only use a South African supplier or retailer and a confirmed price in South African rand (ZAR). Reject foreign-only suppliers and all USD, EUR, GBP, or other non-ZAR prices. Do not contact suppliers, make purchases, promise availability, publish anything, or make approvals. Return a concise factual briefing of no more than 350 words. Include supplier name, supplier website, supplier_country as ZA, price_currency as ZAR, product name, short product description, supplier cost in cents, confidence, official supplier product URL, a direct supplier/manufacturer image URL ending in an image file type, and one product category from: ${productCategories.join(', ')}.`,
    input: demandSignal,
  }, 60_000)

  try {
    return parseResearchResult(research)
  } catch {
    const formatted = await createResponse(key, {
      model,
      store: false,
      max_output_tokens: 1_500,
      reasoning: { effort: 'low' },
      instructions: `Convert the research into one valid JSON object. Use exactly these keys: title, demand_summary, source_url, confidence, supplier_name, supplier_website, supplier_country, price_currency, product_name, product_description, supplier_cost_cents, product_image_url, product_category. supplier_country must be ZA and price_currency must be ZAR. product_category must be one of: ${productCategories.join(', ')}. Use empty strings or null when a value is unknown. supplier_cost_cents is the supplier product price in cents, not a marked-up selling price. product_image_url must be a direct supplier/manufacturer image URL ending in .jpg, .jpeg, .png, .webp, .avif, or .gif. Return JSON only.`,
      input: `Convert the following research into a valid JSON object.\n\n${research}`,
      text: { format: { type: 'json_object' } },
    }, 30_000)
    return parseResearchResult(formatted)
  }
}

export async function classifyProductCategory(name: string, description: string, selectedCategory?: string) {
  if (productCategories.includes(selectedCategory as typeof productCategories[number])) return selectedCategory
  const key = process.env.OPENAI_API_KEY
  if (!key) return 'Other'
  try {
    const output = await createResponse(key, { model, store: false, max_output_tokens: 80, reasoning: { effort: 'low' }, instructions: `Return exactly one category from this list for the product. No explanation: ${productCategories.join(', ')}.`, input: `${name}\n${description}` }, 20_000)
    return productCategories.includes(output.trim() as typeof productCategories[number]) ? output.trim() : 'Other'
  } catch {
    return 'Other'
  }
}
