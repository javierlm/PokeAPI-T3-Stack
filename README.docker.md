# Docker Deployment

## Commands

### Build and execute the app
```bash
docker-compose up --build
```

### Execute in background
```bash
docker-compose up -d --build
```

### Stop services
```bash
docker-compose down
```

### Stop and delete volumes (⚠️ it erases database)
```bash
docker-compose down -v
```

## Services included

- **app**: Aplicación Next.js (puerto 3000)
- **postgres**: Base de datos PostgreSQL (puerto 5432)

```bash
# Enter into the container shell
docker-compose exec app sh

# Execute migrations (inside container)
npx prisma migrate deploy

# Generate and apply schema changes
npx prisma db push
```

## Access

- Application will be on http://localhost:3000
- Database: localhost:5432 (user: postgres, password: password)
