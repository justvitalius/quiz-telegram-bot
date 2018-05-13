const Queue = require("./index");

jest.useFakeTimers();

describe("Queue", () => {
  const msg1 = { id: new Date().getTime() };
  const msg2 = { id: new Date().getTime() };
  const msg3 = { id: new Date().getTime() };
  const msg4 = { id: new Date().getTime() };
  const msg5 = { id: new Date().getTime() };
  const msg6 = { id: new Date().getTime() };
  const msg7 = { id: new Date().getTime() };

  describe("constructor(maxBatch, interval)", () => {
    it("Конфигурируется пачка вычитываемых сообщений", () => {
      expect(new Queue(32, 2000).maxBatch).toEqual(32);
    });
    it("Задается по умолчанию пачка вычитываемых сообщений, если нет параметра на входе", () => {
      expect(new Queue(null, 2000).maxBatch).toEqual(1);
    });
    it("Конфигурируется интервал с которым сообщения будут вычитываться", () => {
      expect(new Queue(32, 2000).interval).toEqual(2000);
    });
    it("Задается по умолчанию интервал вычитываемых сообщений, если нет параметра на входе", () => {
      expect(new Queue(32, null).interval).toEqual(1000);
    });
    it("Конфигурируется пустой Set callback", () => {
      expect(new Queue(32, 2000).callbacks).toEqual(new Set());
    });
    it("Конфигурируется пустой Set сообщений", () => {
      expect(new Queue(32, 2000).messages).toEqual(new Set());
    });
  });

  describe("addMessage(msg)", () => {
    describe("добавляет сообщение в очередь", () => {
      const queue = new Queue();
      queue.addMessage(msg1);
      queue.addMessage(msg2);
      queue.addMessage(msg3);

      it("Длина равна кол-ву записанных сообщений", () => {
        expect(queue.messages.size).toEqual(3);
      });

      it("Вычитываются по правилу FIFO", () => {
        const expectedMsgs = {
          msg1,
          msg2,
          msg3
        };
        let index = 1;

        for (let queueMsg of queue.messages) {
          expect(queueMsg).toEqual(expectedMsgs[`msg${index}`]);
          index += 1;
        }
      });
    });
  });

  describe("getMessagesBatch()", () => {
    it("Отдает пачку сообщений равную maxBatch при конфигурировании", () => {
      const queue1 = new Queue(1);
      const queue2 = new Queue(3);

      queue1.addMessage(msg1);
      queue1.addMessage(msg2);
      queue1.addMessage(msg3);

      queue2.addMessage(msg1);
      queue2.addMessage(msg2);
      queue2.addMessage(msg3);
      queue2.addMessage(msg4);
      queue2.addMessage(msg5);

      expect(queue1.getMessagesBatch().length).toEqual(1);

      expect(queue2.getMessagesBatch().length).toEqual(3);
    });

    it("Отдает столько сообщений, сколько можно взять", () => {
      const queue = new Queue(1000);

      queue.addMessage(msg1);
      queue.addMessage(msg2);
      queue.addMessage(msg3);

      expect(queue.getMessagesBatch().length).toEqual(3);
    });

    it("Не удаляет сообщение из общей пачки", () => {
      const queue = new Queue(3);

      queue.addMessage(msg1);
      queue.addMessage(msg2);
      queue.addMessage(msg3);

      expect(queue.getMessagesBatch().length).not.toEqual(0);
      expect(queue.messages.size).toEqual(3);
    });

    it("Отдает пачку сообщений пр правилу FIFO", () => {
      const queue = new Queue(3);

      queue.addMessage(msg1);
      queue.addMessage(msg2);
      queue.addMessage(msg3);
      queue.addMessage(msg4);
      queue.addMessage(msg5);
      queue.addMessage(msg6);

      const expectedMsgs = {
        msg1,
        msg2,
        msg3
      };

      queue
        .getMessagesBatch()
        .map((msg, index) =>
          expect(msg).toEqual(expectedMsgs[`msg${index + 1}`])
        );
    });
  });

  describe("addCallback()", () => {
    it("Добавляет коллбек в Set", () => {
      const queue1 = new Queue();
      const queue2 = new Queue();

      queue1.addCallback(() => {});

      queue2.addCallback(() => {});
      queue2.addCallback(() => {});
      queue2.addCallback(() => {});

      expect(queue1.callbacks.size).toEqual(1);
      expect(queue2.callbacks.size).toEqual(3);
    });

    it("Бросает исключение, если callback не функция", () => {
      expect(new Queue().addCallback.bind(this, 3)).toThrow();
    });
  });

  describe("handleTick()", () => {
    describe("Над каждым сообщением из пачки выполняет коллбек", () => {
      it("Не выполняет коллбеки, если очередь сообщений пуста", () => {
        const queue = new Queue(3);
        const callback = jest.fn();
        queue.addCallback(callback);
        queue.handleTick();

        expect(callback.mock.calls.length).toEqual(0);
      });

      it("Выполняет по колбеку, если очередь сообщений наполнена", () => {
        const maxBatch = 3;
        const queue = new Queue(maxBatch);
        queue.addMessage(msg1);
        queue.addMessage(msg2);
        queue.addMessage(msg3);
        queue.addMessage(msg4);
        queue.addMessage(msg5);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        queue.addCallback(callback1);
        queue.addCallback(callback2);
        queue.handleTick();

        expect(callback1.mock.calls.length).toEqual(maxBatch);
        expect(callback2.mock.calls.length).toEqual(maxBatch);
      });

      it("Передает сообщение в качестве аргумента при вызове коллбека", () => {
        const queue = new Queue(3);
        queue.addMessage(msg1);
        queue.addMessage(msg2);
        const expectedArgs = {
          arg1: msg1,
          arg2: msg2
        };
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        queue.addCallback(callback1);
        queue.addCallback(callback2);
        queue.handleTick();

        callback1.mock.calls.forEach((args, index) =>
          expect(args[0]).toEqual(expectedArgs[`arg${index + 1}`])
        );

        callback2.mock.calls.forEach((args, index) =>
          expect(args[0]).toEqual(expectedArgs[`arg${index + 1}`])
        );
      });

      it("Удаляет сообщение из очереди после выполнения колбеков", () => {
        const queue = new Queue(3);
        queue.addMessage(msg1);
        queue.addMessage(msg2);
        queue.addMessage(msg3);
        queue.addCallback(jest.fn());
        queue.handleTick();

        expect(queue.messages.size).toEqual(0);
      });
    });
  });

  describe("start()", () => {
    describe("Интервально выполняет handleTick()", () => {
      const interval = 2000;
      const diff = 100;
      const resultInterval = interval + diff;
      let queue;

      beforeEach(() => {
        queue = new Queue(1, interval);
        jest.clearAllTimers();
        queue.handleTick = jest.fn();
        queue.addCallback(jest.fn());
        queue.addMessage(msg1);
        queue.addMessage(msg2);
        queue.addMessage(msg3);
        queue.addMessage(msg4);
        queue.addMessage(msg5);
        queue.addMessage(msg6);
      });

      it("Вызывает handleTick() сразу же после вызова", () => {
        expect(queue.handleTick).not.toHaveBeenCalled();
        queue.start();
        expect(queue.handleTick).toHaveBeenCalled();
      });

      it("Добавляет 100мс при вызове setTimetout к interval", () => {
        queue.start();
        jest.advanceTimersByTime(interval);
        expect(setTimeout).toHaveBeenLastCalledWith(
          expect.any(Function),
          resultInterval
        );
      });

      it("Вызывает start() один раз за interval переданный при конфигурации", () => {
        const countSetTimoutCallsBeforeStart = setTimeout.mock.calls.length;
        queue.start();
        jest.advanceTimersByTime(interval);
        expect(
          setTimeout.mock.calls.length - countSetTimoutCallsBeforeStart
        ).toEqual(1);
        expect(setTimeout).toHaveBeenLastCalledWith(
          expect.any(Function),
          resultInterval
        );
      });

      it("Циклично вызывает start()", () => {
        const cycles = 3;

        queue.start();
        jest.advanceTimersByTime(resultInterval * cycles);
        expect(queue.handleTick).toHaveBeenCalledTimes(cycles + 1);
      });
    });
  });
});
