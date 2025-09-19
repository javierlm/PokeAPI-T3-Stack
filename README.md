# PokeAPI Next.js App

T3 Stack app for querying the PokeAPI.

## Prerequisites
You need to create an ".env" file in the root of the project. You can use this content as a template:

```ini
# Next Auth
# You can generate a new secret on the command line with:
# npx auth secret
# https://next-auth.js.org/configuration/options#secret
AUTH_SECRET="topsecretpassword"
# Next Auth Discord Provider
AUTH_DISCORD_ID=""
AUTH_DISCORD_SECRET=""

# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
DATABASE_URL="postgresql://postgres:password@localhost:5432/poketest"
```

## How to execute locally

The project uses pnpm, but you can use npm or yarn, depending on your setup. To install dependencies in local
```bash
pnpm install
```

To run the app
```bash
pnpm run dev
```

Building the app for production
```bash
pnpm run build
```

## Execute with Docker Compose (you need to build it too)
```bash
docker-compose up --build
```

Once the app is builded, you can use only the following command to execute other times:

```bash
docker-compose up
```

### Execute in background
```bash
docker-compose up -d --build
```

### Stop services
```bash
docker-compose down
```

