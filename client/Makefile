# Cardano Ambassador Client - Automation the Workflow

.PHONY: help init setup-hooks dev build lint format type-check clean drizzle-generate drizzle-push drizzle-reset

# Show available commands
help:
	@echo "Cardano Ambassador Client Commands:"
	@echo ""
	@echo "  make init         - Complete first-time project setup"
	@echo "  make install      - Install dependencies and setup hooks"
	@echo "  make setup-hooks  - Setup git hooks (calls npm run prepare)"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier"
	@echo "  make type-check   - Check TypeScript types"
	@echo "  make clean        - Clean build files"
	@echo "  make drizzle-generate - Generate Drizzle schema/migrations"
	@echo "  make drizzle-push     - Push Drizzle migrations"
	@echo "  make drizzle-reset    - Force push (reset) Drizzle schema"

# Complete project initialization (first time)
init:
	npm install
	$(MAKE) setup-hooks
	@mkdir -p src/components src/utils src/types
	npm run type-check
	npm run lint
	@echo "Run 'make dev' to start developing"

# Install and setup everything
install:
	npm install
	$(MAKE) setup-hooks

# Setup git hooks using existing npm script
setup-hooks:
	npm run prepare
	@echo 'cd client && npx lint-staged' > .husky/pre-commit
	@echo 'cd client && npx --no -- commitlint --edit $$1' > .husky/commit-msg
	@chmod +x .husky/pre-commit .husky/commit-msg
	@echo "Git hooks ready!"

# Start development
dev:
	npm run dev

# Build
build:
	npm run build

# Run linting
lint:
	npm run lint

# Formatting code
format:
	npm run format

# Type checking
type-check:
	npm run type-check

# Clean build files
clean:
	rm -rf .next
	rm -f *.tsbuildinfo

# Drizzle ORM + SQLite commands
drizzle-generate:
	npx drizzle-kit generate

drizzle-push:
	npx drizzle-kit push

drizzle-reset:
	npx drizzle-kit push --force
