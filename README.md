# 🐸 Kurbağa - Akıllı Görev Yönetimi Uygulaması

> "En büyük kurbağanı her sabah ye!" - Brian Tracy metodolojisini akıllı algoritmalarla birleştiren üretkenlik asistanı.

## 📋 Proje Hakkında

Kurbağa, kullanıcıların hedeflerini otomatik olarak yönetilebilir, önceliklendirilmiş ve uygulanabilir görev planlarına dönüştüren bir mobil uygulamadır. Brian Tracy'nin "Eat That Frog" kitabındaki 21 stratejiyi AI ile birleştirerek kullanıcılara kişiselleştirilmiş üretkenlik koçluğu sunar.

### ✨ Temel Özellikler

- 🤖 **AI Destekli Hedef Analizi**: Doğal dil ile hedef girişi ve SMART analizi
- 📊 **Akıllı Önceliklendirme**: ABCDE metodolojisi ile otomatik task sıralaması
- 🎯 **Otomatik Görev Ayrıştırma**: Büyük hedefleri 2-saatlik yönetilebilir parçalara bölme
- ⏱️ **Focus Mode**: Pomodoro timer ve dikkat dağılması yönetimi
- 📈 **Adaptif Öğrenme**: Kullanıcı davranışlarını öğrenerek kişiselleştirilmiş öneriler
- 🏆 **Gamification**: XP, seviyeler ve başarı rozetleri ile motivasyon
- 🔍 **Tıkanma Noktası Tespiti**: Ertelenen görevleri otomatik tespit ve çözüm önerileri

## 🏗️ Proje Yapısı

Bu proje Turborepo ile yönetilen bir monorepo'dur:

```
kurbaga-app/
├── apps/
│   ├── backend/          # Node.js + Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── database/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ai-service/       # Python FastAPI Microservice
│       ├── main.py
│       └── requirements.txt
│
├── packages/             # Shared packages (future)
├── turbo.json
└── package.json
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ ve npm 9+
- PostgreSQL 14+
- Python 3.10+ (AI servisi için)
- Git

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd hello-world
```

### 2. Dependencies'leri Kurun

```bash
# Root dependencies
npm install

# Backend dependencies
cd apps/backend
npm install
cd ../..

# AI Service dependencies
cd apps/ai-service
pip install -r requirements.txt
cd ../..
```

### 3. Environment Variables

**Backend (.env)**

```bash
cp apps/backend/.env.example apps/backend/.env
```

`.env` dosyasını düzenleyin:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=kurbaga_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
```

**AI Service (.env)**

```bash
cp apps/ai-service/.env.example apps/ai-service/.env
```

```env
PORT=8000
OPENAI_API_KEY=your_openai_api_key  # Optional for advanced features
```

### 4. Database Setup

PostgreSQL veritabanı oluşturun:

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE kurbaga_db;
\q
```

Migration'ları çalıştırın:

```bash
cd apps/backend
npm run db:migrate
npm run db:seed
cd ../..
```

### 5. Servisleri Başlatın

**Terminal 1 - Backend API:**

```bash
cd apps/backend
npm run dev
```

Backend şu adreste çalışacak: `http://localhost:3000`

**Terminal 2 - AI Service:**

```bash
cd apps/ai-service
python main.py
```

AI servisi şu adreste çalışacak: `http://localhost:8000`

## 🧪 Test Etme

### Health Check

```bash
# Backend
curl http://localhost:3000/health

# AI Service
curl http://localhost:8000/health
```

### Kullanıcı Kaydı

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Hedef Oluşturma

```bash
# Önce login olun ve token alın
TOKEN="your_access_token_here"

# Hedef oluştur
curl -X POST http://localhost:3000/api/v1/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "rawInput": "3 ayda TOEFL sınavında 100 almak istiyorum",
    "useAI": true
  }'
```

## 📚 API Dokümantasyonu

### Backend API Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Yeni kullanıcı kaydı
- `POST /api/v1/auth/login` - Giriş
- `POST /api/v1/auth/refresh` - Token yenileme
- `GET /api/v1/auth/me` - Kullanıcı bilgileri
- `POST /api/v1/auth/logout` - Çıkış

**Goals:**
- `GET /api/v1/goals` - Hedefleri listele
- `POST /api/v1/goals` - Yeni hedef oluştur
- `GET /api/v1/goals/:id` - Hedef detayı
- `PUT /api/v1/goals/:id` - Hedef güncelle
- `DELETE /api/v1/goals/:id` - Hedef sil

**Tasks:**
- `GET /api/v1/tasks` - Görevleri listele
- `POST /api/v1/tasks` - Yeni görev oluştur
- `GET /api/v1/tasks/daily-plan` - Günlük plan
- `GET /api/v1/tasks/:id` - Görev detayı
- `PUT /api/v1/tasks/:id` - Görev güncelle
- `DELETE /api/v1/tasks/:id` - Görev sil
- `PATCH /api/v1/tasks/:id/start` - Görevi başlat
- `PATCH /api/v1/tasks/:id/complete` - Görevi tamamla
- `PATCH /api/v1/tasks/:id/postpone` - Görevi ertele

### AI Service Endpoints

- `POST /ai/v1/nlp/analyze-goal` - Hedef analizi (SMART)
- `POST /ai/v1/planning/decompose` - Görev ayrıştırma
- `POST /ai/v1/prioritize/abcde` - Öncelik hesaplama
- `POST /ai/v1/coach/suggest` - Koçluk önerileri

## 🗄️ Database Schema

Temel tablolar:

- **users** - Kullanıcı bilgileri
- **goals** - Hedefler
- **tasks** - Görevler
- **focus_sessions** - Odaklanma oturumları
- **achievements** - Başarı rozetleri
- **user_achievements** - Kullanıcı başarıları
- **bottlenecks** - Tıkanma noktaları
- **daily_plans** - Günlük planlar

Detaylı schema için: `apps/backend/src/database/schema.sql`

## 🛠️ Teknoloji Stack

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Native pg driver
- **Authentication**: JWT
- **Validation**: Joi

### AI Service
- **Framework**: Python + FastAPI
- **AI/ML**: OpenAI API (optional)
- **Data Processing**: Pydantic

### DevOps (Future)
- Docker & Kubernetes
- GitHub Actions CI/CD
- Monitoring: Sentry + DataDog

## 🎯 Geliştirme Roadmap

### ✅ Phase 1 - MVP (Tamamlandı)
- [x] Monorepo setup
- [x] Backend API (Auth, Goals, Tasks)
- [x] Database schema
- [x] AI microservice temel yapısı
- [x] Temel goal parsing

### 🔄 Phase 2 - Enhanced Intelligence (Devam Ediyor)
- [ ] OpenAI entegrasyonu
- [ ] Gelişmiş önceliklendirme algoritması
- [ ] Tıkanma noktası detektörü
- [ ] Performance analytics
- [ ] Mobile app (React Native)

### 📋 Phase 3 - Social & Collaboration
- [ ] Takım workspace'leri
- [ ] Task delegation
- [ ] Leaderboards
- [ ] Public achievements

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 Lisans

Bu proje özel bir projedir. Dağıtım ve kullanım izni gerektirir.

## 👥 İletişim

**Proje Sahibi**: Çağrı
**Email**: cagri@kurbaga.app

---

## 🐸 Motivasyonel Not

> "En büyük, en çirkin kurbağanızı her sabah ilk iş yeyin. Günün geri kalanı, her şey bundan daha kolay olacağı için hoş geçecektir."
>
> — Brian Tracy

**Şimdi kurbağanızı yemeye başlayın! 🎯**
