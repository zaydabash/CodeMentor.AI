.PHONY: dev seed test lint clean

dev:
	@echo "Starting development environment..."
	@cd backend && python -m uvicorn app.main:app --reload --port 8000 &
	@cd frontend && npm run dev &
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"

seed:
	@echo "Seeding sample repos and running analysis..."
	@cd backend && python3 scripts/seed_demo.py

test:
	@echo "Running tests..."
	@cd backend && pytest tests/ -v
	@cd frontend && npm test

lint:
	@echo "Running linters..."
	@cd backend && ruff check . && bandit -r app/
	@cd frontend && npm run lint
	@python3 scripts/check_no_emoji.py

clean:
	@rm -rf backend/__pycache__ backend/**/__pycache__ backend/.pytest_cache
	@rm -rf frontend/.next frontend/node_modules
	@rm -rf workspace/*.db
	@find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true

