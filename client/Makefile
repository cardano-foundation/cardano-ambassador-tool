# Cardano Ambassador Client - Automation the Workflow

.PHONY: help init setup-hooks dev build lint format type-check clean

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

# Complete project initialization (first time)
init:
	@echo "🚀 Initializing Cardano Ambassador Client..."
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🔧 Setting up git hooks..."
	$(MAKE) setup-hooks
	@echo "📁 Creating additional directories..."
	@mkdir -p src/components src/utils src/types
	@echo "🎯 Running initial setup checks..."
	npm run type-check
	npm run lint
	@echo "🎉 Project initialized! Ready for development!"
	@echo "👉 Run 'make dev' to start developing"

# Install and setup everything
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🔧 Setting up git hooks..."
	$(MAKE) setup-hooks
	@echo "✅ Ready to develop!"

# Setup git hooks using existing npm script
setup-hooks:
	@echo "🔧 Setting up Husky git hooks..."
	npm run prepare
	@echo "✅ Git hooks configured!"
	@echo 'cd client && npx lint-staged' > .husky/pre-commit
	@echo 'cd client && npx --no -- commitlint --edit $$1' > .husky/commit-msg
	@chmod +x .husky/pre-commit .husky/commit-msg
	@echo "✅ Git hooks ready!"

# Start development
dev:
	@echo "🚀 Starting Next.js development server..."
	npm run dev

# Build
build:
	@echo "🏗️ Building..."
	npm run build

# Run linting
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# Formatting code
format:
	@echo "💅 Formatting code..."
	npm run format

# Type checking
type-check:
	@echo "📝 Checking TypeScript..."
	npm run type-check

# Clean build files
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf .next
	rm -f *.tsbuildinfo
	@echo "✅ Cleaned!"
