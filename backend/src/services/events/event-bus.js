const { EventEmitter } = require("events");

const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

function publishEvent(event) {
  eventBus.emit(event.type, event);
}

function subscribeEvent(eventType, handler) {
  eventBus.on(eventType, handler);
  return () => eventBus.off(eventType, handler);
}

module.exports = {
  eventBus,
  publishEvent,
  subscribeEvent
};
