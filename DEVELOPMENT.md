# 🛠️ Development Guide

## Development Environment Setup

### Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Python 3.10+ installed (`python --version`)
- [ ] Git configured
- [ ] Code editor (VS Code recommended)

### Initial Setup

1. **Clone and Install**

```bash
git clone <repository-url>
cd kurbaga-app
npm install
```

2. **PostgreSQL Setup**

```bash
# Start PostgreSQL (macOS)
brew services start postgresql@14

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE kurbaga_db;
CREATE USER kurbaga_user WITH PASSWORD 'kurbaga_pass';
GRANT ALL PRIVILEGES ON DATABASE kurbaga_db TO kurbaga_user;
\q
```

3. **Environment Configuration**

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your database credentials

# AI Service
cp apps/ai-service/.env.example apps/ai-service/.env
# Edit apps/ai-service/.env (OpenAI key is optional for now)
```

4. **Database Migration**

```bash
cd apps/backend
npm run db:migrate
npm run db:seed
```

5. **Start Development Servers**

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - AI Service
cd apps/ai-service
python main.py
```

## Project Structure

```
kurbaga-app/
├── apps/
│   ├── backend/                 # Express.js API
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Auth, validation, etc.
│   │   │   ├── database/       # DB connection, migrations
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── utils/          # Helper functions
│   │   │   └── index.ts        # Main server file
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ai-service/             # FastAPI Microservice
│       ├── main.py             # Main FastAPI app
│       ├── requirements.txt
│       └── package.json
│
├── packages/                   # Shared packages (future)
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── README.md
```

## Development Workflow

### Adding a New API Endpoint

1. **Create Controller Method**

```typescript
// apps/backend/src/controllers/yourController.ts
export class YourController {
  async yourMethod(req: AuthRequest, res: Response): Promise<void> {
    // Implementation
  }
}
```

2. **Add Route**

```typescript
// apps/backend/src/routes/your.ts
import { Router } from 'express';
import { YourController } from '../controllers/yourController';

const router = Router();
const controller = new YourController();

router.get('/', controller.yourMethod.bind(controller));

export default router;
```

3. **Register Route in Main Server**

```typescript
// apps/backend/src/index.ts
import yourRoutes from './routes/your';
app.use(`/api/${API_VERSION}/your`, yourRoutes);
```

### Adding a Database Table

1. **Update Schema**

```sql
-- apps/backend/src/database/schema.sql
CREATE TABLE IF NOT EXISTS your_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- your columns
    created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Run Migration**

```bash
cd apps/backend
npm run db:migrate
```

### Testing API Endpoints

**Using cURL:**

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# Create Goal (with token)
curl -X POST http://localhost:3000/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My Goal","description":"Goal description"}'
```

**Using Postman:**

1. Import the collection (create one if needed)
2. Set up environment variables:
   - `BASE_URL`: `http://localhost:3000`
   - `TOKEN`: Your JWT token

## Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/apps/backend/src/index.ts",
      "preLaunchTask": "npm: dev",
      "outFiles": ["${workspaceFolder}/apps/backend/dist/**/*.js"],
      "runtimeExecutable": "tsx",
      "console": "integratedTerminal"
    }
  ]
}
```

### AI Service Debugging

```bash
cd apps/ai-service
# Run with debugger
python -m debugpy --listen 5678 --wait-for-client main.py
```

## Common Issues & Solutions

### Issue: Database connection failed

**Solution:**

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -c "\l" | grep kurbaga_db

# Check .env credentials
cat apps/backend/.env | grep DATABASE
```

### Issue: Port already in use

**Solution:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port in .env
PORT=3001
```

### Issue: JWT token expired

**Solution:**

```bash
# Use refresh token endpoint
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Code Style & Conventions

### TypeScript

- Use `interface` for data structures
- Use `type` for unions/intersections
- Always type function parameters and return values
- Use `async/await` instead of promises

### Naming Conventions

- **Files**: camelCase for files, PascalCase for classes
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database**: snake_case
- **API Routes**: kebab-case

### Commit Messages

Follow conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## Performance Tips

1. **Database Queries**: Always use indexes for frequently queried columns
2. **API Responses**: Limit data returned, use pagination
3. **Caching**: Implement Redis for frequently accessed data
4. **Error Handling**: Always catch and log errors properly

## Next Steps

- [ ] Add unit tests (Jest)
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger)
- [ ] Implement Redis caching
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry)

## Useful Commands

```bash
# Install all dependencies
npm install

# Run backend in dev mode
cd apps/backend && npm run dev

# Run AI service
cd apps/ai-service && python main.py

# Build all apps
npm run build

# Format code
npm run format

# Database commands
cd apps/backend
npm run db:migrate  # Run migrations
npm run db:seed     # Seed database
```

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

Happy Coding! 🐸
