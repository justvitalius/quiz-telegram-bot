const { generateMessage, MAX_BUTTON_TEXT_SIZE } = require("./index");

describe("generateMessage()", () => {
  const ID = 1;
  const MSG = "msg";
  const HTML_MSG = `<pre>${MSG}</pre>`;
  const REPLIES = [
    { id: 1, value: "replyFirst" },
    { id: 2, value: "replySecond" }
  ];
  const LONG_REPLIES = [
    { id: 1, value: "qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm" },
    { id: 2, value: "replySecond" }
  ];

  describe("Возвращает готовый объект с сообщением", () => {
    describe("Есть msg, нет replies", () => {
      it("Возвращает обычный текст сообщения без parse_mode=html", () => {
        const result = generateMessage({ id: ID, msg: MSG });
        expect(result.msg).toEqual(MSG);
        expect(result.msg).not.toContain("<");
        expect(result.msg).not.toContain(">");
        expect(result.opts).not.toBeDefined();
      });
    });

    describe("Есть msg, есть replies", () => {
      describe(`Все ответы меньше ${MAX_BUTTON_TEXT_SIZE} символов`, () => {
        const result = generateMessage({ id: ID, msg: MSG, replies: REPLIES });

        it("Возвращает обернутый текст", () => {
          expect(result.msg).toContain(HTML_MSG);
        });

        it("Текст не содерижт варианты ответа", () => {
          REPLIES.forEach(item => expect(result.msg).not.toContain(item.value));
        });

        it("Возвращает parse_mode=true", () => {
          expect(result.opts).toBeDefined();
          expect(result.opts.parse_mode).toEqual("html");
        });

        it("Возвращает inline_keyboard", () => {
          expect(result.opts).toBeDefined();
          expect(result.opts.reply_markup.inline_keyboard).toHaveLength(
            REPLIES.length
          );
        });

        it("Текст ответа в inline_keyboard", () => {
          const concatinatedAnswers = REPLIES.map(i => i.value).join("");

          expect(result.opts).toBeDefined();
          result.opts.reply_markup.inline_keyboard.map(keyboardButtonItems =>
            expect(concatinatedAnswers).toContain(keyboardButtonItems[0].text)
          );
        });
      });

      describe(`Один из ответов больше ${MAX_BUTTON_TEXT_SIZE} символов`, () => {
        const result = generateMessage({
          id: ID,
          msg: MSG,
          replies: LONG_REPLIES
        });

        it("Возвращает обернутый текст", () => {
          expect(result.msg).toContain(HTML_MSG);
        });

        it("Текст содерижт варианты ответа", () => {
          LONG_REPLIES.forEach(item =>
            expect(result.msg).toContain(item.value)
          );
        });

        it("Возвращает parse_mode=true", () => {
          expect(result.opts).toBeDefined();
          expect(result.opts.parse_mode).toEqual("html");
        });

        it("Возвращает inline_keyboard", () => {
          expect(result.opts).toBeDefined();
          expect(result.opts.reply_markup.inline_keyboard).toHaveLength(
            REPLIES.length
          );
        });

        it("Не содержит ответов в inline_keyboard", () => {
          const concatinatedAnswers = LONG_REPLIES.map(i => i.value).join("");

          expect(result.opts).toBeDefined();
          result.opts.reply_markup.inline_keyboard.map(keyboardButtonItems =>
            expect(concatinatedAnswers).not.toContain(
              keyboardButtonItems[0].text
            )
          );
        });
      });
    });
  });
});
