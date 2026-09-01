# ConnectNetwork V2 foundation

The public Next.js site stays fast and static by default. PostgreSQL/Supabase is the relational source of truth for all state.

- Connected suppliers submit to `suppliers` as `pending_review`; intake creates a durable `ai_tasks` record.
- AI-discovered suppliers are recorded as research opportunities and must be reviewed before contact, approval, or publication.
- `ai_events` is append-only: database triggers reject updates and deletes.
- The Constitution database trigger limits `app.actor = ai_operator` to preparing suppliers and opportunities for human review.
- Workers should claim `ai_tasks` using `FOR UPDATE SKIP LOCKED`, audit each tool result in `ai_events`, and keep long-running AI work out of web requests.
- The seeded promotion plan is R100/month (`10000` cents). Payments are modelled separately for Yoco and must be webhook-verified before activation.

## Approval and supplier reliability

Visit `/admin` to review AI-prepared opportunities. The one-click action approves the opportunity and supplier, with an append-only event recording the decision. It intentionally does not create a charge or place an order.

The dashboard is owner-only. Google authentication is handled by Supabase and the application issues an admin session only for `ADMIN_EMAIL` (default: `nejabobo@gmail.com`). In Supabase Auth, enable the Google provider, add Google OAuth credentials, and configure `https://your-domain/api/auth/google/callback` as an approved redirect URL.

Supplier fulfilment is evidence-based: create one `supplier_deliveries` record per supplier order, collect a delivery-status signal (tracking/carrier or supplier update), then collect customer feedback in `delivery_feedback`. The `supplier_reliability` view reports delivered/failed counts, delivery success rate, and average customer rating. Use these results as a hard eligibility threshold in the future AI worker before it recommends a supplier.

## Deploy

1. Create paid PostgreSQL/Supabase and run `supabase/schema.sql`, then `supabase/v2_connectnetwork.sql`.
2. Set the server-only variables from `.env.example` in the host.
3. Run a separate worker process for `ai_tasks`.
4. Add signed Yoco checkout and webhook routes before taking payment.

## Payments

`POST /api/payments/promotion-checkout` creates a server-side R100 Yoco checkout for a business name and email. The secret key is used only by `lib/yoco.ts`; browser code receives only the redirect URL. The return route looks up the checkout directly at Yoco before changing the payment to `succeeded` and activating the promotion. Configure the live `YOCO_SECRET_KEY` only in the production host environment and use test keys during development.

## OpenAI operator

`OPENAI_API_KEY` is a server-only environment variable. `POST /api/automation/run` processes one queued `discover_product_opportunity` task, uses the Responses API with web search, creates an unverified supplier and a review-ready opportunity, then appends an audit event. Call it from a separate worker/cron with `Authorization: Bearer $AUTOMATION_WORKER_SECRET`; it can also be run from an authenticated owner session. The operator has no endpoint to approve, publish, take payment, or place an order.

## Operations

`GET /api/health` returns `ok` only when the required database, OpenAI, and Yoco secrets are configured; use it for deployment monitoring. The owner dashboard can queue discovery research. A production scheduler calls the worker endpoint separately, so a slow AI task never blocks the public website.

AI is never authorised to charge customers, place orders, publish products, or approve suppliers.
