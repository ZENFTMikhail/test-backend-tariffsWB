# Интеграция с тарифами Wildberries и Google Sheets

## Описание
Для работы с Google таблицами необходимо выполнить следующие шаги:

## 1. Клонировать репозиторий

```bash
git clone https://github.com/ZENFTMikhail/test-backend-tariffsWB.git
cd test-backend-tariffsWB/
```
## 2. Настройка переменных окружения

Создайте файл .env из примера:

```bash
cp example.env .env
```
Отредактируйте .env, указав ваш API ключ Wildberries:

## 3. Настройка Google Sheets API

Создайте в корневой директории проекта файл credentials.json и заполните его данными из моего сообщения.

## 4. Запуск приложения

```bash
docker compose up -d
```

# Работа сервиса

При первом запуске автоматически создаются идентификаторы Google таблиц в БД через seed-файлы для:
12inYwdJZ-468dQj2lXQgYJNpD6qgCjf72SR3RmetEYA - Основная таблица
1OquDVeai6429XjtPMtZFqYkR9BPLB3-fOvpmdecyfq8 - Тестовая таблица

Сервис обновляет тарифы в базе данных каждый час
Один раз в день происходит автоматическое обновление данных в Google таблицах

## Добавление новых таблиц

При желании можно добавить новые Google таблицы с помощью curl-запроса:

```bash
curl -X POST localhost:5005/sheets/add \
  -H "Content-Type: application/json" \
  -d '{"sheetId": "ID_НОВОЙ_ТАБЛИЦЫ", "name": "Название таблицы"}'
```
Где:
sheetId - идентификатор новой Google таблицы
name - название таблицы (для удобства)
Важно: При создании новой таблицы необходимо предоставить доступ редактора для email сервисного аккаунта (client_email), который находится в файле credentials.json.

