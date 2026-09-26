# Backend КупиПодариДай

REST API сервиса вишлистов на NestJS 9, TypeScript, PostgreSQL 14 и TypeORM. Backend слушает порт `3001`; в Docker Compose он публикуется на `${BACKEND_PORT}`.

## Требования

- Node.js 24 для Docker-образа; для локальной разработки используйте совместимую актуальную LTS-версию.
- npm и PostgreSQL 12+ для запуска без Compose.
- Docker Desktop с Docker Compose v2 для контейнерного запуска.

## Конфигурация

Скопируйте [`.env.example`](.env.example) в `.env`. Для Compose используйте:

```dotenv
JWT_SECRET=длинный-случайный-секрет
YANDEX_CLIENT_ID=
YANDEX_CLIENT_SECRET=
YANDEX_REDIRECT_URI=https://example.com/oauth/yandex/callback
DB_HOST=db-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=пароль-из-root-env
DB_DATABASE=postgres
```

`DB_USERNAME`, `DB_PASSWORD` и `DB_DATABASE` должны совпадать с `POSTGRES_USER`, `POSTGRES_PASSWORD` и `POSTGRES_DB` из root `.env`. Для локального PostgreSQL замените `DB_HOST` на `localhost` и укажите локальные учетные данные.

Не публикуйте `.env`, JWT secret или OAuth secret в репозитории и логах. Для production callback Яндекса должен быть HTTPS и точно совпадать с зарегистрированным URI.

## Запуск через Docker

Из корня репозитория:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
# отредактируйте оба файла
docker compose config
docker compose up --build -d backend db-postgres
docker compose logs -f backend
```

Остановить backend и базу без удаления данных:

```powershell
docker compose stop backend db-postgres
```

## Локальный запуск

```powershell
npm ci
npm run start:dev
```

API будет доступно на `http://localhost:3001`. Production-подобная сборка:

```powershell
npm run build
npm run start:prod
```

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run start:dev` | запуск с watch |
| `npm run build` | сборка в `dist/` |
| `npm run start:prod` | запуск собранного приложения |
| `npm run lint` | проверка ESLint |
| `npm test` | unit-тесты |
| `npm run test:cov` | тесты с coverage |
| `npm run test:e2e` | e2e-тесты, если присутствует конфигурация `test/` |
| `npm run migrate:up` | применение миграций TypeORM |
| `npm run migrate:down` | откат последней миграции |

## API

Все защищенные маршруты требуют заголовок:

```http
Authorization: Bearer <access_token>
```

### Авторизация

| Метод | Путь | JWT | Назначение |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Нет | регистрация |
| `POST` | `/auth/signin` | Нет | вход по логину и паролю |
| `GET` | `/oauth/yandex` | Нет | начало OAuth Яндекса |
| `GET` | `/oauth/yandex/callback` | Нет | OAuth callback |

### Ресурсы

| Ресурс | Открытые операции | Защищенные операции |
| --- | --- | --- |
| Users | `GET /users/:username`, `GET /users/:username/wishes`, `POST /users/find` | `/users/me` и `/users/me/wishes` |
| Wishes | `GET /wishes/last`, `GET /wishes/top` | CRUD, copy |
| Wishlists | нет | CRUD |
| Offers | нет | `GET`, `POST` и `GET /offers/:id` |

Пример тела создания желания:

```json
{
  "name": "Электронная книга",
  "link": "https://example.com/reader",
  "image": "https://example.com/reader.jpg",
  "price": 25000,
  "description": "Для чтения в поездках"
}
```

Входные DTO проверяются глобальным `ValidationPipe`: лишние поля отклоняются с `400 Bad Request`. Ошибки логируются в JSON в stdout; ошибки уровня `error` дополнительно записываются в `error.log` внутри контейнера.

## Структура

```text
src/
├── auth/       # JWT, local и Yandex OAuth
├── users/      # пользователи и профили
├── wishes/     # желания
├── wishlists/  # подборки желаний
├── offers/     # взносы
├── filter/     # глобальный exception filter
├── app.module.ts
└── main.ts
```

TypeORM runtime сейчас использует `synchronize: true`. Перед production-изменениями схемы проверьте миграционный процесс и не полагайтесь на автоматическую синхронизацию как на замену backup/rollback стратегии.
