# КупиПодариДай Backend

Backend сервиса вишлистов «КупиПодариДай» построен на NestJS, хранит данные в PostgreSQL и предоставляет REST API для пользователей, желаний, вишлистов и денежных взносов.

## Стек

- Node.js 16+
- TypeScript
- NestJS 9
- PostgreSQL 14 + TypeORM
- Passport: JWT, local strategy, Yandex OAuth
- class-validator, Winston

## Требования

- Node.js 16 или новее
- npm 10 или совместимый пакетный менеджер
- PostgreSQL 12+ для локального запуска
- Docker и Docker Compose для контейнерного запуска

## Конфигурация окружения

Создайте файл `backend/.env` в корне backend-модуля по шаблону ниже:

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

Для запуска через Docker Compose используйте значения для контейнерной сети:

```dotenv
DB_HOST=db-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=change_me
DB_DATABASE=postgres
```

## Запуск локально

1. Установите зависимости:

```bash
npm install
```

2. Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE kupipodariday;
```

3. Запустите приложение в режиме разработки:

```bash
npm run start:dev
```

API будет доступно по адресу:

```text
http://localhost:3001
```

## Запуск через Docker

Из корня проекта:

```bash
docker compose up --build -d
```

Публичный адрес приложения:

```text
https://magic-friday.ru
```

> Для локального окружения используйте локальные адреса, которые задаются в переменных окружения и `docker-compose.yml`.

## Команды проекта

| Команда | Назначение |
| --- | --- |
| `npm run start` | запуск приложения |
| `npm run start:dev` | запуск в режиме watch |
| `npm run start:debug` | запуск в режиме отладки |
| `npm run build` | сборка в `dist/` |
| `npm run lint` | проверка ESLint |
| `npm run lint:fix` | автоисправление ESLint |
| `npm test` | запуск unit-тестов |
| `npm run test:e2e` | запуск e2e тестов |
| `npm run typeorm` | CLI для TypeORM |
| `npm run migrate:generate -- MigrationName` | генерация миграции |
| `npm run migrate:create -- MigrationName` | создание миграции |
| `npm run migrate:up` | применение миграций |
| `npm run migrate:down` | откат последней миграции |

## Авторизация

После `POST /auth/signin` или OAuth-входа API возвращает JWT:

```json
{
  "access_token": "eyJ..."
}
```

Используйте токен в заголовке:

```http
Authorization: Bearer <access_token>
```

Токен действует 1 час. Регистрация локальных пользователей осуществляется через `POST /auth/signup`, OAuth-авторизация запускается по `GET /oauth/yandex`.

## REST API

Все пути ниже указаны относительно `http://localhost:3001` или проксируемого хоста. Защищённые маршруты требуют JWT, если не оговорено другое.

### Auth

| Метод | Путь | JWT | Назначение |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Нет | Регистрация пользователя |
| `POST` | `/auth/signin` | Нет | Вход по `username` и `password` |
| `GET` | `/oauth/yandex` | Нет | Начало OAuth-входа через Яндекс |
| `GET` | `/oauth/yandex/callback` | Нет | Callback OAuth, возвращает JWT |

Пример регистрации:

```json
{
  "username": "anna",
  "email": "anna@example.com",
  "password": "strong-password",
  "about": "Люблю книги",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Users

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/users/me` | получить свой профиль |
| `PATCH` | `/users/me` | обновить профиль |
| `GET` | `/users/me/wishes` | получить свои желания |
| `GET` | `/users/:username` | получить публичный профиль |
| `GET` | `/users/:username/wishes` | получить желания пользователя |
| `POST` | `/users/find` | найти пользователей по `query` |

### Wishes

| Метод | Путь | JWT | Назначение |
| --- | --- | --- | --- |
| `GET` | `/wishes/last` | Нет | последние 40 желаний |
| `GET` | `/wishes/top` | Нет | популярные желания |
| `GET` | `/wishes/:id` | Да | получить желание |
| `POST` | `/wishes` | Да | создать желание |
| `POST` | `/wishes/:id/copy` | Да | скопировать желание |
| `PATCH` | `/wishes/:id` | Да | обновить свое желание |
| `DELETE` | `/wishes/:id` | Да | удалить свое желание |

Тело `POST /wishes`:

```json
{
  "name": "Электронная книга",
  "link": "https://example.com/reader",
  "image": "https://example.com/reader.jpg",
  "price": 25000,
  "description": "Для чтения в поездках"
}
```

### Wishlists

Все маршруты раздела требуют JWT.

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/wishlists` | получить все вишлисты |
| `GET` | `/wishlists/:id` | получить вишлист |
| `POST` | `/wishlists` | создать вишлист |
| `PATCH` | `/wishlists/:id` | обновить свой вишлист |
| `DELETE` | `/wishlists/:id` | удалить свой вишлист |

Тело `POST /wishlists`:

```json
{
  "name": "Идеи к дню рождения",
  "image": "https://example.com/birthday.jpg",
  "itemsId": [1, 2, 3]
}
```

### Offers

Все маршруты раздела требуют JWT.

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/offers` | получить доступные пользователю взносы |
| `GET` | `/offers/:id` | получить взнос |
| `POST` | `/offers` | сделать взнос за чужое желание |

Тело `POST /offers`:

```json
{
  "itemId": 1,
  "amount": 1500,
  "hidden": false
}
```

Логика ограничений включает проверку, что нельзя сделать взнос за своё желание, перебрать доступную сумму или внести средства после полного сбора.

## Валидация данных и логирование

- все входящие DTO проходят строгую валидацию
- неизвестные поля приводят к ошибке `400 Bad Request`
- допустимые типы автоматически приводятся к нужному формату
- пароли, email и Yandex ID не возвращаются в публичных профилях
- ошибки логируются в JSON-формате в консоль, а ошибки уровня `error` сохраняются в `error.log`

## Структура backend-проекта

```text
src/
  auth/       JWT, локальная авторизация и OAuth Яндекс
  users/      пользователи, профили и бизнес-логика
  wishes/     желания пользователей
  wishlists/  подборки желаний
  offers/     денежные взносы
  filter/     глобальный фильтр исключений
  main.ts     запуск приложения и глобальные middleware
```

## Дополнительно

- `ormconfig.ts` используется для TypeORM CLI
- `synchronize: true` включён в runtime-configuration, поэтому таблицы создаются автоматически во время запуска
- `ConfigModule` читает переменные из `.env` глобально для всего приложения

