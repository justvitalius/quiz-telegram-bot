const logger = require("../logger");

module.exports = class Queue {
  constructor(maxBatch, interval) {
    this.messages = new Set();
    this.callbacks = new Set();
    this.timerId = null;
    this.maxBatch = maxBatch || 1;
    this.interval = interval || 1000;
    return this;
  }

  addMessage(msg) {
    logger.info("Add message to queue %s", msg);
    this.messages.add(msg);
  }

  addCallback(callback) {
    if (typeof callback !== "function") {
      throw new Error("Allow only function for callback");
    }
    this.callbacks.add(callback);
  }

  start() {
    clearTimeout(this.timerId);
    this.handleTick();
    // Такой финт сделан специально
    // Чтобы за interval милисекунд метод setTimeout вызывался 1 раз.
    // Иначе он вызывается на 0 милисекунде и на interval милисекунде, т.е.2 раза
    const allignedInterval = this.interval + 100;
    this.timerId = setTimeout(() => this.start(), allignedInterval);
  }

  getMessagesBatch() {
    let part = [];
    let count = 0;
    for (let message of this.messages) {
      part = part.concat(message);
      count += 1;
      if (count >= this.maxBatch) break;
    }
    return part;
  }

  handleTick() {
    const batchMessages = this.getMessagesBatch();
    logger.info(
      "Tick the queue, messages count=%s, batch size=%s",
      this.messages.size,
      batchMessages.length
    );
    batchMessages.map(message => {
      this.callbacks.forEach(callback => callback(message));
      this.messages.delete(message);
    });
  }
};
