# CodeMentor.AI Backend

FastAPI backend for CodeMentor.AI.

## Development

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Testing

```bash
pytest tests/ -v
```

## Linting

```bash
ruff check .
bandit -r app/
```

