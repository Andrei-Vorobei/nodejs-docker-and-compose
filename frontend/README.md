# Фронтенд КупиПодариДай

React-приложение пользовательского интерфейса сервиса вишлистов «КупиПодариДай». Клиент общается с backend через HTTP API и использует JWT-токен, хранящийся в `sessionStorage`.

## Публичный адрес

- https://magic-friday.ru

## Схема запуска

```text
1. Скопировать шаблоны переменных окружения
   cp .env.example .env
   cp backend/.env.example backend/.env

2. Подставить корректные значения в .env и backend/.env

3. Запустить контейнеры
   docker compose up --build -d

4. Открыть проект по адресу
   https://magic-friday.ru
```

## Шаблон окружения

```dotenv
# Корневой .env
BACKEND_PORT=3001
FRONTEND_PORT=80
ADMINER_PORT=8080

POSTGRES_HOST=db-postgres
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
PGDATA=/var/lib/postgresql/data
```

```dotenv
# backend/.env
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

## Технологии

- React 17
- React Router DOM 5
- Create React App
- Nginx в production-сборке

## Как работает

- SPA загружается через Nginx
- все запросы к API идут по пути `/api`
- в production конфигурации Nginx проксирует `/api/*` на сервис `backend:3001`
- после входа токен сохраняется в `sessionStorage` и отправляется в `Authorization: Bearer ...`

## Запуск локально

1. Установите зависимости:

```bash
npm install
```

2. Запустите dev-режим:

```bash
npm start
```

Приложение будет доступно по адресу:

```text
http://localhost:3000
```

## Сборка production

```bash
npm run build
```

После сборки файлы будут лежать в папке `build/` и могут раздаваться через Nginx.

## Основной API-контракт

Frontend использует следующие базовые маршруты через `URL = "/api"`:

- `POST /auth/signup`
- `POST /auth/signin`
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/:username`
- `POST /users/find`
- `GET /wishes/last`
- `GET /wishes/top`
- `GET /wishes/:id`
- `POST /wishes`
- `PATCH /wishes/:id`
- `DELETE /wishes/:id`
- `POST /wishlists`
- `GET /wishlists`
- `POST /offers`

## Структура frontend

```text
src/
  components/       UI-компоненты и страницы
  utils/            константы, API-клиент, helpers
  images/           статические ресурсы
  index.js          точка входа приложения
  index.css         глобальные стили
```

## Проверка работы в Docker

Из корня проекта:

```bash
docker compose up --build -d
```

Frontend доступен на:

```text
http://localhost:8081
```

Для полного стека также запущены backend и PostgreSQL, а Nginx внутри frontend контейнера маршрутизирует REST-запросы к backend.


