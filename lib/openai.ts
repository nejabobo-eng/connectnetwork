const model = process.env.OPENAI_MODEL || 'gpt-5'

export async function runOpportunityResearch(demandSignal: string) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not configured')
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, store: false, tools: [{ type: 'web_search' }],
      instructions: 'You are ConnectNetwork research operator. Research a viable supplier opportunity from the demand signal. Do not contact suppliers, make purchases, promise availability, publish anything, or make approvals. Return only valid JSON with title, demand_summary, source_url, estimated_margin, confidence, supplier_name, supplier_website, product_name, product_description, retail_price_cents.',
      input: demandSignal,
      text: { format: { type: 'json_object' } },
    }), cache: 'no-store',
  })
  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`)
  const body = await response.json()
  const output = body.output_text
  if (typeof output !== 'string') throw new Error('OpenAI returned no text output')
  return JSON.parse(output) as Record<string, unknown>
}
