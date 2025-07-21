# Database Migrations

## update-game-slug-index.ts

This migration updates the game slug uniqueness constraint from being globally unique to being unique per user.

### What it does:
1. Drops the old unique index on the `slug` field
2. Creates a new compound unique index on `user` + `slug`
3. Fixes any existing duplicate slugs per user by appending a number

### Running the migration:

```bash
# From the server directory
npx ts-node src/migrations/update-game-slug-index.ts

# Or compile and run
npx tsc src/migrations/update-game-slug-index.ts
node src/migrations/update-game-slug-index.js
```

### Important:
- Make sure to backup your database before running this migration
- Update the MongoDB connection string in the script if needed
- This migration is idempotent - it can be run multiple times safely