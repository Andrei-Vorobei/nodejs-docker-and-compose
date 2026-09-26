# КупиПодариДай

Полный стек-проект для сервиса вишлистов «КупиПодариДай» с React frontend, NestJS backend и PostgreSQL. Приложение упаковано в Docker Compose и обслуживается через публичный адрес https://magic-friday.ru.

## Доступы

- Frontend: https://magic-friday.ru

## Архитектура

Проект состоит из трёх основных компонентов:

- `frontend/` — React SPA на базе `create-react-app`, обслуживается через Nginx
- `backend/` — NestJS REST API с JWT, Passport, OAuth через Яндекс и TypeORM
- PostgreSQL — основная база данных, запускается как сервис `db-postgres`

Также в контейнерной топологии есть:

- `adminer` — веб-интерфейс для управления PostgreSQL
- `frontend` и `backend` в сети `KPD-app` для внутренней связи
- `db-postgres` в изолированной внутренней сети `KPD-internal`

## Сервисная структура Docker Compose

```yaml
services:
  backend:
    build: ./backend
    ports: ${BACKEND_PORT}:3001
    env_file: ./backend/.env
    depends_on: db-postgres

  frontend:
    build: ./frontend
    ports: ${FRONTEND_PORT}:80
    depends_on: backend

  db-postgres:
    image: postgres:14-alpine
    env_file: .env
    volumes: KPD-pgdata:${PGDATA}

  adminer:
    image: adminer
    ports: ${ADMINER_PORT}:8080
```

## Технологии

### Frontend

- React 17
- React Router DOM 5
- CRA / react-scripts 5
- Nginx для отдачи собранного приложения

### Backend

- NestJS 9
- TypeScript
- PostgreSQL + TypeORM
- Passport JWT / Local / Yandex OAuth
- class-validator
- Winston logging

## Схема запуска проекта

```text
1. Копируем шаблоны переменных окружения
   cp .env.example .env
   cp backend/.env.example backend/.env

2. Заполняем значения в .env и backend/.env
   - JWT_SECRET
   - YANDEX_CLIENT_ID / YANDEX_CLIENT_SECRET
   - DB_* параметры
   - порты для локального/докер запуска

3. Поднимаем контейнеры
   docker compose up --build -d

4. Проверяем состояние сервисов
   docker compose ps
   docker compose logs -f backend frontend db-postgres

5. Открываем приложение через публичный адрес
   https://magic-friday.ru
```

## Переменные окружения

### Корневой `.env` (шаблон)

```dotenv
# Порты приложений
BACKEND_PORT=3001
FRONTEND_PORT=80
ADMINER_PORT=8080

# PostgreSQL
POSTGRES_HOST=db-postgres
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
PGDATA=/var/lib/postgresql/data
```

### Backend `backend/.env` (шаблон)

```dotenv
JWT_SECRET=change_me
YANDEX_CLIENT_ID=
YANDEX_CLIENT_SECRET=
YANDEX_REDIRECT_URI=http://localhost:3001/oauth/yandex/callback

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=change_me
DB_DATABASE=kupipodariday
```

> Для запуска в Docker используйте `DB_HOST=db-postgres`. Для локальной разработки обычно подходит `localhost`.

## Структура проекта

```text
.
├── backend/                  # NestJS API
│   ├── src/                 # исходники приложения
│   ├── .env                 # локальные переменные backend
│   ├── Dockerfile.pub       # контейнер backend
│   ├── package.json         # зависимости и скрипты backend
│   └── README.md            # документация по API и запуску backend
├── frontend/                # React клиент
│   ├── src/                 # компоненты, страницы, API-клиент
│   ├── nginx/              # конфиг Nginx для production build
│   ├── Dockerfile.pub       # контейнер frontend
│   ├── package.json         # зависимости и скрипты frontend
│   └── README.md            # документация по frontend
├── .env                     # переменные контейнеров PostgreSQL и портов
├── docker-compose.yml      # контейнерная оркестрация
├── README.md                # общая документация проекта
└── .env.example             # шаблон root env
```

## Полезные команды

```bash
# Запуск контейнеров
 docker compose up -d

# Пересборка
 docker compose up --build -d

# Просмотр логов
 docker compose logs -f backend
 docker compose logs -f frontend

# Остановка
 docker compose down

# Проверка контейнеров
 docker compose ps
```

## Документация по модулям

- [backend/README.md](backend/README.md) — описание API, auth, DTO, запуск и команды backend
- [frontend/README.md](frontend/README.md) — описание frontend-части и работы с UI

## Основные возможности

- регистрация и авторизация пользователей
- управление профилями
- CRUD для желаний
- создание и редактирование вишлистов
- внесение взносов на желания
- OAuth вход через Яндекс
- защитa маршрутов через JWT
- логирование ошибок в JSON и запись `error.log`

## Примечание по продакшен-среде

Проект настроен под production-сборку: frontend собирается и отдаётся Nginx, backend запускается как Node-процесс внутри контейнера, а база данных хранится в named volume `KPD-pgdata`.