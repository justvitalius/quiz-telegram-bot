const checkUserAnswer = require('./index.js');

describe('Проверяет ответ пользователя', () => {

  describe('по ключу compareByValue с атрибутом value', () => {

    it('Возвращает true в случае совпадения', () => {
      expect(
        checkUserAnswer({
            compareByValue: true,
            value: '#'
        }, '#')
      ).toBeTruthy();

    });

    it('Возвращает false в случае несовпадения', () => {
      expect(
        checkUserAnswer({
            compareByValue: true,
            value: '#'
        }, '%')
      ).toBeFalsy();

    });

    it('Возвращает false если ответ пользователя = ""', () => {
      expect(
        checkUserAnswer({
          compareByValue: true,
          value: '#'
        }, '')
      ).toBeFalsy();

    });

    it('Возвращает false если ответ пользователя = null', () => {
      expect(
        checkUserAnswer({
            compareByValue: true,
            value: '#'
          }, null)
      ).toBeFalsy();

    });

    it('Возвращает false если ответ пользователя = undefined', () => {
      expect(
        checkUserAnswer({
            compareByValue: true,
            value: '#'
          })
      ).toBeFalsy();

    });

  });

  describe('по ключу compareByExpression с атрибутом value', () => {

    it('Возвращает true в случае совпадения по типу number', () => {
      expect(
        checkUserAnswer({
            compareByExpression: true,
            value: 1
          }, '1')
      ).toBeTruthy();

    });

    it('Возвращает true в случае совпадения по типу string', () => {
      expect(
        checkUserAnswer({
            compareByExpression: true,
            value: "1"
          }, '"1"')
      ).toBeTruthy();

    });

    it('Возвращает false в случае несовпадения по типу', () => {
      expect(
        checkUserAnswer({
            compareByIndex: true,
            value: 1
          }, '"1"')
      ).toBeFalsy();

    });

    it('Возвращает false в случае несовпадения по типу', () => {
      expect(
        checkUserAnswer({
            compareByIndex: true,
            value: '1'
          }, '1')
      ).toBeFalsy();

    });

  });

});
