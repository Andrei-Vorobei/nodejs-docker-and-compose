# КупиПодариДай Backend

Backend сервиса вишлистов «КупиПодариДай». Приложение построено на NestJS,
хранит данные в PostgreSQL и предоставляет REST API для пользователей,
желаний, вишлистов и денежных взносов.

## Стек

- Node.js и TypeScript
- NestJS 9
- PostgreSQL и TypeORM
- Passport: JWT, локальная авторизация и OAuth Яндекса
- class-validator и Winston

## Требования

- Node.js 16 или новее
- npm 10 или совместимый npm
- PostgreSQL 12 или новее

## Установка и запуск

1. Установите зависимости:

	```bash
	npm install
	```

2. Создайте файл `.env` в корне проекта:

	```dotenv
	DB_HOST=localhost
	DB_PORT=5432
	DB_USERNAME=postgres
	DB_PASSWORD=postgres
	DB_DATABASE=kupipodariday

	JWT_SECRET=replace-with-a-long-random-secret

	# Нужно только для входа через Яндекс
	YANDEX_CLIENT_ID=your-client-id
	YANDEX_CLIENT_SECRET=your-client-secret
	YANDEX_REDIRECT_URI=http://localhost:3001/oauth/yandex/callback
	```

3. Создайте базу данных `kupipodariday` в PostgreSQL и запустите приложение:

	```bash
	npm run start:dev
	```

API будет доступен по адресу `http://localhost:3001`.

В текущем режиме запуска TypeORM использует `synchronize: true` и создает или
обновляет таблицы автоматически. Для миграций DataSource в `ormconfig.ts`
настроен с `synchronize: false`.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run start` | Запуск приложения |
| `npm run start:dev` | Запуск в режиме наблюдения |
| `npm run start:prod` | Запуск собранного приложения |
| `npm run build` | Сборка в `dist/` |
| `npm run lint` | Проверка ESLint |
| `npm run lint:fix` | Исправление ошибок ESLint |
| `npm test` | Запуск unit-тестов |
| `npm run test:e2e` | Запуск end-to-end тестов |
| `npm run migrate:generate -- MigrationName` | Генерация миграции |
| `npm run migrate:up` | Применение миграций |
| `npm run migrate:down` | Откат последней миграции |

## Авторизация

После `POST /auth/signin` или OAuth-входа API возвращает JWT:

```json
{
	"access_token": "eyJ..."
}
```

Передавайте токен в защищенные запросы заголовком:

```http
Authorization: Bearer <access_token>
```

Токен действует 1 час. Локальные пользователи регистрируются через
`POST /auth/signup`, OAuth-вход выполняется через редирект на
`GET /oauth/yandex`.

## REST API

Все пути указаны относительно `http://localhost:3001`. Защищенные маршруты
требуют JWT, если не указано иное.

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
| `GET` | `/users/me` | Получить свой профиль |
| `PATCH` | `/users/me` | Обновить свой профиль |
| `GET` | `/users/me/wishes` | Получить свои желания |
| `GET` | `/users/:username` | Получить публичный профиль |
| `GET` | `/users/:username/wishes` | Получить желания пользователя |
| `POST` | `/users/find` | Найти пользователей по `query` |

### Wishes

| Метод | Путь | JWT | Назначение |
| --- | --- | --- | --- |
| `GET` | `/wishes/last` | Нет | Последние 40 желаний |
| `GET` | `/wishes/top` | Нет | Популярные желания |
| `GET` | `/wishes/:id` | Да | Получить желание |
| `POST` | `/wishes` | Да | Создать желание |
| `POST` | `/wishes/:id/copy` | Да | Скопировать желание |
| `PATCH` | `/wishes/:id` | Да | Обновить свое желание |
| `DELETE` | `/wishes/:id` | Да | Удалить свое желание |

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
| `GET` | `/wishlists` | Получить все вишлисты |
| `GET` | `/wishlists/:id` | Получить вишлист |
| `POST` | `/wishlists` | Создать вишлист |
| `PATCH` | `/wishlists/:id` | Обновить свой вишлист |
| `DELETE` | `/wishlists/:id` | Удалить свой вишлист |

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
| `GET` | `/offers` | Получить доступные пользователю взносы |
| `GET` | `/offers/:id` | Получить взнос |
| `POST` | `/offers` | Сделать взнос за чужое желание |

Тело `POST /offers`:

```json
{
	"itemId": 1,
	"amount": 1500,
	"hidden": false
}
```

Нельзя сделать взнос за собственное желание, превысить оставшуюся сумму или
внести деньги после полного сбора.

## Валидация и данные

Для всех входящих DTO включена строгая валидация: неизвестные поля приводят к
ошибке `400 Bad Request`, а допустимые типы преобразуются автоматически.
Пароли, email и идентификатор Яндекса не возвращаются в публичных профилях.

Ошибки пишутся в консоль в JSON-формате, ошибки уровня `error` дополнительно
сохраняются в `error.log`.

## Структура проекта

```text
src/
	auth/       JWT, локальная авторизация и OAuth Яндекса
	users/      пользователи и профили
	wishes/     желания
	wishlists/  подборки желаний
	offers/     денежные взносы
	filter/     глобальный фильтр исключений
	main.ts     запуск приложения и глобальные middleware
```
