# Cardano Ambassador Tool - Client

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, clone the repository and install dependencies:

- `cd client`

## Available Scripts

In the `client` directory, you can run:

- `npm run dev` - Starts the development server with hot reload.
- `npm run build` - Builds the app for production.
- `npm run start` - Runs the built app in production mode.
- `npm run lint` - Runs ESLint with auto-fix on source files.
- `npm run format` - Formats code using Prettier.
- `npm run type-check` - Runs TypeScript type checking.
- `npm run prepare` - Sets up Husky Git hooks for pre-commit and commit-msg.
- `npm run commitlint` - Checks commit messages against conventional commit standards.

## Make commands

A **Makefile** is included to streamline common development tasks. Use these commands in the `client` directory:

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `make init`        | Complete first-time project setup     |
| `make install`     | Install dependencies and set up hooks |
| `make setup-hooks` | Set up Git hooks using Husky          |
| `make dev`         | Start the development server          |
| `make build`       | Build the app for production          |
| `make lint`        | Run ESLint                            |
| `make format`      | Format code with Prettier             |
| `make type-check`  | Run TypeScript type checking          |
| `make clean`       | Clean build files                     |

> **Tip:** Run `make help` to see all available commands.

## Git Hooks and Code Quality

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to enforce code quality:

- Pre-commit hooks automatically format staged files with Prettier and lint with ESLint.
- Commit messages are validated with Commitlint to follow conventional commit standards.

Make sure to run `npm run prepare` after cloning to install Git hooks.

## Commit Guidelines

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to maintain clear and consistent commit history.

### Commit Types

| Type    | Description              |
| ------- | ------------------------ |
| `feat:` | New features             |
| `fix:`  | Bug fixes                |
| `test:` | Adding or updating tests |

### Example Commit Messages

- `feat: add ambassador dashboard component`
- `fix: resolve authentication issue`
- `docs: update API documentation`
