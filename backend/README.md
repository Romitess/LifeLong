# Lifelong2 Backend

NestJS backend service for the Lifelong2 project.

## Requirements

- Node.js LTS
- npm
- MySQL

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with your local MySQL credentials, then start the development server:

```bash
npm run start:dev
```

The health endpoint is available at:

```text
GET http://localhost:3000/
```

Swagger UI is available in development mode at:

```text
http://localhost:3000/api/docs
```

## Database

This project uses TypeORM with MySQL. Database schema changes must be made through migrations only.

Generate a migration after changing entities:

```bash
npm run migration:generate -- src/database/migrations/<migration-name>
```

Run pending migrations:

```bash
npm run migration:run
```

Revert the latest migration:

```bash
npm run migration:revert
```

## Quality Checks

Run linting:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Build the project:

```bash
npm run build
```

## Contributing

Follow the standards in [CONTRIBUTING.md](./CONTRIBUTING.md), including modular NestJS structure, TypeScript typing rules, migration-only database changes, and Conventional Commits.
