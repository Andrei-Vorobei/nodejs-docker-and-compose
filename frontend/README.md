# Frontend КупиПодариДай

React 17 SPA сервиса вишлистов. В production frontend собирается в статические файлы и обслуживается Nginx; запросы `/api/*` проксируются к backend.

## Требования

- Node.js 24 для Docker-сборки; для локальной разработки используйте совместимую актуальную LTS-версию.
- npm.
- Docker Desktop с Docker Compose v2 для полного стека.

## Локальная разработка

```powershell
npm ci
npm start
```

Dev server доступен на `http://localhost:3000`. Команда `npm start` запускает Create React App в watch-режиме.

Проверка тестов:

```powershell
npm test -- --watchAll=false
```

## Production-сборка

```powershell
npm ci
npm run build
```

Результат находится в `build/`. Dockerfile копирует его в Nginx и использует конфигурацию [nginx/conf.d/default.conf](nginx/conf.d/default.conf). Локальный Docker frontend запускается из корня репозитория:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
docker compose up --build -d frontend backend db-postgres
```

Откройте `http://localhost:${FRONTEND_PORT}`. Значение порта берется из root `.env`; в шаблоне репозитория это `2222`, а не фиксированный `8081`.

## Работа с API

Клиент использует базовый путь `/api` и передает JWT в заголовке `Authorization: Bearer ...`. Токен хранится в `sessionStorage` и удаляется при завершении сессии браузера.

Основные операции:

- `POST /api/auth/signup` и `POST /api/auth/signin`
- `GET` и `PATCH /api/users/me`
- `GET /api/wishes/last`, `GET /api/wishes/top`
- CRUD `/api/wishes`
- CRUD `/api/wishlists`
- `GET` и `POST /api/offers`

В dev-режиме проверьте, что API доступно на `http://localhost:3001` и что используемый API base URL соответствует настройкам клиента. В Docker proxy обращается к имени сервиса `backend`, а не к `localhost`.

## Структура

```text
src/
├── components/   # страницы и UI-компоненты
├── utils/        # API-клиент, контекст и helpers
├── images/       # статические ресурсы
├── fonts/        # шрифты
├── index.js      # точка входа
└── index.css     # глобальные стили
```

## Эксплуатация

```powershell
docker compose logs -f frontend
docker compose restart frontend
docker compose down
```

Перед публикацией проверьте production build, маршрутизацию SPA после прямого перехода на URL и запросы `/api`. Публичный адрес развернутого окружения: [https://magic-friday.ru](https://magic-friday.ru).
