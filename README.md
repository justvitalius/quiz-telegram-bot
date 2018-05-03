[![Build Status](https://travis-ci.org/justVitalius/quiz-telegram-bot.svg?branch=master)](https://travis-ci.org/justVitalius/quiz-telegram-bot)
![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)

# Quiz Telegram Bot

## Геймификация

* Вопросы представить вопросы по категориям: javascript, angular, jest, vue, webpack, enzyme, typescript, flow
* Вопросов должно быть создано с запасом, чтобы была некая рандомность
* Пользователь должен ответить на Nx вопросов по каждой категории
* Кол-во Nx определяется по каждой категории в отдельности. И записывается во время миграции вопросов.
* При получении ответа от Игрока сразу высчитываем «правильность» и сохраняем в БД
* В Игроке нужно хранить статус «в очереди на отправку» или «ожидает новый вопрос» чтобы проще было фильтровать пользователей, которые ждут вопрос
* В каждом пользователе нужно хранить дату смены статуса, чтобы по ней делать выборку. Так можно спамить не более Y раз в Z минут. И находить пользователей, сообщения которых висят в очереди.
* Пока пользователь не ответит, не присылать ему новый вопрос
* Есть некий дедлайн, после которого не высылаются вопросы игроку
* Нельзя завершить тест в любой момент. Тест считается завершенным, когда получены ответы на все вопросы
* Один и тот же игрок может играть оба дня. И при этом его статистика должна делиться
* HR определяют победителя по статистике ответов по каждому игроку
* Никаких шуток в боте
* Стараемся делать вопросы с ответами в виде кнопок, радиобатонов, чекбоксов
* Вопросы идут один за одним

## Статусная модель пользователя

new -> waiting-questions -> with-question -> end

## Экшены

Каждый экшен должен возврщать промис с объектом типа

```
{
    message: {
        id, // id чата
        msg, // текст сообщения (вопроса)
        replies // массив возможных ответов (кнопки)
    }
    gamer: <найденый пользователь в БД>
}
```

## Опросники по javascript

* [https://www.javatpoint.com/javascript-quiz](https://www.javatpoint.com/javascript-quiz)
* [http://davidshariff.com/js-quiz/](http://davidshariff.com/js-quiz/)
* [https://learn.javascript.ru/quiz](https://learn.javascript.ru/quiz)
* [http://perfectionkills.com/javascript-quiz/](http://perfectionkills.com/javascript-quiz/)
* [https://www.w3schools.com/quiztest/quiztest.asp?qtest=JavaScript](https://www.w3schools.com/quiztest/quiztest.asp?qtest=JavaScript)

# Как начать

## MongoDB

```
// Установка монги
docker pull mongo

// Старт монги
docker run -d -p 27017:27017 -v ~/mongo_data:/data/db mongo
```

## Redis

```
// Установка редиса
docker pull redis

// Старт редиса
docker run -d -p 6379:6379 redis
```

## Подготовка конфига

* Создать файл `config/development.json`
* Скопировать из `config/default.json` те атрибуты, которые нужно переопределить. И заполнить их значениями

## Миграция данных

Для миграции в составе репозитория присутствует мигратор. Для запуска необходим файл `js` с вопросами в формате

```
{
    q: 'вопрос',
    a: [
      'вариант ответа 1',
      'вариант ответа 2',
      ...
    ],
    v: 'правильный ответ',
    c: 'категория вопроса'
  },
```

Далее в терминале выполнить `npm run migrator -- -f path-to-questionnaires.js`. Чтобы удалить существующие вопросы, нужно выполнить с флагом `--force`, например: `npm run migrator -- --force -f path-to-questionnaires.js`.
Для вывода всех возможных свойств мигратора выполнить `npm run migrator -- --help`

## Запуск приложения

Чтобы запустить приложение с development.json конфигом, нужно выполнить `npm start` или `npm run bot:development`.
Для запуска api-сервера статистики необходимо выполнить `npm run api:development`.

Для продакшн режима созданы похожие команды `npm run bot:production` и `npm run api:production`.

Чтобы стартовало приложение в режиме с испольхованием webhook необходимо локально:

1.  Скачать утилиту https://ngrok.com/download - это локальный ssl туннель
    Зарегистрироваться, прописать authtoken, стартовать ngrok
    Из полученного при старте вывода скопировать ссылку вида

```
https://d39febbf.ngrok.io
```

2.  В локальном файле конфигурации в папке сщташп (development.js, prealpha.js, production.js, default.js - любом, какой есть)
    прописать в поле url полученную ссылку
3.  Стартовать бота

При деплое в ansible в config файле, на основе которого создается файл prealpha.js, production.js - vitaly_test_config.js например
в репозитории https://bitbucket.org/sbertechspb/configs/src требуется добавить также поле url

Пример файла development.js, при котором происходит успешный старт

```
module.exports = {
  telegramBotToken: "588143760:AAEjsGv8eirVN2CAmnBRQtIKsqrycWQCwXw",
  bot_server: {
    port: 8443
  },
  url: "https://172.104.134.141:8443"
};
```

Для старта через webhook на сервере в папке bot в корне должна лежать папка certs с приватным ключом и сертификатом, созданными через
openssl genrsa -out webhook_pkey.pem 2048
openssl req -new -x509 -days 3650 -key webhook_pkey.pem -out webhook_cert.pem

## Модуль статистики

https://github.com/w3dip/statistics-ui

# Технический стек и ссылки

## Модель данных

Актуальные User и Questionnaire можно смотреть в `src/database/models`

```
Category {
    title: string
    numberOfNeedAnswers: number
}
```

При миграции создается модель User, Questionnaire и Category.
Questionnaires заполняется из файла отдельным скриптом миграции,
в этот же момент динамически расчитывается модель Category и тоже записывается в БД.

## Стек

* NodeJS
* Vue.js
* MongoDB
* pm2
* Docker

## Prettier

[Чтобы настроить Prettier в своей Webstorm](https://prettier.io/docs/en/webstorm.html)

## Полезные ссылки о ботах

* [Официальная документация](https://core.telegram.org/bots/api)
* [Bot API: часто задаваемые вопросы](https://tlgrm.ru/docs/bots/faq)
* [Лимиты Telegram bot API и работа с ними на Go (habr)](https://habrahabr.ru/post/317666/)
* [Пишем бота для Telegram на языке Python (книга)](https://www.gitbook.com/book/groosha/telegram-bot-lessons/details)
* [Node.js Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
* [Плейлист с видео по созданию telegram-бота](https://www.youtube.com/watch?v=5_BnZQENB2g&list=PLD-piGJ3Dtl3zlRzM4kyWgjHAZv_HDvHH)
* [Видео. Боты в telegram. Зачем они нужны?](https://www.youtube.com/watch?v=_HLbYEEUCtk&t=903s)

## Ссылки по nodejs

* https://github.com/sergtitov/NodeJS-Learning/blob/master/README.md
* https://learnnode.com
* https://egghead.io/technologies/node
