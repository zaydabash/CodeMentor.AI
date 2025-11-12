# Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- Git (for Git URL imports)
- OpenAI API key (or Anthropic API key)

## Setup Steps

1. **Clone and navigate to project:**
```bash
cd codementor.ai
```

2. **Set up backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up frontend:**
```bash
cd ../frontend
npm install
```

4. **Configure environment:**
```bash
cd ..
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

5. **Start development servers:**
```bash
make dev
```

The servers will start on available ports (typically 8000 for backend, 3000 or 3001 for frontend).

## Try It Out

1. Open your browser and navigate to the frontend URL (check terminal output for the exact port)
2. Click "Get Started" or navigate to /upload
3. Either:
   - Upload a ZIP file of your codebase (recommended), OR
   - Paste a public Git repository URL

   **Note**: If Git URL upload fails, try using ZIP file uploads instead. Git imports require public repositories with proper access.

4. Wait for analysis to complete (status updates automatically)
5. Select issues you want to fix
6. Click "Generate PR Draft"
7. Review the PR draft with unified diffs
8. Export as `.patch` or `PR.md`

## Seed Demo Data

```bash
make seed
```

This creates a sample Python Flask app with intentional bugs and runs a full analysis.

## Troubleshooting

- **Backend won't start**: Make sure you've activated the virtual environment and installed dependencies
- **Frontend won't start**: Run `npm install` in the frontend directory
- **LLM errors**: Check your API key in `.env` file
- **Analysis fails**: Ensure static analysis tools (ruff, bandit, eslint) are installed and in PATH

## Next Steps

- Read the full README.md for detailed documentation
- Check out the sample repos in `samples/` directory
- Review the API documentation (backend runs on port 8000 by default, accessible via `/docs` endpoint)

