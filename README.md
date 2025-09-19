# PokeAPI Next.js App

T3 Stack app for querying the PokeAPI.

## How to execute locally

The project uses pnpm. To install dependencies in local
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

