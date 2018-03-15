[![Build Status](https://travis-ci.org/justVitalius/quiz-telegram-bot.svg?branch=master)](https://travis-ci.org/justVitalius/quiz-telegram-bot)
# Quiz Telegram Bot

## Диаграмма 
![bot architecture](./docs/quiz-telegram-bot-architecture.png)
[Прямая ссылка на редактирование](https://www.draw.io/#G1xTVMxWpaF0GJBOxuXjc8B2q7-aZmQC2e)

## Тезисно о геймификации
- Сделать N тематик и сложностей
- Пользователь должен набрать X баллов в каждой тематике
- После X баллов в одной из тематик переходить на задавание вопросов в другой тематике
- По каждому пользователю нужно хранить сколько баллов в какой тематике он набрал
- В пользователе нужно хранить статус «в очереди на отправку» или «ожидает новый вопрос» чтобы проще было фильтровать пользователей, которые ждут вопрос
- В каждом пользователе нужно хранить дату смены статуса, чтобы по ней делать выборку. Так можно спамить не более Y раз в Z минут. И находить пользователей, сообщения которых висят в очереди.
- Пока пользователь не ответит, не присылать ему новый вопрос

## Полезные ссылки
- [Официальная документация](https://core.telegram.org/bots/api)
- [Bot API: часто задаваемые вопросы](https://tlgrm.ru/docs/bots/faq)
- [Лимиты Telegram bot API и работа с ними на Go (habr)](https://habrahabr.ru/post/317666/)
- [Пишем бота для Telegram на языке Python (книга)](https://www.gitbook.com/book/groosha/telegram-bot-lessons/details)
- [Node.js Telegram Bot API](https://github.com/yagop/node-telegram-bot-api)
- [Плейлист с видео по созданию telegram-бота](https://www.youtube.com/watch?v=5_BnZQENB2g&list=PLD-piGJ3Dtl3zlRzM4kyWgjHAZv_HDvHH)
- [Видео. Боты в telegram. Зачем они нужны?](https://www.youtube.com/watch?v=_HLbYEEUCtk&t=903s)

## Опросники по javascript
- [https://www.javatpoint.com/javascript-quiz](https://www.javatpoint.com/javascript-quiz)
- [http://davidshariff.com/js-quiz/](http://davidshariff.com/js-quiz/)
- [https://learn.javascript.ru/quiz](https://learn.javascript.ru/quiz)
- [http://perfectionkills.com/javascript-quiz/](http://perfectionkills.com/javascript-quiz/)
- [https://www.w3schools.com/quiztest/quiztest.asp?qtest=JavaScript](https://www.w3schools.com/quiztest/quiztest.asp?qtest=JavaScript)
