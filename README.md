# pathe-api

## Setup

Make sure you have this before you continue:

- Node
- Yarn
- Postgres

1. Run `yarn` to install the modules
2. Copy `.env.dev` → `.env`
3. Update the variables
4. Generate the types with `yarn prisma:generate`
5. Apply migrations with `yarn prisma:migration`
6. Run the project with `yarn start`

## Database

This project uses Prisma as the ORM. Make sure you've installed the modules with `yarn` before continuing.

### Generating types

Run the following command to generate types based on the `schema.prisma`:

```bash

yarn prisma:generate

```

### Creating and applying migrations

Prisma has one command to create and apply migrations:

```bash

yarn prisma:migration

```

If you have changes in `schema.prisma`, you'll be promted to give a name for your new migrations. After that, the migrations will be applied. If you have no changes, only the pending migrations will be applied.

### Seeding the database

A `seed.ts` file has been creating with upserts to insert or create data. Run this command to seed:

```bash

yarn prisma:seed

```

### Database client

A build in client is available by running:

```bash

yarn prisma:studio

```

This will open `localhost:5555` where you can view the database tables.