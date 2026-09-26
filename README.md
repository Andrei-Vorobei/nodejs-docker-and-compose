# КупиПодариДай

Полный стек сервиса вишлистов: React-клиент, NestJS API и PostgreSQL. Локальный запуск выполняется через Docker Compose; production-сборка frontend отдается Nginx, backend работает в контейнере Node.js.

## Содержание

- [Архитектура](#архитектура)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [Проверка и эксплуатация](#проверка-и-эксплуатация)
- [Локальная разработка](#локальная-разработка)
- [Структура](#структура)
- [Документация модулей](#документация-модулей)

## Архитектура

| Сервис | Назначение | Внутренний порт | Публикуемый порт |
| --- | --- | ---: | ---: |
| `frontend` | React SPA и reverse proxy Nginx | 80 | `${FRONTEND_PORT}` |
| `backend` | REST API на NestJS | 3001 | `${BACKEND_PORT}` |
| `db-postgres` | PostgreSQL 14 | 5432 | не публикуется |
| `adminer` | Администрирование PostgreSQL | 8080 | `${ADMINER_PORT}` |

Сервисы `backend` и `db-postgres` находятся во внутренней сети. Frontend подключен к frontend-сети и проксирует запросы `/api/*` к `backend:3001`.

## Быстрый старт

Требования: Docker Desktop с Docker Compose v2 и доступ к Docker Hub.

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

Перед запуском измените как минимум `POSTGRES_PASSWORD`, `DB_PASSWORD` и `JWT_SECRET`. Для Docker в `backend/.env` задайте `DB_HOST=db-postgres`, а значения `DB_USERNAME`, `DB_PASSWORD` и `DB_DATABASE` должны соответствовать root `.env`.

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

После запуска откройте `http://localhost:${FRONTEND_PORT}`. Фактический порт берется из `.env`; для шаблона репозитория это `2222`. Adminer доступен на `http://localhost:${ADMINER_PORT}`.

## Конфигурация

Шаблоны конфигурации находятся в [.env.example](.env.example) и [backend/.env.example](backend/.env.example). Не добавляйте реальные `.env` в Git.

### Root `.env`

| Переменная | Назначение |
| --- | --- |
| `BACKEND_PORT` | порт API на хосте |
| `FRONTEND_PORT` | порт frontend на хосте |
| `ADMINER_PORT` | порт Adminer на хосте |
| `POSTGRES_DB` | база PostgreSQL |
| `POSTGRES_USER` | пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | пароль PostgreSQL |
| `PGDATA` | каталог данных внутри контейнера |

### `backend/.env`

| Переменная | Назначение |
| --- | --- |
| `JWT_SECRET` | секрет подписи JWT; используйте длинное случайное значение |
| `YANDEX_CLIENT_ID` / `YANDEX_CLIENT_SECRET` | учетные данные OAuth Яндекса |
| `YANDEX_REDIRECT_URI` | callback, зарегистрированный в приложении Яндекса |
| `DB_HOST` / `DB_PORT` | адрес и порт PostgreSQL; в Compose это `db-postgres` и `5432` |
| `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | учетные данные базы |

В production OAuth callback должен использовать публичный HTTPS-адрес. Секреты передавайте через защищенное хранилище или секреты CI/CD.

## Проверка и эксплуатация

```powershell
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db-postgres
docker compose down
```

`docker compose down` не удаляет named volume `KPD-pgdata`. Команда `docker compose down -v` удаляет volume и данные базы. Volume не заменяет резервное копирование. Adminer не следует публиковать в интернет без дополнительной защиты.

## Локальная разработка

Backend:

```powershell
cd backend
npm ci
npm run start:dev
```

Frontend в отдельном терминале:

```powershell
cd frontend
npm ci
npm start
```

Backend слушает `http://localhost:3001`, frontend dev server — `http://localhost:3000`. Для локального backend нужен PostgreSQL и `backend/.env` с `DB_HOST=localhost`.

## Структура

```text
.
├── backend/            # NestJS API, TypeORM и авторизация
├── frontend/           # React SPA и конфигурация Nginx
├── docker-compose.yml  # контейнерная топология
├── .env.example        # шаблон переменных Compose/PostgreSQL
└── README.md           # документация проекта
```

## Документация модулей

- [backend/README.md](backend/README.md) — API, авторизация, миграции и команды backend
- [frontend/README.md](frontend/README.md) — сборка, dev server и интеграция с API

Публичный адрес развернутого окружения: [https://magic-friday.ru](https://magic-friday.ru).
