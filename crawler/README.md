# Crawl4AI service

This separate Python service crawls a supplier product URL and returns normalized product data to ConnectNetwork. It has no OpenAI dependency and does not publish products.

## Local run

```powershell
cd crawler
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
crawl4ai-setup
uvicorn main:app --host 0.0.0.0 --port 8000
```

Set `CRAWL4AI_SERVICE_URL=http://localhost:8000` in the main ConnectNetwork `.env.local` for local testing. Deploy this service separately from Vercel before production use.
