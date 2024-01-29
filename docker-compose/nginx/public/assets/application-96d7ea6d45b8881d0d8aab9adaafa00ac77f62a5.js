var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

// node_modules/slim-select/dist/slimselect.jsjsjs
var adapters_default;
var init_adapters = __esm(() => {
  adapters_default = {
    logger: self.console,
    WebSocket: self.WebSocket
  };
});

// node_modules/slim-select/dist/slimselect.jsjs
var logger_default;
var init_logger = __esm(() => {
  init_adapters();
  logger_default = {
    log(...messages) {
      if (this.enabled) {
        messages.push(Date.now());
        adapters_default.logger.log("[ActionCable]", ...messages);
      }
    }
  };
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_guaranto
class ConnectionMonitor {
  constructor(connection) {
    this.visibilityDidChange = this.visibilityDidChange.bind(this);
    this.connection = connection;
    this.reconnectAttempts = 0;
  }
  start() {
    if (!this.isRunning()) {
      this.startedAt = now();
      delete this.stoppedAt;
      this.startPolling();
      addEventListener("visibilitychange", this.visibilityDidChange);
      logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
    }
  }
  stop() {
    if (this.isRunning()) {
      this.stoppedAt = now();
      this.stopPolling();
      removeEventListener("visibilitychange", this.visibilityDidChange);
      logger_default.log("ConnectionMonitor stopped");
    }
  }
  isRunning() {
    return this.startedAt && !this.stoppedAt;
  }
  recordPing() {
    this.pingedAt = now();
  }
  recordConnect() {
    this.reconnectAttempts = 0;
    this.recordPing();
    delete this.disconnectedAt;
    logger_default.log("ConnectionMonitor recorded connect");
  }
  recordDisconnect() {
    this.disconnectedAt = now();
    logger_default.log("ConnectionMonitor recorded disconnect");
  }
  startPolling() {
    this.stopPolling();
    this.poll();
  }
  stopPolling() {
    clearTimeout(this.pollTimeout);
  }
  poll() {
    this.pollTimeout = setTimeout(() => {
      this.reconnectIfStale();
      this.poll();
    }, this.getPollInterval());
  }
  getPollInterval() {
    const { staleThreshold, reconnectionBackoffRate } = this.constructor;
    const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
    const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
    const jitter = jitterMax * Math.random();
    return staleThreshold * 1000 * backoff * (1 + jitter);
  }
  reconnectIfStale() {
    if (this.connectionIsStale()) {
      logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
      this.reconnectAttempts++;
      if (this.disconnectedRecently()) {
        logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
      } else {
        logger_default.log("ConnectionMonitor reopening");
        this.connection.reopen();
      }
    }
  }
  get refreshedAt() {
    return this.pingedAt ? this.pingedAt : this.startedAt;
  }
  connectionIsStale() {
    return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
  }
  disconnectedRecently() {
    return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
  }
  visibilityDidChange() {
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        if (this.connectionIsStale() || !this.connection.isOpen()) {
          logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
          this.connection.reopen();
        }
      }, 200);
    }
  }
}
var now, secondsSince, connection_monitor_default;
var init_connection_monitor = __esm(() => {
  init_logger();
  now = () => new Date().getTime();
  secondsSince = (time) => (now() - time) / 1000;
  ConnectionMonitor.staleThreshold = 6;
  ConnectionMonitor.reconnectionBackoffRate = 0.15;
  connection_monitor_default = ConnectionMonitor;
});

// node_modules/slim-select/dist/slimselect.jsjsjs
var internal_default;
var init_internal = __esm(() => {
  internal_default = {
    message_types: {
      welcome: "welcome",
      disconnect: "disconnect",
      ping: "ping",
      confirmation: "confirm_subscription",
      rejection: "reject_subscription"
    },
    disconnect_reasons: {
      unauthorized: "unauthorized",
      invalid_request: "invalid_request",
      server_restart: "server_restart",
      remote: "remote"
    },
    default_mount_path: "/cable",
    protocols: [
      "actioncable-v1-json",
      "actioncable-unsupported"
    ]
  };
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_
class Connection {
  constructor(consumer) {
    this.open = this.open.bind(this);
    this.consumer = consumer;
    this.subscriptions = this.consumer.subscriptions;
    this.monitor = new connection_monitor_default(this);
    this.disconnected = true;
  }
  send(data) {
    if (this.isOpen()) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  }
  open() {
    if (this.isActive()) {
      logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
      return false;
    } else {
      const socketProtocols = [...protocols, ...this.consumer.subprotocols || []];
      logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
      if (this.webSocket) {
        this.uninstallEventHandlers();
      }
      this.webSocket = new adapters_default.WebSocket(this.consumer.url, socketProtocols);
      this.installEventHandlers();
      this.monitor.start();
      return true;
    }
  }
  close({ allowReconnect } = { allowReconnect: true }) {
    if (!allowReconnect) {
      this.monitor.stop();
    }
    if (this.isOpen()) {
      return this.webSocket.close();
    }
  }
  reopen() {
    logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        logger_default.log("Failed to reopen WebSocket", error);
      } finally {
        logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
        setTimeout(this.open, this.constructor.reopenDelay);
      }
    } else {
      return this.open();
    }
  }
  getProtocol() {
    if (this.webSocket) {
      return this.webSocket.protocol;
    }
  }
  isOpen() {
    return this.isState("open");
  }
  isActive() {
    return this.isState("open", "connecting");
  }
  triedToReconnect() {
    return this.monitor.reconnectAttempts > 0;
  }
  isProtocolSupported() {
    return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
  }
  isState(...states) {
    return indexOf.call(states, this.getState()) >= 0;
  }
  getState() {
    if (this.webSocket) {
      for (let state in adapters_default.WebSocket) {
        if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
          return state.toLowerCase();
        }
      }
    }
    return null;
  }
  installEventHandlers() {
    for (let eventName in this.events) {
      const handler = this.events[eventName].bind(this);
      this.webSocket[`on${eventName}`] = handler;
    }
  }
  uninstallEventHandlers() {
    for (let eventName in this.events) {
      this.webSocket[`on${eventName}`] = function() {
      };
    }
  }
}
var message_types, protocols, supportedProtocols, indexOf, connection_default;
var init_connection = __esm(() => {
  init_adapters();
  init_connection_monitor();
  init_internal();
  init_logger();
  ({ message_types, protocols } = internal_default);
  supportedProtocols = protocols.slice(0, protocols.length - 1);
  indexOf = [].indexOf;
  Connection.reopenDelay = 500;
  Connection.prototype.events = {
    message(event) {
      if (!this.isProtocolSupported()) {
        return;
      }
      const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
      switch (type) {
        case message_types.welcome:
          if (this.triedToReconnect()) {
            this.reconnectAttempted = true;
          }
          this.monitor.recordConnect();
          return this.subscriptions.reload();
        case message_types.disconnect:
          logger_default.log(`Disconnecting. Reason: ${reason}`);
          return this.close({ allowReconnect: reconnect });
        case message_types.ping:
          return this.monitor.recordPing();
        case message_types.confirmation:
          this.subscriptions.confirmSubscription(identifier);
          if (this.reconnectAttempted) {
            this.reconnectAttempted = false;
            return this.subscriptions.notify(identifier, "connected", { reconnected: true });
          } else {
            return this.subscriptions.notify(identifier, "connected", { reconnected: false });
          }
        case message_types.rejection:
          return this.subscriptions.reject(identifier);
        default:
          return this.subscriptions.notify(identifier, "received", message);
      }
    },
    open() {
      logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({ allowReconnect: false });
      }
    },
    close(event) {
      logger_default.log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
    },
    error() {
      logger_default.log("WebSocket onerror event");
    }
  };
  connection_default = Connection;
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_gu
class Subscription {
  constructor(consumer, params = {}, mixin) {
    this.consumer = consumer;
    this.identifier = JSON.stringify(params);
    extend(this, mixin);
  }
  perform(action, data = {}) {
    data.action = action;
    return this.send(data);
  }
  send(data) {
    return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
  }
  unsubscribe() {
    return this.consumer.subscriptions.remove(this);
  }
}
var extend;
var init_subscription = __esm(() => {
  extend = function(object, properties) {
    if (properties != null) {
      for (let key in properties) {
        const value = properties[key];
        object[key] = value;
      }
    }
    return object;
  };
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.js
class SubscriptionGuarantor {
  constructor(subscriptions) {
    this.subscriptions = subscriptions;
    this.pendingSubscriptions = [];
  }
  guarantee(subscription) {
    if (this.pendingSubscriptions.indexOf(subscription) == -1) {
      logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription.identifier}`);
      this.pendingSubscriptions.push(subscription);
    } else {
      logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription.identifier}`);
    }
    this.startGuaranteeing();
  }
  forget(subscription) {
    logger_default.log(`SubscriptionGuarantor forgetting ${subscription.identifier}`);
    this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription);
  }
  startGuaranteeing() {
    this.stopGuaranteeing();
    this.retrySubscribing();
  }
  stopGuaranteeing() {
    clearTimeout(this.retryTimeout);
  }
  retrySubscribing() {
    this.retryTimeout = setTimeout(() => {
      if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
        this.pendingSubscriptions.map((subscription) => {
          logger_default.log(`SubscriptionGuarantor resubscribing ${subscription.identifier}`);
          this.subscriptions.subscribe(subscription);
        });
      }
    }, 500);
  }
}
var subscription_guarantor_default;
var init_subscription_guarantor = __esm(() => {
  init_logger();
  subscription_guarantor_default = SubscriptionGuarantor;
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_gua
class Subscriptions {
  constructor(consumer) {
    this.consumer = consumer;
    this.guarantor = new subscription_guarantor_default(this);
    this.subscriptions = [];
  }
  create(channelName, mixin) {
    const channel = channelName;
    const params = typeof channel === "object" ? channel : { channel };
    const subscription2 = new Subscription(this.consumer, params, mixin);
    return this.add(subscription2);
  }
  add(subscription2) {
    this.subscriptions.push(subscription2);
    this.consumer.ensureActiveConnection();
    this.notify(subscription2, "initialized");
    this.subscribe(subscription2);
    return subscription2;
  }
  remove(subscription2) {
    this.forget(subscription2);
    if (!this.findAll(subscription2.identifier).length) {
      this.sendCommand(subscription2, "unsubscribe");
    }
    return subscription2;
  }
  reject(identifier) {
    return this.findAll(identifier).map((subscription2) => {
      this.forget(subscription2);
      this.notify(subscription2, "rejected");
      return subscription2;
    });
  }
  forget(subscription2) {
    this.guarantor.forget(subscription2);
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription2);
    return subscription2;
  }
  findAll(identifier) {
    return this.subscriptions.filter((s) => s.identifier === identifier);
  }
  reload() {
    return this.subscriptions.map((subscription2) => this.subscribe(subscription2));
  }
  notifyAll(callbackName, ...args) {
    return this.subscriptions.map((subscription2) => this.notify(subscription2, callbackName, ...args));
  }
  notify(subscription2, callbackName, ...args) {
    let subscriptions;
    if (typeof subscription2 === "string") {
      subscriptions = this.findAll(subscription2);
    } else {
      subscriptions = [subscription2];
    }
    return subscriptions.map((subscription3) => typeof subscription3[callbackName] === "function" ? subscription3[callbackName](...args) : undefined);
  }
  subscribe(subscription2) {
    if (this.sendCommand(subscription2, "subscribe")) {
      this.guarantor.guarantee(subscription2);
    }
  }
  confirmSubscription(identifier) {
    logger_default.log(`Subscription confirmed ${identifier}`);
    this.findAll(identifier).map((subscription2) => this.guarantor.forget(subscription2));
  }
  sendCommand(subscription2, command) {
    const { identifier } = subscription2;
    return this.consumer.send({ command, identifier });
  }
}
var init_subscriptions = __esm(() => {
  init_subscription();
  init_subscription_guarantor();
  init_logger();
});

// node_modules/slim-select/dist/slimselect.jsjsjs
function createWebSocketURL(url) {
  if (typeof url === "function") {
    url = url();
  }
  if (url && !/^wss?:/i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    a.href = a.href;
    a.protocol = a.protocol.replace("http", "ws");
    return a.href;
  } else {
    return url;
  }
}

class Consumer {
  constructor(url) {
    this._url = url;
    this.subscriptions = new Subscriptions(this);
    this.connection = new connection_default(this);
    this.subprotocols = [];
  }
  get url() {
    return createWebSocketURL(this._url);
  }
  send(data) {
    return this.connection.send(data);
  }
  connect() {
    return this.connection.open();
  }
  disconnect() {
    return this.connection.close({ allowReconnect: false });
  }
  ensureActiveConnection() {
    if (!this.connection.isActive()) {
      return this.connection.open();
    }
  }
  addSubProtocol(subprotocol) {
    this.subprotocols = [...this.subprotocols, subprotocol];
  }
}
var init_consumer = __esm(() => {
  init_connection();
  init_subscriptions();
});

// node_modules/slim-select/dist/slimselect.jsj
var exports_src = {};
__export(exports_src, {
  logger: () => {
    {
      return logger_default;
    }
  },
  getConfig: () => {
    {
      return getConfig;
    }
  },
  createWebSocketURL: () => {
    {
      return createWebSocketURL;
    }
  },
  createConsumer: () => {
    {
      return createConsumer;
    }
  },
  adapters: () => {
    {
      return adapters_default;
    }
  },
  Subscriptions: () => {
    {
      return Subscriptions;
    }
  },
  SubscriptionGuarantor: () => {
    {
      return subscription_guarantor_default;
    }
  },
  Subscription: () => {
    {
      return Subscription;
    }
  },
  INTERNAL: () => {
    {
      return internal_default;
    }
  },
  Consumer: () => {
    {
      return Consumer;
    }
  },
  ConnectionMonitor: () => {
    {
      return connection_monitor_default;
    }
  },
  Connection: () => {
    {
      return connection_default;
    }
  }
});
function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
  return new Consumer(url);
}
function getConfig(name) {
  const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
  if (element) {
    return element.getAttribute("content");
  }
}
var init_src = __esm(() => {
  init_connection();
  init_connection_monitor();
  init_consumer();
  init_internal();
  init_subscription();
  init_subscriptions();
  init_subscription_guarantor();
  init_adapters();
  init_logger();
});

// node_modules/slim-select/dist/slimselect.
var require_timeout = __commonJS((exports) => {
  var __spreadArrays = exports && exports.__spreadArrays || function() {
    for (var s = 0, i = 0, il = arguments.length;i < il; i++)
      s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0;i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length;j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var MetadataRecord = function() {
    function MetadataRecord2(callback, key, ms, params) {
      this.callback = callback;
      this.key = key;
      this.ms = ms;
      this.params = params;
      this.paused = false;
      this.startTime = new Date().getTime();
      this.timeSpentWaiting = 0;
    }
    return MetadataRecord2;
  }();
  var Timeout = function() {
    function Timeout2() {
    }
    Timeout2.clear = function(key, erase) {
      if (erase === undefined) {
        erase = true;
      }
      clearTimeout(Timeout2.keyId[key]);
      delete Timeout2.keyId[key];
      delete Timeout2.keyCall[key];
      if (erase) {
        delete Timeout2.metadata[key];
        delete Timeout2.originalMs[key];
      }
    };
    Timeout2.set = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var key;
      var ms;
      var params;
      var callback;
      if (args.length === 0) {
        throw Error("Timeout.set() requires at least one argument");
      }
      if (typeof args[1] === "function") {
        key = args[0], callback = args[1], ms = args[2], params = args.slice(3);
      } else {
        callback = args[0], ms = args[1], params = args.slice(2);
        key = callback.toString();
      }
      if (!callback) {
        throw Error("Timeout.set() requires a callback parameter");
      }
      Timeout2.clear(key);
      var invoke = function() {
        Timeout2.metadata[key].executedTime = new Date().getTime();
        callback.apply(undefined, params);
      };
      Timeout2.keyId[key] = setTimeout(invoke, ms || 0);
      Timeout2.keyCall[key] = function() {
        return callback.apply(undefined, params);
      };
      Timeout2.originalMs[key] = Timeout2.originalMs[key] || ms;
      Timeout2.metadata[key] = new MetadataRecord(callback, key, ms, params);
      return function() {
        return Timeout2.executed(key);
      };
    };
    Timeout2.create = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (args.length === 0) {
        throw Error("Timeout.create() requires at least one argument");
      }
      var key;
      if (typeof args[1] === "function") {
        key = args[0];
      } else {
        var callback = args[0];
        key = callback.toString();
      }
      return Timeout2.exists(key) ? false : Timeout2.set.apply(Timeout2, args);
    };
    Timeout2.elapsed = function(key) {
      var metaDataRecord = Timeout2.metadata[key];
      if (!metaDataRecord)
        return 0;
      return Math.max(0, new Date().getTime() - metaDataRecord.startTime);
    };
    Timeout2.exists = function(key) {
      return (key in Timeout2.keyId) || Timeout2.metadata[key] !== undefined;
    };
    Timeout2.call = function(key) {
      return Timeout2.exists(key) && Timeout2.keyCall[key]();
    };
    Timeout2.executed = function(key) {
      return Timeout2.exists(key) && !!Timeout2.metadata[key].executedTime;
    };
    Timeout2.lastExecuted = function(key) {
      return !Timeout2.executed(key) ? null : new Date(Timeout2.metadata[key].executedTime);
    };
    Timeout2.meta = function(key) {
      return Timeout2.metadata[key];
    };
    Timeout2.pending = function(key) {
      return Timeout2.exists(key) && !Timeout2.executed(key);
    };
    Timeout2.paused = function(key) {
      return Timeout2.exists(key) && !Timeout2.executed(key) && Timeout2.metadata[key].paused;
    };
    Timeout2.remaining = function(key) {
      if (!Timeout2.metadata[key])
        return 0;
      var metaDataRecord = Timeout2.metadata[key];
      return Timeout2.paused(key) ? metaDataRecord.ms - metaDataRecord.timeSpentWaiting : Math.max(0, metaDataRecord.startTime + metaDataRecord.ms - new Date().getTime());
    };
    Timeout2.reset = function(key, ms) {
      var params = [];
      for (var _i = 2;_i < arguments.length; _i++) {
        params[_i - 2] = arguments[_i];
      }
      var metaDataRecord = Timeout2.metadata[key];
      if (!metaDataRecord)
        return false;
      Timeout2.clear(key, false);
      if (metaDataRecord.paused) {
        metaDataRecord.paused = false;
      }
      return Timeout2.set.apply(Timeout2, __spreadArrays([
        key,
        metaDataRecord.callback,
        ms !== null && ms !== undefined ? ms : Timeout2.originalMs[key]
      ], params || metaDataRecord.params));
    };
    Timeout2.restart = function(key, force) {
      if (force === undefined) {
        force = false;
      }
      if (!Timeout2.metadata[key] || !force && Timeout2.executed(key))
        return false;
      var metaDataRecord = Timeout2.metadata[key];
      Timeout2.clear(key, false);
      if (metaDataRecord.paused) {
        metaDataRecord.paused = false;
      }
      return Timeout2.set.apply(Timeout2, __spreadArrays([key, metaDataRecord.callback, Timeout2.originalMs[key]], metaDataRecord.params));
    };
    Timeout2.pause = function(key) {
      if (!Timeout2.metadata[key] || Timeout2.paused(key) || Timeout2.executed(key))
        return false;
      Timeout2.clear(key, false);
      var metaDataRecord = Timeout2.metadata[key];
      metaDataRecord.paused = true;
      metaDataRecord.timeSpentWaiting = new Date().getTime() - metaDataRecord.startTime;
      return metaDataRecord.timeSpentWaiting;
    };
    Timeout2.resume = function(key) {
      if (!Timeout2.metadata[key] || Timeout2.executed(key))
        return false;
      var metaDataRecord = Timeout2.metadata[key];
      if (!metaDataRecord.paused)
        return false;
      var originalMs = Timeout2.originalMs[key];
      var remainingTime = metaDataRecord.ms - metaDataRecord.timeSpentWaiting;
      var result = Timeout2.set.apply(Timeout2, __spreadArrays([key, metaDataRecord.callback, remainingTime], metaDataRecord.params));
      Timeout2.originalMs[key] = originalMs;
      return result;
    };
    Timeout2.instantiate = function() {
      var args = [];
      for (var _i = 0;_i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var key;
      var ms;
      var params;
      var callback;
      if (args.length === 0) {
        throw Error("Timeout.set() requires at least one argument");
      }
      var linkToExisting = args.length === 1 && typeof args[0] !== "function";
      if (linkToExisting) {
        key = args[0];
        var metadata = Timeout2.meta(key);
        if (!metadata) {
          throw Error("Timeout.instantiate() attempted to link to nonexistent object by key");
        }
        ms = metadata.ms;
        params = metadata.params;
        callback = metadata.callback;
      } else if (typeof args[1] === "function") {
        key = args[0], callback = args[1], ms = args[2], params = args.slice(3);
      } else {
        callback = args[0], ms = args[1], params = args.slice(2);
        key = ("" + Math.random() + callback).replace(/\s/g, "");
      }
      if (!callback) {
        throw Error("Timeout.instantiate() requires a function parameter");
      }
      if (!linkToExisting) {
        Timeout2.set.apply(Timeout2, __spreadArrays([key, callback, ms], params));
      }
      return {
        call: function() {
          return Timeout2.call(key);
        },
        clear: function(erase) {
          if (erase === undefined) {
            erase = true;
          }
          return Timeout2.clear(key, erase);
        },
        elapsed: function() {
          return Timeout2.elapsed(key);
        },
        executed: function() {
          return Timeout2.executed(key);
        },
        exists: function() {
          return Timeout2.exists(key);
        },
        lastExecuted: function() {
          return Timeout2.lastExecuted(key);
        },
        meta: function() {
          return Timeout2.meta(key);
        },
        pause: function() {
          return Timeout2.pause(key);
        },
        paused: function() {
          return Timeout2.paused(key);
        },
        pending: function() {
          return Timeout2.pending(key);
        },
        remaining: function() {
          return Timeout2.remaining(key);
        },
        reset: function(ms2) {
          var params2 = [];
          for (var _i2 = 1;_i2 < arguments.length; _i2++) {
            params2[_i2 - 1] = arguments[_i2];
          }
          return Timeout2.reset.apply(Timeout2, __spreadArrays([key, ms2], params2));
        },
        restart: function() {
          return Timeout2.restart(key);
        },
        resume: function() {
          return Timeout2.resume(key);
        },
        set: function(newCallback, newMs) {
          if (newMs === undefined) {
            newMs = 0;
          }
          var newParams = [];
          for (var _i2 = 2;_i2 < arguments.length; _i2++) {
            newParams[_i2 - 2] = arguments[_i2];
          }
          return Timeout2.set.apply(Timeout2, __spreadArrays([key, newCallback, newMs], newParams));
        }
      };
    };
    Timeout2.keyId = {};
    Timeout2.keyCall = {};
    Timeout2.originalMs = {};
    Timeout2.metadata = {};
    return Timeout2;
  }();
  exports.Timeout = Timeout;
});

// node_modules/slim-select/dist/slims
var require_smart_timeout = __commonJS((exports, module) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var timeout_1 = require_timeout();
  module.exports = timeout_1.Timeout;
});

// node_modules/slim-select/dist/slimselect.js
var require_slimselect = __commonJS((exports, module) => {
  (function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.SlimSelect = factory());
  })(exports, function() {
    function generateID() {
      return Math.random().toString(36).substring(2, 10);
    }
    function hasClassInTree(element, className) {
      function hasClass(e, c) {
        if (c && e && e.classList && e.classList.contains(c)) {
          return e;
        }
        if (c && e && e.dataset && e.dataset.id && e.dataset.id === className) {
          return e;
        }
        return null;
      }
      function parentByClass(e, c) {
        if (!e || e === document) {
          return null;
        } else if (hasClass(e, c)) {
          return e;
        } else {
          return parentByClass(e.parentNode, c);
        }
      }
      return hasClass(element, className) || parentByClass(element, className);
    }
    function debounce(func, wait = 50, immediate = false) {
      let timeout;
      return function(...args) {
        const context = self;
        const later = () => {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
          func.apply(context, args);
        }
      };
    }
    function isEqual(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    function kebabCase(str) {
      const result = str.replace(/[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g, (match) => "-" + match.toLowerCase());
      return str[0] === str[0].toUpperCase() ? result.substring(1) : result;
    }

    class Optgroup {
      constructor(optgroup) {
        this.id = !optgroup.id || optgroup.id === "" ? generateID() : optgroup.id;
        this.label = optgroup.label || "";
        this.selectAll = optgroup.selectAll === undefined ? false : optgroup.selectAll;
        this.selectAllText = optgroup.selectAllText || "Select All";
        this.closable = optgroup.closable || "off";
        this.options = [];
        if (optgroup.options) {
          for (const o of optgroup.options) {
            this.options.push(new Option(o));
          }
        }
      }
    }

    class Option {
      constructor(option) {
        this.id = !option.id || option.id === "" ? generateID() : option.id;
        this.value = option.value === undefined ? option.text : option.value;
        this.text = option.text || "";
        this.html = option.html || "";
        this.selected = option.selected !== undefined ? option.selected : false;
        this.display = option.display !== undefined ? option.display : true;
        this.disabled = option.disabled !== undefined ? option.disabled : false;
        this.mandatory = option.mandatory !== undefined ? option.mandatory : false;
        this.placeholder = option.placeholder !== undefined ? option.placeholder : false;
        this.class = option.class || "";
        this.style = option.style || "";
        this.data = option.data || {};
      }
    }

    class Store {
      constructor(type, data) {
        this.selectType = "single";
        this.data = [];
        this.selectType = type;
        this.setData(data);
      }
      validateDataArray(data) {
        if (!Array.isArray(data)) {
          return new Error("Data must be an array");
        }
        for (let dataObj of data) {
          if (dataObj instanceof Optgroup || ("label" in dataObj)) {
            if (!("label" in dataObj)) {
              return new Error("Optgroup must have a label");
            }
            if (("options" in dataObj) && dataObj.options) {
              for (let option of dataObj.options) {
                return this.validateOption(option);
              }
            }
          } else if (dataObj instanceof Option || ("text" in dataObj)) {
            return this.validateOption(dataObj);
          } else {
            return new Error("Data object must be a valid optgroup or option");
          }
        }
        return null;
      }
      validateOption(option) {
        if (!("text" in option)) {
          return new Error("Option must have a text");
        }
        return null;
      }
      partialToFullData(data) {
        let dataFinal = [];
        data.forEach((dataObj) => {
          if (dataObj instanceof Optgroup || ("label" in dataObj)) {
            let optOptions = [];
            if (("options" in dataObj) && dataObj.options) {
              dataObj.options.forEach((option) => {
                optOptions.push(new Option(option));
              });
            }
            if (optOptions.length > 0) {
              dataFinal.push(new Optgroup(dataObj));
            }
          }
          if (dataObj instanceof Option || ("text" in dataObj)) {
            dataFinal.push(new Option(dataObj));
          }
        });
        return dataFinal;
      }
      setData(data) {
        this.data = this.partialToFullData(data);
        if (this.selectType === "single") {
          this.setSelectedBy("value", this.getSelected());
        }
      }
      getData() {
        return this.filter(null, true);
      }
      getDataOptions() {
        return this.filter(null, false);
      }
      addOption(option) {
        this.setData(this.getData().concat(new Option(option)));
      }
      setSelectedBy(selectedType, selectedValues) {
        let firstOption = null;
        let hasSelected = false;
        for (let dataObj of this.data) {
          if (dataObj instanceof Optgroup) {
            for (let option of dataObj.options) {
              if (!firstOption) {
                firstOption = option;
              }
              option.selected = hasSelected ? false : selectedValues.includes(option[selectedType]);
              if (option.selected && this.selectType === "single") {
                hasSelected = true;
              }
            }
          }
          if (dataObj instanceof Option) {
            if (!firstOption) {
              firstOption = dataObj;
            }
            dataObj.selected = hasSelected ? false : selectedValues.includes(dataObj[selectedType]);
            if (dataObj.selected && this.selectType === "single") {
              hasSelected = true;
            }
          }
        }
        if (this.selectType === "single" && firstOption && !hasSelected) {
          firstOption.selected = true;
        }
      }
      getSelected() {
        let selectedOptions = this.getSelectedOptions();
        let selectedValues = [];
        selectedOptions.forEach((option) => {
          selectedValues.push(option.value);
        });
        return selectedValues;
      }
      getSelectedOptions() {
        return this.filter((opt) => {
          return opt.selected;
        }, false);
      }
      getSelectedIDs() {
        let selectedOptions = this.getSelectedOptions();
        let selectedIDs = [];
        selectedOptions.forEach((op) => {
          selectedIDs.push(op.id);
        });
        return selectedIDs;
      }
      getOptgroupByID(id) {
        for (let dataObj of this.data) {
          if (dataObj instanceof Optgroup && dataObj.id === id) {
            return dataObj;
          }
        }
        return null;
      }
      getOptionByID(id) {
        let options = this.filter((opt) => {
          return opt.id === id;
        }, false);
        return options.length ? options[0] : null;
      }
      getSelectType() {
        return this.selectType;
      }
      getFirstOption() {
        let option = null;
        for (let dataObj of this.data) {
          if (dataObj instanceof Optgroup) {
            option = dataObj.options[0];
          } else if (dataObj instanceof Option) {
            option = dataObj;
          }
          if (option) {
            break;
          }
        }
        return option;
      }
      search(search, searchFilter) {
        search = search.trim();
        if (search === "") {
          return this.getData();
        }
        return this.filter((opt) => {
          return searchFilter(opt, search);
        }, true);
      }
      filter(filter, includeOptgroup) {
        const dataSearch = [];
        this.data.forEach((dataObj) => {
          if (dataObj instanceof Optgroup) {
            let optOptions = [];
            dataObj.options.forEach((option) => {
              if (!filter || filter(option)) {
                if (!includeOptgroup) {
                  dataSearch.push(new Option(option));
                } else {
                  optOptions.push(new Option(option));
                }
              }
            });
            if (optOptions.length > 0) {
              let optgroup = new Optgroup(dataObj);
              optgroup.options = optOptions;
              dataSearch.push(optgroup);
            }
          }
          if (dataObj instanceof Option) {
            if (!filter || filter(dataObj)) {
              dataSearch.push(new Option(dataObj));
            }
          }
        });
        return dataSearch;
      }
    }

    class Render {
      constructor(settings, store, callbacks) {
        this.classes = {
          main: "ss-main",
          placeholder: "ss-placeholder",
          values: "ss-values",
          single: "ss-single",
          max: "ss-max",
          value: "ss-value",
          valueText: "ss-value-text",
          valueDelete: "ss-value-delete",
          valueOut: "ss-value-out",
          deselect: "ss-deselect",
          deselectPath: "M10,10 L90,90 M10,90 L90,10",
          arrow: "ss-arrow",
          arrowClose: "M10,30 L50,70 L90,30",
          arrowOpen: "M10,70 L50,30 L90,70",
          content: "ss-content",
          openAbove: "ss-open-above",
          openBelow: "ss-open-below",
          search: "ss-search",
          searchHighlighter: "ss-search-highlight",
          searching: "ss-searching",
          addable: "ss-addable",
          addablePath: "M50,10 L50,90 M10,50 L90,50",
          list: "ss-list",
          optgroup: "ss-optgroup",
          optgroupLabel: "ss-optgroup-label",
          optgroupLabelText: "ss-optgroup-label-text",
          optgroupActions: "ss-optgroup-actions",
          optgroupSelectAll: "ss-selectall",
          optgroupSelectAllBox: "M60,10 L10,10 L10,90 L90,90 L90,50",
          optgroupSelectAllCheck: "M30,45 L50,70 L90,10",
          optgroupClosable: "ss-closable",
          option: "ss-option",
          optionDelete: "M10,10 L90,90 M10,90 L90,10",
          highlighted: "ss-highlighted",
          open: "ss-open",
          close: "ss-close",
          selected: "ss-selected",
          error: "ss-error",
          disabled: "ss-disabled",
          hide: "ss-hide"
        };
        this.store = store;
        this.settings = settings;
        this.callbacks = callbacks;
        this.main = this.mainDiv();
        this.content = this.contentDiv();
        this.updateClassStyles();
        this.updateAriaAttributes();
        this.settings.contentLocation.appendChild(this.content.main);
      }
      enable() {
        this.main.main.classList.remove(this.classes.disabled);
        this.content.search.input.disabled = false;
      }
      disable() {
        this.main.main.classList.add(this.classes.disabled);
        this.content.search.input.disabled = true;
      }
      open() {
        this.main.arrow.path.setAttribute("d", this.classes.arrowOpen);
        this.main.main.classList.add(this.settings.openPosition === "up" ? this.classes.openAbove : this.classes.openBelow);
        this.main.main.setAttribute("aria-expanded", "true");
        this.moveContent();
        const selectedOptions = this.store.getSelectedOptions();
        if (selectedOptions.length) {
          const selectedId = selectedOptions[selectedOptions.length - 1].id;
          const selectedOption = this.content.list.querySelector('[data-id="' + selectedId + '"]');
          if (selectedOption) {
            this.ensureElementInView(this.content.list, selectedOption);
          }
        }
      }
      close() {
        this.main.main.classList.remove(this.classes.openAbove);
        this.main.main.classList.remove(this.classes.openBelow);
        this.main.main.setAttribute("aria-expanded", "false");
        this.content.main.classList.remove(this.classes.openAbove);
        this.content.main.classList.remove(this.classes.openBelow);
        this.main.arrow.path.setAttribute("d", this.classes.arrowClose);
      }
      updateClassStyles() {
        this.main.main.className = "";
        this.main.main.removeAttribute("style");
        this.content.main.className = "";
        this.content.main.removeAttribute("style");
        this.main.main.classList.add(this.classes.main);
        this.content.main.classList.add(this.classes.content);
        if (this.settings.style !== "") {
          this.main.main.style.cssText = this.settings.style;
          this.content.main.style.cssText = this.settings.style;
        }
        if (this.settings.class.length) {
          for (const c of this.settings.class) {
            if (c.trim() !== "") {
              this.main.main.classList.add(c.trim());
              this.content.main.classList.add(c.trim());
            }
          }
        }
        if (this.settings.contentPosition === "relative") {
          this.content.main.classList.add("ss-" + this.settings.contentPosition);
        }
      }
      updateAriaAttributes() {
        this.main.main.role = "combobox";
        this.main.main.setAttribute("aria-haspopup", "listbox");
        this.main.main.setAttribute("aria-controls", this.content.main.id);
        this.main.main.setAttribute("aria-expanded", "false");
        this.content.main.setAttribute("role", "listbox");
      }
      mainDiv() {
        var _a;
        const main = document.createElement("div");
        main.dataset.id = this.settings.id;
        main.setAttribute("aria-label", this.settings.ariaLabel);
        main.tabIndex = 0;
        main.onkeydown = (e) => {
          switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
              this.callbacks.open();
              e.key === "ArrowDown" ? this.highlight("down") : this.highlight("up");
              return false;
            case "Tab":
              this.callbacks.close();
              return true;
            case "Enter":
            case " ":
              this.callbacks.open();
              const highlighted = this.content.list.querySelector("." + this.classes.highlighted);
              if (highlighted) {
                highlighted.click();
              }
              return false;
            case "Escape":
              this.callbacks.close();
              return false;
          }
          return false;
        };
        main.onclick = (e) => {
          if (this.settings.disabled) {
            return;
          }
          this.settings.isOpen ? this.callbacks.close() : this.callbacks.open();
        };
        const values = document.createElement("div");
        values.classList.add(this.classes.values);
        main.appendChild(values);
        const deselect = document.createElement("div");
        deselect.classList.add(this.classes.deselect);
        const selectedOptions = (_a = this.store) === null || _a === undefined ? undefined : _a.getSelectedOptions();
        if (!this.settings.allowDeselect || this.settings.isMultiple && selectedOptions && selectedOptions.length <= 0) {
          deselect.classList.add(this.classes.hide);
        } else {
          deselect.classList.remove(this.classes.hide);
        }
        deselect.onclick = (e) => {
          e.stopPropagation();
          if (this.settings.disabled) {
            return;
          }
          let shouldDelete = true;
          const before = this.store.getSelectedOptions();
          const after = [];
          if (this.callbacks.beforeChange) {
            shouldDelete = this.callbacks.beforeChange(after, before) === true;
          }
          if (shouldDelete) {
            if (this.settings.isMultiple) {
              this.callbacks.setSelected([], false);
              this.updateDeselectAll();
            } else {
              const firstOption = this.store.getFirstOption();
              const value = firstOption ? firstOption.value : "";
              this.callbacks.setSelected(value, false);
            }
            if (this.settings.closeOnSelect) {
              this.callbacks.close();
            }
            if (this.callbacks.afterChange) {
              this.callbacks.afterChange(this.store.getSelectedOptions());
            }
          }
        };
        const deselectSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        deselectSvg.setAttribute("viewBox", "0 0 100 100");
        const deselectPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        deselectPath.setAttribute("d", this.classes.deselectPath);
        deselectSvg.appendChild(deselectPath);
        deselect.appendChild(deselectSvg);
        main.appendChild(deselect);
        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        arrow.classList.add(this.classes.arrow);
        arrow.setAttribute("viewBox", "0 0 100 100");
        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.setAttribute("d", this.classes.arrowClose);
        if (this.settings.alwaysOpen) {
          arrow.classList.add(this.classes.hide);
        }
        arrow.appendChild(arrowPath);
        main.appendChild(arrow);
        return {
          main,
          values,
          deselect: {
            main: deselect,
            svg: deselectSvg,
            path: deselectPath
          },
          arrow: {
            main: arrow,
            path: arrowPath
          }
        };
      }
      mainFocus(eventType) {
        if (eventType !== "click") {
          this.main.main.focus({ preventScroll: true });
        }
      }
      placeholder() {
        const placeholderOption = this.store.filter((o) => o.placeholder, false);
        let placeholderText = this.settings.placeholderText;
        if (placeholderOption.length) {
          if (placeholderOption[0].html !== "") {
            placeholderText = placeholderOption[0].html;
          } else if (placeholderOption[0].text !== "") {
            placeholderText = placeholderOption[0].text;
          }
        }
        const placeholder = document.createElement("div");
        placeholder.classList.add(this.classes.placeholder);
        placeholder.innerHTML = placeholderText;
        return placeholder;
      }
      renderValues() {
        if (!this.settings.isMultiple) {
          this.renderSingleValue();
          return;
        }
        this.renderMultipleValues();
      }
      renderSingleValue() {
        const selected = this.store.filter((o) => {
          return o.selected && !o.placeholder;
        }, false);
        const selectedSingle = selected.length > 0 ? selected[0] : null;
        if (!selectedSingle) {
          this.main.values.innerHTML = this.placeholder().outerHTML;
        } else {
          const singleValue = document.createElement("div");
          singleValue.classList.add(this.classes.single);
          if (selectedSingle.html) {
            singleValue.innerHTML = selectedSingle.html;
          } else {
            singleValue.innerText = selectedSingle.text;
          }
          this.main.values.innerHTML = singleValue.outerHTML;
        }
        if (!this.settings.allowDeselect || !selected.length) {
          this.main.deselect.main.classList.add(this.classes.hide);
        } else {
          this.main.deselect.main.classList.remove(this.classes.hide);
        }
      }
      renderMultipleValues() {
        let currentNodes = this.main.values.childNodes;
        let selectedOptions = this.store.filter((opt) => {
          return opt.selected && opt.display;
        }, false);
        if (selectedOptions.length === 0) {
          this.main.values.innerHTML = this.placeholder().outerHTML;
          return;
        } else {
          const placeholder = this.main.values.querySelector("." + this.classes.placeholder);
          if (placeholder) {
            placeholder.remove();
          }
        }
        if (selectedOptions.length > this.settings.maxValuesShown) {
          const singleValue = document.createElement("div");
          singleValue.classList.add(this.classes.max);
          singleValue.textContent = this.settings.maxValuesMessage.replace("{number}", selectedOptions.length.toString());
          this.main.values.innerHTML = singleValue.outerHTML;
          return;
        } else {
          const maxValuesMessage = this.main.values.querySelector("." + this.classes.max);
          if (maxValuesMessage) {
            maxValuesMessage.remove();
          }
        }
        let removeNodes = [];
        for (let i = 0;i < currentNodes.length; i++) {
          const node = currentNodes[i];
          const id = node.getAttribute("data-id");
          if (id) {
            const found = selectedOptions.filter((opt) => {
              return opt.id === id;
            }, false);
            if (!found.length) {
              removeNodes.push(node);
            }
          }
        }
        for (const n of removeNodes) {
          n.classList.add(this.classes.valueOut);
          setTimeout(() => {
            if (this.main.values.hasChildNodes() && this.main.values.contains(n)) {
              this.main.values.removeChild(n);
            }
          }, 100);
        }
        currentNodes = this.main.values.childNodes;
        for (let d = 0;d < selectedOptions.length; d++) {
          let shouldAdd = true;
          for (let i = 0;i < currentNodes.length; i++) {
            if (selectedOptions[d].id === String(currentNodes[i].dataset.id)) {
              shouldAdd = false;
            }
          }
          if (shouldAdd) {
            if (this.settings.keepOrder) {
              this.main.values.appendChild(this.multipleValue(selectedOptions[d]));
            } else {
              if (currentNodes.length === 0) {
                this.main.values.appendChild(this.multipleValue(selectedOptions[d]));
              } else if (d === 0) {
                this.main.values.insertBefore(this.multipleValue(selectedOptions[d]), currentNodes[d]);
              } else {
                currentNodes[d - 1].insertAdjacentElement("afterend", this.multipleValue(selectedOptions[d]));
              }
            }
          }
        }
        this.updateDeselectAll();
      }
      multipleValue(option) {
        const value = document.createElement("div");
        value.classList.add(this.classes.value);
        value.dataset.id = option.id;
        const text = document.createElement("div");
        text.classList.add(this.classes.valueText);
        text.innerText = option.text;
        value.appendChild(text);
        if (!option.mandatory) {
          const deleteDiv = document.createElement("div");
          deleteDiv.classList.add(this.classes.valueDelete);
          deleteDiv.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.settings.disabled) {
              return;
            }
            let shouldDelete = true;
            const before = this.store.getSelectedOptions();
            const after = before.filter((o) => {
              return o.selected && o.id !== option.id;
            }, true);
            if (this.settings.minSelected && after.length < this.settings.minSelected) {
              return;
            }
            if (this.callbacks.beforeChange) {
              shouldDelete = this.callbacks.beforeChange(after, before) === true;
            }
            if (shouldDelete) {
              let selectedValues = [];
              for (const o of after) {
                if (o instanceof Optgroup) {
                  for (const c of o.options) {
                    selectedValues.push(c.value);
                  }
                }
                if (o instanceof Option) {
                  selectedValues.push(o.value);
                }
              }
              this.callbacks.setSelected(selectedValues, false);
              if (this.settings.closeOnSelect) {
                this.callbacks.close();
              }
              if (this.callbacks.afterChange) {
                this.callbacks.afterChange(after);
              }
              this.updateDeselectAll();
            }
          };
          const deleteSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          deleteSvg.setAttribute("viewBox", "0 0 100 100");
          const deletePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          deletePath.setAttribute("d", this.classes.optionDelete);
          deleteSvg.appendChild(deletePath);
          deleteDiv.appendChild(deleteSvg);
          value.appendChild(deleteDiv);
        }
        return value;
      }
      contentDiv() {
        const main = document.createElement("div");
        main.dataset.id = this.settings.id;
        const search = this.searchDiv();
        main.appendChild(search.main);
        const list = this.listDiv();
        main.appendChild(list);
        return {
          main,
          search,
          list
        };
      }
      moveContent() {
        if (this.settings.contentPosition === "relative") {
          this.moveContentBelow();
          return;
        }
        if (this.settings.openPosition === "down") {
          this.moveContentBelow();
          return;
        } else if (this.settings.openPosition === "up") {
          this.moveContentAbove();
          return;
        }
        if (this.putContent() === "up") {
          this.moveContentAbove();
        } else {
          this.moveContentBelow();
        }
      }
      searchDiv() {
        const main = document.createElement("div");
        const input = document.createElement("input");
        const addable = document.createElement("div");
        main.classList.add(this.classes.search);
        const searchReturn = {
          main,
          input
        };
        if (!this.settings.showSearch) {
          main.classList.add(this.classes.hide);
          input.readOnly = true;
        }
        input.type = "search";
        input.placeholder = this.settings.searchPlaceholder;
        input.tabIndex = -1;
        input.setAttribute("aria-label", this.settings.searchPlaceholder);
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("autocorrect", "off");
        input.oninput = debounce((e) => {
          this.callbacks.search(e.target.value);
        }, 100);
        input.onkeydown = (e) => {
          switch (e.key) {
            case "ArrowUp":
            case "ArrowDown":
              e.key === "ArrowDown" ? this.highlight("down") : this.highlight("up");
              return false;
            case "Tab":
              this.callbacks.close();
              return true;
            case "Escape":
              this.callbacks.close();
              return false;
            case "Enter":
            case " ":
              if (this.callbacks.addable && e.ctrlKey) {
                addable.click();
                return false;
              } else {
                const highlighted = this.content.list.querySelector("." + this.classes.highlighted);
                if (highlighted) {
                  highlighted.click();
                  return false;
                }
              }
              return true;
          }
          return true;
        };
        main.appendChild(input);
        if (this.callbacks.addable) {
          addable.classList.add(this.classes.addable);
          const plus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          plus.setAttribute("viewBox", "0 0 100 100");
          const plusPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          plusPath.setAttribute("d", this.classes.addablePath);
          plus.appendChild(plusPath);
          addable.appendChild(plus);
          addable.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.callbacks.addable) {
              return;
            }
            const inputValue = this.content.search.input.value.trim();
            if (inputValue === "") {
              this.content.search.input.focus();
              return;
            }
            const runFinish = (oo) => {
              let newOption = new Option(oo);
              this.callbacks.addOption(newOption);
              if (this.settings.isMultiple) {
                let values = this.store.getSelected();
                values.push(newOption.value);
                this.callbacks.setSelected(values, true);
              } else {
                this.callbacks.setSelected([newOption.value], true);
              }
              this.callbacks.search("");
              if (this.settings.closeOnSelect) {
                setTimeout(() => {
                  this.callbacks.close();
                }, 100);
              }
            };
            const addableValue = this.callbacks.addable(inputValue);
            if (addableValue === false || addableValue === undefined || addableValue === null) {
              return;
            }
            if (addableValue instanceof Promise) {
              addableValue.then((value) => {
                if (typeof value === "string") {
                  runFinish({
                    text: value,
                    value
                  });
                } else {
                  runFinish(value);
                }
              });
            } else if (typeof addableValue === "string") {
              runFinish({
                text: addableValue,
                value: addableValue
              });
            } else {
              runFinish(addableValue);
            }
            return;
          };
          main.appendChild(addable);
          searchReturn.addable = {
            main: addable,
            svg: plus,
            path: plusPath
          };
        }
        return searchReturn;
      }
      searchFocus() {
        this.content.search.input.focus();
      }
      getOptions(notPlaceholder = false, notDisabled = false, notHidden = false) {
        let query = "." + this.classes.option;
        if (notPlaceholder) {
          query += ":not(." + this.classes.placeholder + ")";
        }
        if (notDisabled) {
          query += ":not(." + this.classes.disabled + ")";
        }
        if (notHidden) {
          query += ":not(." + this.classes.hide + ")";
        }
        return Array.from(this.content.list.querySelectorAll(query));
      }
      highlight(dir) {
        const options = this.getOptions(true, true, true);
        if (options.length === 0) {
          return;
        }
        if (options.length === 1) {
          if (!options[0].classList.contains(this.classes.highlighted)) {
            options[0].classList.add(this.classes.highlighted);
            return;
          }
        }
        let highlighted = false;
        for (const o of options) {
          if (o.classList.contains(this.classes.highlighted)) {
            highlighted = true;
          }
        }
        if (!highlighted) {
          for (const o of options) {
            if (o.classList.contains(this.classes.selected)) {
              o.classList.add(this.classes.highlighted);
              break;
            }
          }
        }
        for (let i = 0;i < options.length; i++) {
          if (options[i].classList.contains(this.classes.highlighted)) {
            const prevOption = options[i];
            prevOption.classList.remove(this.classes.highlighted);
            const prevParent = prevOption.parentElement;
            if (prevParent && prevParent.classList.contains(this.classes.open)) {
              const optgroupLabel = prevParent.querySelector("." + this.classes.optgroupLabel);
              if (optgroupLabel) {
                optgroupLabel.click();
              }
            }
            let selectOption = options[dir === "down" ? i + 1 < options.length ? i + 1 : 0 : i - 1 >= 0 ? i - 1 : options.length - 1];
            selectOption.classList.add(this.classes.highlighted);
            this.ensureElementInView(this.content.list, selectOption);
            const selectParent = selectOption.parentElement;
            if (selectParent && selectParent.classList.contains(this.classes.close)) {
              const optgroupLabel = selectParent.querySelector("." + this.classes.optgroupLabel);
              if (optgroupLabel) {
                optgroupLabel.click();
              }
            }
            return;
          }
        }
        options[dir === "down" ? 0 : options.length - 1].classList.add(this.classes.highlighted);
        this.ensureElementInView(this.content.list, options[dir === "down" ? 0 : options.length - 1]);
      }
      listDiv() {
        const options = document.createElement("div");
        options.classList.add(this.classes.list);
        return options;
      }
      renderError(error2) {
        this.content.list.innerHTML = "";
        const errorDiv = document.createElement("div");
        errorDiv.classList.add(this.classes.error);
        errorDiv.textContent = error2;
        this.content.list.appendChild(errorDiv);
      }
      renderSearching() {
        this.content.list.innerHTML = "";
        const searchingDiv = document.createElement("div");
        searchingDiv.classList.add(this.classes.searching);
        searchingDiv.textContent = this.settings.searchingText;
        this.content.list.appendChild(searchingDiv);
      }
      renderOptions(data) {
        this.content.list.innerHTML = "";
        if (data.length === 0) {
          const noResults = document.createElement("div");
          noResults.classList.add(this.classes.search);
          noResults.innerHTML = this.settings.searchText;
          this.content.list.appendChild(noResults);
          return;
        }
        for (const d of data) {
          if (d instanceof Optgroup) {
            const optgroupEl = document.createElement("div");
            optgroupEl.classList.add(this.classes.optgroup);
            const optgroupLabel = document.createElement("div");
            optgroupLabel.classList.add(this.classes.optgroupLabel);
            optgroupEl.appendChild(optgroupLabel);
            const optgroupLabelText = document.createElement("div");
            optgroupLabelText.classList.add(this.classes.optgroupLabelText);
            optgroupLabelText.textContent = d.label;
            optgroupLabel.appendChild(optgroupLabelText);
            const optgroupActions = document.createElement("div");
            optgroupActions.classList.add(this.classes.optgroupActions);
            optgroupLabel.appendChild(optgroupActions);
            if (this.settings.isMultiple && d.selectAll) {
              const selectAll = document.createElement("div");
              selectAll.classList.add(this.classes.optgroupSelectAll);
              let allSelected = true;
              for (const o of d.options) {
                if (!o.selected) {
                  allSelected = false;
                  break;
                }
              }
              if (allSelected) {
                selectAll.classList.add(this.classes.selected);
              }
              const selectAllText = document.createElement("span");
              selectAllText.textContent = d.selectAllText;
              selectAll.appendChild(selectAllText);
              const selectAllSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              selectAllSvg.setAttribute("viewBox", "0 0 100 100");
              selectAll.appendChild(selectAllSvg);
              const selectAllBox = document.createElementNS("http://www.w3.org/2000/svg", "path");
              selectAllBox.setAttribute("d", this.classes.optgroupSelectAllBox);
              selectAllSvg.appendChild(selectAllBox);
              const selectAllCheck = document.createElementNS("http://www.w3.org/2000/svg", "path");
              selectAllCheck.setAttribute("d", this.classes.optgroupSelectAllCheck);
              selectAllSvg.appendChild(selectAllCheck);
              selectAll.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentSelected = this.store.getSelected();
                if (allSelected) {
                  const newSelected = currentSelected.filter((s) => {
                    for (const o of d.options) {
                      if (s === o.value) {
                        return false;
                      }
                    }
                    return true;
                  });
                  this.callbacks.setSelected(newSelected, true);
                  return;
                } else {
                  const newSelected = currentSelected.concat(d.options.map((o) => o.value));
                  for (const o of d.options) {
                    if (!this.store.getOptionByID(o.id)) {
                      this.callbacks.addOption(o);
                    }
                  }
                  this.callbacks.setSelected(newSelected, true);
                  return;
                }
              });
              optgroupActions.appendChild(selectAll);
            }
            if (d.closable !== "off") {
              const optgroupClosable = document.createElement("div");
              optgroupClosable.classList.add(this.classes.optgroupClosable);
              const optgroupClosableSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              optgroupClosableSvg.setAttribute("viewBox", "0 0 100 100");
              optgroupClosableSvg.classList.add(this.classes.arrow);
              optgroupClosable.appendChild(optgroupClosableSvg);
              const optgroupClosableArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
              optgroupClosableSvg.appendChild(optgroupClosableArrow);
              if (d.options.some((o) => o.selected) || this.content.search.input.value.trim() !== "") {
                optgroupClosable.classList.add(this.classes.open);
                optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
              } else if (d.closable === "open") {
                optgroupEl.classList.add(this.classes.open);
                optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
              } else if (d.closable === "close") {
                optgroupEl.classList.add(this.classes.close);
                optgroupClosableArrow.setAttribute("d", this.classes.arrowClose);
              }
              optgroupLabel.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (optgroupEl.classList.contains(this.classes.close)) {
                  optgroupEl.classList.remove(this.classes.close);
                  optgroupEl.classList.add(this.classes.open);
                  optgroupClosableArrow.setAttribute("d", this.classes.arrowOpen);
                } else {
                  optgroupEl.classList.remove(this.classes.open);
                  optgroupEl.classList.add(this.classes.close);
                  optgroupClosableArrow.setAttribute("d", this.classes.arrowClose);
                }
              });
              optgroupActions.appendChild(optgroupClosable);
            }
            optgroupEl.appendChild(optgroupLabel);
            for (const o of d.options) {
              optgroupEl.appendChild(this.option(o));
            }
            this.content.list.appendChild(optgroupEl);
          }
          if (d instanceof Option) {
            this.content.list.appendChild(this.option(d));
          }
        }
      }
      option(option) {
        if (option.placeholder) {
          const placeholder = document.createElement("div");
          placeholder.classList.add(this.classes.option);
          placeholder.classList.add(this.classes.hide);
          return placeholder;
        }
        const optionEl = document.createElement("div");
        optionEl.dataset.id = option.id;
        optionEl.id = option.id;
        optionEl.classList.add(this.classes.option);
        optionEl.setAttribute("role", "option");
        if (option.class) {
          option.class.split(" ").forEach((dataClass) => {
            optionEl.classList.add(dataClass);
          });
        }
        if (option.style) {
          optionEl.style.cssText = option.style;
        }
        if (this.settings.searchHighlight && this.content.search.input.value.trim() !== "") {
          optionEl.innerHTML = this.highlightText(option.html !== "" ? option.html : option.text, this.content.search.input.value, this.classes.searchHighlighter);
        } else if (option.html !== "") {
          optionEl.innerHTML = option.html;
        } else {
          optionEl.textContent = option.text;
        }
        if (this.settings.showOptionTooltips && optionEl.textContent) {
          optionEl.setAttribute("title", optionEl.textContent);
        }
        if (!option.display) {
          optionEl.classList.add(this.classes.hide);
        }
        if (option.disabled) {
          optionEl.classList.add(this.classes.disabled);
        }
        if (option.selected && this.settings.hideSelected) {
          optionEl.classList.add(this.classes.hide);
        }
        if (option.selected) {
          optionEl.classList.add(this.classes.selected);
          optionEl.setAttribute("aria-selected", "true");
          this.main.main.setAttribute("aria-activedescendant", optionEl.id);
        } else {
          optionEl.classList.remove(this.classes.selected);
          optionEl.setAttribute("aria-selected", "false");
        }
        optionEl.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const selectedOptions = this.store.getSelected();
          const element = e.currentTarget;
          const elementID = String(element.dataset.id);
          if (option.disabled || option.selected && !this.settings.allowDeselect) {
            return;
          }
          if (this.settings.isMultiple && this.settings.maxSelected <= selectedOptions.length && !option.selected || this.settings.isMultiple && this.settings.minSelected >= selectedOptions.length && option.selected) {
            return;
          }
          let shouldUpdate = false;
          const before = this.store.getSelectedOptions();
          let after = [];
          if (this.settings.isMultiple) {
            if (option.selected) {
              after = before.filter((o) => o.id !== elementID);
            } else {
              after = before.concat(option);
            }
          }
          if (!this.settings.isMultiple) {
            if (option.selected) {
              after = [];
            } else {
              after = [option];
            }
          }
          if (!this.callbacks.beforeChange) {
            shouldUpdate = true;
          }
          if (this.callbacks.beforeChange) {
            if (this.callbacks.beforeChange(after, before) === false) {
              shouldUpdate = false;
            } else {
              shouldUpdate = true;
            }
          }
          if (shouldUpdate) {
            if (!this.store.getOptionByID(elementID)) {
              this.callbacks.addOption(option);
            }
            this.callbacks.setSelected(after.map((o) => o.value), false);
            if (this.settings.closeOnSelect) {
              this.callbacks.close();
            }
            if (this.callbacks.afterChange) {
              this.callbacks.afterChange(after);
            }
          }
        });
        return optionEl;
      }
      destroy() {
        this.main.main.remove();
        this.content.main.remove();
      }
      highlightText(str, search, className) {
        let completedString = str;
        const regex = new RegExp("(" + search.trim() + ")(?![^<]*>[^<>]*</)", "i");
        if (!str.match(regex)) {
          return str;
        }
        const matchStartPosition = str.match(regex).index;
        const matchEndPosition = matchStartPosition + str.match(regex)[0].toString().length;
        const originalTextFoundByRegex = str.substring(matchStartPosition, matchEndPosition);
        completedString = completedString.replace(regex, `<mark class="${className}">${originalTextFoundByRegex}</mark>`);
        return completedString;
      }
      moveContentAbove() {
        const mainHeight = this.main.main.offsetHeight;
        const contentHeight = this.content.main.offsetHeight;
        this.main.main.classList.remove(this.classes.openBelow);
        this.main.main.classList.add(this.classes.openAbove);
        this.content.main.classList.remove(this.classes.openBelow);
        this.content.main.classList.add(this.classes.openAbove);
        const containerRect = this.main.main.getBoundingClientRect();
        this.content.main.style.margin = "-" + (mainHeight + contentHeight - 1) + "px 0px 0px 0px";
        this.content.main.style.top = containerRect.top + containerRect.height + window.scrollY + "px";
        this.content.main.style.left = containerRect.left + window.scrollX + "px";
        this.content.main.style.width = containerRect.width + "px";
      }
      moveContentBelow() {
        this.main.main.classList.remove(this.classes.openAbove);
        this.main.main.classList.add(this.classes.openBelow);
        this.content.main.classList.remove(this.classes.openAbove);
        this.content.main.classList.add(this.classes.openBelow);
        const containerRect = this.main.main.getBoundingClientRect();
        this.content.main.style.margin = "-1px 0px 0px 0px";
        if (this.settings.contentPosition !== "relative") {
          this.content.main.style.top = containerRect.top + containerRect.height + window.scrollY + "px";
          this.content.main.style.left = containerRect.left + window.scrollX + "px";
          this.content.main.style.width = containerRect.width + "px";
        }
      }
      ensureElementInView(container, element) {
        const cTop = container.scrollTop + container.offsetTop;
        const cBottom = cTop + container.clientHeight;
        const eTop = element.offsetTop;
        const eBottom = eTop + element.clientHeight;
        if (eTop < cTop) {
          container.scrollTop -= cTop - eTop;
        } else if (eBottom > cBottom) {
          container.scrollTop += eBottom - cBottom;
        }
      }
      putContent() {
        const mainHeight = this.main.main.offsetHeight;
        const mainRect = this.main.main.getBoundingClientRect();
        const contentHeight = this.content.main.offsetHeight;
        const spaceBelow = window.innerHeight - (mainRect.top + mainHeight);
        if (spaceBelow <= contentHeight) {
          if (mainRect.top > contentHeight) {
            return "up";
          } else {
            return "down";
          }
        }
        return "down";
      }
      updateDeselectAll() {
        if (!this.store || !this.settings) {
          return;
        }
        const selected = this.store.getSelectedOptions();
        const hasSelectedItems = selected && selected.length > 0;
        const isMultiple = this.settings.isMultiple;
        const allowDeselect = this.settings.allowDeselect;
        const deselectButton = this.main.deselect.main;
        const hideClass = this.classes.hide;
        if (allowDeselect && !(isMultiple && !hasSelectedItems)) {
          deselectButton.classList.remove(hideClass);
        } else {
          deselectButton.classList.add(hideClass);
        }
      }
    }

    class Select {
      constructor(select) {
        this.listen = false;
        this.observer = null;
        this.select = select;
        this.valueChange = this.valueChange.bind(this);
        this.select.addEventListener("change", this.valueChange, {
          passive: true
        });
        this.observer = new MutationObserver(this.observeCall.bind(this));
        this.changeListen(true);
      }
      enable() {
        this.select.disabled = false;
      }
      disable() {
        this.select.disabled = true;
      }
      hideUI() {
        this.select.tabIndex = -1;
        this.select.style.display = "none";
        this.select.setAttribute("aria-hidden", "true");
      }
      showUI() {
        this.select.removeAttribute("tabindex");
        this.select.style.display = "";
        this.select.removeAttribute("aria-hidden");
      }
      changeListen(listen) {
        this.listen = listen;
        if (listen) {
          if (this.observer) {
            this.observer.observe(this.select, {
              subtree: true,
              childList: true,
              attributes: true
            });
          }
        }
        if (!listen) {
          if (this.observer) {
            this.observer.disconnect();
          }
        }
      }
      valueChange(ev) {
        if (this.listen && this.onValueChange) {
          this.onValueChange(this.getSelectedValues());
        }
        return true;
      }
      observeCall(mutations) {
        if (!this.listen) {
          return;
        }
        let classChanged = false;
        let disabledChanged = false;
        let optgroupOptionChanged = false;
        for (const m of mutations) {
          if (m.target === this.select) {
            if (m.attributeName === "disabled") {
              disabledChanged = true;
            }
            if (m.attributeName === "class") {
              classChanged = true;
            }
          }
          if (m.target.nodeName === "OPTGROUP" || m.target.nodeName === "OPTION") {
            optgroupOptionChanged = true;
          }
        }
        if (classChanged && this.onClassChange) {
          this.onClassChange(this.select.className.split(" "));
        }
        if (disabledChanged && this.onDisabledChange) {
          this.changeListen(false);
          this.onDisabledChange(this.select.disabled);
          this.changeListen(true);
        }
        if (optgroupOptionChanged && this.onOptionsChange) {
          this.changeListen(false);
          this.onOptionsChange(this.getData());
          this.changeListen(true);
        }
      }
      getData() {
        let data = [];
        const nodes = this.select.childNodes;
        for (const n of nodes) {
          if (n.nodeName === "OPTGROUP") {
            data.push(this.getDataFromOptgroup(n));
          }
          if (n.nodeName === "OPTION") {
            data.push(this.getDataFromOption(n));
          }
        }
        return data;
      }
      getDataFromOptgroup(optgroup) {
        let data = {
          id: optgroup.id,
          label: optgroup.label,
          selectAll: optgroup.dataset ? optgroup.dataset.selectall === "true" : false,
          selectAllText: optgroup.dataset ? optgroup.dataset.selectalltext : "Select all",
          closable: optgroup.dataset ? optgroup.dataset.closable : "off",
          options: []
        };
        const options = optgroup.childNodes;
        for (const o of options) {
          if (o.nodeName === "OPTION") {
            data.options.push(this.getDataFromOption(o));
          }
        }
        return data;
      }
      getDataFromOption(option) {
        return {
          id: option.id,
          value: option.value,
          text: option.text,
          html: option.dataset && option.dataset.html ? option.dataset.html : "",
          selected: option.selected,
          display: option.style.display === "none" ? false : true,
          disabled: option.disabled,
          mandatory: option.dataset ? option.dataset.mandatory === "true" : false,
          placeholder: option.dataset.placeholder === "true",
          class: option.className,
          style: option.style.cssText,
          data: option.dataset
        };
      }
      getSelectedValues() {
        let values = [];
        const options = this.select.childNodes;
        for (const o of options) {
          if (o.nodeName === "OPTGROUP") {
            const optgroupOptions = o.childNodes;
            for (const oo of optgroupOptions) {
              if (oo.nodeName === "OPTION") {
                const option = oo;
                if (option.selected) {
                  values.push(option.value);
                }
              }
            }
          }
          if (o.nodeName === "OPTION") {
            const option = o;
            if (option.selected) {
              values.push(option.value);
            }
          }
        }
        return values;
      }
      setSelected(value) {
        this.changeListen(false);
        const options = this.select.childNodes;
        for (const o of options) {
          if (o.nodeName === "OPTGROUP") {
            const optgroup = o;
            const optgroupOptions = optgroup.childNodes;
            for (const oo of optgroupOptions) {
              if (oo.nodeName === "OPTION") {
                const option = oo;
                option.selected = value.includes(option.value);
              }
            }
          }
          if (o.nodeName === "OPTION") {
            const option = o;
            option.selected = value.includes(option.value);
          }
        }
        this.changeListen(true);
      }
      updateSelect(id, style, classes) {
        this.changeListen(false);
        if (id) {
          this.select.dataset.id = id;
        }
        if (style) {
          this.select.style.cssText = style;
        }
        if (classes) {
          this.select.className = "";
          classes.forEach((c) => {
            if (c.trim() !== "") {
              this.select.classList.add(c.trim());
            }
          });
        }
        this.changeListen(true);
      }
      updateOptions(data) {
        this.changeListen(false);
        this.select.innerHTML = "";
        for (const d of data) {
          if (d instanceof Optgroup) {
            this.select.appendChild(this.createOptgroup(d));
          }
          if (d instanceof Option) {
            this.select.appendChild(this.createOption(d));
          }
        }
        this.select.dispatchEvent(new Event("change"));
        this.changeListen(true);
      }
      createOptgroup(optgroup) {
        const optgroupEl = document.createElement("optgroup");
        optgroupEl.id = optgroup.id;
        optgroupEl.label = optgroup.label;
        if (optgroup.selectAll) {
          optgroupEl.dataset.selectAll = "true";
        }
        if (optgroup.closable !== "off") {
          optgroupEl.dataset.closable = optgroup.closable;
        }
        if (optgroup.options) {
          for (const o of optgroup.options) {
            optgroupEl.appendChild(this.createOption(o));
          }
        }
        return optgroupEl;
      }
      createOption(info) {
        const optionEl = document.createElement("option");
        optionEl.id = info.id;
        optionEl.value = info.value;
        optionEl.innerHTML = info.text;
        if (info.html !== "") {
          optionEl.setAttribute("data-html", info.html);
        }
        if (info.selected) {
          optionEl.selected = info.selected;
        }
        if (info.disabled) {
          optionEl.disabled = true;
        }
        if (info.display === false) {
          optionEl.style.display = "none";
        }
        if (info.placeholder) {
          optionEl.setAttribute("data-placeholder", "true");
        }
        if (info.mandatory) {
          optionEl.setAttribute("data-mandatory", "true");
        }
        if (info.class) {
          info.class.split(" ").forEach((optionClass) => {
            optionEl.classList.add(optionClass);
          });
        }
        if (info.data && typeof info.data === "object") {
          Object.keys(info.data).forEach((key) => {
            optionEl.setAttribute("data-" + kebabCase(key), info.data[key]);
          });
        }
        return optionEl;
      }
      destroy() {
        this.changeListen(false);
        this.select.removeEventListener("change", this.valueChange);
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
        delete this.select.dataset.id;
        this.showUI();
      }
    }

    class Settings {
      constructor(settings) {
        this.id = "";
        this.style = "";
        this.class = [];
        this.isMultiple = false;
        this.isOpen = false;
        this.isFullOpen = false;
        this.intervalMove = null;
        if (!settings) {
          settings = {};
        }
        this.id = "ss-" + generateID();
        this.style = settings.style || "";
        this.class = settings.class || [];
        this.disabled = settings.disabled !== undefined ? settings.disabled : false;
        this.alwaysOpen = settings.alwaysOpen !== undefined ? settings.alwaysOpen : false;
        this.showSearch = settings.showSearch !== undefined ? settings.showSearch : true;
        this.ariaLabel = settings.ariaLabel || "Combobox";
        this.searchPlaceholder = settings.searchPlaceholder || "Search";
        this.searchText = settings.searchText || "No Results";
        this.searchingText = settings.searchingText || "Searching...";
        this.searchHighlight = settings.searchHighlight !== undefined ? settings.searchHighlight : false;
        this.closeOnSelect = settings.closeOnSelect !== undefined ? settings.closeOnSelect : true;
        this.contentLocation = settings.contentLocation || document.body;
        this.contentPosition = settings.contentPosition || "absolute";
        this.openPosition = settings.openPosition || "auto";
        this.placeholderText = settings.placeholderText !== undefined ? settings.placeholderText : "Select Value";
        this.allowDeselect = settings.allowDeselect !== undefined ? settings.allowDeselect : false;
        this.hideSelected = settings.hideSelected !== undefined ? settings.hideSelected : false;
        this.keepOrder = settings.keepOrder !== undefined ? settings.keepOrder : false;
        this.showOptionTooltips = settings.showOptionTooltips !== undefined ? settings.showOptionTooltips : false;
        this.minSelected = settings.minSelected || 0;
        this.maxSelected = settings.maxSelected || 1000;
        this.timeoutDelay = settings.timeoutDelay || 200;
        this.maxValuesShown = settings.maxValuesShown || 20;
        this.maxValuesMessage = settings.maxValuesMessage || "{number} selected";
      }
    }

    class SlimSelect {
      constructor(config) {
        var _a;
        this.events = {
          search: undefined,
          searchFilter: (opt, search) => {
            return opt.text.toLowerCase().indexOf(search.toLowerCase()) !== -1;
          },
          addable: undefined,
          beforeChange: undefined,
          afterChange: undefined,
          beforeOpen: undefined,
          afterOpen: undefined,
          beforeClose: undefined,
          afterClose: undefined
        };
        this.windowResize = debounce(() => {
          if (!this.settings.isOpen && !this.settings.isFullOpen) {
            return;
          }
          this.render.moveContent();
        });
        this.windowScroll = debounce(() => {
          if (!this.settings.isOpen && !this.settings.isFullOpen) {
            return;
          }
          this.render.moveContent();
        });
        this.documentClick = (e) => {
          if (!this.settings.isOpen) {
            return;
          }
          if (e.target && !hasClassInTree(e.target, this.settings.id)) {
            this.close(e.type);
          }
        };
        this.windowVisibilityChange = () => {
          if (document.hidden) {
            this.close();
          }
        };
        this.selectEl = typeof config.select === "string" ? document.querySelector(config.select) : config.select;
        if (!this.selectEl) {
          if (config.events && config.events.error) {
            config.events.error(new Error("Could not find select element"));
          }
          return;
        }
        if (this.selectEl.tagName !== "SELECT") {
          if (config.events && config.events.error) {
            config.events.error(new Error("Element isnt of type select"));
          }
          return;
        }
        if (this.selectEl.dataset.ssid) {
          this.destroy();
        }
        this.settings = new Settings(config.settings);
        const debounceEvents = ["afterChange", "beforeOpen", "afterOpen", "beforeClose", "afterClose"];
        for (const key in config.events) {
          if (!config.events.hasOwnProperty(key)) {
            continue;
          }
          if (debounceEvents.indexOf(key) !== -1) {
            this.events[key] = debounce(config.events[key], 100);
          } else {
            this.events[key] = config.events[key];
          }
        }
        this.settings.disabled = ((_a = config.settings) === null || _a === undefined ? undefined : _a.disabled) ? config.settings.disabled : this.selectEl.disabled;
        this.settings.isMultiple = this.selectEl.multiple;
        this.settings.style = this.selectEl.style.cssText;
        this.settings.class = this.selectEl.className.split(" ");
        this.select = new Select(this.selectEl);
        this.select.updateSelect(this.settings.id, this.settings.style, this.settings.class);
        this.select.hideUI();
        this.select.onValueChange = (values) => {
          this.setSelected(values);
        };
        this.select.onClassChange = (classes) => {
          this.settings.class = classes;
          this.render.updateClassStyles();
        };
        this.select.onDisabledChange = (disabled) => {
          if (disabled) {
            this.disable();
          } else {
            this.enable();
          }
        };
        this.select.onOptionsChange = (data) => {
          this.setData(data);
        };
        this.store = new Store(this.settings.isMultiple ? "multiple" : "single", config.data ? config.data : this.select.getData());
        if (config.data) {
          this.select.updateOptions(this.store.getData());
        }
        const renderCallbacks = {
          open: this.open.bind(this),
          close: this.close.bind(this),
          addable: this.events.addable ? this.events.addable : undefined,
          setSelected: this.setSelected.bind(this),
          addOption: this.addOption.bind(this),
          search: this.search.bind(this),
          beforeChange: this.events.beforeChange,
          afterChange: this.events.afterChange
        };
        this.render = new Render(this.settings, this.store, renderCallbacks);
        this.render.renderValues();
        this.render.renderOptions(this.store.getData());
        const selectAriaLabel = this.selectEl.getAttribute("aria-label");
        const selectAriaLabelledBy = this.selectEl.getAttribute("aria-labelledby");
        if (selectAriaLabel) {
          this.render.main.main.setAttribute("aria-label", selectAriaLabel);
        } else if (selectAriaLabelledBy) {
          this.render.main.main.setAttribute("aria-labelledby", selectAriaLabelledBy);
        }
        if (this.selectEl.parentNode) {
          this.selectEl.parentNode.insertBefore(this.render.main.main, this.selectEl.nextSibling);
        }
        window.addEventListener("resize", this.windowResize, false);
        if (this.settings.openPosition === "auto") {
          window.addEventListener("scroll", this.windowScroll, false);
        }
        document.addEventListener("visibilitychange", this.windowVisibilityChange);
        if (this.settings.disabled) {
          this.disable();
        }
        if (this.settings.alwaysOpen) {
          this.open();
        }
        this.selectEl.slim = this;
      }
      enable() {
        this.settings.disabled = false;
        this.select.enable();
        this.render.enable();
      }
      disable() {
        this.settings.disabled = true;
        this.select.disable();
        this.render.disable();
      }
      getData() {
        return this.store.getData();
      }
      setData(data) {
        const selected = this.store.getSelected();
        const err = this.store.validateDataArray(data);
        if (err) {
          if (this.events.error) {
            this.events.error(err);
          }
          return;
        }
        this.store.setData(data);
        const dataClean = this.store.getData();
        this.select.updateOptions(dataClean);
        this.render.renderValues();
        this.render.renderOptions(dataClean);
        if (this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
          this.events.afterChange(this.store.getSelectedOptions());
        }
      }
      getSelected() {
        return this.store.getSelected();
      }
      setSelected(value, runAfterChange = true) {
        const selected = this.store.getSelected();
        this.store.setSelectedBy("value", Array.isArray(value) ? value : [value]);
        const data = this.store.getData();
        this.select.updateOptions(data);
        this.render.renderValues();
        if (this.render.content.search.input.value !== "") {
          this.search(this.render.content.search.input.value);
        } else {
          this.render.renderOptions(data);
        }
        if (runAfterChange && this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
          this.events.afterChange(this.store.getSelectedOptions());
        }
      }
      addOption(option) {
        const selected = this.store.getSelected();
        if (!this.store.getDataOptions().some((o) => {
          var _a;
          return o.value === ((_a = option.value) !== null && _a !== undefined ? _a : option.text);
        })) {
          this.store.addOption(option);
        }
        const data = this.store.getData();
        this.select.updateOptions(data);
        this.render.renderValues();
        this.render.renderOptions(data);
        if (this.events.afterChange && !isEqual(selected, this.store.getSelected())) {
          this.events.afterChange(this.store.getSelectedOptions());
        }
      }
      open() {
        if (this.settings.disabled || this.settings.isOpen) {
          return;
        }
        if (this.events.beforeOpen) {
          this.events.beforeOpen();
        }
        this.render.open();
        if (this.settings.showSearch) {
          this.render.searchFocus();
        }
        this.settings.isOpen = true;
        setTimeout(() => {
          if (this.events.afterOpen) {
            this.events.afterOpen();
          }
          if (this.settings.isOpen) {
            this.settings.isFullOpen = true;
          }
          document.addEventListener("click", this.documentClick);
        }, this.settings.timeoutDelay);
        if (this.settings.contentPosition === "absolute") {
          if (this.settings.intervalMove) {
            clearInterval(this.settings.intervalMove);
          }
          this.settings.intervalMove = setInterval(this.render.moveContent.bind(this.render), 500);
        }
      }
      close(eventType = null) {
        if (!this.settings.isOpen || this.settings.alwaysOpen) {
          return;
        }
        if (this.events.beforeClose) {
          this.events.beforeClose();
        }
        this.render.close();
        if (this.render.content.search.input.value !== "") {
          this.search("");
        }
        this.render.mainFocus(eventType);
        this.settings.isOpen = false;
        this.settings.isFullOpen = false;
        setTimeout(() => {
          if (this.events.afterClose) {
            this.events.afterClose();
          }
          document.removeEventListener("click", this.documentClick);
        }, this.settings.timeoutDelay);
        if (this.settings.intervalMove) {
          clearInterval(this.settings.intervalMove);
        }
      }
      search(value) {
        if (this.render.content.search.input.value !== value) {
          this.render.content.search.input.value = value;
        }
        if (!this.events.search) {
          this.render.renderOptions(value === "" ? this.store.getData() : this.store.search(value, this.events.searchFilter));
          return;
        }
        this.render.renderSearching();
        const searchResp = this.events.search(value, this.store.getSelectedOptions());
        if (searchResp instanceof Promise) {
          searchResp.then((data) => {
            this.render.renderOptions(this.store.partialToFullData(data));
          }).catch((err) => {
            this.render.renderError(typeof err === "string" ? err : err.message);
          });
          return;
        } else if (Array.isArray(searchResp)) {
          this.render.renderOptions(this.store.partialToFullData(searchResp));
        } else {
          this.render.renderError("Search event must return a promise or an array of data");
        }
      }
      destroy() {
        document.removeEventListener("click", this.documentClick);
        window.removeEventListener("resize", this.windowResize, false);
        if (this.settings.openPosition === "auto") {
          window.removeEventListener("scroll", this.windowScroll, false);
        }
        document.removeEventListener("visibilitychange", this.windowVisibilityChange);
        this.store.setData([]);
        this.render.destroy();
        this.select.destroy();
      }
    }
    return SlimSelect;
  });
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_guar
var exports_turbo_es2017_esm = {};
__export(exports_turbo_es2017_esm, {
  visit: () => {
    {
      return visit;
    }
  },
  start: () => {
    {
      return start;
    }
  },
  setProgressBarDelay: () => {
    {
      return setProgressBarDelay;
    }
  },
  setFormMode: () => {
    {
      return setFormMode;
    }
  },
  setConfirmMethod: () => {
    {
      return setConfirmMethod;
    }
  },
  session: () => {
    {
      return session;
    }
  },
  renderStreamMessage: () => {
    {
      return renderStreamMessage;
    }
  },
  registerAdapter: () => {
    {
      return registerAdapter;
    }
  },
  navigator: () => {
    {
      return navigator$1;
    }
  },
  isSafe: () => {
    {
      return isSafe;
    }
  },
  fetchMethodFromString: () => {
    {
      return fetchMethodFromString;
    }
  },
  fetchEnctypeFromString: () => {
    {
      return fetchEnctypeFromString;
    }
  },
  fetch: () => {
    {
      return fetchWithTurboHeaders;
    }
  },
  disconnectStreamSource: () => {
    {
      return disconnectStreamSource;
    }
  },
  connectStreamSource: () => {
    {
      return connectStreamSource;
    }
  },
  clearCache: () => {
    {
      return clearCache;
    }
  },
  cache: () => {
    {
      return cache;
    }
  },
  StreamSourceElement: () => {
    {
      return StreamSourceElement;
    }
  },
  StreamElement: () => {
    {
      return StreamElement;
    }
  },
  StreamActions: () => {
    {
      return StreamActions;
    }
  },
  PageSnapshot: () => {
    {
      return PageSnapshot;
    }
  },
  PageRenderer: () => {
    {
      return PageRenderer;
    }
  },
  FrameRenderer: () => {
    {
      return FrameRenderer;
    }
  },
  FrameLoadingStyle: () => {
    {
      return FrameLoadingStyle;
    }
  },
  FrameElement: () => {
    {
      return FrameElement;
    }
  },
  FetchResponse: () => {
    {
      return FetchResponse;
    }
  },
  FetchRequest: () => {
    {
      return FetchRequest;
    }
  },
  FetchMethod: () => {
    {
      return FetchMethod;
    }
  },
  FetchEnctype: () => {
    {
      return FetchEnctype;
    }
  }
});
var findSubmitterFromClickTarget = function(target) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  const candidate = element ? element.closest("input, button") : null;
  return candidate?.type == "submit" ? candidate : null;
};
var clickCaptured = function(event) {
  const submitter = findSubmitterFromClickTarget(event.target);
  if (submitter && submitter.form) {
    submittersByForm.set(submitter.form, submitter);
  }
};
var frameLoadingStyleFromString = function(style) {
  switch (style.toLowerCase()) {
    case "lazy":
      return FrameLoadingStyle.lazy;
    default:
      return FrameLoadingStyle.eager;
  }
};
var expandURL = function(locatable) {
  return new URL(locatable.toString(), document.baseURI);
};
var getAnchor = function(url) {
  let anchorMatch;
  if (url.hash) {
    return url.hash.slice(1);
  } else if (anchorMatch = url.href.match(/#(.*)$/)) {
    return anchorMatch[1];
  }
};
var getAction$1 = function(form, submitter) {
  const action = submitter?.getAttribute("formaction") || form.getAttribute("action") || form.action;
  return expandURL(action);
};
var getExtension = function(url) {
  return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
};
var isHTML = function(url) {
  return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
};
var isPrefixedBy = function(baseURL, url) {
  const prefix = getPrefix(url);
  return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
};
var locationIsVisitable = function(location2, rootLocation) {
  return isPrefixedBy(location2, rootLocation) && isHTML(location2);
};
var getRequestURL = function(url) {
  const anchor = getAnchor(url);
  return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
};
var toCacheKey = function(url) {
  return getRequestURL(url);
};
var urlsAreEqual = function(left, right) {
  return expandURL(left).href == expandURL(right).href;
};
var getPathComponents = function(url) {
  return url.pathname.split("/").slice(1);
};
var getLastPathComponent = function(url) {
  return getPathComponents(url).slice(-1)[0];
};
var getPrefix = function(url) {
  return addTrailingSlash(url.origin + url.pathname);
};
var addTrailingSlash = function(value) {
  return value.endsWith("/") ? value : value + "/";
};
var activateScriptElement = function(element) {
  if (element.getAttribute("data-turbo-eval") == "false") {
    return element;
  } else {
    const createdScriptElement = document.createElement("script");
    const cspNonce = getMetaContent("csp-nonce");
    if (cspNonce) {
      createdScriptElement.nonce = cspNonce;
    }
    createdScriptElement.textContent = element.textContent;
    createdScriptElement.async = false;
    copyElementAttributes(createdScriptElement, element);
    return createdScriptElement;
  }
};
var copyElementAttributes = function(destinationElement, sourceElement) {
  for (const { name, value } of sourceElement.attributes) {
    destinationElement.setAttribute(name, value);
  }
};
var createDocumentFragment = function(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
};
var dispatch = function(eventName, { target, cancelable, detail } = {}) {
  const event = new CustomEvent(eventName, {
    cancelable,
    bubbles: true,
    composed: true,
    detail
  });
  if (target && target.isConnected) {
    target.dispatchEvent(event);
  } else {
    document.documentElement.dispatchEvent(event);
  }
  return event;
};
var nextRepaint = function() {
  if (document.visibilityState === "hidden") {
    return nextEventLoopTick();
  } else {
    return nextAnimationFrame();
  }
};
var nextAnimationFrame = function() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
};
var nextEventLoopTick = function() {
  return new Promise((resolve) => setTimeout(() => resolve(), 0));
};
var nextMicrotask = function() {
  return Promise.resolve();
};
var parseHTMLDocument = function(html = "") {
  return new DOMParser().parseFromString(html, "text/html");
};
var unindent = function(strings, ...values) {
  const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
  const match = lines[0].match(/^\s+/);
  const indent = match ? match[0].length : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
};
var interpolate = function(strings, values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] == undefined ? "" : values[i];
    return result + string + value;
  }, "");
};
var uuid = function() {
  return Array.from({ length: 36 }).map((_, i) => {
    if (i == 8 || i == 13 || i == 18 || i == 23) {
      return "-";
    } else if (i == 14) {
      return "4";
    } else if (i == 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16);
    } else {
      return Math.floor(Math.random() * 15).toString(16);
    }
  }).join("");
};
var getAttribute = function(attributeName, ...elements) {
  for (const value of elements.map((element) => element?.getAttribute(attributeName))) {
    if (typeof value == "string")
      return value;
  }
  return null;
};
var hasAttribute = function(attributeName, ...elements) {
  return elements.some((element) => element && element.hasAttribute(attributeName));
};
var markAsBusy = function(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.setAttribute("busy", "");
    }
    element.setAttribute("aria-busy", "true");
  }
};
var clearBusyState = function(...elements) {
  for (const element of elements) {
    if (element.localName == "turbo-frame") {
      element.removeAttribute("busy");
    }
    element.removeAttribute("aria-busy");
  }
};
var waitForLoad = function(element, timeoutInMilliseconds = 2000) {
  return new Promise((resolve) => {
    const onComplete = () => {
      element.removeEventListener("error", onComplete);
      element.removeEventListener("load", onComplete);
      resolve();
    };
    element.addEventListener("load", onComplete, { once: true });
    element.addEventListener("error", onComplete, { once: true });
    setTimeout(resolve, timeoutInMilliseconds);
  });
};
var getHistoryMethodForAction = function(action) {
  switch (action) {
    case "replace":
      return history.replaceState;
    case "advance":
    case "restore":
      return history.pushState;
  }
};
var isAction = function(action) {
  return action == "advance" || action == "replace" || action == "restore";
};
var getVisitAction = function(...elements) {
  const action = getAttribute("data-turbo-action", ...elements);
  return isAction(action) ? action : null;
};
var getMetaElement = function(name) {
  return document.querySelector(`meta[name="${name}"]`);
};
var getMetaContent = function(name) {
  const element = getMetaElement(name);
  return element && element.content;
};
var setMetaContent = function(name, content) {
  let element = getMetaElement(name);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
};
var findClosestRecursively = function(element, selector) {
  if (element instanceof Element) {
    return element.closest(selector) || findClosestRecursively(element.assignedSlot || element.getRootNode()?.host, selector);
  }
};
var elementIsFocusable = function(element) {
  const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
  return !!element && element.closest(inertDisabledOrHidden) == null && typeof element.focus == "function";
};
var queryAutofocusableElement = function(elementOrDocumentFragment) {
  return Array.from(elementOrDocumentFragment.querySelectorAll("[autofocus]")).find(elementIsFocusable);
};
async function around(callback, reader) {
  const before = reader();
  callback();
  await nextAnimationFrame();
  const after = reader();
  return [before, after];
}
var fetchWithTurboHeaders = function(url, options = {}) {
  const modifiedHeaders = new Headers(options.headers || {});
  const requestUID = uuid();
  recentRequests.add(requestUID);
  modifiedHeaders.append("X-Turbo-Request-Id", requestUID);
  return nativeFetch(url, {
    ...options,
    headers: modifiedHeaders
  });
};
var fetchMethodFromString = function(method) {
  switch (method.toLowerCase()) {
    case "get":
      return FetchMethod.get;
    case "post":
      return FetchMethod.post;
    case "put":
      return FetchMethod.put;
    case "patch":
      return FetchMethod.patch;
    case "delete":
      return FetchMethod.delete;
  }
};
var fetchEnctypeFromString = function(encoding) {
  switch (encoding.toLowerCase()) {
    case FetchEnctype.multipart:
      return FetchEnctype.multipart;
    case FetchEnctype.plain:
      return FetchEnctype.plain;
    default:
      return FetchEnctype.urlEncoded;
  }
};
var isSafe = function(fetchMethod) {
  return fetchMethodFromString(fetchMethod) == FetchMethod.get;
};
var buildResourceAndBody = function(resource, method, requestBody, enctype) {
  const searchParams = Array.from(requestBody).length > 0 ? new URLSearchParams(entriesExcludingFiles(requestBody)) : resource.searchParams;
  if (isSafe(method)) {
    return [mergeIntoURLSearchParams(resource, searchParams), null];
  } else if (enctype == FetchEnctype.urlEncoded) {
    return [resource, searchParams];
  } else {
    return [resource, requestBody];
  }
};
var entriesExcludingFiles = function(requestBody) {
  const entries = [];
  for (const [name, value] of requestBody) {
    if (value instanceof File)
      continue;
    else
      entries.push([name, value]);
  }
  return entries;
};
var mergeIntoURLSearchParams = function(url, requestBody) {
  const searchParams = new URLSearchParams(entriesExcludingFiles(requestBody));
  url.search = searchParams.toString();
  return url;
};
var importStreamElements = function(fragment) {
  for (const element of fragment.querySelectorAll("turbo-stream")) {
    const streamElement = document.importNode(element, true);
    for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
      inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
    }
    element.replaceWith(streamElement);
  }
  return fragment;
};
var buildFormData = function(formElement, submitter) {
  const formData = new FormData(formElement);
  const name = submitter?.getAttribute("name");
  const value = submitter?.getAttribute("value");
  if (name) {
    formData.append(name, value || "");
  }
  return formData;
};
var getCookieValue = function(cookieName) {
  if (cookieName != null) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=");
      return value ? decodeURIComponent(value) : undefined;
    }
  }
};
var responseSucceededWithoutRedirect = function(response) {
  return response.statusCode == 200 && !response.redirected;
};
var getFormAction = function(formElement, submitter) {
  const formElementAction = typeof formElement.action === "string" ? formElement.action : null;
  if (submitter?.hasAttribute("formaction")) {
    return submitter.getAttribute("formaction") || "";
  } else {
    return formElement.getAttribute("action") || formElementAction || "";
  }
};
var getAction = function(formAction, fetchMethod) {
  const action = expandURL(formAction);
  if (isSafe(fetchMethod)) {
    action.search = "";
  }
  return action;
};
var getMethod = function(formElement, submitter) {
  const method = submitter?.getAttribute("formmethod") || formElement.getAttribute("method") || "";
  return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
};
var getEnctype = function(formElement, submitter) {
  return fetchEnctypeFromString(submitter?.getAttribute("formenctype") || formElement.enctype);
};
var getPermanentElementById = function(node, id) {
  return node.querySelector(`#${id}[data-turbo-permanent]`);
};
var queryPermanentElementsAll = function(node) {
  return node.querySelectorAll("[id][data-turbo-permanent]");
};
var submissionDoesNotDismissDialog = function(form, submitter) {
  const method = submitter?.getAttribute("formmethod") || form.getAttribute("method");
  return method != "dialog";
};
var submissionDoesNotTargetIFrame = function(form, submitter) {
  if (submitter?.hasAttribute("formtarget") || form.hasAttribute("target")) {
    const target = submitter?.getAttribute("formtarget") || form.target;
    for (const element of document.getElementsByName(target)) {
      if (element instanceof HTMLIFrameElement)
        return false;
    }
    return true;
  } else {
    return true;
  }
};
var doesNotTargetIFrame = function(anchor) {
  if (anchor.hasAttribute("target")) {
    for (const element of document.getElementsByName(anchor.target)) {
      if (element instanceof HTMLIFrameElement)
        return false;
    }
    return true;
  } else {
    return true;
  }
};
var createPlaceholderForPermanentElement = function(permanentElement) {
  const element = document.createElement("meta");
  element.setAttribute("name", "turbo-permanent-placeholder");
  element.setAttribute("content", permanentElement.id);
  return element;
};
var readScrollLogicalPosition = function(value, defaultValue) {
  if (value == "end" || value == "start" || value == "center" || value == "nearest") {
    return value;
  } else {
    return defaultValue;
  }
};
var readScrollBehavior = function(value, defaultValue) {
  if (value == "auto" || value == "smooth") {
    return value;
  } else {
    return defaultValue;
  }
};
var elementType = function(element) {
  if (elementIsScript(element)) {
    return "script";
  } else if (elementIsStylesheet(element)) {
    return "stylesheet";
  }
};
var elementIsTracked = function(element) {
  return element.getAttribute("data-turbo-track") == "reload";
};
var elementIsScript = function(element) {
  const tagName = element.localName;
  return tagName == "script";
};
var elementIsNoscript = function(element) {
  const tagName = element.localName;
  return tagName == "noscript";
};
var elementIsStylesheet = function(element) {
  const tagName = element.localName;
  return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
};
var elementIsMetaElementWithName = function(element, name) {
  const tagName = element.localName;
  return tagName == "meta" && element.getAttribute("name") == name;
};
var elementWithoutNonce = function(element) {
  if (element.hasAttribute("nonce")) {
    element.setAttribute("nonce", "");
  }
  return element;
};
var isSuccessful = function(statusCode) {
  return statusCode >= 200 && statusCode < 300;
};
var getPermanentElementMapForFragment = function(fragment) {
  const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
  const permanentElementMap = {};
  for (const permanentElementInDocument of permanentElementsInDocument) {
    const { id } = permanentElementInDocument;
    for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
      const elementInStream = getPermanentElementById(streamElement.templateElement.content, id);
      if (elementInStream) {
        permanentElementMap[id] = [permanentElementInDocument, elementInStream];
      }
    }
  }
  return permanentElementMap;
};
async function withAutofocusFromFragment(fragment, callback) {
  const generatedID = `turbo-stream-autofocus-${uuid()}`;
  const turboStreams = fragment.querySelectorAll("turbo-stream");
  const elementWithAutofocus = firstAutofocusableElementInStreams(turboStreams);
  let willAutofocusId = null;
  if (elementWithAutofocus) {
    if (elementWithAutofocus.id) {
      willAutofocusId = elementWithAutofocus.id;
    } else {
      willAutofocusId = generatedID;
    }
    elementWithAutofocus.id = willAutofocusId;
  }
  callback();
  await nextRepaint();
  const hasNoActiveElement = document.activeElement == null || document.activeElement == document.body;
  if (hasNoActiveElement && willAutofocusId) {
    const elementToAutofocus = document.getElementById(willAutofocusId);
    if (elementIsFocusable(elementToAutofocus)) {
      elementToAutofocus.focus();
    }
    if (elementToAutofocus && elementToAutofocus.id == generatedID) {
      elementToAutofocus.removeAttribute("id");
    }
  }
}
async function withPreservedFocus(callback) {
  const [activeElementBeforeRender, activeElementAfterRender] = await around(callback, () => document.activeElement);
  const restoreFocusTo = activeElementBeforeRender && activeElementBeforeRender.id;
  if (restoreFocusTo) {
    const elementToFocus = document.getElementById(restoreFocusTo);
    if (elementIsFocusable(elementToFocus) && elementToFocus != activeElementAfterRender) {
      elementToFocus.focus();
    }
  }
}
var firstAutofocusableElementInStreams = function(nodeListOfStreamElements) {
  for (const streamElement of nodeListOfStreamElements) {
    const elementWithAutofocus = queryAutofocusableElement(streamElement.templateElement.content);
    if (elementWithAutofocus)
      return elementWithAutofocus;
  }
  return null;
};
var fetchResponseFromEvent = function(event) {
  const fetchResponse = event.detail?.fetchResponse;
  if (fetchResponse instanceof FetchResponse) {
    return fetchResponse;
  }
};
var fetchResponseIsStream = function(response) {
  const contentType = response.contentType ?? "";
  return contentType.startsWith(StreamMessage.contentType);
};
var morph = function(oldNode, newContent, config = {}) {
  if (oldNode instanceof Document) {
    oldNode = oldNode.documentElement;
  }
  if (typeof newContent === "string") {
    newContent = parseContent(newContent);
  }
  let normalizedContent = normalizeContent(newContent);
  let ctx = createMorphContext(oldNode, normalizedContent, config);
  return morphNormalizedContent(oldNode, normalizedContent, ctx);
};
var morphNormalizedContent = function(oldNode, normalizedNewContent, ctx) {
  if (ctx.head.block) {
    let oldHead = oldNode.querySelector("head");
    let newHead = normalizedNewContent.querySelector("head");
    if (oldHead && newHead) {
      let promises = handleHeadElement(newHead, oldHead, ctx);
      Promise.all(promises).then(function() {
        morphNormalizedContent(oldNode, normalizedNewContent, Object.assign(ctx, {
          head: {
            block: false,
            ignore: true
          }
        }));
      });
      return;
    }
  }
  if (ctx.morphStyle === "innerHTML") {
    morphChildren(normalizedNewContent, oldNode, ctx);
    return oldNode.children;
  } else if (ctx.morphStyle === "outerHTML" || ctx.morphStyle == null) {
    let bestMatch = findBestNodeMatch(normalizedNewContent, oldNode, ctx);
    let previousSibling = bestMatch?.previousSibling;
    let nextSibling = bestMatch?.nextSibling;
    let morphedNode = morphOldNodeTo(oldNode, bestMatch, ctx);
    if (bestMatch) {
      return insertSiblings(previousSibling, morphedNode, nextSibling);
    } else {
      return [];
    }
  } else {
    throw "Do not understand how to morph style " + ctx.morphStyle;
  }
};
var morphOldNodeTo = function(oldNode, newContent, ctx) {
  if (ctx.ignoreActive && oldNode === document.activeElement)
    ;
  else if (newContent == null) {
    if (ctx.callbacks.beforeNodeRemoved(oldNode) === false)
      return;
    oldNode.remove();
    ctx.callbacks.afterNodeRemoved(oldNode);
    return null;
  } else if (!isSoftMatch(oldNode, newContent)) {
    if (ctx.callbacks.beforeNodeRemoved(oldNode) === false)
      return;
    if (ctx.callbacks.beforeNodeAdded(newContent) === false)
      return;
    oldNode.parentElement.replaceChild(newContent, oldNode);
    ctx.callbacks.afterNodeAdded(newContent);
    ctx.callbacks.afterNodeRemoved(oldNode);
    return newContent;
  } else {
    if (ctx.callbacks.beforeNodeMorphed(oldNode, newContent) === false)
      return;
    if (oldNode instanceof HTMLHeadElement && ctx.head.ignore)
      ;
    else if (oldNode instanceof HTMLHeadElement && ctx.head.style !== "morph") {
      handleHeadElement(newContent, oldNode, ctx);
    } else {
      syncNodeFrom(newContent, oldNode);
      morphChildren(newContent, oldNode, ctx);
    }
    ctx.callbacks.afterNodeMorphed(oldNode, newContent);
    return oldNode;
  }
};
var morphChildren = function(newParent, oldParent, ctx) {
  let nextNewChild = newParent.firstChild;
  let insertionPoint = oldParent.firstChild;
  let newChild;
  while (nextNewChild) {
    newChild = nextNewChild;
    nextNewChild = newChild.nextSibling;
    if (insertionPoint == null) {
      if (ctx.callbacks.beforeNodeAdded(newChild) === false)
        return;
      oldParent.appendChild(newChild);
      ctx.callbacks.afterNodeAdded(newChild);
      removeIdsFromConsideration(ctx, newChild);
      continue;
    }
    if (isIdSetMatch(newChild, insertionPoint, ctx)) {
      morphOldNodeTo(insertionPoint, newChild, ctx);
      insertionPoint = insertionPoint.nextSibling;
      removeIdsFromConsideration(ctx, newChild);
      continue;
    }
    let idSetMatch = findIdSetMatch(newParent, oldParent, newChild, insertionPoint, ctx);
    if (idSetMatch) {
      insertionPoint = removeNodesBetween(insertionPoint, idSetMatch, ctx);
      morphOldNodeTo(idSetMatch, newChild, ctx);
      removeIdsFromConsideration(ctx, newChild);
      continue;
    }
    let softMatch = findSoftMatch(newParent, oldParent, newChild, insertionPoint, ctx);
    if (softMatch) {
      insertionPoint = removeNodesBetween(insertionPoint, softMatch, ctx);
      morphOldNodeTo(softMatch, newChild, ctx);
      removeIdsFromConsideration(ctx, newChild);
      continue;
    }
    if (ctx.callbacks.beforeNodeAdded(newChild) === false)
      return;
    oldParent.insertBefore(newChild, insertionPoint);
    ctx.callbacks.afterNodeAdded(newChild);
    removeIdsFromConsideration(ctx, newChild);
  }
  while (insertionPoint !== null) {
    let tempNode = insertionPoint;
    insertionPoint = insertionPoint.nextSibling;
    removeNode(tempNode, ctx);
  }
};
var syncNodeFrom = function(from, to) {
  let type = from.nodeType;
  if (type === 1) {
    const fromAttributes = from.attributes;
    const toAttributes = to.attributes;
    for (const fromAttribute of fromAttributes) {
      if (to.getAttribute(fromAttribute.name) !== fromAttribute.value) {
        to.setAttribute(fromAttribute.name, fromAttribute.value);
      }
    }
    for (const toAttribute of toAttributes) {
      if (!from.hasAttribute(toAttribute.name)) {
        to.removeAttribute(toAttribute.name);
      }
    }
  }
  if (type === 8 || type === 3) {
    if (to.nodeValue !== from.nodeValue) {
      to.nodeValue = from.nodeValue;
    }
  }
  if (from instanceof HTMLInputElement && to instanceof HTMLInputElement && from.type !== "file") {
    to.value = from.value || "";
    syncAttribute(from, to, "value");
    syncAttribute(from, to, "checked");
    syncAttribute(from, to, "disabled");
  } else if (from instanceof HTMLOptionElement) {
    syncAttribute(from, to, "selected");
  } else if (from instanceof HTMLTextAreaElement && to instanceof HTMLTextAreaElement) {
    let fromValue = from.value;
    let toValue = to.value;
    if (fromValue !== toValue) {
      to.value = fromValue;
    }
    if (to.firstChild && to.firstChild.nodeValue !== fromValue) {
      to.firstChild.nodeValue = fromValue;
    }
  }
};
var syncAttribute = function(from, to, attributeName) {
  if (from[attributeName] !== to[attributeName]) {
    if (from[attributeName]) {
      to.setAttribute(attributeName, from[attributeName]);
    } else {
      to.removeAttribute(attributeName);
    }
  }
};
var handleHeadElement = function(newHeadTag, currentHead, ctx) {
  let added = [];
  let removed = [];
  let preserved = [];
  let nodesToAppend = [];
  let headMergeStyle = ctx.head.style;
  let srcToNewHeadNodes = new Map;
  for (const newHeadChild of newHeadTag.children) {
    srcToNewHeadNodes.set(newHeadChild.outerHTML, newHeadChild);
  }
  for (const currentHeadElt of currentHead.children) {
    let inNewContent = srcToNewHeadNodes.has(currentHeadElt.outerHTML);
    let isReAppended = ctx.head.shouldReAppend(currentHeadElt);
    let isPreserved = ctx.head.shouldPreserve(currentHeadElt);
    if (inNewContent || isPreserved) {
      if (isReAppended) {
        removed.push(currentHeadElt);
      } else {
        srcToNewHeadNodes.delete(currentHeadElt.outerHTML);
        preserved.push(currentHeadElt);
      }
    } else {
      if (headMergeStyle === "append") {
        if (isReAppended) {
          removed.push(currentHeadElt);
          nodesToAppend.push(currentHeadElt);
        }
      } else {
        if (ctx.head.shouldRemove(currentHeadElt) !== false) {
          removed.push(currentHeadElt);
        }
      }
    }
  }
  nodesToAppend.push(...srcToNewHeadNodes.values());
  let promises = [];
  for (const newNode of nodesToAppend) {
    let newElt = document.createRange().createContextualFragment(newNode.outerHTML).firstChild;
    if (ctx.callbacks.beforeNodeAdded(newElt) !== false) {
      if (newElt.href || newElt.src) {
        let resolve = null;
        let promise = new Promise(function(_resolve) {
          resolve = _resolve;
        });
        newElt.addEventListener("load", function() {
          resolve();
        });
        promises.push(promise);
      }
      currentHead.appendChild(newElt);
      ctx.callbacks.afterNodeAdded(newElt);
      added.push(newElt);
    }
  }
  for (const removedElement of removed) {
    if (ctx.callbacks.beforeNodeRemoved(removedElement) !== false) {
      currentHead.removeChild(removedElement);
      ctx.callbacks.afterNodeRemoved(removedElement);
    }
  }
  ctx.head.afterHeadMorphed(currentHead, { added, kept: preserved, removed });
  return promises;
};
var noOp = function() {
};
var createMorphContext = function(oldNode, newContent, config) {
  return {
    target: oldNode,
    newContent,
    config,
    morphStyle: config.morphStyle,
    ignoreActive: config.ignoreActive,
    idMap: createIdMap(oldNode, newContent),
    deadIds: new Set,
    callbacks: Object.assign({
      beforeNodeAdded: noOp,
      afterNodeAdded: noOp,
      beforeNodeMorphed: noOp,
      afterNodeMorphed: noOp,
      beforeNodeRemoved: noOp,
      afterNodeRemoved: noOp
    }, config.callbacks),
    head: Object.assign({
      style: "merge",
      shouldPreserve: function(elt) {
        return elt.getAttribute("im-preserve") === "true";
      },
      shouldReAppend: function(elt) {
        return elt.getAttribute("im-re-append") === "true";
      },
      shouldRemove: noOp,
      afterHeadMorphed: noOp
    }, config.head)
  };
};
var isIdSetMatch = function(node1, node2, ctx) {
  if (node1 == null || node2 == null) {
    return false;
  }
  if (node1.nodeType === node2.nodeType && node1.tagName === node2.tagName) {
    if (node1.id !== "" && node1.id === node2.id) {
      return true;
    } else {
      return getIdIntersectionCount(ctx, node1, node2) > 0;
    }
  }
  return false;
};
var isSoftMatch = function(node1, node2) {
  if (node1 == null || node2 == null) {
    return false;
  }
  return node1.nodeType === node2.nodeType && node1.tagName === node2.tagName;
};
var removeNodesBetween = function(startInclusive, endExclusive, ctx) {
  while (startInclusive !== endExclusive) {
    let tempNode = startInclusive;
    startInclusive = startInclusive.nextSibling;
    removeNode(tempNode, ctx);
  }
  removeIdsFromConsideration(ctx, endExclusive);
  return endExclusive.nextSibling;
};
var findIdSetMatch = function(newContent, oldParent, newChild, insertionPoint, ctx) {
  let newChildPotentialIdCount = getIdIntersectionCount(ctx, newChild, oldParent);
  let potentialMatch = null;
  if (newChildPotentialIdCount > 0) {
    let potentialMatch2 = insertionPoint;
    let otherMatchCount = 0;
    while (potentialMatch2 != null) {
      if (isIdSetMatch(newChild, potentialMatch2, ctx)) {
        return potentialMatch2;
      }
      otherMatchCount += getIdIntersectionCount(ctx, potentialMatch2, newContent);
      if (otherMatchCount > newChildPotentialIdCount) {
        return null;
      }
      potentialMatch2 = potentialMatch2.nextSibling;
    }
  }
  return potentialMatch;
};
var findSoftMatch = function(newContent, oldParent, newChild, insertionPoint, ctx) {
  let potentialSoftMatch = insertionPoint;
  let nextSibling = newChild.nextSibling;
  let siblingSoftMatchCount = 0;
  while (potentialSoftMatch != null) {
    if (getIdIntersectionCount(ctx, potentialSoftMatch, newContent) > 0) {
      return null;
    }
    if (isSoftMatch(newChild, potentialSoftMatch)) {
      return potentialSoftMatch;
    }
    if (isSoftMatch(nextSibling, potentialSoftMatch)) {
      siblingSoftMatchCount++;
      nextSibling = nextSibling.nextSibling;
      if (siblingSoftMatchCount >= 2) {
        return null;
      }
    }
    potentialSoftMatch = potentialSoftMatch.nextSibling;
  }
  return potentialSoftMatch;
};
var parseContent = function(newContent) {
  let parser = new DOMParser;
  let contentWithSvgsRemoved = newContent.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim, "");
  if (contentWithSvgsRemoved.match(/<\/html>/) || contentWithSvgsRemoved.match(/<\/head>/) || contentWithSvgsRemoved.match(/<\/body>/)) {
    let content = parser.parseFromString(newContent, "text/html");
    if (contentWithSvgsRemoved.match(/<\/html>/)) {
      content.generatedByIdiomorph = true;
      return content;
    } else {
      let htmlElement = content.firstChild;
      if (htmlElement) {
        htmlElement.generatedByIdiomorph = true;
        return htmlElement;
      } else {
        return null;
      }
    }
  } else {
    let responseDoc = parser.parseFromString("<body><template>" + newContent + "</template></body>", "text/html");
    let content = responseDoc.body.querySelector("template").content;
    content.generatedByIdiomorph = true;
    return content;
  }
};
var normalizeContent = function(newContent) {
  if (newContent == null) {
    const dummyParent = document.createElement("div");
    return dummyParent;
  } else if (newContent.generatedByIdiomorph) {
    return newContent;
  } else if (newContent instanceof Node) {
    const dummyParent = document.createElement("div");
    dummyParent.append(newContent);
    return dummyParent;
  } else {
    const dummyParent = document.createElement("div");
    for (const elt of [...newContent]) {
      dummyParent.append(elt);
    }
    return dummyParent;
  }
};
var insertSiblings = function(previousSibling, morphedNode, nextSibling) {
  let stack = [];
  let added = [];
  while (previousSibling != null) {
    stack.push(previousSibling);
    previousSibling = previousSibling.previousSibling;
  }
  while (stack.length > 0) {
    let node = stack.pop();
    added.push(node);
    morphedNode.parentElement.insertBefore(node, morphedNode);
  }
  added.push(morphedNode);
  while (nextSibling != null) {
    stack.push(nextSibling);
    added.push(nextSibling);
    nextSibling = nextSibling.nextSibling;
  }
  while (stack.length > 0) {
    morphedNode.parentElement.insertBefore(stack.pop(), morphedNode.nextSibling);
  }
  return added;
};
var findBestNodeMatch = function(newContent, oldNode, ctx) {
  let currentElement;
  currentElement = newContent.firstChild;
  let bestElement = currentElement;
  let score = 0;
  while (currentElement) {
    let newScore = scoreElement(currentElement, oldNode, ctx);
    if (newScore > score) {
      bestElement = currentElement;
      score = newScore;
    }
    currentElement = currentElement.nextSibling;
  }
  return bestElement;
};
var scoreElement = function(node1, node2, ctx) {
  if (isSoftMatch(node1, node2)) {
    return 0.5 + getIdIntersectionCount(ctx, node1, node2);
  }
  return 0;
};
var removeNode = function(tempNode, ctx) {
  removeIdsFromConsideration(ctx, tempNode);
  if (ctx.callbacks.beforeNodeRemoved(tempNode) === false)
    return;
  tempNode.remove();
  ctx.callbacks.afterNodeRemoved(tempNode);
};
var isIdInConsideration = function(ctx, id) {
  return !ctx.deadIds.has(id);
};
var idIsWithinNode = function(ctx, id, targetNode) {
  let idSet = ctx.idMap.get(targetNode) || EMPTY_SET;
  return idSet.has(id);
};
var removeIdsFromConsideration = function(ctx, node) {
  let idSet = ctx.idMap.get(node) || EMPTY_SET;
  for (const id of idSet) {
    ctx.deadIds.add(id);
  }
};
var getIdIntersectionCount = function(ctx, node1, node2) {
  let sourceSet = ctx.idMap.get(node1) || EMPTY_SET;
  let matchCount = 0;
  for (const id of sourceSet) {
    if (isIdInConsideration(ctx, id) && idIsWithinNode(ctx, id, node2)) {
      ++matchCount;
    }
  }
  return matchCount;
};
var populateIdMapForNode = function(node, idMap) {
  let nodeParent = node.parentElement;
  let idElements = node.querySelectorAll("[id]");
  for (const elt of idElements) {
    let current = elt;
    while (current !== nodeParent && current != null) {
      let idSet = idMap.get(current);
      if (idSet == null) {
        idSet = new Set;
        idMap.set(current, idSet);
      }
      idSet.add(elt.id);
      current = current.parentElement;
    }
  }
};
var createIdMap = function(oldContent, newContent) {
  let idMap = new Map;
  populateIdMapForNode(oldContent, idMap);
  populateIdMapForNode(newContent, idMap);
  return idMap;
};
var extendURLWithDeprecatedProperties = function(url) {
  Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
};
var start = function() {
  session.start();
};
var registerAdapter = function(adapter) {
  session.registerAdapter(adapter);
};
var visit = function(location2, options) {
  session.visit(location2, options);
};
var connectStreamSource = function(source) {
  session.connectStreamSource(source);
};
var disconnectStreamSource = function(source) {
  session.disconnectStreamSource(source);
};
var renderStreamMessage = function(message) {
  session.renderStreamMessage(message);
};
var clearCache = function() {
  console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
  session.clearCache();
};
var setProgressBarDelay = function(delay) {
  session.setProgressBarDelay(delay);
};
var setConfirmMethod = function(confirmMethod) {
  FormSubmission.confirmMethod = confirmMethod;
};
var setFormMode = function(mode) {
  session.setFormMode(mode);
};
var getFrameElementById = function(id) {
  if (id != null) {
    const element = document.getElementById(id);
    if (element instanceof FrameElement) {
      return element;
    }
  }
};
var activateElement = function(element, currentURL) {
  if (element) {
    const src = element.getAttribute("src");
    if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
      throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
    }
    if (element.ownerDocument !== document) {
      element = document.importNode(element, true);
    }
    if (element instanceof FrameElement) {
      element.connectedCallback();
      element.disconnectedCallback();
      return element;
    }
  }
};
/*!
Turbo 8.0.0-beta.2
Copyright © 2023 37signals LLC
 */
(function(prototype) {
  if (typeof prototype.requestSubmit == "function")
    return;
  prototype.requestSubmit = function(submitter) {
    if (submitter) {
      validateSubmitter(submitter, this);
      submitter.click();
    } else {
      submitter = document.createElement("input");
      submitter.type = "submit";
      submitter.hidden = true;
      this.appendChild(submitter);
      submitter.click();
      this.removeChild(submitter);
    }
  };
  function validateSubmitter(submitter, form) {
    submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
    submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
    submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
  }
  function raise(errorConstructor, message, name) {
    throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name);
  }
})(HTMLFormElement.prototype);
var submittersByForm = new WeakMap;
(function() {
  if ("submitter" in Event.prototype)
    return;
  let prototype = window.Event.prototype;
  if ("SubmitEvent" in window) {
    const prototypeOfSubmitEvent = window.SubmitEvent.prototype;
    if (/Apple Computer/.test(navigator.vendor) && !("submitter" in prototypeOfSubmitEvent)) {
      prototype = prototypeOfSubmitEvent;
    } else {
      return;
    }
  }
  addEventListener("click", clickCaptured, true);
  Object.defineProperty(prototype, "submitter", {
    get() {
      if (this.type == "submit" && this.target instanceof HTMLFormElement) {
        return submittersByForm.get(this.target);
      }
    }
  });
})();
var FrameLoadingStyle = {
  eager: "eager",
  lazy: "lazy"
};

class FrameElement extends HTMLElement {
  static delegateConstructor = undefined;
  loaded = Promise.resolve();
  static get observedAttributes() {
    return ["disabled", "complete", "loading", "src"];
  }
  constructor() {
    super();
    this.delegate = new FrameElement.delegateConstructor(this);
  }
  connectedCallback() {
    this.delegate.connect();
  }
  disconnectedCallback() {
    this.delegate.disconnect();
  }
  reload() {
    return this.delegate.sourceURLReloaded();
  }
  attributeChangedCallback(name) {
    if (name == "loading") {
      this.delegate.loadingStyleChanged();
    } else if (name == "complete") {
      this.delegate.completeChanged();
    } else if (name == "src") {
      this.delegate.sourceURLChanged();
    } else {
      this.delegate.disabledChanged();
    }
  }
  get src() {
    return this.getAttribute("src");
  }
  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }
  get refresh() {
    return this.getAttribute("refresh");
  }
  set refresh(value) {
    if (value) {
      this.setAttribute("refresh", value);
    } else {
      this.removeAttribute("refresh");
    }
  }
  get loading() {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "");
  }
  set loading(value) {
    if (value) {
      this.setAttribute("loading", value);
    } else {
      this.removeAttribute("loading");
    }
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  get autoscroll() {
    return this.hasAttribute("autoscroll");
  }
  set autoscroll(value) {
    if (value) {
      this.setAttribute("autoscroll", "");
    } else {
      this.removeAttribute("autoscroll");
    }
  }
  get complete() {
    return !this.delegate.isLoading;
  }
  get isActive() {
    return this.ownerDocument === document && !this.isPreview;
  }
  get isPreview() {
    return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview");
  }
}

class FetchResponse {
  constructor(response) {
    this.response = response;
  }
  get succeeded() {
    return this.response.ok;
  }
  get failed() {
    return !this.succeeded;
  }
  get clientError() {
    return this.statusCode >= 400 && this.statusCode <= 499;
  }
  get serverError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
  get redirected() {
    return this.response.redirected;
  }
  get location() {
    return expandURL(this.response.url);
  }
  get isHTML() {
    return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
  }
  get statusCode() {
    return this.response.status;
  }
  get contentType() {
    return this.header("Content-Type");
  }
  get responseText() {
    return this.response.clone().text();
  }
  get responseHTML() {
    if (this.isHTML) {
      return this.response.clone().text();
    } else {
      return Promise.resolve(undefined);
    }
  }
  header(name) {
    return this.response.headers.get(name);
  }
}

class LimitedSet extends Set {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
  }
  add(value) {
    if (this.size >= this.maxSize) {
      const iterator = this.values();
      const oldestValue = iterator.next().value;
      this.delete(oldestValue);
    }
    super.add(value);
  }
}
var recentRequests = new LimitedSet(20);
var nativeFetch = window.fetch;
var FetchMethod = {
  get: "get",
  post: "post",
  put: "put",
  patch: "patch",
  delete: "delete"
};
var FetchEnctype = {
  urlEncoded: "application/x-www-form-urlencoded",
  multipart: "multipart/form-data",
  plain: "text/plain"
};

class FetchRequest {
  abortController = new AbortController;
  #resolveRequestPromise = (_value) => {
  };
  constructor(delegate, method, location2, requestBody = new URLSearchParams, target = null, enctype = FetchEnctype.urlEncoded) {
    const [url, body] = buildResourceAndBody(expandURL(location2), method, requestBody, enctype);
    this.delegate = delegate;
    this.url = url;
    this.target = target;
    this.fetchOptions = {
      credentials: "same-origin",
      redirect: "follow",
      method,
      headers: { ...this.defaultHeaders },
      body,
      signal: this.abortSignal,
      referrer: this.delegate.referrer?.href
    };
    this.enctype = enctype;
  }
  get method() {
    return this.fetchOptions.method;
  }
  set method(value) {
    const fetchBody = this.isSafe ? this.url.searchParams : this.fetchOptions.body || new FormData;
    const fetchMethod = fetchMethodFromString(value) || FetchMethod.get;
    this.url.search = "";
    const [url, body] = buildResourceAndBody(this.url, fetchMethod, fetchBody, this.enctype);
    this.url = url;
    this.fetchOptions.body = body;
    this.fetchOptions.method = fetchMethod;
  }
  get headers() {
    return this.fetchOptions.headers;
  }
  set headers(value) {
    this.fetchOptions.headers = value;
  }
  get body() {
    if (this.isSafe) {
      return this.url.searchParams;
    } else {
      return this.fetchOptions.body;
    }
  }
  set body(value) {
    this.fetchOptions.body = value;
  }
  get location() {
    return this.url;
  }
  get params() {
    return this.url.searchParams;
  }
  get entries() {
    return this.body ? Array.from(this.body.entries()) : [];
  }
  cancel() {
    this.abortController.abort();
  }
  async perform() {
    const { fetchOptions } = this;
    this.delegate.prepareRequest(this);
    await this.#allowRequestToBeIntercepted(fetchOptions);
    try {
      this.delegate.requestStarted(this);
      const response = await fetchWithTurboHeaders(this.url.href, fetchOptions);
      return await this.receive(response);
    } catch (error) {
      if (error.name !== "AbortError") {
        if (this.#willDelegateErrorHandling(error)) {
          this.delegate.requestErrored(this, error);
        }
        throw error;
      }
    } finally {
      this.delegate.requestFinished(this);
    }
  }
  async receive(response) {
    const fetchResponse = new FetchResponse(response);
    const event = dispatch("turbo:before-fetch-response", {
      cancelable: true,
      detail: { fetchResponse },
      target: this.target
    });
    if (event.defaultPrevented) {
      this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
    } else if (fetchResponse.succeeded) {
      this.delegate.requestSucceededWithResponse(this, fetchResponse);
    } else {
      this.delegate.requestFailedWithResponse(this, fetchResponse);
    }
    return fetchResponse;
  }
  get defaultHeaders() {
    return {
      Accept: "text/html, application/xhtml+xml"
    };
  }
  get isSafe() {
    return isSafe(this.method);
  }
  get abortSignal() {
    return this.abortController.signal;
  }
  acceptResponseType(mimeType) {
    this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
  }
  async#allowRequestToBeIntercepted(fetchOptions) {
    const requestInterception = new Promise((resolve) => this.#resolveRequestPromise = resolve);
    const event = dispatch("turbo:before-fetch-request", {
      cancelable: true,
      detail: {
        fetchOptions,
        url: this.url,
        resume: this.#resolveRequestPromise
      },
      target: this.target
    });
    this.url = event.detail.url;
    if (event.defaultPrevented)
      await requestInterception;
  }
  #willDelegateErrorHandling(error) {
    const event = dispatch("turbo:fetch-request-error", {
      target: this.target,
      cancelable: true,
      detail: { request: this, error }
    });
    return !event.defaultPrevented;
  }
}

class AppearanceObserver {
  started = false;
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
    this.intersectionObserver = new IntersectionObserver(this.intersect);
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.intersectionObserver.observe(this.element);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.intersectionObserver.unobserve(this.element);
    }
  }
  intersect = (entries) => {
    const lastEntry = entries.slice(-1)[0];
    if (lastEntry?.isIntersecting) {
      this.delegate.elementAppearedInViewport(this.element);
    }
  };
}

class StreamMessage {
  static contentType = "text/vnd.turbo-stream.html";
  static wrap(message) {
    if (typeof message == "string") {
      return new this(createDocumentFragment(message));
    } else {
      return message;
    }
  }
  constructor(fragment) {
    this.fragment = importStreamElements(fragment);
  }
}
var FormSubmissionState = {
  initialized: "initialized",
  requesting: "requesting",
  waiting: "waiting",
  receiving: "receiving",
  stopping: "stopping",
  stopped: "stopped"
};

class FormSubmission {
  state = FormSubmissionState.initialized;
  static confirmMethod(message, _element, _submitter) {
    return Promise.resolve(confirm(message));
  }
  constructor(delegate, formElement, submitter, mustRedirect = false) {
    const method = getMethod(formElement, submitter);
    const action = getAction(getFormAction(formElement, submitter), method);
    const body = buildFormData(formElement, submitter);
    const enctype = getEnctype(formElement, submitter);
    this.delegate = delegate;
    this.formElement = formElement;
    this.submitter = submitter;
    this.fetchRequest = new FetchRequest(this, method, action, body, formElement, enctype);
    this.mustRedirect = mustRedirect;
  }
  get method() {
    return this.fetchRequest.method;
  }
  set method(value) {
    this.fetchRequest.method = value;
  }
  get action() {
    return this.fetchRequest.url.toString();
  }
  set action(value) {
    this.fetchRequest.url = expandURL(value);
  }
  get body() {
    return this.fetchRequest.body;
  }
  get enctype() {
    return this.fetchRequest.enctype;
  }
  get isSafe() {
    return this.fetchRequest.isSafe;
  }
  get location() {
    return this.fetchRequest.url;
  }
  async start() {
    const { initialized, requesting } = FormSubmissionState;
    const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
    if (typeof confirmationMessage === "string") {
      const answer = await FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
      if (!answer) {
        return;
      }
    }
    if (this.state == initialized) {
      this.state = requesting;
      return this.fetchRequest.perform();
    }
  }
  stop() {
    const { stopping, stopped } = FormSubmissionState;
    if (this.state != stopping && this.state != stopped) {
      this.state = stopping;
      this.fetchRequest.cancel();
      return true;
    }
  }
  prepareRequest(request) {
    if (!request.isSafe) {
      const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
      if (token) {
        request.headers["X-CSRF-Token"] = token;
      }
    }
    if (this.requestAcceptsTurboStreamResponse(request)) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    this.state = FormSubmissionState.waiting;
    this.submitter?.setAttribute("disabled", "");
    this.setSubmitsWith();
    markAsBusy(this.formElement);
    dispatch("turbo:submit-start", {
      target: this.formElement,
      detail: { formSubmission: this }
    });
    this.delegate.formSubmissionStarted(this);
  }
  requestPreventedHandlingResponse(request, response) {
    this.result = { success: response.succeeded, fetchResponse: response };
  }
  requestSucceededWithResponse(request, response) {
    if (response.clientError || response.serverError) {
      this.delegate.formSubmissionFailedWithResponse(this, response);
    } else if (this.requestMustRedirect(request) && responseSucceededWithoutRedirect(response)) {
      const error = new Error("Form responses must redirect to another location");
      this.delegate.formSubmissionErrored(this, error);
    } else {
      this.state = FormSubmissionState.receiving;
      this.result = { success: true, fetchResponse: response };
      this.delegate.formSubmissionSucceededWithResponse(this, response);
    }
  }
  requestFailedWithResponse(request, response) {
    this.result = { success: false, fetchResponse: response };
    this.delegate.formSubmissionFailedWithResponse(this, response);
  }
  requestErrored(request, error) {
    this.result = { success: false, error };
    this.delegate.formSubmissionErrored(this, error);
  }
  requestFinished(_request) {
    this.state = FormSubmissionState.stopped;
    this.submitter?.removeAttribute("disabled");
    this.resetSubmitterText();
    clearBusyState(this.formElement);
    dispatch("turbo:submit-end", {
      target: this.formElement,
      detail: { formSubmission: this, ...this.result }
    });
    this.delegate.formSubmissionFinished(this);
  }
  setSubmitsWith() {
    if (!this.submitter || !this.submitsWith)
      return;
    if (this.submitter.matches("button")) {
      this.originalSubmitText = this.submitter.innerHTML;
      this.submitter.innerHTML = this.submitsWith;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      this.originalSubmitText = input.value;
      input.value = this.submitsWith;
    }
  }
  resetSubmitterText() {
    if (!this.submitter || !this.originalSubmitText)
      return;
    if (this.submitter.matches("button")) {
      this.submitter.innerHTML = this.originalSubmitText;
    } else if (this.submitter.matches("input")) {
      const input = this.submitter;
      input.value = this.originalSubmitText;
    }
  }
  requestMustRedirect(request) {
    return !request.isSafe && this.mustRedirect;
  }
  requestAcceptsTurboStreamResponse(request) {
    return !request.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
  }
  get submitsWith() {
    return this.submitter?.getAttribute("data-turbo-submits-with");
  }
}

class Snapshot {
  constructor(element) {
    this.element = element;
  }
  get activeElement() {
    return this.element.ownerDocument.activeElement;
  }
  get children() {
    return [...this.element.children];
  }
  hasAnchor(anchor) {
    return this.getElementForAnchor(anchor) != null;
  }
  getElementForAnchor(anchor) {
    return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
  }
  get isConnected() {
    return this.element.isConnected;
  }
  get firstAutofocusableElement() {
    return queryAutofocusableElement(this.element);
  }
  get permanentElements() {
    return queryPermanentElementsAll(this.element);
  }
  getPermanentElementById(id) {
    return getPermanentElementById(this.element, id);
  }
  getPermanentElementMapForSnapshot(snapshot) {
    const permanentElementMap = {};
    for (const currentPermanentElement of this.permanentElements) {
      const { id } = currentPermanentElement;
      const newPermanentElement = snapshot.getPermanentElementById(id);
      if (newPermanentElement) {
        permanentElementMap[id] = [currentPermanentElement, newPermanentElement];
      }
    }
    return permanentElementMap;
  }
}

class FormSubmitObserver {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("submit", this.submitCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
      this.started = false;
    }
  }
  submitCaptured = () => {
    this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
    this.eventTarget.addEventListener("submit", this.submitBubbled, false);
  };
  submitBubbled = (event) => {
    if (!event.defaultPrevented) {
      const form = event.target instanceof HTMLFormElement ? event.target : undefined;
      const submitter = event.submitter || undefined;
      if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.delegate.formSubmitted(form, submitter);
      }
    }
  };
}

class View {
  #resolveRenderPromise = (_value) => {
  };
  #resolveInterceptionPromise = (_value) => {
  };
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  scrollToAnchor(anchor) {
    const element = this.snapshot.getElementForAnchor(anchor);
    if (element) {
      this.scrollToElement(element);
      this.focusElement(element);
    } else {
      this.scrollToPosition({ x: 0, y: 0 });
    }
  }
  scrollToAnchorFromLocation(location2) {
    this.scrollToAnchor(getAnchor(location2));
  }
  scrollToElement(element) {
    element.scrollIntoView();
  }
  focusElement(element) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute("tabindex")) {
        element.focus();
      } else {
        element.setAttribute("tabindex", "-1");
        element.focus();
        element.removeAttribute("tabindex");
      }
    }
  }
  scrollToPosition({ x, y }) {
    this.scrollRoot.scrollTo(x, y);
  }
  scrollToTop() {
    this.scrollToPosition({ x: 0, y: 0 });
  }
  get scrollRoot() {
    return window;
  }
  async render(renderer) {
    const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
    if (shouldRender) {
      try {
        this.renderPromise = new Promise((resolve) => this.#resolveRenderPromise = resolve);
        this.renderer = renderer;
        await this.prepareToRenderSnapshot(renderer);
        const renderInterception = new Promise((resolve) => this.#resolveInterceptionPromise = resolve);
        const options = { resume: this.#resolveInterceptionPromise, render: this.renderer.renderElement };
        const immediateRender = this.delegate.allowsImmediateRender(snapshot, isPreview, options);
        if (!immediateRender)
          await renderInterception;
        await this.renderSnapshot(renderer);
        this.delegate.viewRenderedSnapshot(snapshot, isPreview, this.renderer.renderMethod);
        this.delegate.preloadOnLoadLinksForView(this.element);
        this.finishRenderingSnapshot(renderer);
      } finally {
        delete this.renderer;
        this.#resolveRenderPromise(undefined);
        delete this.renderPromise;
      }
    } else {
      this.invalidate(renderer.reloadReason);
    }
  }
  invalidate(reason) {
    this.delegate.viewInvalidated(reason);
  }
  async prepareToRenderSnapshot(renderer) {
    this.markAsPreview(renderer.isPreview);
    await renderer.prepareToRender();
  }
  markAsPreview(isPreview) {
    if (isPreview) {
      this.element.setAttribute("data-turbo-preview", "");
    } else {
      this.element.removeAttribute("data-turbo-preview");
    }
  }
  markVisitDirection(direction) {
    this.element.setAttribute("data-turbo-visit-direction", direction);
  }
  unmarkVisitDirection() {
    this.element.removeAttribute("data-turbo-visit-direction");
  }
  async renderSnapshot(renderer) {
    await renderer.render();
  }
  finishRenderingSnapshot(renderer) {
    renderer.finishRendering();
  }
}

class FrameView extends View {
  missing() {
    this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
  }
  get snapshot() {
    return new Snapshot(this.element);
  }
}

class LinkInterceptor {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.element = element;
  }
  start() {
    this.element.addEventListener("click", this.clickBubbled);
    document.addEventListener("turbo:click", this.linkClicked);
    document.addEventListener("turbo:before-visit", this.willVisit);
  }
  stop() {
    this.element.removeEventListener("click", this.clickBubbled);
    document.removeEventListener("turbo:click", this.linkClicked);
    document.removeEventListener("turbo:before-visit", this.willVisit);
  }
  clickBubbled = (event) => {
    if (this.respondsToEventTarget(event.target)) {
      this.clickEvent = event;
    } else {
      delete this.clickEvent;
    }
  };
  linkClicked = (event) => {
    if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
      if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
        this.clickEvent.preventDefault();
        event.preventDefault();
        this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
      }
    }
    delete this.clickEvent;
  };
  willVisit = (_event) => {
    delete this.clickEvent;
  };
  respondsToEventTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    return element && element.closest("turbo-frame, html") == this.element;
  }
}

class LinkClickObserver {
  started = false;
  constructor(delegate, eventTarget) {
    this.delegate = delegate;
    this.eventTarget = eventTarget;
  }
  start() {
    if (!this.started) {
      this.eventTarget.addEventListener("click", this.clickCaptured, true);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.eventTarget.removeEventListener("click", this.clickCaptured, true);
      this.started = false;
    }
  }
  clickCaptured = () => {
    this.eventTarget.removeEventListener("click", this.clickBubbled, false);
    this.eventTarget.addEventListener("click", this.clickBubbled, false);
  };
  clickBubbled = (event) => {
    if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
      const target = event.composedPath && event.composedPath()[0] || event.target;
      const link = this.findLinkFromClickTarget(target);
      if (link && doesNotTargetIFrame(link)) {
        const location2 = this.getLocationForLink(link);
        if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
          event.preventDefault();
          this.delegate.followedLinkToLocation(link, location2);
        }
      }
    }
  };
  clickEventIsSignificant(event) {
    return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
  }
  findLinkFromClickTarget(target) {
    return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
  }
  getLocationForLink(link) {
    return expandURL(link.getAttribute("href") || "");
  }
}

class FormLinkClickObserver {
  constructor(delegate, element) {
    this.delegate = delegate;
    this.linkInterceptor = new LinkClickObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
  }
  stop() {
    this.linkInterceptor.stop();
  }
  willFollowLinkToLocation(link, location2, originalEvent) {
    return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && (link.hasAttribute("data-turbo-method") || link.hasAttribute("data-turbo-stream"));
  }
  followedLinkToLocation(link, location2) {
    const form = document.createElement("form");
    const type = "hidden";
    for (const [name, value] of location2.searchParams) {
      form.append(Object.assign(document.createElement("input"), { type, name, value }));
    }
    const action = Object.assign(location2, { search: "" });
    form.setAttribute("data-turbo", "true");
    form.setAttribute("action", action.href);
    form.setAttribute("hidden", "");
    const method = link.getAttribute("data-turbo-method");
    if (method)
      form.setAttribute("method", method);
    const turboFrame = link.getAttribute("data-turbo-frame");
    if (turboFrame)
      form.setAttribute("data-turbo-frame", turboFrame);
    const turboAction = getVisitAction(link);
    if (turboAction)
      form.setAttribute("data-turbo-action", turboAction);
    const turboConfirm = link.getAttribute("data-turbo-confirm");
    if (turboConfirm)
      form.setAttribute("data-turbo-confirm", turboConfirm);
    const turboStream = link.hasAttribute("data-turbo-stream");
    if (turboStream)
      form.setAttribute("data-turbo-stream", "");
    this.delegate.submittedFormLinkToLocation(link, location2, form);
    document.body.appendChild(form);
    form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
    requestAnimationFrame(() => form.requestSubmit());
  }
}

class Bardo {
  static async preservingPermanentElements(delegate, permanentElementMap, callback) {
    const bardo = new this(delegate, permanentElementMap);
    bardo.enter();
    await callback();
    bardo.leave();
  }
  constructor(delegate, permanentElementMap) {
    this.delegate = delegate;
    this.permanentElementMap = permanentElementMap;
  }
  enter() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id];
      this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
      this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
    }
  }
  leave() {
    for (const id in this.permanentElementMap) {
      const [currentPermanentElement] = this.permanentElementMap[id];
      this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
      this.replacePlaceholderWithPermanentElement(currentPermanentElement);
      this.delegate.leavingBardo(currentPermanentElement);
    }
  }
  replaceNewPermanentElementWithPlaceholder(permanentElement) {
    const placeholder = createPlaceholderForPermanentElement(permanentElement);
    permanentElement.replaceWith(placeholder);
  }
  replaceCurrentPermanentElementWithClone(permanentElement) {
    const clone = permanentElement.cloneNode(true);
    permanentElement.replaceWith(clone);
  }
  replacePlaceholderWithPermanentElement(permanentElement) {
    const placeholder = this.getPlaceholderById(permanentElement.id);
    placeholder?.replaceWith(permanentElement);
  }
  getPlaceholderById(id) {
    return this.placeholders.find((element) => element.content == id);
  }
  get placeholders() {
    return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
  }
}

class Renderer {
  #activeElement = null;
  constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    this.currentSnapshot = currentSnapshot;
    this.newSnapshot = newSnapshot;
    this.isPreview = isPreview;
    this.willRender = willRender;
    this.renderElement = renderElement;
    this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
  }
  get shouldRender() {
    return true;
  }
  get reloadReason() {
    return;
  }
  prepareToRender() {
    return;
  }
  render() {
  }
  finishRendering() {
    if (this.resolvingFunctions) {
      this.resolvingFunctions.resolve();
      delete this.resolvingFunctions;
    }
  }
  async preservingPermanentElements(callback) {
    await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
  }
  focusFirstAutofocusableElement() {
    const element = this.connectedSnapshot.firstAutofocusableElement;
    if (element) {
      element.focus();
    }
  }
  enteringBardo(currentPermanentElement) {
    if (this.#activeElement)
      return;
    if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
      this.#activeElement = this.currentSnapshot.activeElement;
    }
  }
  leavingBardo(currentPermanentElement) {
    if (currentPermanentElement.contains(this.#activeElement) && this.#activeElement instanceof HTMLElement) {
      this.#activeElement.focus();
      this.#activeElement = null;
    }
  }
  get connectedSnapshot() {
    return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
  }
  get currentElement() {
    return this.currentSnapshot.element;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  get permanentElementMap() {
    return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
  }
  get renderMethod() {
    return "replace";
  }
}

class FrameRenderer extends Renderer {
  static renderElement(currentElement, newElement) {
    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(currentElement);
    destinationRange.deleteContents();
    const frameElement = newElement;
    const sourceRange = frameElement.ownerDocument?.createRange();
    if (sourceRange) {
      sourceRange.selectNodeContents(frameElement);
      currentElement.appendChild(sourceRange.extractContents());
    }
  }
  constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
    super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
    this.delegate = delegate;
  }
  get shouldRender() {
    return true;
  }
  async render() {
    await nextRepaint();
    this.preservingPermanentElements(() => {
      this.loadFrameElement();
    });
    this.scrollFrameIntoView();
    await nextRepaint();
    this.focusFirstAutofocusableElement();
    await nextRepaint();
    this.activateScriptElements();
  }
  loadFrameElement() {
    this.delegate.willRenderFrame(this.currentElement, this.newElement);
    this.renderElement(this.currentElement, this.newElement);
  }
  scrollFrameIntoView() {
    if (this.currentElement.autoscroll || this.newElement.autoscroll) {
      const element = this.currentElement.firstElementChild;
      const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
      const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
      if (element) {
        element.scrollIntoView({ block, behavior });
        return true;
      }
    }
    return false;
  }
  activateScriptElements() {
    for (const inertScriptElement of this.newScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  get newScriptElements() {
    return this.currentElement.querySelectorAll("script");
  }
}

class ProgressBar {
  static animationDuration = 300;
  static get defaultCSS() {
    return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${ProgressBar.animationDuration}ms ease-out,
          opacity ${ProgressBar.animationDuration / 2}ms ${ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
  }
  hiding = false;
  value = 0;
  visible = false;
  constructor() {
    this.stylesheetElement = this.createStylesheetElement();
    this.progressElement = this.createProgressElement();
    this.installStylesheetElement();
    this.setValue(0);
  }
  show() {
    if (!this.visible) {
      this.visible = true;
      this.installProgressElement();
      this.startTrickling();
    }
  }
  hide() {
    if (this.visible && !this.hiding) {
      this.hiding = true;
      this.fadeProgressElement(() => {
        this.uninstallProgressElement();
        this.stopTrickling();
        this.visible = false;
        this.hiding = false;
      });
    }
  }
  setValue(value) {
    this.value = value;
    this.refresh();
  }
  installStylesheetElement() {
    document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
  }
  installProgressElement() {
    this.progressElement.style.width = "0";
    this.progressElement.style.opacity = "1";
    document.documentElement.insertBefore(this.progressElement, document.body);
    this.refresh();
  }
  fadeProgressElement(callback) {
    this.progressElement.style.opacity = "0";
    setTimeout(callback, ProgressBar.animationDuration * 1.5);
  }
  uninstallProgressElement() {
    if (this.progressElement.parentNode) {
      document.documentElement.removeChild(this.progressElement);
    }
  }
  startTrickling() {
    if (!this.trickleInterval) {
      this.trickleInterval = window.setInterval(this.trickle, ProgressBar.animationDuration);
    }
  }
  stopTrickling() {
    window.clearInterval(this.trickleInterval);
    delete this.trickleInterval;
  }
  trickle = () => {
    this.setValue(this.value + Math.random() / 100);
  };
  refresh() {
    requestAnimationFrame(() => {
      this.progressElement.style.width = `${10 + this.value * 90}%`;
    });
  }
  createStylesheetElement() {
    const element = document.createElement("style");
    element.type = "text/css";
    element.textContent = ProgressBar.defaultCSS;
    if (this.cspNonce) {
      element.nonce = this.cspNonce;
    }
    return element;
  }
  createProgressElement() {
    const element = document.createElement("div");
    element.className = "turbo-progress-bar";
    return element;
  }
  get cspNonce() {
    return getMetaContent("csp-nonce");
  }
}

class HeadSnapshot extends Snapshot {
  detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
    const { outerHTML } = element;
    const details = outerHTML in result ? result[outerHTML] : {
      type: elementType(element),
      tracked: elementIsTracked(element),
      elements: []
    };
    return {
      ...result,
      [outerHTML]: {
        ...details,
        elements: [...details.elements, element]
      }
    };
  }, {});
  get trackedElementSignature() {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
  }
  getScriptElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
  }
  getStylesheetElementsNotInSnapshot(snapshot) {
    return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
  }
  getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
    return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
  }
  get provisionalElements() {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
      if (type == null && !tracked) {
        return [...result, ...elements];
      } else if (elements.length > 1) {
        return [...result, ...elements.slice(1)];
      } else {
        return result;
      }
    }, []);
  }
  getMetaValue(name) {
    const element = this.findMetaElementByName(name);
    return element ? element.getAttribute("content") : null;
  }
  findMetaElementByName(name) {
    return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
      const {
        elements: [element]
      } = this.detailsByOuterHTML[outerHTML];
      return elementIsMetaElementWithName(element, name) ? element : result;
    }, undefined | undefined);
  }
}

class PageSnapshot extends Snapshot {
  static fromHTMLString(html = "") {
    return this.fromDocument(parseHTMLDocument(html));
  }
  static fromElement(element) {
    return this.fromDocument(element.ownerDocument);
  }
  static fromDocument({ documentElement, body, head }) {
    return new this(documentElement, body, new HeadSnapshot(head));
  }
  constructor(documentElement, body, headSnapshot) {
    super(body);
    this.documentElement = documentElement;
    this.headSnapshot = headSnapshot;
  }
  clone() {
    const clonedElement = this.element.cloneNode(true);
    const selectElements = this.element.querySelectorAll("select");
    const clonedSelectElements = clonedElement.querySelectorAll("select");
    for (const [index, source] of selectElements.entries()) {
      const clone = clonedSelectElements[index];
      for (const option of clone.selectedOptions)
        option.selected = false;
      for (const option of source.selectedOptions)
        clone.options[option.index].selected = true;
    }
    for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
      clonedPasswordInput.value = "";
    }
    return new PageSnapshot(this.documentElement, clonedElement, this.headSnapshot);
  }
  get lang() {
    return this.documentElement.getAttribute("lang");
  }
  get headElement() {
    return this.headSnapshot.element;
  }
  get rootLocation() {
    const root = this.getSetting("root") ?? "/";
    return expandURL(root);
  }
  get cacheControlValue() {
    return this.getSetting("cache-control");
  }
  get isPreviewable() {
    return this.cacheControlValue != "no-preview";
  }
  get isCacheable() {
    return this.cacheControlValue != "no-cache";
  }
  get isVisitable() {
    return this.getSetting("visit-control") != "reload";
  }
  get prefersViewTransitions() {
    return this.headSnapshot.getMetaValue("view-transition") === "same-origin";
  }
  get shouldMorphPage() {
    return this.getSetting("refresh-method") === "morph";
  }
  get shouldPreserveScrollPosition() {
    return this.getSetting("refresh-scroll") === "preserve";
  }
  getSetting(name) {
    return this.headSnapshot.getMetaValue(`turbo-${name}`);
  }
}

class ViewTransitioner {
  #viewTransitionStarted = false;
  #lastOperation = Promise.resolve();
  renderChange(useViewTransition, render) {
    if (useViewTransition && this.viewTransitionsAvailable && !this.#viewTransitionStarted) {
      this.#viewTransitionStarted = true;
      this.#lastOperation = this.#lastOperation.then(async () => {
        await document.startViewTransition(render).finished;
      });
    } else {
      this.#lastOperation = this.#lastOperation.then(render);
    }
    return this.#lastOperation;
  }
  get viewTransitionsAvailable() {
    return document.startViewTransition;
  }
}
var defaultOptions = {
  action: "advance",
  historyChanged: false,
  visitCachedSnapshot: () => {
  },
  willRender: true,
  updateHistory: true,
  shouldCacheSnapshot: true,
  acceptsStreamResponse: false
};
var TimingMetric = {
  visitStart: "visitStart",
  requestStart: "requestStart",
  requestEnd: "requestEnd",
  visitEnd: "visitEnd"
};
var VisitState = {
  initialized: "initialized",
  started: "started",
  canceled: "canceled",
  failed: "failed",
  completed: "completed"
};
var SystemStatusCode = {
  networkFailure: 0,
  timeoutFailure: -1,
  contentTypeMismatch: -2
};
var Direction = {
  advance: "forward",
  restore: "back",
  replace: "none"
};

class Visit {
  identifier = uuid();
  timingMetrics = {};
  followedRedirect = false;
  historyChanged = false;
  scrolled = false;
  shouldCacheSnapshot = true;
  acceptsStreamResponse = false;
  snapshotCached = false;
  state = VisitState.initialized;
  viewTransitioner = new ViewTransitioner;
  constructor(delegate, location2, restorationIdentifier, options = {}) {
    this.delegate = delegate;
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier || uuid();
    const {
      action,
      historyChanged,
      referrer,
      snapshot,
      snapshotHTML,
      response,
      visitCachedSnapshot,
      willRender,
      updateHistory,
      shouldCacheSnapshot,
      acceptsStreamResponse,
      direction
    } = {
      ...defaultOptions,
      ...options
    };
    this.action = action;
    this.historyChanged = historyChanged;
    this.referrer = referrer;
    this.snapshot = snapshot;
    this.snapshotHTML = snapshotHTML;
    this.response = response;
    this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
    this.visitCachedSnapshot = visitCachedSnapshot;
    this.willRender = willRender;
    this.updateHistory = updateHistory;
    this.scrolled = !willRender;
    this.shouldCacheSnapshot = shouldCacheSnapshot;
    this.acceptsStreamResponse = acceptsStreamResponse;
    this.direction = direction || Direction[action];
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get history() {
    return this.delegate.history;
  }
  get restorationData() {
    return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
  }
  get silent() {
    return this.isSamePage;
  }
  start() {
    if (this.state == VisitState.initialized) {
      this.recordTimingMetric(TimingMetric.visitStart);
      this.state = VisitState.started;
      this.adapter.visitStarted(this);
      this.delegate.visitStarted(this);
    }
  }
  cancel() {
    if (this.state == VisitState.started) {
      if (this.request) {
        this.request.cancel();
      }
      this.cancelRender();
      this.state = VisitState.canceled;
    }
  }
  complete() {
    if (this.state == VisitState.started) {
      this.recordTimingMetric(TimingMetric.visitEnd);
      this.state = VisitState.completed;
      this.followRedirect();
      if (!this.followedRedirect) {
        this.adapter.visitCompleted(this);
        this.delegate.visitCompleted(this);
      }
    }
  }
  fail() {
    if (this.state == VisitState.started) {
      this.state = VisitState.failed;
      this.adapter.visitFailed(this);
      this.delegate.visitCompleted(this);
    }
  }
  changeHistory() {
    if (!this.historyChanged && this.updateHistory) {
      const actionForHistory = this.location.href === this.referrer?.href ? "replace" : this.action;
      const method = getHistoryMethodForAction(actionForHistory);
      this.history.update(method, this.location, this.restorationIdentifier);
      this.historyChanged = true;
    }
  }
  issueRequest() {
    if (this.hasPreloadedResponse()) {
      this.simulateRequest();
    } else if (this.shouldIssueRequest() && !this.request) {
      this.request = new FetchRequest(this, FetchMethod.get, this.location);
      this.request.perform();
    }
  }
  simulateRequest() {
    if (this.response) {
      this.startRequest();
      this.recordResponse();
      this.finishRequest();
    }
  }
  startRequest() {
    this.recordTimingMetric(TimingMetric.requestStart);
    this.adapter.visitRequestStarted(this);
  }
  recordResponse(response = this.response) {
    this.response = response;
    if (response) {
      const { statusCode } = response;
      if (isSuccessful(statusCode)) {
        this.adapter.visitRequestCompleted(this);
      } else {
        this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
      }
    }
  }
  finishRequest() {
    this.recordTimingMetric(TimingMetric.requestEnd);
    this.adapter.visitRequestFinished(this);
  }
  loadResponse() {
    if (this.response) {
      const { statusCode, responseHTML } = this.response;
      this.render(async () => {
        if (this.shouldCacheSnapshot)
          this.cacheSnapshot();
        if (this.view.renderPromise)
          await this.view.renderPromise;
        if (isSuccessful(statusCode) && responseHTML != null) {
          const snapshot = PageSnapshot.fromHTMLString(responseHTML);
          await this.renderPageSnapshot(snapshot, false);
          this.adapter.visitRendered(this);
          this.complete();
        } else {
          await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
          this.adapter.visitRendered(this);
          this.fail();
        }
      });
    }
  }
  getCachedSnapshot() {
    const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
    if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
      if (this.action == "restore" || snapshot.isPreviewable) {
        return snapshot;
      }
    }
  }
  getPreloadedSnapshot() {
    if (this.snapshotHTML) {
      return PageSnapshot.fromHTMLString(this.snapshotHTML);
    }
  }
  hasCachedSnapshot() {
    return this.getCachedSnapshot() != null;
  }
  loadCachedSnapshot() {
    const snapshot = this.getCachedSnapshot();
    if (snapshot) {
      const isPreview = this.shouldIssueRequest();
      this.render(async () => {
        this.cacheSnapshot();
        if (this.isSamePage) {
          this.adapter.visitRendered(this);
        } else {
          if (this.view.renderPromise)
            await this.view.renderPromise;
          await this.renderPageSnapshot(snapshot, isPreview);
          this.adapter.visitRendered(this);
          if (!isPreview) {
            this.complete();
          }
        }
      });
    }
  }
  followRedirect() {
    if (this.redirectedToLocation && !this.followedRedirect && this.response?.redirected) {
      this.adapter.visitProposedToLocation(this.redirectedToLocation, {
        action: "replace",
        response: this.response,
        shouldCacheSnapshot: false,
        willRender: false
      });
      this.followedRedirect = true;
    }
  }
  goToSamePageAnchor() {
    if (this.isSamePage) {
      this.render(async () => {
        this.cacheSnapshot();
        this.performScroll();
        this.changeHistory();
        this.adapter.visitRendered(this);
      });
    }
  }
  prepareRequest(request) {
    if (this.acceptsStreamResponse) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted() {
    this.startRequest();
  }
  requestPreventedHandlingResponse(_request, _response) {
  }
  async requestSucceededWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == undefined) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.redirectedToLocation = response.redirected ? response.location : undefined;
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  async requestFailedWithResponse(request, response) {
    const responseHTML = await response.responseHTML;
    const { redirected, statusCode } = response;
    if (responseHTML == undefined) {
      this.recordResponse({
        statusCode: SystemStatusCode.contentTypeMismatch,
        redirected
      });
    } else {
      this.recordResponse({ statusCode, responseHTML, redirected });
    }
  }
  requestErrored(_request, _error) {
    this.recordResponse({
      statusCode: SystemStatusCode.networkFailure,
      redirected: false
    });
  }
  requestFinished() {
    this.finishRequest();
  }
  performScroll() {
    if (!this.scrolled && !this.view.forceReloaded && !this.view.shouldPreserveScrollPosition(this)) {
      if (this.action == "restore") {
        this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
      } else {
        this.scrollToAnchor() || this.view.scrollToTop();
      }
      if (this.isSamePage) {
        this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
      }
      this.scrolled = true;
    }
  }
  scrollToRestoredPosition() {
    const { scrollPosition } = this.restorationData;
    if (scrollPosition) {
      this.view.scrollToPosition(scrollPosition);
      return true;
    }
  }
  scrollToAnchor() {
    const anchor = getAnchor(this.location);
    if (anchor != null) {
      this.view.scrollToAnchor(anchor);
      return true;
    }
  }
  recordTimingMetric(metric) {
    this.timingMetrics[metric] = new Date().getTime();
  }
  getTimingMetrics() {
    return { ...this.timingMetrics };
  }
  getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  hasPreloadedResponse() {
    return typeof this.response == "object";
  }
  shouldIssueRequest() {
    if (this.isSamePage) {
      return false;
    } else if (this.action == "restore") {
      return !this.hasCachedSnapshot();
    } else {
      return this.willRender;
    }
  }
  cacheSnapshot() {
    if (!this.snapshotCached) {
      this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
      this.snapshotCached = true;
    }
  }
  async render(callback) {
    this.cancelRender();
    this.frame = await nextRepaint();
    await callback();
    delete this.frame;
  }
  async renderPageSnapshot(snapshot, isPreview) {
    await this.viewTransitioner.renderChange(this.view.shouldTransitionTo(snapshot), async () => {
      await this.view.renderPage(snapshot, isPreview, this.willRender, this);
      this.performScroll();
    });
  }
  cancelRender() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      delete this.frame;
    }
  }
}

class BrowserAdapter {
  progressBar = new ProgressBar;
  constructor(session) {
    this.session = session;
  }
  visitProposedToLocation(location2, options) {
    if (locationIsVisitable(location2, this.navigator.rootLocation)) {
      this.navigator.startVisit(location2, options?.restorationIdentifier || uuid(), options);
    } else {
      window.location.href = location2.toString();
    }
  }
  visitStarted(visit2) {
    this.location = visit2.location;
    visit2.loadCachedSnapshot();
    visit2.issueRequest();
    visit2.goToSamePageAnchor();
  }
  visitRequestStarted(visit2) {
    this.progressBar.setValue(0);
    if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
      this.showVisitProgressBarAfterDelay();
    } else {
      this.showProgressBar();
    }
  }
  visitRequestCompleted(visit2) {
    visit2.loadResponse();
  }
  visitRequestFailedWithStatusCode(visit2, statusCode) {
    switch (statusCode) {
      case SystemStatusCode.networkFailure:
      case SystemStatusCode.timeoutFailure:
      case SystemStatusCode.contentTypeMismatch:
        return this.reload({
          reason: "request_failed",
          context: {
            statusCode
          }
        });
      default:
        return visit2.loadResponse();
    }
  }
  visitRequestFinished(_visit) {
  }
  visitCompleted(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  pageInvalidated(reason) {
    this.reload(reason);
  }
  visitFailed(_visit) {
    this.progressBar.setValue(1);
    this.hideVisitProgressBar();
  }
  visitRendered(_visit) {
  }
  formSubmissionStarted(_formSubmission) {
    this.progressBar.setValue(0);
    this.showFormProgressBarAfterDelay();
  }
  formSubmissionFinished(_formSubmission) {
    this.progressBar.setValue(1);
    this.hideFormProgressBar();
  }
  showVisitProgressBarAfterDelay() {
    this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
  }
  hideVisitProgressBar() {
    this.progressBar.hide();
    if (this.visitProgressBarTimeout != null) {
      window.clearTimeout(this.visitProgressBarTimeout);
      delete this.visitProgressBarTimeout;
    }
  }
  showFormProgressBarAfterDelay() {
    if (this.formProgressBarTimeout == null) {
      this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
  }
  hideFormProgressBar() {
    this.progressBar.hide();
    if (this.formProgressBarTimeout != null) {
      window.clearTimeout(this.formProgressBarTimeout);
      delete this.formProgressBarTimeout;
    }
  }
  showProgressBar = () => {
    this.progressBar.show();
  };
  reload(reason) {
    dispatch("turbo:reload", { detail: reason });
    window.location.href = this.location?.toString() || window.location.href;
  }
  get navigator() {
    return this.session.navigator;
  }
}

class CacheObserver {
  selector = "[data-turbo-temporary]";
  deprecatedSelector = "[data-turbo-cache=false]";
  started = false;
  start() {
    if (!this.started) {
      this.started = true;
      addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
    }
  }
  removeTemporaryElements = (_event) => {
    for (const element of this.temporaryElements) {
      element.remove();
    }
  };
  get temporaryElements() {
    return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
  }
  get temporaryElementsWithDeprecation() {
    const elements = document.querySelectorAll(this.deprecatedSelector);
    if (elements.length) {
      console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
    }
    return [...elements];
  }
}

class FrameRedirector {
  constructor(session, element) {
    this.session = session;
    this.element = element;
    this.linkInterceptor = new LinkInterceptor(this, element);
    this.formSubmitObserver = new FormSubmitObserver(this, element);
  }
  start() {
    this.linkInterceptor.start();
    this.formSubmitObserver.start();
  }
  stop() {
    this.linkInterceptor.stop();
    this.formSubmitObserver.stop();
  }
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldRedirect(element);
  }
  linkClickIntercepted(element, url, event) {
    const frame = this.#findFrameElement(element);
    if (frame) {
      frame.delegate.linkClickIntercepted(element, url, event);
    }
  }
  willSubmitForm(element, submitter) {
    return element.closest("turbo-frame") == null && this.#shouldSubmit(element, submitter) && this.#shouldRedirect(element, submitter);
  }
  formSubmitted(element, submitter) {
    const frame = this.#findFrameElement(element, submitter);
    if (frame) {
      frame.delegate.formSubmitted(element, submitter);
    }
  }
  #shouldSubmit(form, submitter) {
    const action = getAction$1(form, submitter);
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const rootLocation = expandURL(meta?.content ?? "/");
    return this.#shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
  }
  #shouldRedirect(element, submitter) {
    const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
    if (isNavigatable) {
      const frame = this.#findFrameElement(element, submitter);
      return frame ? frame != element.closest("turbo-frame") : false;
    } else {
      return false;
    }
  }
  #findFrameElement(element, submitter) {
    const id = submitter?.getAttribute("data-turbo-frame") || element.getAttribute("data-turbo-frame");
    if (id && id != "_top") {
      const frame = this.element.querySelector(`#${id}:not([disabled])`);
      if (frame instanceof FrameElement) {
        return frame;
      }
    }
  }
}

class History {
  location;
  restorationIdentifier = uuid();
  restorationData = {};
  started = false;
  pageLoaded = false;
  currentIndex = 0;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false);
      addEventListener("load", this.onPageLoad, false);
      this.currentIndex = history.state?.turbo?.restorationIndex || 0;
      this.started = true;
      this.replace(new URL(window.location.href));
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false);
      removeEventListener("load", this.onPageLoad, false);
      this.started = false;
    }
  }
  push(location2, restorationIdentifier) {
    this.update(history.pushState, location2, restorationIdentifier);
  }
  replace(location2, restorationIdentifier) {
    this.update(history.replaceState, location2, restorationIdentifier);
  }
  update(method, location2, restorationIdentifier = uuid()) {
    if (method === history.pushState)
      ++this.currentIndex;
    const state = { turbo: { restorationIdentifier, restorationIndex: this.currentIndex } };
    method.call(history, state, "", location2.href);
    this.location = location2;
    this.restorationIdentifier = restorationIdentifier;
  }
  getRestorationDataForIdentifier(restorationIdentifier) {
    return this.restorationData[restorationIdentifier] || {};
  }
  updateRestorationData(additionalData) {
    const { restorationIdentifier } = this;
    const restorationData = this.restorationData[restorationIdentifier];
    this.restorationData[restorationIdentifier] = {
      ...restorationData,
      ...additionalData
    };
  }
  assumeControlOfScrollRestoration() {
    if (!this.previousScrollRestoration) {
      this.previousScrollRestoration = history.scrollRestoration ?? "auto";
      history.scrollRestoration = "manual";
    }
  }
  relinquishControlOfScrollRestoration() {
    if (this.previousScrollRestoration) {
      history.scrollRestoration = this.previousScrollRestoration;
      delete this.previousScrollRestoration;
    }
  }
  onPopState = (event) => {
    if (this.shouldHandlePopState()) {
      const { turbo } = event.state || {};
      if (turbo) {
        this.location = new URL(window.location.href);
        const { restorationIdentifier, restorationIndex } = turbo;
        this.restorationIdentifier = restorationIdentifier;
        const direction = restorationIndex > this.currentIndex ? "forward" : "back";
        this.delegate.historyPoppedToLocationWithRestorationIdentifierAndDirection(this.location, restorationIdentifier, direction);
        this.currentIndex = restorationIndex;
      }
    }
  };
  onPageLoad = async (_event) => {
    await nextMicrotask();
    this.pageLoaded = true;
  };
  shouldHandlePopState() {
    return this.pageIsLoaded();
  }
  pageIsLoaded() {
    return this.pageLoaded || document.readyState == "complete";
  }
}

class Navigator {
  constructor(delegate) {
    this.delegate = delegate;
  }
  proposeVisit(location2, options = {}) {
    if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
      this.delegate.visitProposedToLocation(location2, options);
    }
  }
  startVisit(locatable, restorationIdentifier, options = {}) {
    this.stop();
    this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, {
      referrer: this.location,
      ...options
    });
    this.currentVisit.start();
  }
  submitForm(form, submitter) {
    this.stop();
    this.formSubmission = new FormSubmission(this, form, submitter, true);
    this.formSubmission.start();
  }
  stop() {
    if (this.formSubmission) {
      this.formSubmission.stop();
      delete this.formSubmission;
    }
    if (this.currentVisit) {
      this.currentVisit.cancel();
      delete this.currentVisit;
    }
  }
  get adapter() {
    return this.delegate.adapter;
  }
  get view() {
    return this.delegate.view;
  }
  get rootLocation() {
    return this.view.snapshot.rootLocation;
  }
  get history() {
    return this.delegate.history;
  }
  formSubmissionStarted(formSubmission) {
    if (typeof this.adapter.formSubmissionStarted === "function") {
      this.adapter.formSubmissionStarted(formSubmission);
    }
  }
  async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
    if (formSubmission == this.formSubmission) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const shouldCacheSnapshot = formSubmission.isSafe;
        if (!shouldCacheSnapshot) {
          this.view.clearSnapshotCache();
        }
        const { statusCode, redirected } = fetchResponse;
        const action = this.#getActionForFormSubmission(formSubmission, fetchResponse);
        const visitOptions = {
          action,
          shouldCacheSnapshot,
          response: { statusCode, responseHTML, redirected }
        };
        this.proposeVisit(fetchResponse.location, visitOptions);
      }
    }
  }
  async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    const responseHTML = await fetchResponse.responseHTML;
    if (responseHTML) {
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      if (fetchResponse.serverError) {
        await this.view.renderError(snapshot, this.currentVisit);
      } else {
        await this.view.renderPage(snapshot, false, true, this.currentVisit);
      }
      if (!snapshot.shouldPreserveScrollPosition) {
        this.view.scrollToTop();
      }
      this.view.clearSnapshotCache();
    }
  }
  formSubmissionErrored(formSubmission, error) {
    console.error(error);
  }
  formSubmissionFinished(formSubmission) {
    if (typeof this.adapter.formSubmissionFinished === "function") {
      this.adapter.formSubmissionFinished(formSubmission);
    }
  }
  visitStarted(visit2) {
    this.delegate.visitStarted(visit2);
  }
  visitCompleted(visit2) {
    this.delegate.visitCompleted(visit2);
  }
  locationWithActionIsSamePage(location2, action) {
    const anchor = getAnchor(location2);
    const currentAnchor = getAnchor(this.view.lastRenderedLocation);
    const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
    return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  #getActionForFormSubmission(formSubmission, fetchResponse) {
    const { submitter, formElement } = formSubmission;
    return getVisitAction(submitter, formElement) || this.#getDefaultAction(fetchResponse);
  }
  #getDefaultAction(fetchResponse) {
    const sameLocationRedirect = fetchResponse.redirected && fetchResponse.location.href === this.location?.href;
    return sameLocationRedirect ? "replace" : "advance";
  }
}
var PageStage = {
  initial: 0,
  loading: 1,
  interactive: 2,
  complete: 3
};

class PageObserver {
  stage = PageStage.initial;
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      if (this.stage == PageStage.initial) {
        this.stage = PageStage.loading;
      }
      document.addEventListener("readystatechange", this.interpretReadyState, false);
      addEventListener("pagehide", this.pageWillUnload, false);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      document.removeEventListener("readystatechange", this.interpretReadyState, false);
      removeEventListener("pagehide", this.pageWillUnload, false);
      this.started = false;
    }
  }
  interpretReadyState = () => {
    const { readyState } = this;
    if (readyState == "interactive") {
      this.pageIsInteractive();
    } else if (readyState == "complete") {
      this.pageIsComplete();
    }
  };
  pageIsInteractive() {
    if (this.stage == PageStage.loading) {
      this.stage = PageStage.interactive;
      this.delegate.pageBecameInteractive();
    }
  }
  pageIsComplete() {
    this.pageIsInteractive();
    if (this.stage == PageStage.interactive) {
      this.stage = PageStage.complete;
      this.delegate.pageLoaded();
    }
  }
  pageWillUnload = () => {
    this.delegate.pageWillUnload();
  };
  get readyState() {
    return document.readyState;
  }
}

class ScrollObserver {
  started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.started) {
      addEventListener("scroll", this.onScroll, false);
      this.onScroll();
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      removeEventListener("scroll", this.onScroll, false);
      this.started = false;
    }
  }
  onScroll = () => {
    this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
  };
  updatePosition(position) {
    this.delegate.scrollPositionChanged(position);
  }
}

class StreamMessageRenderer {
  render({ fragment }) {
    Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => {
      withAutofocusFromFragment(fragment, () => {
        withPreservedFocus(() => {
          document.documentElement.appendChild(fragment);
        });
      });
    });
  }
  enteringBardo(currentPermanentElement, newPermanentElement) {
    newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
  }
  leavingBardo() {
  }
}

class StreamObserver {
  sources = new Set;
  #started = false;
  constructor(delegate) {
    this.delegate = delegate;
  }
  start() {
    if (!this.#started) {
      this.#started = true;
      addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  stop() {
    if (this.#started) {
      this.#started = false;
      removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
    }
  }
  connectStreamSource(source) {
    if (!this.streamSourceIsConnected(source)) {
      this.sources.add(source);
      source.addEventListener("message", this.receiveMessageEvent, false);
    }
  }
  disconnectStreamSource(source) {
    if (this.streamSourceIsConnected(source)) {
      this.sources.delete(source);
      source.removeEventListener("message", this.receiveMessageEvent, false);
    }
  }
  streamSourceIsConnected(source) {
    return this.sources.has(source);
  }
  inspectFetchResponse = (event) => {
    const response = fetchResponseFromEvent(event);
    if (response && fetchResponseIsStream(response)) {
      event.preventDefault();
      this.receiveMessageResponse(response);
    }
  };
  receiveMessageEvent = (event) => {
    if (this.#started && typeof event.data == "string") {
      this.receiveMessageHTML(event.data);
    }
  };
  async receiveMessageResponse(response) {
    const html = await response.responseHTML;
    if (html) {
      this.receiveMessageHTML(html);
    }
  }
  receiveMessageHTML(html) {
    this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
  }
}

class ErrorRenderer extends Renderer {
  static renderElement(currentElement, newElement) {
    const { documentElement, body } = document;
    documentElement.replaceChild(newElement, body);
  }
  async render() {
    this.replaceHeadAndBody();
    this.activateScriptElements();
  }
  replaceHeadAndBody() {
    const { documentElement, head } = document;
    documentElement.replaceChild(this.newHead, head);
    this.renderElement(this.currentElement, this.newElement);
  }
  activateScriptElements() {
    for (const replaceableElement of this.scriptElements) {
      const parentNode = replaceableElement.parentNode;
      if (parentNode) {
        const element = activateScriptElement(replaceableElement);
        parentNode.replaceChild(element, replaceableElement);
      }
    }
  }
  get newHead() {
    return this.newSnapshot.headSnapshot.element;
  }
  get scriptElements() {
    return document.documentElement.querySelectorAll("script");
  }
}
var EMPTY_SET = new Set;
var idiomorph = { morph };

class MorphRenderer extends Renderer {
  async render() {
    if (this.willRender)
      await this.#morphBody();
  }
  get renderMethod() {
    return "morph";
  }
  async#morphBody() {
    this.#morphElements(this.currentElement, this.newElement);
    this.#reloadRemoteFrames();
    dispatch("turbo:morph", {
      detail: {
        currentElement: this.currentElement,
        newElement: this.newElement
      }
    });
  }
  #morphElements(currentElement, newElement, morphStyle = "outerHTML") {
    this.isMorphingTurboFrame = this.#isFrameReloadedWithMorph(currentElement);
    idiomorph.morph(currentElement, newElement, {
      morphStyle,
      callbacks: {
        beforeNodeAdded: this.#shouldAddElement,
        beforeNodeMorphed: this.#shouldMorphElement,
        beforeNodeRemoved: this.#shouldRemoveElement
      }
    });
  }
  #shouldAddElement = (node) => {
    return !(node.id && node.hasAttribute("data-turbo-permanent") && document.getElementById(node.id));
  };
  #shouldMorphElement = (oldNode, newNode) => {
    if (oldNode instanceof HTMLElement) {
      return !oldNode.hasAttribute("data-turbo-permanent") && (this.isMorphingTurboFrame || !this.#isFrameReloadedWithMorph(oldNode));
    } else {
      return true;
    }
  };
  #shouldRemoveElement = (node) => {
    return this.#shouldMorphElement(node);
  };
  #reloadRemoteFrames() {
    this.#remoteFrames().forEach((frame) => {
      if (this.#isFrameReloadedWithMorph(frame)) {
        this.#renderFrameWithMorph(frame);
        frame.reload();
      }
    });
  }
  #renderFrameWithMorph(frame) {
    frame.addEventListener("turbo:before-frame-render", (event) => {
      event.detail.render = this.#morphFrameUpdate;
    }, { once: true });
  }
  #morphFrameUpdate = (currentElement, newElement) => {
    dispatch("turbo:before-frame-morph", {
      target: currentElement,
      detail: { currentElement, newElement }
    });
    this.#morphElements(currentElement, newElement.children, "innerHTML");
  };
  #isFrameReloadedWithMorph(element) {
    return element.src && element.refresh === "morph";
  }
  #remoteFrames() {
    return Array.from(document.querySelectorAll("turbo-frame[src]")).filter((frame) => {
      return !frame.closest("[data-turbo-permanent]");
    });
  }
}

class PageRenderer extends Renderer {
  static renderElement(currentElement, newElement) {
    if (document.body && newElement instanceof HTMLBodyElement) {
      document.body.replaceWith(newElement);
    } else {
      document.documentElement.appendChild(newElement);
    }
  }
  get shouldRender() {
    return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
  }
  get reloadReason() {
    if (!this.newSnapshot.isVisitable) {
      return {
        reason: "turbo_visit_control_is_reload"
      };
    }
    if (!this.trackedElementsAreIdentical) {
      return {
        reason: "tracked_element_mismatch"
      };
    }
  }
  async prepareToRender() {
    this.#setLanguage();
    await this.mergeHead();
  }
  async render() {
    if (this.willRender) {
      await this.replaceBody();
    }
  }
  finishRendering() {
    super.finishRendering();
    if (!this.isPreview) {
      this.focusFirstAutofocusableElement();
    }
  }
  get currentHeadSnapshot() {
    return this.currentSnapshot.headSnapshot;
  }
  get newHeadSnapshot() {
    return this.newSnapshot.headSnapshot;
  }
  get newElement() {
    return this.newSnapshot.element;
  }
  #setLanguage() {
    const { documentElement } = this.currentSnapshot;
    const { lang } = this.newSnapshot;
    if (lang) {
      documentElement.setAttribute("lang", lang);
    } else {
      documentElement.removeAttribute("lang");
    }
  }
  async mergeHead() {
    const mergedHeadElements = this.mergeProvisionalElements();
    const newStylesheetElements = this.copyNewHeadStylesheetElements();
    this.copyNewHeadScriptElements();
    await mergedHeadElements;
    await newStylesheetElements;
  }
  async replaceBody() {
    await this.preservingPermanentElements(async () => {
      this.activateNewBody();
      await this.assignNewBody();
    });
  }
  get trackedElementsAreIdentical() {
    return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
  }
  async copyNewHeadStylesheetElements() {
    const loadingElements = [];
    for (const element of this.newHeadStylesheetElements) {
      loadingElements.push(waitForLoad(element));
      document.head.appendChild(element);
    }
    await Promise.all(loadingElements);
  }
  copyNewHeadScriptElements() {
    for (const element of this.newHeadScriptElements) {
      document.head.appendChild(activateScriptElement(element));
    }
  }
  async mergeProvisionalElements() {
    const newHeadElements = [...this.newHeadProvisionalElements];
    for (const element of this.currentHeadProvisionalElements) {
      if (!this.isCurrentElementInElementList(element, newHeadElements)) {
        document.head.removeChild(element);
      }
    }
    for (const element of newHeadElements) {
      document.head.appendChild(element);
    }
  }
  isCurrentElementInElementList(element, elementList) {
    for (const [index, newElement] of elementList.entries()) {
      if (element.tagName == "TITLE") {
        if (newElement.tagName != "TITLE") {
          continue;
        }
        if (element.innerHTML == newElement.innerHTML) {
          elementList.splice(index, 1);
          return true;
        }
      }
      if (newElement.isEqualNode(element)) {
        elementList.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  removeCurrentHeadProvisionalElements() {
    for (const element of this.currentHeadProvisionalElements) {
      document.head.removeChild(element);
    }
  }
  copyNewHeadProvisionalElements() {
    for (const element of this.newHeadProvisionalElements) {
      document.head.appendChild(element);
    }
  }
  activateNewBody() {
    document.adoptNode(this.newElement);
    this.activateNewBodyScriptElements();
  }
  activateNewBodyScriptElements() {
    for (const inertScriptElement of this.newBodyScriptElements) {
      const activatedScriptElement = activateScriptElement(inertScriptElement);
      inertScriptElement.replaceWith(activatedScriptElement);
    }
  }
  async assignNewBody() {
    await this.renderElement(this.currentElement, this.newElement);
  }
  get newHeadStylesheetElements() {
    return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get newHeadScriptElements() {
    return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
  }
  get currentHeadProvisionalElements() {
    return this.currentHeadSnapshot.provisionalElements;
  }
  get newHeadProvisionalElements() {
    return this.newHeadSnapshot.provisionalElements;
  }
  get newBodyScriptElements() {
    return this.newElement.querySelectorAll("script");
  }
}

class SnapshotCache {
  keys = [];
  snapshots = {};
  constructor(size) {
    this.size = size;
  }
  has(location2) {
    return toCacheKey(location2) in this.snapshots;
  }
  get(location2) {
    if (this.has(location2)) {
      const snapshot = this.read(location2);
      this.touch(location2);
      return snapshot;
    }
  }
  put(location2, snapshot) {
    this.write(location2, snapshot);
    this.touch(location2);
    return snapshot;
  }
  clear() {
    this.snapshots = {};
  }
  read(location2) {
    return this.snapshots[toCacheKey(location2)];
  }
  write(location2, snapshot) {
    this.snapshots[toCacheKey(location2)] = snapshot;
  }
  touch(location2) {
    const key = toCacheKey(location2);
    const index = this.keys.indexOf(key);
    if (index > -1)
      this.keys.splice(index, 1);
    this.keys.unshift(key);
    this.trim();
  }
  trim() {
    for (const key of this.keys.splice(this.size)) {
      delete this.snapshots[key];
    }
  }
}

class PageView extends View {
  snapshotCache = new SnapshotCache(10);
  lastRenderedLocation = new URL(location.href);
  forceReloaded = false;
  shouldTransitionTo(newSnapshot) {
    return this.snapshot.prefersViewTransitions && newSnapshot.prefersViewTransitions;
  }
  renderPage(snapshot, isPreview = false, willRender = true, visit2) {
    const shouldMorphPage = this.isPageRefresh(visit2) && this.snapshot.shouldMorphPage;
    const rendererClass = shouldMorphPage ? MorphRenderer : PageRenderer;
    const renderer = new rendererClass(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
    if (!renderer.shouldRender) {
      this.forceReloaded = true;
    } else {
      visit2?.changeHistory();
    }
    return this.render(renderer);
  }
  renderError(snapshot, visit2) {
    visit2?.changeHistory();
    const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
    return this.render(renderer);
  }
  clearSnapshotCache() {
    this.snapshotCache.clear();
  }
  async cacheSnapshot(snapshot = this.snapshot) {
    if (snapshot.isCacheable) {
      this.delegate.viewWillCacheSnapshot();
      const { lastRenderedLocation: location2 } = this;
      await nextEventLoopTick();
      const cachedSnapshot = snapshot.clone();
      this.snapshotCache.put(location2, cachedSnapshot);
      return cachedSnapshot;
    }
  }
  getCachedSnapshotForLocation(location2) {
    return this.snapshotCache.get(location2);
  }
  isPageRefresh(visit2) {
    return !visit2 || this.lastRenderedLocation.pathname === visit2.location.pathname && visit2.action === "replace";
  }
  shouldPreserveScrollPosition(visit2) {
    return this.isPageRefresh(visit2) && this.snapshot.shouldPreserveScrollPosition;
  }
  get snapshot() {
    return PageSnapshot.fromElement(this.element);
  }
}

class Preloader {
  selector = "a[data-turbo-preload]";
  constructor(delegate, snapshotCache) {
    this.delegate = delegate;
    this.snapshotCache = snapshotCache;
  }
  start() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", this.#preloadAll);
    } else {
      this.preloadOnLoadLinksForView(document.body);
    }
  }
  stop() {
    document.removeEventListener("DOMContentLoaded", this.#preloadAll);
  }
  preloadOnLoadLinksForView(element) {
    for (const link of element.querySelectorAll(this.selector)) {
      if (this.delegate.shouldPreloadLink(link)) {
        this.preloadURL(link);
      }
    }
  }
  async preloadURL(link) {
    const location2 = new URL(link.href);
    if (this.snapshotCache.has(location2)) {
      return;
    }
    const fetchRequest = new FetchRequest(this, FetchMethod.get, location2, new URLSearchParams, link);
    await fetchRequest.perform();
  }
  prepareRequest(fetchRequest) {
    fetchRequest.headers["Sec-Purpose"] = "prefetch";
  }
  async requestSucceededWithResponse(fetchRequest, fetchResponse) {
    try {
      const responseHTML = await fetchResponse.responseHTML;
      const snapshot = PageSnapshot.fromHTMLString(responseHTML);
      this.snapshotCache.put(fetchRequest.url, snapshot);
    } catch (_) {
    }
  }
  requestStarted(fetchRequest) {
  }
  requestErrored(fetchRequest) {
  }
  requestFinished(fetchRequest) {
  }
  requestPreventedHandlingResponse(fetchRequest, fetchResponse) {
  }
  requestFailedWithResponse(fetchRequest, fetchResponse) {
  }
  #preloadAll = () => {
    this.preloadOnLoadLinksForView(document.body);
  };
}

class Cache {
  constructor(session) {
    this.session = session;
  }
  clear() {
    this.session.clearCache();
  }
  resetCacheControl() {
    this.#setCacheControl("");
  }
  exemptPageFromCache() {
    this.#setCacheControl("no-cache");
  }
  exemptPageFromPreview() {
    this.#setCacheControl("no-preview");
  }
  #setCacheControl(value) {
    setMetaContent("turbo-cache-control", value);
  }
}

class Session {
  navigator = new Navigator(this);
  history = new History(this);
  view = new PageView(this, document.documentElement);
  adapter = new BrowserAdapter(this);
  pageObserver = new PageObserver(this);
  cacheObserver = new CacheObserver;
  linkClickObserver = new LinkClickObserver(this, window);
  formSubmitObserver = new FormSubmitObserver(this, document);
  scrollObserver = new ScrollObserver(this);
  streamObserver = new StreamObserver(this);
  formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
  frameRedirector = new FrameRedirector(this, document.documentElement);
  streamMessageRenderer = new StreamMessageRenderer;
  cache = new Cache(this);
  drive = true;
  enabled = true;
  progressBarDelay = 500;
  started = false;
  formMode = "on";
  constructor(recentRequests2) {
    this.recentRequests = recentRequests2;
    this.preloader = new Preloader(this, this.view.snapshotCache);
  }
  start() {
    if (!this.started) {
      this.pageObserver.start();
      this.cacheObserver.start();
      this.formLinkClickObserver.start();
      this.linkClickObserver.start();
      this.formSubmitObserver.start();
      this.scrollObserver.start();
      this.streamObserver.start();
      this.frameRedirector.start();
      this.history.start();
      this.preloader.start();
      this.started = true;
      this.enabled = true;
    }
  }
  disable() {
    this.enabled = false;
  }
  stop() {
    if (this.started) {
      this.pageObserver.stop();
      this.cacheObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkClickObserver.stop();
      this.formSubmitObserver.stop();
      this.scrollObserver.stop();
      this.streamObserver.stop();
      this.frameRedirector.stop();
      this.history.stop();
      this.preloader.stop();
      this.started = false;
    }
  }
  registerAdapter(adapter) {
    this.adapter = adapter;
  }
  visit(location2, options = {}) {
    const frameElement = options.frame ? document.getElementById(options.frame) : null;
    if (frameElement instanceof FrameElement) {
      frameElement.src = location2.toString();
      frameElement.loaded;
    } else {
      this.navigator.proposeVisit(expandURL(location2), options);
    }
  }
  refresh(url, requestId) {
    const isRecentRequest = requestId && this.recentRequests.has(requestId);
    if (!isRecentRequest) {
      this.cache.exemptPageFromPreview();
      this.visit(url, { action: "replace" });
    }
  }
  connectStreamSource(source) {
    this.streamObserver.connectStreamSource(source);
  }
  disconnectStreamSource(source) {
    this.streamObserver.disconnectStreamSource(source);
  }
  renderStreamMessage(message) {
    this.streamMessageRenderer.render(StreamMessage.wrap(message));
  }
  clearCache() {
    this.view.clearSnapshotCache();
  }
  setProgressBarDelay(delay) {
    this.progressBarDelay = delay;
  }
  setFormMode(mode) {
    this.formMode = mode;
  }
  get location() {
    return this.history.location;
  }
  get restorationIdentifier() {
    return this.history.restorationIdentifier;
  }
  shouldPreloadLink(element) {
    const isUnsafe = element.hasAttribute("data-turbo-method");
    const isStream = element.hasAttribute("data-turbo-stream");
    const frameTarget = element.getAttribute("data-turbo-frame");
    const frame = frameTarget == "_top" ? null : document.getElementById(frameTarget) || findClosestRecursively(element, "turbo-frame:not([disabled])");
    if (isUnsafe || isStream || frame instanceof FrameElement) {
      return false;
    } else {
      const location2 = new URL(element.href);
      return this.elementIsNavigatable(element) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
  }
  historyPoppedToLocationWithRestorationIdentifierAndDirection(location2, restorationIdentifier, direction) {
    if (this.enabled) {
      this.navigator.startVisit(location2, restorationIdentifier, {
        action: "restore",
        historyChanged: true,
        direction
      });
    } else {
      this.adapter.pageInvalidated({
        reason: "turbo_disabled"
      });
    }
  }
  scrollPositionChanged(position) {
    this.history.updateRestorationData({ scrollPosition: position });
  }
  willSubmitFormLinkToLocation(link, location2) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
  }
  submittedFormLinkToLocation() {
  }
  willFollowLinkToLocation(link, location2, event) {
    return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
  }
  followedLinkToLocation(link, location2) {
    const action = this.getActionForLink(link);
    const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
    this.visit(location2.href, { action, acceptsStreamResponse });
  }
  allowsVisitingLocationWithAction(location2, action) {
    return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
  }
  visitProposedToLocation(location2, options) {
    extendURLWithDeprecatedProperties(location2);
    this.adapter.visitProposedToLocation(location2, options);
  }
  visitStarted(visit2) {
    if (!visit2.acceptsStreamResponse) {
      markAsBusy(document.documentElement);
      this.view.markVisitDirection(visit2.direction);
    }
    extendURLWithDeprecatedProperties(visit2.location);
    if (!visit2.silent) {
      this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
    }
  }
  visitCompleted(visit2) {
    this.view.unmarkVisitDirection();
    clearBusyState(document.documentElement);
    this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
  }
  locationWithActionIsSamePage(location2, action) {
    return this.navigator.locationWithActionIsSamePage(location2, action);
  }
  visitScrolledToSamePageLocation(oldURL, newURL) {
    this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
  }
  willSubmitForm(form, submitter) {
    const action = getAction$1(form, submitter);
    return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
  }
  formSubmitted(form, submitter) {
    this.navigator.submitForm(form, submitter);
  }
  pageBecameInteractive() {
    this.view.lastRenderedLocation = this.location;
    this.notifyApplicationAfterPageLoad();
  }
  pageLoaded() {
    this.history.assumeControlOfScrollRestoration();
  }
  pageWillUnload() {
    this.history.relinquishControlOfScrollRestoration();
  }
  receivedMessageFromStream(message) {
    this.renderStreamMessage(message);
  }
  viewWillCacheSnapshot() {
    if (!this.navigator.currentVisit?.silent) {
      this.notifyApplicationBeforeCachingSnapshot();
    }
  }
  allowsImmediateRender({ element }, isPreview, options) {
    const event = this.notifyApplicationBeforeRender(element, isPreview, options);
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, isPreview, renderMethod) {
    this.view.lastRenderedLocation = this.history.location;
    this.notifyApplicationAfterRender(isPreview, renderMethod);
  }
  preloadOnLoadLinksForView(element) {
    this.preloader.preloadOnLoadLinksForView(element);
  }
  viewInvalidated(reason) {
    this.adapter.pageInvalidated(reason);
  }
  frameLoaded(frame) {
    this.notifyApplicationAfterFrameLoad(frame);
  }
  frameRendered(fetchResponse, frame) {
    this.notifyApplicationAfterFrameRender(fetchResponse, frame);
  }
  applicationAllowsFollowingLinkToLocation(link, location2, ev) {
    const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
    return !event.defaultPrevented;
  }
  applicationAllowsVisitingLocation(location2) {
    const event = this.notifyApplicationBeforeVisitingLocation(location2);
    return !event.defaultPrevented;
  }
  notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
    return dispatch("turbo:click", {
      target: link,
      detail: { url: location2.href, originalEvent: event },
      cancelable: true
    });
  }
  notifyApplicationBeforeVisitingLocation(location2) {
    return dispatch("turbo:before-visit", {
      detail: { url: location2.href },
      cancelable: true
    });
  }
  notifyApplicationAfterVisitingLocation(location2, action) {
    return dispatch("turbo:visit", { detail: { url: location2.href, action } });
  }
  notifyApplicationBeforeCachingSnapshot() {
    return dispatch("turbo:before-cache");
  }
  notifyApplicationBeforeRender(newBody, isPreview, options) {
    return dispatch("turbo:before-render", {
      detail: { newBody, isPreview, ...options },
      cancelable: true
    });
  }
  notifyApplicationAfterRender(isPreview, renderMethod) {
    return dispatch("turbo:render", { detail: { isPreview, renderMethod } });
  }
  notifyApplicationAfterPageLoad(timing = {}) {
    return dispatch("turbo:load", {
      detail: { url: this.location.href, timing }
    });
  }
  notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
    dispatchEvent(new HashChangeEvent("hashchange", {
      oldURL: oldURL.toString(),
      newURL: newURL.toString()
    }));
  }
  notifyApplicationAfterFrameLoad(frame) {
    return dispatch("turbo:frame-load", { target: frame });
  }
  notifyApplicationAfterFrameRender(fetchResponse, frame) {
    return dispatch("turbo:frame-render", {
      detail: { fetchResponse },
      target: frame,
      cancelable: true
    });
  }
  submissionIsNavigatable(form, submitter) {
    if (this.formMode == "off") {
      return false;
    } else {
      const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
      if (this.formMode == "optin") {
        return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
      } else {
        return submitterIsNavigatable && this.elementIsNavigatable(form);
      }
    }
  }
  elementIsNavigatable(element) {
    const container = findClosestRecursively(element, "[data-turbo]");
    const withinFrame = findClosestRecursively(element, "turbo-frame");
    if (this.drive || withinFrame) {
      if (container) {
        return container.getAttribute("data-turbo") != "false";
      } else {
        return true;
      }
    } else {
      if (container) {
        return container.getAttribute("data-turbo") == "true";
      } else {
        return false;
      }
    }
  }
  getActionForLink(link) {
    return getVisitAction(link) || "advance";
  }
  get snapshot() {
    return this.view.snapshot;
  }
}
var deprecatedLocationPropertyDescriptors = {
  absoluteURL: {
    get() {
      return this.toString();
    }
  }
};
var session = new Session(recentRequests);
var { cache, navigator: navigator$1 } = session;
var Turbo = Object.freeze({
  __proto__: null,
  navigator: navigator$1,
  session,
  cache,
  PageRenderer,
  PageSnapshot,
  FrameRenderer,
  fetch: fetchWithTurboHeaders,
  start,
  registerAdapter,
  visit,
  connectStreamSource,
  disconnectStreamSource,
  renderStreamMessage,
  clearCache,
  setProgressBarDelay,
  setConfirmMethod,
  setFormMode
});

class TurboFrameMissingError extends Error {
}

class FrameController {
  fetchResponseLoaded = (_fetchResponse) => Promise.resolve();
  #currentFetchRequest = null;
  #resolveVisitPromise = () => {
  };
  #connected = false;
  #hasBeenLoaded = false;
  #ignoredAttributes = new Set;
  action = null;
  constructor(element) {
    this.element = element;
    this.view = new FrameView(this, this.element);
    this.appearanceObserver = new AppearanceObserver(this, this.element);
    this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
    this.linkInterceptor = new LinkInterceptor(this, this.element);
    this.restorationIdentifier = uuid();
    this.formSubmitObserver = new FormSubmitObserver(this, this.element);
  }
  connect() {
    if (!this.#connected) {
      this.#connected = true;
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.#loadSourceURL();
      }
      this.formLinkClickObserver.start();
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
  }
  disconnect() {
    if (this.#connected) {
      this.#connected = false;
      this.appearanceObserver.stop();
      this.formLinkClickObserver.stop();
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
  }
  disabledChanged() {
    if (this.loadingStyle == FrameLoadingStyle.eager) {
      this.#loadSourceURL();
    }
  }
  sourceURLChanged() {
    if (this.#isIgnoringChangesTo("src"))
      return;
    if (this.element.isConnected) {
      this.complete = false;
    }
    if (this.loadingStyle == FrameLoadingStyle.eager || this.#hasBeenLoaded) {
      this.#loadSourceURL();
    }
  }
  sourceURLReloaded() {
    const { src } = this.element;
    this.#ignoringChangesToAttribute("complete", () => {
      this.element.removeAttribute("complete");
    });
    this.element.src = null;
    this.element.src = src;
    return this.element.loaded;
  }
  completeChanged() {
    if (this.#isIgnoringChangesTo("complete"))
      return;
    this.#loadSourceURL();
  }
  loadingStyleChanged() {
    if (this.loadingStyle == FrameLoadingStyle.lazy) {
      this.appearanceObserver.start();
    } else {
      this.appearanceObserver.stop();
      this.#loadSourceURL();
    }
  }
  async#loadSourceURL() {
    if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
      this.element.loaded = this.#visit(expandURL(this.sourceURL));
      this.appearanceObserver.stop();
      await this.element.loaded;
      this.#hasBeenLoaded = true;
    }
  }
  async loadResponse(fetchResponse) {
    if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
      this.sourceURL = fetchResponse.response.url;
    }
    try {
      const html = await fetchResponse.responseHTML;
      if (html) {
        const document2 = parseHTMLDocument(html);
        const pageSnapshot = PageSnapshot.fromDocument(document2);
        if (pageSnapshot.isVisitable) {
          await this.#loadFrameResponse(fetchResponse, document2);
        } else {
          await this.#handleUnvisitableFrameResponse(fetchResponse);
        }
      }
    } finally {
      this.fetchResponseLoaded = () => Promise.resolve();
    }
  }
  elementAppearedInViewport(element) {
    this.proposeVisitIfNavigatedWithAction(element, element);
    this.#loadSourceURL();
  }
  willSubmitFormLinkToLocation(link) {
    return this.#shouldInterceptNavigation(link);
  }
  submittedFormLinkToLocation(link, _location, form) {
    const frame = this.#findFrameElement(link);
    if (frame)
      form.setAttribute("data-turbo-frame", frame.id);
  }
  shouldInterceptLinkClick(element, _location, _event) {
    return this.#shouldInterceptNavigation(element);
  }
  linkClickIntercepted(element, location2) {
    this.#navigateFrame(element, location2);
  }
  willSubmitForm(element, submitter) {
    return element.closest("turbo-frame") == this.element && this.#shouldInterceptNavigation(element, submitter);
  }
  formSubmitted(element, submitter) {
    if (this.formSubmission) {
      this.formSubmission.stop();
    }
    this.formSubmission = new FormSubmission(this, element, submitter);
    const { fetchRequest } = this.formSubmission;
    this.prepareRequest(fetchRequest);
    this.formSubmission.start();
  }
  prepareRequest(request) {
    request.headers["Turbo-Frame"] = this.id;
    if (this.currentNavigationElement?.hasAttribute("data-turbo-stream")) {
      request.acceptResponseType(StreamMessage.contentType);
    }
  }
  requestStarted(_request) {
    markAsBusy(this.element);
  }
  requestPreventedHandlingResponse(_request, _response) {
    this.#resolveVisitPromise();
  }
  async requestSucceededWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  async requestFailedWithResponse(request, response) {
    await this.loadResponse(response);
    this.#resolveVisitPromise();
  }
  requestErrored(request, error) {
    console.error(error);
    this.#resolveVisitPromise();
  }
  requestFinished(_request) {
    clearBusyState(this.element);
  }
  formSubmissionStarted({ formElement }) {
    markAsBusy(formElement, this.#findFrameElement(formElement));
  }
  formSubmissionSucceededWithResponse(formSubmission, response) {
    const frame = this.#findFrameElement(formSubmission.formElement, formSubmission.submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
    frame.delegate.loadResponse(response);
    if (!formSubmission.isSafe) {
      session.clearCache();
    }
  }
  formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
    this.element.delegate.loadResponse(fetchResponse);
    session.clearCache();
  }
  formSubmissionErrored(formSubmission, error) {
    console.error(error);
  }
  formSubmissionFinished({ formElement }) {
    clearBusyState(formElement, this.#findFrameElement(formElement));
  }
  allowsImmediateRender({ element: newFrame }, _isPreview, options) {
    const event = dispatch("turbo:before-frame-render", {
      target: this.element,
      detail: { newFrame, ...options },
      cancelable: true
    });
    const {
      defaultPrevented,
      detail: { render }
    } = event;
    if (this.view.renderer && render) {
      this.view.renderer.renderElement = render;
    }
    return !defaultPrevented;
  }
  viewRenderedSnapshot(_snapshot, _isPreview, _renderMethod) {
  }
  preloadOnLoadLinksForView(element) {
    session.preloadOnLoadLinksForView(element);
  }
  viewInvalidated() {
  }
  willRenderFrame(currentElement, _newElement) {
    this.previousFrameElement = currentElement.cloneNode(true);
  }
  visitCachedSnapshot = ({ element }) => {
    const frame = element.querySelector("#" + this.element.id);
    if (frame && this.previousFrameElement) {
      frame.replaceChildren(...this.previousFrameElement.children);
    }
    delete this.previousFrameElement;
  };
  async#loadFrameResponse(fetchResponse, document2) {
    const newFrameElement = await this.extractForeignFrameElement(document2.body);
    if (newFrameElement) {
      const snapshot = new Snapshot(newFrameElement);
      const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
      if (this.view.renderPromise)
        await this.view.renderPromise;
      this.changeHistory();
      await this.view.render(renderer);
      this.complete = true;
      session.frameRendered(fetchResponse, this.element);
      session.frameLoaded(this.element);
      await this.fetchResponseLoaded(fetchResponse);
    } else if (this.#willHandleFrameMissingFromResponse(fetchResponse)) {
      this.#handleFrameMissingFromResponse(fetchResponse);
    }
  }
  async#visit(url) {
    const request = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams, this.element);
    this.#currentFetchRequest?.cancel();
    this.#currentFetchRequest = request;
    return new Promise((resolve) => {
      this.#resolveVisitPromise = () => {
        this.#resolveVisitPromise = () => {
        };
        this.#currentFetchRequest = null;
        resolve();
      };
      request.perform();
    });
  }
  #navigateFrame(element, url, submitter) {
    const frame = this.#findFrameElement(element, submitter);
    frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
    this.#withCurrentNavigationElement(element, () => {
      frame.src = url;
    });
  }
  proposeVisitIfNavigatedWithAction(frame, element, submitter) {
    this.action = getVisitAction(submitter, element, frame);
    if (this.action) {
      const pageSnapshot = PageSnapshot.fromElement(frame).clone();
      const { visitCachedSnapshot } = frame.delegate;
      frame.delegate.fetchResponseLoaded = async (fetchResponse) => {
        if (frame.src) {
          const { statusCode, redirected } = fetchResponse;
          const responseHTML = await fetchResponse.responseHTML;
          const response = { statusCode, redirected, responseHTML };
          const options = {
            response,
            visitCachedSnapshot,
            willRender: false,
            updateHistory: false,
            restorationIdentifier: this.restorationIdentifier,
            snapshot: pageSnapshot
          };
          if (this.action)
            options.action = this.action;
          session.visit(frame.src, options);
        }
      };
    }
  }
  changeHistory() {
    if (this.action) {
      const method = getHistoryMethodForAction(this.action);
      session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
    }
  }
  async#handleUnvisitableFrameResponse(fetchResponse) {
    console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
    await this.#visitResponse(fetchResponse.response);
  }
  #willHandleFrameMissingFromResponse(fetchResponse) {
    this.element.setAttribute("complete", "");
    const response = fetchResponse.response;
    const visit2 = async (url, options) => {
      if (url instanceof Response) {
        this.#visitResponse(url);
      } else {
        session.visit(url, options);
      }
    };
    const event = dispatch("turbo:frame-missing", {
      target: this.element,
      detail: { response, visit: visit2 },
      cancelable: true
    });
    return !event.defaultPrevented;
  }
  #handleFrameMissingFromResponse(fetchResponse) {
    this.view.missing();
    this.#throwFrameMissingError(fetchResponse);
  }
  #throwFrameMissingError(fetchResponse) {
    const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
    throw new TurboFrameMissingError(message);
  }
  async#visitResponse(response) {
    const wrapped = new FetchResponse(response);
    const responseHTML = await wrapped.responseHTML;
    const { location: location2, redirected, statusCode } = wrapped;
    return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
  }
  #findFrameElement(element, submitter) {
    const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
    return getFrameElementById(id) ?? this.element;
  }
  async extractForeignFrameElement(container) {
    let element;
    const id = CSS.escape(this.id);
    try {
      element = activateElement(container.querySelector(`turbo-frame#${id}`), this.sourceURL);
      if (element) {
        return element;
      }
      element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id}]`), this.sourceURL);
      if (element) {
        await element.loaded;
        return await this.extractForeignFrameElement(element);
      }
    } catch (error) {
      console.error(error);
      return new FrameElement;
    }
    return null;
  }
  #formActionIsVisitable(form, submitter) {
    const action = getAction$1(form, submitter);
    return locationIsVisitable(expandURL(action), this.rootLocation);
  }
  #shouldInterceptNavigation(element, submitter) {
    const id = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
    if (element instanceof HTMLFormElement && !this.#formActionIsVisitable(element, submitter)) {
      return false;
    }
    if (!this.enabled || id == "_top") {
      return false;
    }
    if (id) {
      const frameElement = getFrameElementById(id);
      if (frameElement) {
        return !frameElement.disabled;
      }
    }
    if (!session.elementIsNavigatable(element)) {
      return false;
    }
    if (submitter && !session.elementIsNavigatable(submitter)) {
      return false;
    }
    return true;
  }
  get id() {
    return this.element.id;
  }
  get enabled() {
    return !this.element.disabled;
  }
  get sourceURL() {
    if (this.element.src) {
      return this.element.src;
    }
  }
  set sourceURL(sourceURL) {
    this.#ignoringChangesToAttribute("src", () => {
      this.element.src = sourceURL ?? null;
    });
  }
  get loadingStyle() {
    return this.element.loading;
  }
  get isLoading() {
    return this.formSubmission !== undefined || this.#resolveVisitPromise() !== undefined;
  }
  get complete() {
    return this.element.hasAttribute("complete");
  }
  set complete(value) {
    this.#ignoringChangesToAttribute("complete", () => {
      if (value) {
        this.element.setAttribute("complete", "");
      } else {
        this.element.removeAttribute("complete");
      }
    });
  }
  get isActive() {
    return this.element.isActive && this.#connected;
  }
  get rootLocation() {
    const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
    const root = meta?.content ?? "/";
    return expandURL(root);
  }
  #isIgnoringChangesTo(attributeName) {
    return this.#ignoredAttributes.has(attributeName);
  }
  #ignoringChangesToAttribute(attributeName, callback) {
    this.#ignoredAttributes.add(attributeName);
    callback();
    this.#ignoredAttributes.delete(attributeName);
  }
  #withCurrentNavigationElement(element, callback) {
    this.currentNavigationElement = element;
    callback();
    delete this.currentNavigationElement;
  }
}
var StreamActions = {
  after() {
    this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e.nextSibling));
  },
  append() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.append(this.templateContent));
  },
  before() {
    this.targetElements.forEach((e) => e.parentElement?.insertBefore(this.templateContent, e));
  },
  prepend() {
    this.removeDuplicateTargetChildren();
    this.targetElements.forEach((e) => e.prepend(this.templateContent));
  },
  remove() {
    this.targetElements.forEach((e) => e.remove());
  },
  replace() {
    this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
  },
  update() {
    this.targetElements.forEach((targetElement) => {
      targetElement.innerHTML = "";
      targetElement.append(this.templateContent);
    });
  },
  refresh() {
    session.refresh(this.baseURI, this.requestId);
  }
};

class StreamElement extends HTMLElement {
  static async renderElement(newElement) {
    await newElement.performAction();
  }
  async connectedCallback() {
    try {
      await this.render();
    } catch (error) {
      console.error(error);
    } finally {
      this.disconnect();
    }
  }
  async render() {
    return this.renderPromise ??= (async () => {
      const event = this.beforeRenderEvent;
      if (this.dispatchEvent(event)) {
        await nextRepaint();
        await event.detail.render(this);
      }
    })();
  }
  disconnect() {
    try {
      this.remove();
    } catch {
    }
  }
  removeDuplicateTargetChildren() {
    this.duplicateChildren.forEach((c) => c.remove());
  }
  get duplicateChildren() {
    const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
    const newChildrenIds = [...this.templateContent?.children || []].filter((c) => !!c.id).map((c) => c.id);
    return existingChildren.filter((c) => newChildrenIds.includes(c.id));
  }
  get performAction() {
    if (this.action) {
      const actionFunction = StreamActions[this.action];
      if (actionFunction) {
        return actionFunction;
      }
      this.#raise("unknown action");
    }
    this.#raise("action attribute is missing");
  }
  get targetElements() {
    if (this.target) {
      return this.targetElementsById;
    } else if (this.targets) {
      return this.targetElementsByQuery;
    } else {
      this.#raise("target or targets attribute is missing");
    }
  }
  get templateContent() {
    return this.templateElement.content.cloneNode(true);
  }
  get templateElement() {
    if (this.firstElementChild === null) {
      const template = this.ownerDocument.createElement("template");
      this.appendChild(template);
      return template;
    } else if (this.firstElementChild instanceof HTMLTemplateElement) {
      return this.firstElementChild;
    }
    this.#raise("first child element must be a <template> element");
  }
  get action() {
    return this.getAttribute("action");
  }
  get target() {
    return this.getAttribute("target");
  }
  get targets() {
    return this.getAttribute("targets");
  }
  get requestId() {
    return this.getAttribute("request-id");
  }
  #raise(message) {
    throw new Error(`${this.description}: ${message}`);
  }
  get description() {
    return (this.outerHTML.match(/<[^>]+>/) ?? [])[0] ?? "<turbo-stream>";
  }
  get beforeRenderEvent() {
    return new CustomEvent("turbo:before-stream-render", {
      bubbles: true,
      cancelable: true,
      detail: { newStream: this, render: StreamElement.renderElement }
    });
  }
  get targetElementsById() {
    const element = this.ownerDocument?.getElementById(this.target);
    if (element !== null) {
      return [element];
    } else {
      return [];
    }
  }
  get targetElementsByQuery() {
    const elements = this.ownerDocument?.querySelectorAll(this.targets);
    if (elements.length !== 0) {
      return Array.prototype.slice.call(elements);
    } else {
      return [];
    }
  }
}

class StreamSourceElement extends HTMLElement {
  streamSource = null;
  connectedCallback() {
    this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
    connectStreamSource(this.streamSource);
  }
  disconnectedCallback() {
    if (this.streamSource) {
      this.streamSource.close();
      disconnectStreamSource(this.streamSource);
    }
  }
  get src() {
    return this.getAttribute("src") || "";
  }
}
FrameElement.delegateConstructor = FrameController;
if (customElements.get("turbo-frame") === undefined) {
  customElements.define("turbo-frame", FrameElement);
}
if (customElements.get("turbo-stream") === undefined) {
  customElements.define("turbo-stream", StreamElement);
}
if (customElements.get("turbo-stream-source") === undefined) {
  customElements.define("turbo-stream-source", StreamSourceElement);
}
(() => {
  let element = document.currentScript;
  if (!element)
    return;
  if (element.hasAttribute("data-turbo-suppress-warning"))
    return;
  element = element.parentElement;
  while (element) {
    if (element == document.body) {
      return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
    }
    element = element.parentElement;
  }
})();
window.Turbo = { ...Turbo, StreamActions };
start();

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize
async function getConsumer() {
  return consumer2 || setConsumer(createConsumer2().then(setConsumer));
}
function setConsumer(newConsumer) {
  return consumer2 = newConsumer;
}
async function createConsumer2() {
  const { createConsumer: createConsumer3 } = await Promise.resolve().then(() => (init_src(), exports_src));
  return createConsumer3();
}
async function subscribeTo(channel, mixin) {
  const { subscriptions: subscriptions3 } = await getConsumer();
  return subscriptions3.create(channel, mixin);
}
var consumer2;

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize.js
function walk(obj) {
  if (!obj || typeof obj !== "object")
    return obj;
  if (obj instanceof Date || obj instanceof RegExp)
    return obj;
  if (Array.isArray(obj))
    return obj.map(walk);
  return Object.keys(obj).reduce(function(acc, key) {
    var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
      return "_" + x.toLowerCase();
    });
    acc[camel] = walk(obj[key]);
    return acc;
  }, {});
}

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize.jssts.jsce_element.js
class TurboCableStreamSourceElement extends HTMLElement {
  async connectedCallback() {
    connectStreamSource(this);
    this.subscription = await subscribeTo(this.channel, {
      received: this.dispatchMessageEvent.bind(this),
      connected: this.subscriptionConnected.bind(this),
      disconnected: this.subscriptionDisconnected.bind(this)
    });
  }
  disconnectedCallback() {
    disconnectStreamSource(this);
    if (this.subscription)
      this.subscription.unsubscribe();
  }
  dispatchMessageEvent(data) {
    const event = new MessageEvent("message", { data });
    return this.dispatchEvent(event);
  }
  subscriptionConnected() {
    this.setAttribute("connected", "");
  }
  subscriptionDisconnected() {
    this.removeAttribute("connected");
  }
  get channel() {
    const channel = this.getAttribute("channel");
    const signed_stream_name = this.getAttribute("signed-stream-name");
    return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
  }
}
if (customElements.get("turbo-cable-stream-source") === undefined) {
  customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
}

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize.jssts.js
function encodeMethodIntoRequestBody(event) {
  if (event.target instanceof HTMLFormElement) {
    const { target: form, detail: { fetchOptions } } = event;
    form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
      const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams;
      const method = determineFetchMethod(submitter, body, form);
      if (!/get/i.test(method)) {
        if (/post/i.test(method)) {
          body.delete("_method");
        } else {
          body.set("_method", method);
        }
        fetchOptions.method = "post";
      }
    }, { once: true });
  }
}
var determineFetchMethod = function(submitter, body, form) {
  const formMethod = determineFormMethod(submitter);
  const overrideMethod = body.get("_method");
  const method = form.getAttribute("method") || "get";
  if (typeof formMethod == "string") {
    return formMethod;
  } else if (typeof overrideMethod == "string") {
    return overrideMethod;
  } else {
    return method;
  }
};
var determineFormMethod = function(submitter) {
  if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
    if (submitter.name === "_method") {
      return submitter.value;
    } else if (submitter.hasAttribute("formmethod")) {
      return submitter.formMethod;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
var isBodyInit = function(body) {
  return body instanceof FormData || body instanceof URLSearchParams;
};

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize
window.Turbo = exports_turbo_es2017_esm;
addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

// node_modules/slim-select/dist/slimselect.jsjsjsn
var extendEvent = function(event) {
  if ("immediatePropagationStopped" in event) {
    return event;
  } else {
    const { stopImmediatePropagation } = event;
    return Object.assign(event, {
      immediatePropagationStopped: false,
      stopImmediatePropagation() {
        this.immediatePropagationStopped = true;
        stopImmediatePropagation.call(this);
      }
    });
  }
};
var parseActionDescriptorString = function(descriptorString) {
  const source = descriptorString.trim();
  const matches = source.match(descriptorPattern) || [];
  let eventName = matches[2];
  let keyFilter = matches[3];
  if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
    eventName += `.${keyFilter}`;
    keyFilter = "";
  }
  return {
    eventTarget: parseEventTarget(matches[4]),
    eventName,
    eventOptions: matches[7] ? parseEventOptions(matches[7]) : {},
    identifier: matches[5],
    methodName: matches[6],
    keyFilter: matches[1] || keyFilter
  };
};
var parseEventTarget = function(eventTargetName) {
  if (eventTargetName == "window") {
    return window;
  } else if (eventTargetName == "document") {
    return document;
  }
};
var parseEventOptions = function(eventOptions) {
  return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
};
var stringifyEventTarget = function(eventTarget) {
  if (eventTarget == window) {
    return "window";
  } else if (eventTarget == document) {
    return "document";
  }
};
var camelize = function(value) {
  return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
};
var namespaceCamelize = function(value) {
  return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
};
var capitalize = function(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
};
var dasherize = function(value) {
  return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
};
var tokenize = function(value) {
  return value.match(/[^\s]+/g) || [];
};
var isSomething = function(object) {
  return object !== null && object !== undefined;
};
var hasProperty = function(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
};
var getDefaultEventNameForElement = function(element) {
  const tagName = element.tagName.toLowerCase();
  if (tagName in defaultEventNames) {
    return defaultEventNames[tagName](element);
  }
};
var error = function(message) {
  throw new Error(message);
};
var typecast = function(value) {
  try {
    return JSON.parse(value);
  } catch (o_O) {
    return value;
  }
};
var add = function(map, key, value) {
  fetch2(map, key).add(value);
};
var del = function(map, key, value) {
  fetch2(map, key).delete(value);
  prune(map, key);
};
var fetch2 = function(map, key) {
  let values = map.get(key);
  if (!values) {
    values = new Set;
    map.set(key, values);
  }
  return values;
};
var prune = function(map, key) {
  const values = map.get(key);
  if (values != null && values.size == 0) {
    map.delete(key);
  }
};
var parseTokenString = function(tokenString, element, attributeName) {
  return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
};
var zip = function(left, right) {
  const length = Math.max(left.length, right.length);
  return Array.from({ length }, (_, index) => [left[index], right[index]]);
};
var tokensAreEqual = function(left, right) {
  return left && right && left.index == right.index && left.content == right.content;
};
var readInheritableStaticArrayValues = function(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return Array.from(ancestors.reduce((values, constructor2) => {
    getOwnStaticArrayValues(constructor2, propertyName).forEach((name) => values.add(name));
    return values;
  }, new Set));
};
var readInheritableStaticObjectPairs = function(constructor, propertyName) {
  const ancestors = getAncestorsForConstructor(constructor);
  return ancestors.reduce((pairs, constructor2) => {
    pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
    return pairs;
  }, []);
};
var getAncestorsForConstructor = function(constructor) {
  const ancestors = [];
  while (constructor) {
    ancestors.push(constructor);
    constructor = Object.getPrototypeOf(constructor);
  }
  return ancestors.reverse();
};
var getOwnStaticArrayValues = function(constructor, propertyName) {
  const definition = constructor[propertyName];
  return Array.isArray(definition) ? definition : [];
};
var getOwnStaticObjectPairs = function(constructor, propertyName) {
  const definition = constructor[propertyName];
  return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
};
var bless = function(constructor) {
  return shadow(constructor, getBlessedProperties(constructor));
};
var shadow = function(constructor, properties) {
  const shadowConstructor = extend2(constructor);
  const shadowProperties = getShadowProperties(constructor.prototype, properties);
  Object.defineProperties(shadowConstructor.prototype, shadowProperties);
  return shadowConstructor;
};
var getBlessedProperties = function(constructor) {
  const blessings = readInheritableStaticArrayValues(constructor, "blessings");
  return blessings.reduce((blessedProperties, blessing) => {
    const properties = blessing(constructor);
    for (const key in properties) {
      const descriptor = blessedProperties[key] || {};
      blessedProperties[key] = Object.assign(descriptor, properties[key]);
    }
    return blessedProperties;
  }, {});
};
var getShadowProperties = function(prototype, properties) {
  return getOwnKeys(properties).reduce((shadowProperties, key) => {
    const descriptor = getShadowedDescriptor(prototype, properties, key);
    if (descriptor) {
      Object.assign(shadowProperties, { [key]: descriptor });
    }
    return shadowProperties;
  }, {});
};
var getShadowedDescriptor = function(prototype, properties, key) {
  const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
  const shadowedByValue = shadowingDescriptor && ("value" in shadowingDescriptor);
  if (!shadowedByValue) {
    const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
    if (shadowingDescriptor) {
      descriptor.get = shadowingDescriptor.get || descriptor.get;
      descriptor.set = shadowingDescriptor.set || descriptor.set;
    }
    return descriptor;
  }
};
var blessDefinition = function(definition) {
  return {
    identifier: definition.identifier,
    controllerConstructor: bless(definition.controllerConstructor)
  };
};
var attributeValueContainsToken = function(attributeName, token) {
  return `[${attributeName}~="${token}"]`;
};
var objectFromEntries = function(array) {
  return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
};
var domReady = function() {
  return new Promise((resolve) => {
    if (document.readyState == "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve());
    } else {
      resolve();
    }
  });
};
var ClassPropertiesBlessing = function(constructor) {
  const classes = readInheritableStaticArrayValues(constructor, "classes");
  return classes.reduce((properties, classDefinition) => {
    return Object.assign(properties, propertiesForClassDefinition(classDefinition));
  }, {});
};
var propertiesForClassDefinition = function(key) {
  return {
    [`${key}Class`]: {
      get() {
        const { classes } = this;
        if (classes.has(key)) {
          return classes.get(key);
        } else {
          const attribute = classes.getAttributeName(key);
          throw new Error(`Missing attribute "${attribute}"`);
        }
      }
    },
    [`${key}Classes`]: {
      get() {
        return this.classes.getAll(key);
      }
    },
    [`has${capitalize(key)}Class`]: {
      get() {
        return this.classes.has(key);
      }
    }
  };
};
var OutletPropertiesBlessing = function(constructor) {
  const outlets = readInheritableStaticArrayValues(constructor, "outlets");
  return outlets.reduce((properties, outletDefinition) => {
    return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
  }, {});
};
var getOutletController = function(controller, element, identifier) {
  return controller.application.getControllerForElementAndIdentifier(element, identifier);
};
var getControllerAndEnsureConnectedScope = function(controller, element, outletName) {
  let outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
  controller.application.router.proposeToConnectScopeForElementAndIdentifier(element, outletName);
  outletController = getOutletController(controller, element, outletName);
  if (outletController)
    return outletController;
};
var propertiesForOutletDefinition = function(name) {
  const camelizedName = namespaceCamelize(name);
  return {
    [`${camelizedName}Outlet`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
          if (outletController)
            return outletController;
          throw new Error(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`);
        }
        throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
      }
    },
    [`${camelizedName}Outlets`]: {
      get() {
        const outlets = this.outlets.findAll(name);
        if (outlets.length > 0) {
          return outlets.map((outletElement) => {
            const outletController = getControllerAndEnsureConnectedScope(this, outletElement, name);
            if (outletController)
              return outletController;
            console.warn(`The provided outlet element is missing an outlet controller "${name}" instance for host controller "${this.identifier}"`, outletElement);
          }).filter((controller) => controller);
        }
        return [];
      }
    },
    [`${camelizedName}OutletElement`]: {
      get() {
        const outletElement = this.outlets.find(name);
        const selector = this.outlets.getSelectorForOutletName(name);
        if (outletElement) {
          return outletElement;
        } else {
          throw new Error(`Missing outlet element "${name}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${selector}".`);
        }
      }
    },
    [`${camelizedName}OutletElements`]: {
      get() {
        return this.outlets.findAll(name);
      }
    },
    [`has${capitalize(camelizedName)}Outlet`]: {
      get() {
        return this.outlets.has(name);
      }
    }
  };
};
var TargetPropertiesBlessing = function(constructor) {
  const targets = readInheritableStaticArrayValues(constructor, "targets");
  return targets.reduce((properties, targetDefinition) => {
    return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
  }, {});
};
var propertiesForTargetDefinition = function(name) {
  return {
    [`${name}Target`]: {
      get() {
        const target = this.targets.find(name);
        if (target) {
          return target;
        } else {
          throw new Error(`Missing target element "${name}" for "${this.identifier}" controller`);
        }
      }
    },
    [`${name}Targets`]: {
      get() {
        return this.targets.findAll(name);
      }
    },
    [`has${capitalize(name)}Target`]: {
      get() {
        return this.targets.has(name);
      }
    }
  };
};
var ValuePropertiesBlessing = function(constructor) {
  const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
  const propertyDescriptorMap = {
    valueDescriptorMap: {
      get() {
        return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
          const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
          const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
          return Object.assign(result, { [attributeName]: valueDescriptor });
        }, {});
      }
    }
  };
  return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
    return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
  }, propertyDescriptorMap);
};
var propertiesForValueDefinitionPair = function(valueDefinitionPair, controller) {
  const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
  const { key, name, reader: read, writer: write } = definition;
  return {
    [name]: {
      get() {
        const value = this.data.get(key);
        if (value !== null) {
          return read(value);
        } else {
          return definition.defaultValue;
        }
      },
      set(value) {
        if (value === undefined) {
          this.data.delete(key);
        } else {
          this.data.set(key, write(value));
        }
      }
    },
    [`has${capitalize(name)}`]: {
      get() {
        return this.data.has(key) || definition.hasCustomDefaultValue;
      }
    }
  };
};
var parseValueDefinitionPair = function([token, typeDefinition], controller) {
  return valueDescriptorForTokenAndTypeDefinition({
    controller,
    token,
    typeDefinition
  });
};
var parseValueTypeConstant = function(constant) {
  switch (constant) {
    case Array:
      return "array";
    case Boolean:
      return "boolean";
    case Number:
      return "number";
    case Object:
      return "object";
    case String:
      return "string";
  }
};
var parseValueTypeDefault = function(defaultValue) {
  switch (typeof defaultValue) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
  }
  if (Array.isArray(defaultValue))
    return "array";
  if (Object.prototype.toString.call(defaultValue) === "[object Object]")
    return "object";
};
var parseValueTypeObject = function(payload) {
  const { controller, token, typeObject } = payload;
  const hasType = isSomething(typeObject.type);
  const hasDefault = isSomething(typeObject.default);
  const fullObject = hasType && hasDefault;
  const onlyType = hasType && !hasDefault;
  const onlyDefault = !hasType && hasDefault;
  const typeFromObject = parseValueTypeConstant(typeObject.type);
  const typeFromDefaultValue = parseValueTypeDefault(payload.typeObject.default);
  if (onlyType)
    return typeFromObject;
  if (onlyDefault)
    return typeFromDefaultValue;
  if (typeFromObject !== typeFromDefaultValue) {
    const propertyPath = controller ? `${controller}.${token}` : token;
    throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${typeObject.default}" is of type "${typeFromDefaultValue}".`);
  }
  if (fullObject)
    return typeFromObject;
};
var parseValueTypeDefinition = function(payload) {
  const { controller, token, typeDefinition } = payload;
  const typeObject = { controller, token, typeObject: typeDefinition };
  const typeFromObject = parseValueTypeObject(typeObject);
  const typeFromDefaultValue = parseValueTypeDefault(typeDefinition);
  const typeFromConstant = parseValueTypeConstant(typeDefinition);
  const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
  if (type)
    return type;
  const propertyPath = controller ? `${controller}.${typeDefinition}` : token;
  throw new Error(`Unknown value type "${propertyPath}" for "${token}" value`);
};
var defaultValueForDefinition = function(typeDefinition) {
  const constant = parseValueTypeConstant(typeDefinition);
  if (constant)
    return defaultValuesByType[constant];
  const hasDefault = hasProperty(typeDefinition, "default");
  const hasType = hasProperty(typeDefinition, "type");
  const typeObject = typeDefinition;
  if (hasDefault)
    return typeObject.default;
  if (hasType) {
    const { type } = typeObject;
    const constantFromType = parseValueTypeConstant(type);
    if (constantFromType)
      return defaultValuesByType[constantFromType];
  }
  return typeDefinition;
};
var valueDescriptorForTokenAndTypeDefinition = function(payload) {
  const { token, typeDefinition } = payload;
  const key = `${dasherize(token)}-value`;
  const type = parseValueTypeDefinition(payload);
  return {
    type,
    key,
    name: camelize(key),
    get defaultValue() {
      return defaultValueForDefinition(typeDefinition);
    },
    get hasCustomDefaultValue() {
      return parseValueTypeDefault(typeDefinition) !== undefined;
    },
    reader: readers[type],
    writer: writers[type] || writers.default
  };
};
var writeJSON = function(value) {
  return JSON.stringify(value);
};
var writeString = function(value) {
  return `${value}`;
};

class EventListener {
  constructor(eventTarget, eventName, eventOptions) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.eventOptions = eventOptions;
    this.unorderedBindings = new Set;
  }
  connect() {
    this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
  }
  disconnect() {
    this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
  }
  bindingConnected(binding) {
    this.unorderedBindings.add(binding);
  }
  bindingDisconnected(binding) {
    this.unorderedBindings.delete(binding);
  }
  handleEvent(event) {
    const extendedEvent = extendEvent(event);
    for (const binding of this.bindings) {
      if (extendedEvent.immediatePropagationStopped) {
        break;
      } else {
        binding.handleEvent(extendedEvent);
      }
    }
  }
  hasBindings() {
    return this.unorderedBindings.size > 0;
  }
  get bindings() {
    return Array.from(this.unorderedBindings).sort((left, right) => {
      const leftIndex = left.index, rightIndex = right.index;
      return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
    });
  }
}

class Dispatcher {
  constructor(application) {
    this.application = application;
    this.eventListenerMaps = new Map;
    this.started = false;
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.eventListeners.forEach((eventListener) => eventListener.connect());
    }
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.eventListeners.forEach((eventListener) => eventListener.disconnect());
    }
  }
  get eventListeners() {
    return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
  }
  bindingConnected(binding) {
    this.fetchEventListenerForBinding(binding).bindingConnected(binding);
  }
  bindingDisconnected(binding, clearEventListeners = false) {
    this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
    if (clearEventListeners)
      this.clearEventListenersForBinding(binding);
  }
  handleError(error2, message, detail = {}) {
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  clearEventListenersForBinding(binding) {
    const eventListener = this.fetchEventListenerForBinding(binding);
    if (!eventListener.hasBindings()) {
      eventListener.disconnect();
      this.removeMappedEventListenerFor(binding);
    }
  }
  removeMappedEventListenerFor(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    eventListenerMap.delete(cacheKey);
    if (eventListenerMap.size == 0)
      this.eventListenerMaps.delete(eventTarget);
  }
  fetchEventListenerForBinding(binding) {
    const { eventTarget, eventName, eventOptions } = binding;
    return this.fetchEventListener(eventTarget, eventName, eventOptions);
  }
  fetchEventListener(eventTarget, eventName, eventOptions) {
    const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
    const cacheKey = this.cacheKey(eventName, eventOptions);
    let eventListener = eventListenerMap.get(cacheKey);
    if (!eventListener) {
      eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
      eventListenerMap.set(cacheKey, eventListener);
    }
    return eventListener;
  }
  createEventListener(eventTarget, eventName, eventOptions) {
    const eventListener = new EventListener(eventTarget, eventName, eventOptions);
    if (this.started) {
      eventListener.connect();
    }
    return eventListener;
  }
  fetchEventListenerMapForEventTarget(eventTarget) {
    let eventListenerMap = this.eventListenerMaps.get(eventTarget);
    if (!eventListenerMap) {
      eventListenerMap = new Map;
      this.eventListenerMaps.set(eventTarget, eventListenerMap);
    }
    return eventListenerMap;
  }
  cacheKey(eventName, eventOptions) {
    const parts = [eventName];
    Object.keys(eventOptions).sort().forEach((key) => {
      parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
    });
    return parts.join(":");
  }
}
var defaultActionDescriptorFilters = {
  stop({ event, value }) {
    if (value)
      event.stopPropagation();
    return true;
  },
  prevent({ event, value }) {
    if (value)
      event.preventDefault();
    return true;
  },
  self({ event, value, element }) {
    if (value) {
      return element === event.target;
    } else {
      return true;
    }
  }
};
var descriptorPattern = /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
var allModifiers = ["meta", "ctrl", "alt", "shift"];

class Action {
  constructor(element, index, descriptor, schema) {
    this.element = element;
    this.index = index;
    this.eventTarget = descriptor.eventTarget || element;
    this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
    this.eventOptions = descriptor.eventOptions || {};
    this.identifier = descriptor.identifier || error("missing identifier");
    this.methodName = descriptor.methodName || error("missing method name");
    this.keyFilter = descriptor.keyFilter || "";
    this.schema = schema;
  }
  static forToken(token, schema) {
    return new this(token.element, token.index, parseActionDescriptorString(token.content), schema);
  }
  toString() {
    const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
    const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
    return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
  }
  shouldIgnoreKeyboardEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = this.keyFilter.split("+");
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    const standardFilter = filters.filter((key) => !allModifiers.includes(key))[0];
    if (!standardFilter) {
      return false;
    }
    if (!hasProperty(this.keyMappings, standardFilter)) {
      error(`contains unknown key filter: ${this.keyFilter}`);
    }
    return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
  }
  shouldIgnoreMouseEvent(event) {
    if (!this.keyFilter) {
      return false;
    }
    const filters = [this.keyFilter];
    if (this.keyFilterDissatisfied(event, filters)) {
      return true;
    }
    return false;
  }
  get params() {
    const params = {};
    const pattern = new RegExp(`^data-${this.identifier}-(.+)-param\$`, "i");
    for (const { name, value } of Array.from(this.element.attributes)) {
      const match = name.match(pattern);
      const key = match && match[1];
      if (key) {
        params[camelize(key)] = typecast(value);
      }
    }
    return params;
  }
  get eventTargetName() {
    return stringifyEventTarget(this.eventTarget);
  }
  get keyMappings() {
    return this.schema.keyMappings;
  }
  keyFilterDissatisfied(event, filters) {
    const [meta, ctrl, alt, shift] = allModifiers.map((modifier) => filters.includes(modifier));
    return event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift;
  }
}
var defaultEventNames = {
  a: () => "click",
  button: () => "click",
  form: () => "submit",
  details: () => "toggle",
  input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
  select: () => "change",
  textarea: () => "input"
};

class Binding {
  constructor(context, action) {
    this.context = context;
    this.action = action;
  }
  get index() {
    return this.action.index;
  }
  get eventTarget() {
    return this.action.eventTarget;
  }
  get eventOptions() {
    return this.action.eventOptions;
  }
  get identifier() {
    return this.context.identifier;
  }
  handleEvent(event) {
    const actionEvent = this.prepareActionEvent(event);
    if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(actionEvent)) {
      this.invokeWithEvent(actionEvent);
    }
  }
  get eventName() {
    return this.action.eventName;
  }
  get method() {
    const method = this.controller[this.methodName];
    if (typeof method == "function") {
      return method;
    }
    throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
  }
  applyEventModifiers(event) {
    const { element } = this.action;
    const { actionDescriptorFilters } = this.context.application;
    const { controller } = this.context;
    let passes = true;
    for (const [name, value] of Object.entries(this.eventOptions)) {
      if (name in actionDescriptorFilters) {
        const filter = actionDescriptorFilters[name];
        passes = passes && filter({ name, value, event, element, controller });
      } else {
        continue;
      }
    }
    return passes;
  }
  prepareActionEvent(event) {
    return Object.assign(event, { params: this.action.params });
  }
  invokeWithEvent(event) {
    const { target, currentTarget } = event;
    try {
      this.method.call(this.controller, event);
      this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
    } catch (error2) {
      const { identifier, controller, element, index } = this;
      const detail = { identifier, controller, element, index, event };
      this.context.handleError(error2, `invoking action "${this.action}"`, detail);
    }
  }
  willBeInvokedByEvent(event) {
    const eventTarget = event.target;
    if (event instanceof KeyboardEvent && this.action.shouldIgnoreKeyboardEvent(event)) {
      return false;
    }
    if (event instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(event)) {
      return false;
    }
    if (this.element === eventTarget) {
      return true;
    } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
      return this.scope.containsElement(eventTarget);
    } else {
      return this.scope.containsElement(this.action.element);
    }
  }
  get controller() {
    return this.context.controller;
  }
  get methodName() {
    return this.action.methodName;
  }
  get element() {
    return this.scope.element;
  }
  get scope() {
    return this.context.scope;
  }
}

class ElementObserver {
  constructor(element, delegate) {
    this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
    this.element = element;
    this.started = false;
    this.delegate = delegate;
    this.elements = new Set;
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.refresh();
    }
  }
  pause(callback) {
    if (this.started) {
      this.mutationObserver.disconnect();
      this.started = false;
    }
    callback();
    if (!this.started) {
      this.mutationObserver.observe(this.element, this.mutationObserverInit);
      this.started = true;
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      const matches = new Set(this.matchElementsInTree());
      for (const element of Array.from(this.elements)) {
        if (!matches.has(element)) {
          this.removeElement(element);
        }
      }
      for (const element of Array.from(matches)) {
        this.addElement(element);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    if (mutation.type == "attributes") {
      this.processAttributeChange(mutation.target, mutation.attributeName);
    } else if (mutation.type == "childList") {
      this.processRemovedNodes(mutation.removedNodes);
      this.processAddedNodes(mutation.addedNodes);
    }
  }
  processAttributeChange(element, attributeName) {
    if (this.elements.has(element)) {
      if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
        this.delegate.elementAttributeChanged(element, attributeName);
      } else {
        this.removeElement(element);
      }
    } else if (this.matchElement(element)) {
      this.addElement(element);
    }
  }
  processRemovedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element) {
        this.processTree(element, this.removeElement);
      }
    }
  }
  processAddedNodes(nodes) {
    for (const node of Array.from(nodes)) {
      const element = this.elementFromNode(node);
      if (element && this.elementIsActive(element)) {
        this.processTree(element, this.addElement);
      }
    }
  }
  matchElement(element) {
    return this.delegate.matchElement(element);
  }
  matchElementsInTree(tree = this.element) {
    return this.delegate.matchElementsInTree(tree);
  }
  processTree(tree, processor) {
    for (const element of this.matchElementsInTree(tree)) {
      processor.call(this, element);
    }
  }
  elementFromNode(node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      return node;
    }
  }
  elementIsActive(element) {
    if (element.isConnected != this.element.isConnected) {
      return false;
    } else {
      return this.element.contains(element);
    }
  }
  addElement(element) {
    if (!this.elements.has(element)) {
      if (this.elementIsActive(element)) {
        this.elements.add(element);
        if (this.delegate.elementMatched) {
          this.delegate.elementMatched(element);
        }
      }
    }
  }
  removeElement(element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);
      if (this.delegate.elementUnmatched) {
        this.delegate.elementUnmatched(element);
      }
    }
  }
}

class AttributeObserver {
  constructor(element, attributeName, delegate) {
    this.attributeName = attributeName;
    this.delegate = delegate;
    this.elementObserver = new ElementObserver(element, this);
  }
  get element() {
    return this.elementObserver.element;
  }
  get selector() {
    return `[${this.attributeName}]`;
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get started() {
    return this.elementObserver.started;
  }
  matchElement(element) {
    return element.hasAttribute(this.attributeName);
  }
  matchElementsInTree(tree) {
    const match = this.matchElement(tree) ? [tree] : [];
    const matches = Array.from(tree.querySelectorAll(this.selector));
    return match.concat(matches);
  }
  elementMatched(element) {
    if (this.delegate.elementMatchedAttribute) {
      this.delegate.elementMatchedAttribute(element, this.attributeName);
    }
  }
  elementUnmatched(element) {
    if (this.delegate.elementUnmatchedAttribute) {
      this.delegate.elementUnmatchedAttribute(element, this.attributeName);
    }
  }
  elementAttributeChanged(element, attributeName) {
    if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
      this.delegate.elementAttributeValueChanged(element, attributeName);
    }
  }
}

class Multimap {
  constructor() {
    this.valuesByKey = new Map;
  }
  get keys() {
    return Array.from(this.valuesByKey.keys());
  }
  get values() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((values, set) => values.concat(Array.from(set)), []);
  }
  get size() {
    const sets = Array.from(this.valuesByKey.values());
    return sets.reduce((size, set) => size + set.size, 0);
  }
  add(key, value) {
    add(this.valuesByKey, key, value);
  }
  delete(key, value) {
    del(this.valuesByKey, key, value);
  }
  has(key, value) {
    const values = this.valuesByKey.get(key);
    return values != null && values.has(value);
  }
  hasKey(key) {
    return this.valuesByKey.has(key);
  }
  hasValue(value) {
    const sets = Array.from(this.valuesByKey.values());
    return sets.some((set) => set.has(value));
  }
  getValuesForKey(key) {
    const values = this.valuesByKey.get(key);
    return values ? Array.from(values) : [];
  }
  getKeysForValue(value) {
    return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
  }
}
class SelectorObserver {
  constructor(element, selector, delegate, details) {
    this._selector = selector;
    this.details = details;
    this.elementObserver = new ElementObserver(element, this);
    this.delegate = delegate;
    this.matchesByElement = new Multimap;
  }
  get started() {
    return this.elementObserver.started;
  }
  get selector() {
    return this._selector;
  }
  set selector(selector) {
    this._selector = selector;
    this.refresh();
  }
  start() {
    this.elementObserver.start();
  }
  pause(callback) {
    this.elementObserver.pause(callback);
  }
  stop() {
    this.elementObserver.stop();
  }
  refresh() {
    this.elementObserver.refresh();
  }
  get element() {
    return this.elementObserver.element;
  }
  matchElement(element) {
    const { selector } = this;
    if (selector) {
      const matches = element.matches(selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    } else {
      return false;
    }
  }
  matchElementsInTree(tree) {
    const { selector } = this;
    if (selector) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    } else {
      return [];
    }
  }
  elementMatched(element) {
    const { selector } = this;
    if (selector) {
      this.selectorMatched(element, selector);
    }
  }
  elementUnmatched(element) {
    const selectors = this.matchesByElement.getKeysForValue(element);
    for (const selector of selectors) {
      this.selectorUnmatched(element, selector);
    }
  }
  elementAttributeChanged(element, _attributeName) {
    const { selector } = this;
    if (selector) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(selector, element);
      if (matches && !matchedBefore) {
        this.selectorMatched(element, selector);
      } else if (!matches && matchedBefore) {
        this.selectorUnmatched(element, selector);
      }
    }
  }
  selectorMatched(element, selector) {
    this.delegate.selectorMatched(element, selector, this.details);
    this.matchesByElement.add(selector, element);
  }
  selectorUnmatched(element, selector) {
    this.delegate.selectorUnmatched(element, selector, this.details);
    this.matchesByElement.delete(selector, element);
  }
}

class StringMapObserver {
  constructor(element, delegate) {
    this.element = element;
    this.delegate = delegate;
    this.started = false;
    this.stringMap = new Map;
    this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
  }
  start() {
    if (!this.started) {
      this.started = true;
      this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
      this.refresh();
    }
  }
  stop() {
    if (this.started) {
      this.mutationObserver.takeRecords();
      this.mutationObserver.disconnect();
      this.started = false;
    }
  }
  refresh() {
    if (this.started) {
      for (const attributeName of this.knownAttributeNames) {
        this.refreshAttribute(attributeName, null);
      }
    }
  }
  processMutations(mutations) {
    if (this.started) {
      for (const mutation of mutations) {
        this.processMutation(mutation);
      }
    }
  }
  processMutation(mutation) {
    const attributeName = mutation.attributeName;
    if (attributeName) {
      this.refreshAttribute(attributeName, mutation.oldValue);
    }
  }
  refreshAttribute(attributeName, oldValue) {
    const key = this.delegate.getStringMapKeyForAttribute(attributeName);
    if (key != null) {
      if (!this.stringMap.has(attributeName)) {
        this.stringMapKeyAdded(key, attributeName);
      }
      const value = this.element.getAttribute(attributeName);
      if (this.stringMap.get(attributeName) != value) {
        this.stringMapValueChanged(value, key, oldValue);
      }
      if (value == null) {
        const oldValue2 = this.stringMap.get(attributeName);
        this.stringMap.delete(attributeName);
        if (oldValue2)
          this.stringMapKeyRemoved(key, attributeName, oldValue2);
      } else {
        this.stringMap.set(attributeName, value);
      }
    }
  }
  stringMapKeyAdded(key, attributeName) {
    if (this.delegate.stringMapKeyAdded) {
      this.delegate.stringMapKeyAdded(key, attributeName);
    }
  }
  stringMapValueChanged(value, key, oldValue) {
    if (this.delegate.stringMapValueChanged) {
      this.delegate.stringMapValueChanged(value, key, oldValue);
    }
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    if (this.delegate.stringMapKeyRemoved) {
      this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
    }
  }
  get knownAttributeNames() {
    return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
  }
  get currentAttributeNames() {
    return Array.from(this.element.attributes).map((attribute) => attribute.name);
  }
  get recordedAttributeNames() {
    return Array.from(this.stringMap.keys());
  }
}

class TokenListObserver {
  constructor(element, attributeName, delegate) {
    this.attributeObserver = new AttributeObserver(element, attributeName, this);
    this.delegate = delegate;
    this.tokensByElement = new Multimap;
  }
  get started() {
    return this.attributeObserver.started;
  }
  start() {
    this.attributeObserver.start();
  }
  pause(callback) {
    this.attributeObserver.pause(callback);
  }
  stop() {
    this.attributeObserver.stop();
  }
  refresh() {
    this.attributeObserver.refresh();
  }
  get element() {
    return this.attributeObserver.element;
  }
  get attributeName() {
    return this.attributeObserver.attributeName;
  }
  elementMatchedAttribute(element) {
    this.tokensMatched(this.readTokensForElement(element));
  }
  elementAttributeValueChanged(element) {
    const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
    this.tokensUnmatched(unmatchedTokens);
    this.tokensMatched(matchedTokens);
  }
  elementUnmatchedAttribute(element) {
    this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
  }
  tokensMatched(tokens) {
    tokens.forEach((token) => this.tokenMatched(token));
  }
  tokensUnmatched(tokens) {
    tokens.forEach((token) => this.tokenUnmatched(token));
  }
  tokenMatched(token) {
    this.delegate.tokenMatched(token);
    this.tokensByElement.add(token.element, token);
  }
  tokenUnmatched(token) {
    this.delegate.tokenUnmatched(token);
    this.tokensByElement.delete(token.element, token);
  }
  refreshTokensForElement(element) {
    const previousTokens = this.tokensByElement.getValuesForKey(element);
    const currentTokens = this.readTokensForElement(element);
    const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
    if (firstDifferingIndex == -1) {
      return [[], []];
    } else {
      return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
    }
  }
  readTokensForElement(element) {
    const attributeName = this.attributeName;
    const tokenString = element.getAttribute(attributeName) || "";
    return parseTokenString(tokenString, element, attributeName);
  }
}

class ValueListObserver {
  constructor(element, attributeName, delegate) {
    this.tokenListObserver = new TokenListObserver(element, attributeName, this);
    this.delegate = delegate;
    this.parseResultsByToken = new WeakMap;
    this.valuesByTokenByElement = new WeakMap;
  }
  get started() {
    return this.tokenListObserver.started;
  }
  start() {
    this.tokenListObserver.start();
  }
  stop() {
    this.tokenListObserver.stop();
  }
  refresh() {
    this.tokenListObserver.refresh();
  }
  get element() {
    return this.tokenListObserver.element;
  }
  get attributeName() {
    return this.tokenListObserver.attributeName;
  }
  tokenMatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).set(token, value);
      this.delegate.elementMatchedValue(element, value);
    }
  }
  tokenUnmatched(token) {
    const { element } = token;
    const { value } = this.fetchParseResultForToken(token);
    if (value) {
      this.fetchValuesByTokenForElement(element).delete(token);
      this.delegate.elementUnmatchedValue(element, value);
    }
  }
  fetchParseResultForToken(token) {
    let parseResult = this.parseResultsByToken.get(token);
    if (!parseResult) {
      parseResult = this.parseToken(token);
      this.parseResultsByToken.set(token, parseResult);
    }
    return parseResult;
  }
  fetchValuesByTokenForElement(element) {
    let valuesByToken = this.valuesByTokenByElement.get(element);
    if (!valuesByToken) {
      valuesByToken = new Map;
      this.valuesByTokenByElement.set(element, valuesByToken);
    }
    return valuesByToken;
  }
  parseToken(token) {
    try {
      const value = this.delegate.parseValueForToken(token);
      return { value };
    } catch (error2) {
      return { error: error2 };
    }
  }
}

class BindingObserver {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.bindingsByAction = new Map;
  }
  start() {
    if (!this.valueListObserver) {
      this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
      this.valueListObserver.start();
    }
  }
  stop() {
    if (this.valueListObserver) {
      this.valueListObserver.stop();
      delete this.valueListObserver;
      this.disconnectAllActions();
    }
  }
  get element() {
    return this.context.element;
  }
  get identifier() {
    return this.context.identifier;
  }
  get actionAttribute() {
    return this.schema.actionAttribute;
  }
  get schema() {
    return this.context.schema;
  }
  get bindings() {
    return Array.from(this.bindingsByAction.values());
  }
  connectAction(action) {
    const binding = new Binding(this.context, action);
    this.bindingsByAction.set(action, binding);
    this.delegate.bindingConnected(binding);
  }
  disconnectAction(action) {
    const binding = this.bindingsByAction.get(action);
    if (binding) {
      this.bindingsByAction.delete(action);
      this.delegate.bindingDisconnected(binding);
    }
  }
  disconnectAllActions() {
    this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
    this.bindingsByAction.clear();
  }
  parseValueForToken(token) {
    const action = Action.forToken(token, this.schema);
    if (action.identifier == this.identifier) {
      return action;
    }
  }
  elementMatchedValue(element, action) {
    this.connectAction(action);
  }
  elementUnmatchedValue(element, action) {
    this.disconnectAction(action);
  }
}

class ValueObserver {
  constructor(context, receiver) {
    this.context = context;
    this.receiver = receiver;
    this.stringMapObserver = new StringMapObserver(this.element, this);
    this.valueDescriptorMap = this.controller.valueDescriptorMap;
  }
  start() {
    this.stringMapObserver.start();
    this.invokeChangedCallbacksForDefaultValues();
  }
  stop() {
    this.stringMapObserver.stop();
  }
  get element() {
    return this.context.element;
  }
  get controller() {
    return this.context.controller;
  }
  getStringMapKeyForAttribute(attributeName) {
    if (attributeName in this.valueDescriptorMap) {
      return this.valueDescriptorMap[attributeName].name;
    }
  }
  stringMapKeyAdded(key, attributeName) {
    const descriptor = this.valueDescriptorMap[attributeName];
    if (!this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
    }
  }
  stringMapValueChanged(value, name, oldValue) {
    const descriptor = this.valueDescriptorNameMap[name];
    if (value === null)
      return;
    if (oldValue === null) {
      oldValue = descriptor.writer(descriptor.defaultValue);
    }
    this.invokeChangedCallback(name, value, oldValue);
  }
  stringMapKeyRemoved(key, attributeName, oldValue) {
    const descriptor = this.valueDescriptorNameMap[key];
    if (this.hasValue(key)) {
      this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
    } else {
      this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
    }
  }
  invokeChangedCallbacksForDefaultValues() {
    for (const { key, name, defaultValue, writer } of this.valueDescriptors) {
      if (defaultValue != null && !this.controller.data.has(key)) {
        this.invokeChangedCallback(name, writer(defaultValue), undefined);
      }
    }
  }
  invokeChangedCallback(name, rawValue, rawOldValue) {
    const changedMethodName = `${name}Changed`;
    const changedMethod = this.receiver[changedMethodName];
    if (typeof changedMethod == "function") {
      const descriptor = this.valueDescriptorNameMap[name];
      try {
        const value = descriptor.reader(rawValue);
        let oldValue = rawOldValue;
        if (rawOldValue) {
          oldValue = descriptor.reader(rawOldValue);
        }
        changedMethod.call(this.receiver, value, oldValue);
      } catch (error2) {
        if (error2 instanceof TypeError) {
          error2.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error2.message}`;
        }
        throw error2;
      }
    }
  }
  get valueDescriptors() {
    const { valueDescriptorMap } = this;
    return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
  }
  get valueDescriptorNameMap() {
    const descriptors = {};
    Object.keys(this.valueDescriptorMap).forEach((key) => {
      const descriptor = this.valueDescriptorMap[key];
      descriptors[descriptor.name] = descriptor;
    });
    return descriptors;
  }
  hasValue(attributeName) {
    const descriptor = this.valueDescriptorNameMap[attributeName];
    const hasMethodName = `has${capitalize(descriptor.name)}`;
    return this.receiver[hasMethodName];
  }
}

class TargetObserver {
  constructor(context, delegate) {
    this.context = context;
    this.delegate = delegate;
    this.targetsByName = new Multimap;
  }
  start() {
    if (!this.tokenListObserver) {
      this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
      this.tokenListObserver.start();
    }
  }
  stop() {
    if (this.tokenListObserver) {
      this.disconnectAllTargets();
      this.tokenListObserver.stop();
      delete this.tokenListObserver;
    }
  }
  tokenMatched({ element, content: name }) {
    if (this.scope.containsElement(element)) {
      this.connectTarget(element, name);
    }
  }
  tokenUnmatched({ element, content: name }) {
    this.disconnectTarget(element, name);
  }
  connectTarget(element, name) {
    var _a;
    if (!this.targetsByName.has(name, element)) {
      this.targetsByName.add(name, element);
      (_a = this.tokenListObserver) === null || _a === undefined || _a.pause(() => this.delegate.targetConnected(element, name));
    }
  }
  disconnectTarget(element, name) {
    var _a;
    if (this.targetsByName.has(name, element)) {
      this.targetsByName.delete(name, element);
      (_a = this.tokenListObserver) === null || _a === undefined || _a.pause(() => this.delegate.targetDisconnected(element, name));
    }
  }
  disconnectAllTargets() {
    for (const name of this.targetsByName.keys) {
      for (const element of this.targetsByName.getValuesForKey(name)) {
        this.disconnectTarget(element, name);
      }
    }
  }
  get attributeName() {
    return `data-${this.context.identifier}-target`;
  }
  get element() {
    return this.context.element;
  }
  get scope() {
    return this.context.scope;
  }
}

class OutletObserver {
  constructor(context, delegate) {
    this.started = false;
    this.context = context;
    this.delegate = delegate;
    this.outletsByName = new Multimap;
    this.outletElementsByName = new Multimap;
    this.selectorObserverMap = new Map;
    this.attributeObserverMap = new Map;
  }
  start() {
    if (!this.started) {
      this.outletDefinitions.forEach((outletName) => {
        this.setupSelectorObserverForOutlet(outletName);
        this.setupAttributeObserverForOutlet(outletName);
      });
      this.started = true;
      this.dependentContexts.forEach((context) => context.refresh());
    }
  }
  refresh() {
    this.selectorObserverMap.forEach((observer) => observer.refresh());
    this.attributeObserverMap.forEach((observer) => observer.refresh());
  }
  stop() {
    if (this.started) {
      this.started = false;
      this.disconnectAllOutlets();
      this.stopSelectorObservers();
      this.stopAttributeObservers();
    }
  }
  stopSelectorObservers() {
    if (this.selectorObserverMap.size > 0) {
      this.selectorObserverMap.forEach((observer) => observer.stop());
      this.selectorObserverMap.clear();
    }
  }
  stopAttributeObservers() {
    if (this.attributeObserverMap.size > 0) {
      this.attributeObserverMap.forEach((observer) => observer.stop());
      this.attributeObserverMap.clear();
    }
  }
  selectorMatched(element, _selector, { outletName }) {
    const outlet = this.getOutlet(element, outletName);
    if (outlet) {
      this.connectOutlet(outlet, element, outletName);
    }
  }
  selectorUnmatched(element, _selector, { outletName }) {
    const outlet = this.getOutletFromMap(element, outletName);
    if (outlet) {
      this.disconnectOutlet(outlet, element, outletName);
    }
  }
  selectorMatchElement(element, { outletName }) {
    const selector = this.selector(outletName);
    const hasOutlet = this.hasOutlet(element, outletName);
    const hasOutletController = element.matches(`[${this.schema.controllerAttribute}~=${outletName}]`);
    if (selector) {
      return hasOutlet && hasOutletController && element.matches(selector);
    } else {
      return false;
    }
  }
  elementMatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementAttributeValueChanged(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  elementUnmatchedAttribute(_element, attributeName) {
    const outletName = this.getOutletNameFromOutletAttributeName(attributeName);
    if (outletName) {
      this.updateSelectorObserverForOutlet(outletName);
    }
  }
  connectOutlet(outlet, element, outletName) {
    var _a;
    if (!this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.add(outletName, outlet);
      this.outletElementsByName.add(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === undefined || _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
    }
  }
  disconnectOutlet(outlet, element, outletName) {
    var _a;
    if (this.outletElementsByName.has(outletName, element)) {
      this.outletsByName.delete(outletName, outlet);
      this.outletElementsByName.delete(outletName, element);
      (_a = this.selectorObserverMap.get(outletName)) === null || _a === undefined || _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
    }
  }
  disconnectAllOutlets() {
    for (const outletName of this.outletElementsByName.keys) {
      for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
        for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
          this.disconnectOutlet(outlet, element, outletName);
        }
      }
    }
  }
  updateSelectorObserverForOutlet(outletName) {
    const observer = this.selectorObserverMap.get(outletName);
    if (observer) {
      observer.selector = this.selector(outletName);
    }
  }
  setupSelectorObserverForOutlet(outletName) {
    const selector = this.selector(outletName);
    const selectorObserver = new SelectorObserver(document.body, selector, this, { outletName });
    this.selectorObserverMap.set(outletName, selectorObserver);
    selectorObserver.start();
  }
  setupAttributeObserverForOutlet(outletName) {
    const attributeName = this.attributeNameForOutletName(outletName);
    const attributeObserver = new AttributeObserver(this.scope.element, attributeName, this);
    this.attributeObserverMap.set(outletName, attributeObserver);
    attributeObserver.start();
  }
  selector(outletName) {
    return this.scope.outlets.getSelectorForOutletName(outletName);
  }
  attributeNameForOutletName(outletName) {
    return this.scope.schema.outletAttributeForScope(this.identifier, outletName);
  }
  getOutletNameFromOutletAttributeName(attributeName) {
    return this.outletDefinitions.find((outletName) => this.attributeNameForOutletName(outletName) === attributeName);
  }
  get outletDependencies() {
    const dependencies = new Multimap;
    this.router.modules.forEach((module) => {
      const constructor = module.definition.controllerConstructor;
      const outlets = readInheritableStaticArrayValues(constructor, "outlets");
      outlets.forEach((outlet) => dependencies.add(outlet, module.identifier));
    });
    return dependencies;
  }
  get outletDefinitions() {
    return this.outletDependencies.getKeysForValue(this.identifier);
  }
  get dependentControllerIdentifiers() {
    return this.outletDependencies.getValuesForKey(this.identifier);
  }
  get dependentContexts() {
    const identifiers = this.dependentControllerIdentifiers;
    return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
  }
  hasOutlet(element, outletName) {
    return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
  }
  getOutlet(element, outletName) {
    return this.application.getControllerForElementAndIdentifier(element, outletName);
  }
  getOutletFromMap(element, outletName) {
    return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
  }
  get scope() {
    return this.context.scope;
  }
  get schema() {
    return this.context.schema;
  }
  get identifier() {
    return this.context.identifier;
  }
  get application() {
    return this.context.application;
  }
  get router() {
    return this.application.router;
  }
}

class Context {
  constructor(module, scope) {
    this.logDebugActivity = (functionName, detail = {}) => {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.logDebugActivity(this.identifier, functionName, detail);
    };
    this.module = module;
    this.scope = scope;
    this.controller = new module.controllerConstructor(this);
    this.bindingObserver = new BindingObserver(this, this.dispatcher);
    this.valueObserver = new ValueObserver(this, this.controller);
    this.targetObserver = new TargetObserver(this, this);
    this.outletObserver = new OutletObserver(this, this);
    try {
      this.controller.initialize();
      this.logDebugActivity("initialize");
    } catch (error2) {
      this.handleError(error2, "initializing controller");
    }
  }
  connect() {
    this.bindingObserver.start();
    this.valueObserver.start();
    this.targetObserver.start();
    this.outletObserver.start();
    try {
      this.controller.connect();
      this.logDebugActivity("connect");
    } catch (error2) {
      this.handleError(error2, "connecting controller");
    }
  }
  refresh() {
    this.outletObserver.refresh();
  }
  disconnect() {
    try {
      this.controller.disconnect();
      this.logDebugActivity("disconnect");
    } catch (error2) {
      this.handleError(error2, "disconnecting controller");
    }
    this.outletObserver.stop();
    this.targetObserver.stop();
    this.valueObserver.stop();
    this.bindingObserver.stop();
  }
  get application() {
    return this.module.application;
  }
  get identifier() {
    return this.module.identifier;
  }
  get schema() {
    return this.application.schema;
  }
  get dispatcher() {
    return this.application.dispatcher;
  }
  get element() {
    return this.scope.element;
  }
  get parentElement() {
    return this.element.parentElement;
  }
  handleError(error2, message, detail = {}) {
    const { identifier, controller, element } = this;
    detail = Object.assign({ identifier, controller, element }, detail);
    this.application.handleError(error2, `Error ${message}`, detail);
  }
  targetConnected(element, name) {
    this.invokeControllerMethod(`${name}TargetConnected`, element);
  }
  targetDisconnected(element, name) {
    this.invokeControllerMethod(`${name}TargetDisconnected`, element);
  }
  outletConnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletConnected`, outlet, element);
  }
  outletDisconnected(outlet, element, name) {
    this.invokeControllerMethod(`${namespaceCamelize(name)}OutletDisconnected`, outlet, element);
  }
  invokeControllerMethod(methodName, ...args) {
    const controller = this.controller;
    if (typeof controller[methodName] == "function") {
      controller[methodName](...args);
    }
  }
}
var getOwnKeys = (() => {
  if (typeof Object.getOwnPropertySymbols == "function") {
    return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
  } else {
    return Object.getOwnPropertyNames;
  }
})();
var extend2 = (() => {
  function extendWithReflect(constructor) {
    function extended() {
      return Reflect.construct(constructor, arguments, new.target);
    }
    extended.prototype = Object.create(constructor.prototype, {
      constructor: { value: extended }
    });
    Reflect.setPrototypeOf(extended, constructor);
    return extended;
  }
  function testReflectExtension() {
    const a = function() {
      this.a.call(this);
    };
    const b = extendWithReflect(a);
    b.prototype.a = function() {
    };
    return new b;
  }
  try {
    testReflectExtension();
    return extendWithReflect;
  } catch (error2) {
    return (constructor) => class extended extends constructor {
    };
  }
})();

class Module {
  constructor(application, definition) {
    this.application = application;
    this.definition = blessDefinition(definition);
    this.contextsByScope = new WeakMap;
    this.connectedContexts = new Set;
  }
  get identifier() {
    return this.definition.identifier;
  }
  get controllerConstructor() {
    return this.definition.controllerConstructor;
  }
  get contexts() {
    return Array.from(this.connectedContexts);
  }
  connectContextForScope(scope) {
    const context = this.fetchContextForScope(scope);
    this.connectedContexts.add(context);
    context.connect();
  }
  disconnectContextForScope(scope) {
    const context = this.contextsByScope.get(scope);
    if (context) {
      this.connectedContexts.delete(context);
      context.disconnect();
    }
  }
  fetchContextForScope(scope) {
    let context = this.contextsByScope.get(scope);
    if (!context) {
      context = new Context(this, scope);
      this.contextsByScope.set(scope, context);
    }
    return context;
  }
}

class ClassMap {
  constructor(scope) {
    this.scope = scope;
  }
  has(name) {
    return this.data.has(this.getDataKey(name));
  }
  get(name) {
    return this.getAll(name)[0];
  }
  getAll(name) {
    const tokenString = this.data.get(this.getDataKey(name)) || "";
    return tokenize(tokenString);
  }
  getAttributeName(name) {
    return this.data.getAttributeNameForKey(this.getDataKey(name));
  }
  getDataKey(name) {
    return `${name}-class`;
  }
  get data() {
    return this.scope.data;
  }
}

class DataMap {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.getAttribute(name);
  }
  set(key, value) {
    const name = this.getAttributeNameForKey(key);
    this.element.setAttribute(name, value);
    return this.get(key);
  }
  has(key) {
    const name = this.getAttributeNameForKey(key);
    return this.element.hasAttribute(name);
  }
  delete(key) {
    if (this.has(key)) {
      const name = this.getAttributeNameForKey(key);
      this.element.removeAttribute(name);
      return true;
    } else {
      return false;
    }
  }
  getAttributeNameForKey(key) {
    return `data-${this.identifier}-${dasherize(key)}`;
  }
}

class Guide {
  constructor(logger6) {
    this.warnedKeysByObject = new WeakMap;
    this.logger = logger6;
  }
  warn(object, key, message) {
    let warnedKeys = this.warnedKeysByObject.get(object);
    if (!warnedKeys) {
      warnedKeys = new Set;
      this.warnedKeysByObject.set(object, warnedKeys);
    }
    if (!warnedKeys.has(key)) {
      warnedKeys.add(key);
      this.logger.warn(message, object);
    }
  }
}

class TargetSet {
  constructor(scope) {
    this.scope = scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(targetName) {
    return this.find(targetName) != null;
  }
  find(...targetNames) {
    return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), undefined);
  }
  findAll(...targetNames) {
    return targetNames.reduce((targets, targetName) => [
      ...targets,
      ...this.findAllTargets(targetName),
      ...this.findAllLegacyTargets(targetName)
    ], []);
  }
  findTarget(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findElement(selector);
  }
  findAllTargets(targetName) {
    const selector = this.getSelectorForTargetName(targetName);
    return this.scope.findAllElements(selector);
  }
  getSelectorForTargetName(targetName) {
    const attributeName = this.schema.targetAttributeForScope(this.identifier);
    return attributeValueContainsToken(attributeName, targetName);
  }
  findLegacyTarget(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.deprecate(this.scope.findElement(selector), targetName);
  }
  findAllLegacyTargets(targetName) {
    const selector = this.getLegacySelectorForTargetName(targetName);
    return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
  }
  getLegacySelectorForTargetName(targetName) {
    const targetDescriptor = `${this.identifier}.${targetName}`;
    return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
  }
  deprecate(element, targetName) {
    if (element) {
      const { identifier } = this;
      const attributeName = this.schema.targetAttribute;
      const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
      this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". ` + `The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
    }
    return element;
  }
  get guide() {
    return this.scope.guide;
  }
}

class OutletSet {
  constructor(scope, controllerElement) {
    this.scope = scope;
    this.controllerElement = controllerElement;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get schema() {
    return this.scope.schema;
  }
  has(outletName) {
    return this.find(outletName) != null;
  }
  find(...outletNames) {
    return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), undefined);
  }
  findAll(...outletNames) {
    return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
  }
  getSelectorForOutletName(outletName) {
    const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
    return this.controllerElement.getAttribute(attributeName);
  }
  findOutlet(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    if (selector)
      return this.findElement(selector, outletName);
  }
  findAllOutlets(outletName) {
    const selector = this.getSelectorForOutletName(outletName);
    return selector ? this.findAllElements(selector, outletName) : [];
  }
  findElement(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
  }
  findAllElements(selector, outletName) {
    const elements = this.scope.queryElements(selector);
    return elements.filter((element) => this.matchesElement(element, selector, outletName));
  }
  matchesElement(element, selector, outletName) {
    const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
    return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
  }
}

class Scope {
  constructor(schema, element, identifier, logger6) {
    this.targets = new TargetSet(this);
    this.classes = new ClassMap(this);
    this.data = new DataMap(this);
    this.containsElement = (element2) => {
      return element2.closest(this.controllerSelector) === this.element;
    };
    this.schema = schema;
    this.element = element;
    this.identifier = identifier;
    this.guide = new Guide(logger6);
    this.outlets = new OutletSet(this.documentScope, element);
  }
  findElement(selector) {
    return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
  }
  findAllElements(selector) {
    return [
      ...this.element.matches(selector) ? [this.element] : [],
      ...this.queryElements(selector).filter(this.containsElement)
    ];
  }
  queryElements(selector) {
    return Array.from(this.element.querySelectorAll(selector));
  }
  get controllerSelector() {
    return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
  }
  get isDocumentScope() {
    return this.element === document.documentElement;
  }
  get documentScope() {
    return this.isDocumentScope ? this : new Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
  }
}

class ScopeObserver {
  constructor(element, schema, delegate) {
    this.element = element;
    this.schema = schema;
    this.delegate = delegate;
    this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
    this.scopesByIdentifierByElement = new WeakMap;
    this.scopeReferenceCounts = new WeakMap;
  }
  start() {
    this.valueListObserver.start();
  }
  stop() {
    this.valueListObserver.stop();
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  parseValueForToken(token) {
    const { element, content: identifier } = token;
    return this.parseValueForElementAndIdentifier(element, identifier);
  }
  parseValueForElementAndIdentifier(element, identifier) {
    const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
    let scope = scopesByIdentifier.get(identifier);
    if (!scope) {
      scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
      scopesByIdentifier.set(identifier, scope);
    }
    return scope;
  }
  elementMatchedValue(element, value) {
    const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
    this.scopeReferenceCounts.set(value, referenceCount);
    if (referenceCount == 1) {
      this.delegate.scopeConnected(value);
    }
  }
  elementUnmatchedValue(element, value) {
    const referenceCount = this.scopeReferenceCounts.get(value);
    if (referenceCount) {
      this.scopeReferenceCounts.set(value, referenceCount - 1);
      if (referenceCount == 1) {
        this.delegate.scopeDisconnected(value);
      }
    }
  }
  fetchScopesByIdentifierForElement(element) {
    let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
    if (!scopesByIdentifier) {
      scopesByIdentifier = new Map;
      this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
    }
    return scopesByIdentifier;
  }
}

class Router {
  constructor(application) {
    this.application = application;
    this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
    this.scopesByIdentifier = new Multimap;
    this.modulesByIdentifier = new Map;
  }
  get element() {
    return this.application.element;
  }
  get schema() {
    return this.application.schema;
  }
  get logger() {
    return this.application.logger;
  }
  get controllerAttribute() {
    return this.schema.controllerAttribute;
  }
  get modules() {
    return Array.from(this.modulesByIdentifier.values());
  }
  get contexts() {
    return this.modules.reduce((contexts, module) => contexts.concat(module.contexts), []);
  }
  start() {
    this.scopeObserver.start();
  }
  stop() {
    this.scopeObserver.stop();
  }
  loadDefinition(definition) {
    this.unloadIdentifier(definition.identifier);
    const module = new Module(this.application, definition);
    this.connectModule(module);
    const afterLoad = definition.controllerConstructor.afterLoad;
    if (afterLoad) {
      afterLoad.call(definition.controllerConstructor, definition.identifier, this.application);
    }
  }
  unloadIdentifier(identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      this.disconnectModule(module);
    }
  }
  getContextForElementAndIdentifier(element, identifier) {
    const module = this.modulesByIdentifier.get(identifier);
    if (module) {
      return module.contexts.find((context) => context.element == element);
    }
  }
  proposeToConnectScopeForElementAndIdentifier(element, identifier) {
    const scope = this.scopeObserver.parseValueForElementAndIdentifier(element, identifier);
    if (scope) {
      this.scopeObserver.elementMatchedValue(scope.element, scope);
    } else {
      console.error(`Couldn't find or create scope for identifier: "${identifier}" and element:`, element);
    }
  }
  handleError(error2, message, detail) {
    this.application.handleError(error2, message, detail);
  }
  createScopeForElementAndIdentifier(element, identifier) {
    return new Scope(this.schema, element, identifier, this.logger);
  }
  scopeConnected(scope) {
    this.scopesByIdentifier.add(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.connectContextForScope(scope);
    }
  }
  scopeDisconnected(scope) {
    this.scopesByIdentifier.delete(scope.identifier, scope);
    const module = this.modulesByIdentifier.get(scope.identifier);
    if (module) {
      module.disconnectContextForScope(scope);
    }
  }
  connectModule(module) {
    this.modulesByIdentifier.set(module.identifier, module);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.connectContextForScope(scope));
  }
  disconnectModule(module) {
    this.modulesByIdentifier.delete(module.identifier);
    const scopes = this.scopesByIdentifier.getValuesForKey(module.identifier);
    scopes.forEach((scope) => module.disconnectContextForScope(scope));
  }
}
var defaultSchema = {
  controllerAttribute: "data-controller",
  actionAttribute: "data-action",
  targetAttribute: "data-target",
  targetAttributeForScope: (identifier) => `data-${identifier}-target`,
  outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
  keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End", page_up: "PageUp", page_down: "PageDown" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
};

class Application {
  constructor(element = document.documentElement, schema = defaultSchema) {
    this.logger = console;
    this.debug = false;
    this.logDebugActivity = (identifier, functionName, detail = {}) => {
      if (this.debug) {
        this.logFormattedMessage(identifier, functionName, detail);
      }
    };
    this.element = element;
    this.schema = schema;
    this.dispatcher = new Dispatcher(this);
    this.router = new Router(this);
    this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
  }
  static start(element, schema) {
    const application = new this(element, schema);
    application.start();
    return application;
  }
  async start() {
    await domReady();
    this.logDebugActivity("application", "starting");
    this.dispatcher.start();
    this.router.start();
    this.logDebugActivity("application", "start");
  }
  stop() {
    this.logDebugActivity("application", "stopping");
    this.dispatcher.stop();
    this.router.stop();
    this.logDebugActivity("application", "stop");
  }
  register(identifier, controllerConstructor) {
    this.load({ identifier, controllerConstructor });
  }
  registerActionOption(name, filter) {
    this.actionDescriptorFilters[name] = filter;
  }
  load(head, ...rest) {
    const definitions = Array.isArray(head) ? head : [head, ...rest];
    definitions.forEach((definition) => {
      if (definition.controllerConstructor.shouldLoad) {
        this.router.loadDefinition(definition);
      }
    });
  }
  unload(head, ...rest) {
    const identifiers = Array.isArray(head) ? head : [head, ...rest];
    identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
  }
  get controllers() {
    return this.router.contexts.map((context) => context.controller);
  }
  getControllerForElementAndIdentifier(element, identifier) {
    const context = this.router.getContextForElementAndIdentifier(element, identifier);
    return context ? context.controller : null;
  }
  handleError(error2, message, detail) {
    var _a;
    this.logger.error(`%s\n\n%o\n\n%o`, message, error2, detail);
    (_a = window.onerror) === null || _a === undefined || _a.call(window, message, "", 0, 0, error2);
  }
  logFormattedMessage(identifier, functionName, detail = {}) {
    detail = Object.assign({ application: this }, detail);
    this.logger.groupCollapsed(`${identifier} #${functionName}`);
    this.logger.log("details:", Object.assign({}, detail));
    this.logger.groupEnd();
  }
}
var defaultValuesByType = {
  get array() {
    return [];
  },
  boolean: false,
  number: 0,
  get object() {
    return {};
  },
  string: ""
};
var readers = {
  array(value) {
    const array = JSON.parse(value);
    if (!Array.isArray(array)) {
      throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
    }
    return array;
  },
  boolean(value) {
    return !(value == "0" || String(value).toLowerCase() == "false");
  },
  number(value) {
    return Number(value.replace(/_/g, ""));
  },
  object(value) {
    const object = JSON.parse(value);
    if (object === null || typeof object != "object" || Array.isArray(object)) {
      throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
    }
    return object;
  },
  string(value) {
    return value;
  }
};
var writers = {
  default: writeString,
  array: writeJSON,
  object: writeJSON
};

class Controller {
  constructor(context) {
    this.context = context;
  }
  static get shouldLoad() {
    return true;
  }
  static afterLoad(_identifier, _application) {
    return;
  }
  get application() {
    return this.context.application;
  }
  get scope() {
    return this.context.scope;
  }
  get element() {
    return this.scope.element;
  }
  get identifier() {
    return this.scope.identifier;
  }
  get targets() {
    return this.scope.targets;
  }
  get outlets() {
    return this.scope.outlets;
  }
  get classes() {
    return this.scope.classes;
  }
  get data() {
    return this.scope.data;
  }
  initialize() {
  }
  connect() {
  }
  disconnect() {
  }
  dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
    const type = prefix ? `${prefix}:${eventName}` : eventName;
    const event = new CustomEvent(type, { detail, bubbles, cancelable });
    target.dispatchEvent(event);
    return event;
  }
}
Controller.blessings = [
  ClassPropertiesBlessing,
  TargetPropertiesBlessing,
  ValuePropertiesBlessing,
  OutletPropertiesBlessing
];
Controller.targets = [];
Controller.outlets = [];
Controller.values = {};

// node_modules/slim-select/dist/slimselect.
var application = Application.start();
application.debug = false;
window.Stimulus = application;

// node_modules/slim-select/dist/slimselect.jsjs
var import_smart_timeout = __toESM(require_smart_timeout(), 1);
class form_controller_default extends Controller {
  static targets = ["sender"];
  sendForm(event) {
    this.element.requestSubmit();
  }
  delayedSendForm(event) {
    if (import_smart_timeout.default.exists("textDelay")) {
      import_smart_timeout.default.clear("textDelay", true);
    }
    import_smart_timeout.default.set("textDelay", () => {
      this.sendForm(event);
    }, 750);
  }
}

// node_modules/slim-select/dist/slimselect.jsjs
class page_controller_default extends Controller {
  static targets = ["container", "menu", "modal"];
  goPage(event) {
    let [data, status, xhr] = event.detail;
    this.containerTarget.innerHTML = xhr.response;
  }
  toggleMenu(event) {
    this.menuTarget.classList.toggle("is-active");
  }
  closeModal(event) {
    [].forEach.call(document.getElementsByClassName("modal"), (item) => {
      item.classList.remove("is-active");
    });
    if (document.getElementById("yield") == null) {
      window.location.replace("/");
    }
  }
}

// node_modules/slim-select/dist/slimselect.jsjs
var import_slim_select = __toESM(require_slimselect(), 1);

class slim_controller_default extends Controller {
  static targets = ["simple", "user", "editor"];
  connect() {
    if (this.hasSimpleTarget) {
      this.simpleTargets.forEach((element) => this.simple(element));
    }
    if (this.hasUserTarget) {
      this.userTargets.forEach((element) => this.user(element));
    }
    if (this.hasEditorTarget) {
      this.editorTargets.forEach((element) => this.editor(element));
    }
  }
  simple(element) {
    new import_slim_select.default({ select: element });
  }
  user(element) {
    this.ajax(element, "/editor/users/list.json?");
  }
  editor(element) {
    this.ajax(element, "/admin/users/list.json?filter[editor]=1&");
  }
  get_data(element) {
    element.getAttribute("data-text"), element.getAttribute("data-value");
  }
  ajax(element, url) {
    new import_slim_select.default({
      select: element,
      placeholder: "Seleziona un utente",
      searchingText: "Sto cercando...",
      searchPlaceholder: "Digita per ricercare",
      searchText: "Nessun risultato",
      allowDeselect: true,
      ajax: function(search, callback) {
        if (search.length < 3) {
          callback("Inserire almeno 3 caratteri");
          return;
        }
        fetch(`${url}filter[text]=${search}`).then(function(response) {
          return response.json();
        }).then(function(json) {
          let data = [];
          for (let i = 0;i < json.users.length; i++) {
            data.push({ text: json.users[i].email, value: json.users[i].id });
          }
          callback(data);
        }).catch(function(error2) {
          callback(false);
        });
      }
    });
  }
}

// node_modules/slim-select/dist/slims
application.register("form", form_controller_default);
application.register("page", page_controller_default);
application.register("slim", slim_controller_default);

// node_modules/slim-select/dist/slimsele
var be = function(t) {
  var e, i;
  function n(e2, i2) {
    try {
      var o = t[e2](i2), s = o.value, a = s instanceof ve;
      Promise.resolve(a ? s.v : s).then(function(i3) {
        if (a) {
          var l = e2 === "return" ? "return" : "next";
          if (!s.k || i3.done)
            return n(l, i3);
          i3 = t[l](i3).value;
        }
        r(o.done ? "return" : "normal", i3);
      }, function(t2) {
        n("throw", t2);
      });
    } catch (t2) {
      r("throw", t2);
    }
  }
  function r(t2, r2) {
    switch (t2) {
      case "return":
        e.resolve({ value: r2, done: true });
        break;
      case "throw":
        e.reject(r2);
        break;
      default:
        e.resolve({ value: r2, done: false });
    }
    (e = e.next) ? n(e.key, e.arg) : i = null;
  }
  this._invoke = function(t2, r2) {
    return new Promise(function(o, s) {
      var a = { key: t2, arg: r2, resolve: o, reject: s, next: null };
      i ? i = i.next = a : (e = i = a, n(t2, r2));
    });
  }, typeof t.return != "function" && (this.return = undefined);
};
var ve = function(t, e) {
  this.v = t, this.k = e;
};
var Ae = function(t, e, i) {
  return ((e = xe(e)) in t) ? Object.defineProperty(t, e, { value: i, enumerable: true, configurable: true, writable: true }) : t[e] = i, t;
};
var xe = function(t) {
  var e = function(t2, e2) {
    if (typeof t2 != "object" || t2 === null)
      return t2;
    var i = t2[Symbol.toPrimitive];
    if (i !== undefined) {
      var n = i.call(t2, e2 || "default");
      if (typeof n != "object")
        return n;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (e2 === "string" ? String : Number)(t2);
  }(t, "string");
  return typeof e == "symbol" ? e : String(e);
};
var t = "2.0.8";
var e = "[data-trix-attachment]";
var i = { preview: { presentation: "gallery", caption: { name: true, size: true } }, file: { caption: { size: true } } };
var n = { default: { tagName: "div", parse: false }, quote: { tagName: "blockquote", nestable: true }, heading1: { tagName: "h1", terminal: true, breakOnReturn: true, group: false }, code: { tagName: "pre", terminal: true, text: { plaintext: true } }, bulletList: { tagName: "ul", parse: false }, bullet: { tagName: "li", listAttribute: "bulletList", group: false, nestable: true, test(t2) {
  return r(t2.parentNode) === n[this.listAttribute].tagName;
} }, numberList: { tagName: "ol", parse: false }, number: { tagName: "li", listAttribute: "numberList", group: false, nestable: true, test(t2) {
  return r(t2.parentNode) === n[this.listAttribute].tagName;
} }, attachmentGallery: { tagName: "div", exclusive: true, terminal: true, parse: false, group: false } };
var r = (t2) => {
  var e2;
  return t2 == null || (e2 = t2.tagName) === null || e2 === undefined ? undefined : e2.toLowerCase();
};
var o = navigator.userAgent.match(/android\s([0-9]+.*Chrome)/i);
var s = o && parseInt(o[1]);
var a = { composesExistingText: /Android.*Chrome/.test(navigator.userAgent), recentAndroid: s && s > 12, samsungAndroid: s && navigator.userAgent.match(/Android.*SM-/), forcesObjectResizing: /Trident.*rv:11/.test(navigator.userAgent), supportsInputEvents: typeof InputEvent != "undefined" && ["data", "getTargetRanges", "inputType"].every((t2) => (t2 in InputEvent.prototype)) };
var l = { attachFiles: "Attach Files", bold: "Bold", bullets: "Bullets", byte: "Byte", bytes: "Bytes", captionPlaceholder: "Add a caption\u2026", code: "Code", heading1: "Heading", indent: "Increase Level", italic: "Italic", link: "Link", numbers: "Numbers", outdent: "Decrease Level", quote: "Quote", redo: "Redo", remove: "Remove", strike: "Strikethrough", undo: "Undo", unlink: "Unlink", url: "URL", urlPlaceholder: "Enter a URL\u2026", GB: "GB", KB: "KB", MB: "MB", PB: "PB", TB: "TB" };
var c = [l.bytes, l.KB, l.MB, l.GB, l.TB, l.PB];
var h = { prefix: "IEC", precision: 2, formatter(t2) {
  switch (t2) {
    case 0:
      return "0 ".concat(l.bytes);
    case 1:
      return "1 ".concat(l.byte);
    default:
      let e2;
      this.prefix === "SI" ? e2 = 1000 : this.prefix === "IEC" && (e2 = 1024);
      const i2 = Math.floor(Math.log(t2) / Math.log(e2)), n2 = (t2 / Math.pow(e2, i2)).toFixed(this.precision).replace(/0*$/, "").replace(/\.$/, "");
      return "".concat(n2, " ").concat(c[i2]);
  }
} };
var u = "\uFEFF";
var d = "\xA0";
var g = function(t2) {
  for (const e2 in t2) {
    const i2 = t2[e2];
    this[e2] = i2;
  }
  return this;
};
var m = document.documentElement;
var p = m.matches;
var f = function(t2) {
  let { onElement: e2, matchingSelector: i2, withCallback: n2, inPhase: r2, preventDefault: o2, times: s2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const a2 = e2 || m, l2 = i2, c2 = r2 === "capturing", h2 = function(t3) {
    s2 != null && --s2 == 0 && h2.destroy();
    const e3 = A(t3.target, { matchingSelector: l2 });
    e3 != null && (n2 == null || n2.call(e3, t3, e3), o2 && t3.preventDefault());
  };
  return h2.destroy = () => a2.removeEventListener(t2, h2, c2), a2.addEventListener(t2, h2, c2), h2;
};
var b = function(t2) {
  let { onElement: e2, bubbles: i2, cancelable: n2, attributes: r2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const o2 = e2 != null ? e2 : m;
  i2 = i2 !== false, n2 = n2 !== false;
  const s2 = document.createEvent("Events");
  return s2.initEvent(t2, i2, n2), r2 != null && g.call(s2, r2), o2.dispatchEvent(s2);
};
var v = function(t2, e2) {
  if ((t2 == null ? undefined : t2.nodeType) === 1)
    return p.call(t2, e2);
};
var A = function(t2) {
  let { matchingSelector: e2, untilNode: i2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  for (;t2 && t2.nodeType !== Node.ELEMENT_NODE; )
    t2 = t2.parentNode;
  if (t2 != null) {
    if (e2 == null)
      return t2;
    if (t2.closest && i2 == null)
      return t2.closest(e2);
    for (;t2 && t2 !== i2; ) {
      if (v(t2, e2))
        return t2;
      t2 = t2.parentNode;
    }
  }
};
var x = (t2) => document.activeElement !== t2 && y(t2, document.activeElement);
var y = function(t2, e2) {
  if (t2 && e2)
    for (;e2; ) {
      if (e2 === t2)
        return true;
      e2 = e2.parentNode;
    }
};
var C = function(t2) {
  var e2;
  if ((e2 = t2) === null || e2 === undefined || !e2.parentNode)
    return;
  let i2 = 0;
  for (t2 = t2.previousSibling;t2; )
    i2++, t2 = t2.previousSibling;
  return i2;
};
var R = (t2) => {
  var e2;
  return t2 == null || (e2 = t2.parentNode) === null || e2 === undefined ? undefined : e2.removeChild(t2);
};
var S = function(t2) {
  let { onlyNodesOfType: e2, usingFilter: i2, expandEntityReferences: n2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const r2 = (() => {
    switch (e2) {
      case "element":
        return NodeFilter.SHOW_ELEMENT;
      case "text":
        return NodeFilter.SHOW_TEXT;
      case "comment":
        return NodeFilter.SHOW_COMMENT;
      default:
        return NodeFilter.SHOW_ALL;
    }
  })();
  return document.createTreeWalker(t2, r2, i2 != null ? i2 : null, n2 === true);
};
var E = (t2) => {
  var e2;
  return t2 == null || (e2 = t2.tagName) === null || e2 === undefined ? undefined : e2.toLowerCase();
};
var k = function(t2) {
  let e2, i2, n2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  typeof t2 == "object" ? (n2 = t2, t2 = n2.tagName) : n2 = { attributes: n2 };
  const r2 = document.createElement(t2);
  if (n2.editable != null && (n2.attributes == null && (n2.attributes = {}), n2.attributes.contenteditable = n2.editable), n2.attributes)
    for (e2 in n2.attributes)
      i2 = n2.attributes[e2], r2.setAttribute(e2, i2);
  if (n2.style)
    for (e2 in n2.style)
      i2 = n2.style[e2], r2.style[e2] = i2;
  if (n2.data)
    for (e2 in n2.data)
      i2 = n2.data[e2], r2.dataset[e2] = i2;
  return n2.className && n2.className.split(" ").forEach((t3) => {
    r2.classList.add(t3);
  }), n2.textContent && (r2.textContent = n2.textContent), n2.childNodes && [].concat(n2.childNodes).forEach((t3) => {
    r2.appendChild(t3);
  }), r2;
};
var L;
var D = function() {
  if (L != null)
    return L;
  L = [];
  for (const t2 in n) {
    const e2 = n[t2];
    e2.tagName && L.push(e2.tagName);
  }
  return L;
};
var w = (t2) => B(t2 == null ? undefined : t2.firstChild);
var T = function(t2) {
  let { strict: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { strict: true };
  return e2 ? B(t2) : B(t2) || !B(t2.firstChild) && function(t3) {
    return D().includes(E(t3)) && !D().includes(E(t3.firstChild));
  }(t2);
};
var B = (t2) => F(t2) && (t2 == null ? undefined : t2.data) === "block";
var F = (t2) => (t2 == null ? undefined : t2.nodeType) === Node.COMMENT_NODE;
var I = function(t2) {
  let { name: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (t2)
    return O(t2) ? t2.data === u ? !e2 || t2.parentNode.dataset.trixCursorTarget === e2 : undefined : I(t2.firstChild);
};
var P = (t2) => v(t2, e);
var N = (t2) => O(t2) && (t2 == null ? undefined : t2.data) === "";
var O = (t2) => (t2 == null ? undefined : t2.nodeType) === Node.TEXT_NODE;
var M = { level2Enabled: true, getLevel() {
  return this.level2Enabled && a.supportsInputEvents ? 2 : 0;
}, pickFiles(t2) {
  const e2 = k("input", { type: "file", multiple: true, hidden: true, id: this.fileInputId });
  e2.addEventListener("change", () => {
    t2(e2.files), R(e2);
  }), R(document.getElementById(this.fileInputId)), document.body.appendChild(e2), e2.click();
} };
var j = { removeBlankTableCells: false, tableCellSeparator: " | ", tableRowSeparator: "\n" };
var W = { bold: { tagName: "strong", inheritable: true, parser(t2) {
  const e2 = window.getComputedStyle(t2);
  return e2.fontWeight === "bold" || e2.fontWeight >= 600;
} }, italic: { tagName: "em", inheritable: true, parser: (t2) => window.getComputedStyle(t2).fontStyle === "italic" }, href: { groupTagName: "a", parser(t2) {
  const i2 = "a:not(".concat(e, ")"), n2 = t2.closest(i2);
  if (n2)
    return n2.getAttribute("href");
} }, strike: { tagName: "del", inheritable: true }, frozen: { style: { backgroundColor: "highlight" } } };
var U = { getDefaultHTML: () => '<div class="trix-button-row">\n      <span class="trix-button-group trix-button-group--text-tools" data-trix-button-group="text-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bold" data-trix-attribute="bold" data-trix-key="b" title="'.concat(l.bold, '" tabindex="-1">').concat(l.bold, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-italic" data-trix-attribute="italic" data-trix-key="i" title="').concat(l.italic, '" tabindex="-1">').concat(l.italic, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-strike" data-trix-attribute="strike" title="').concat(l.strike, '" tabindex="-1">').concat(l.strike, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-link" data-trix-attribute="href" data-trix-action="link" data-trix-key="k" title="').concat(l.link, '" tabindex="-1">').concat(l.link, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--block-tools" data-trix-button-group="block-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-1" data-trix-attribute="heading1" title="').concat(l.heading1, '" tabindex="-1">').concat(l.heading1, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-quote" data-trix-attribute="quote" title="').concat(l.quote, '" tabindex="-1">').concat(l.quote, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-code" data-trix-attribute="code" title="').concat(l.code, '" tabindex="-1">').concat(l.code, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-bullet-list" data-trix-attribute="bullet" title="').concat(l.bullets, '" tabindex="-1">').concat(l.bullets, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-number-list" data-trix-attribute="number" title="').concat(l.numbers, '" tabindex="-1">').concat(l.numbers, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-decrease-nesting-level" data-trix-action="decreaseNestingLevel" title="').concat(l.outdent, '" tabindex="-1">').concat(l.outdent, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-increase-nesting-level" data-trix-action="increaseNestingLevel" title="').concat(l.indent, '" tabindex="-1">').concat(l.indent, '</button>\n      </span>\n\n      <span class="trix-button-group trix-button-group--file-tools" data-trix-button-group="file-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-attach" data-trix-action="attachFiles" title="').concat(l.attachFiles, '" tabindex="-1">').concat(l.attachFiles, '</button>\n      </span>\n\n      <span class="trix-button-group-spacer"></span>\n\n      <span class="trix-button-group trix-button-group--history-tools" data-trix-button-group="history-tools">\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-undo" data-trix-action="undo" data-trix-key="z" title="').concat(l.undo, '" tabindex="-1">').concat(l.undo, '</button>\n        <button type="button" class="trix-button trix-button--icon trix-button--icon-redo" data-trix-action="redo" data-trix-key="shift+z" title="').concat(l.redo, '" tabindex="-1">').concat(l.redo, '</button>\n      </span>\n    </div>\n\n    <div class="trix-dialogs" data-trix-dialogs>\n      <div class="trix-dialog trix-dialog--link" data-trix-dialog="href" data-trix-dialog-attribute="href">\n        <div class="trix-dialog__link-fields">\n          <input type="url" name="href" class="trix-input trix-input--dialog" placeholder="').concat(l.urlPlaceholder, '" aria-label="').concat(l.url, '" required data-trix-input>\n          <div class="trix-button-group">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(l.link, '" data-trix-method="setAttribute">\n            <input type="button" class="trix-button trix-button--dialog" value="').concat(l.unlink, '" data-trix-method="removeAttribute">\n          </div>\n        </div>\n      </div>\n    </div>') };
var q = { interval: 5000 };
var V = Object.freeze({ __proto__: null, attachments: i, blockAttributes: n, browser: a, css: { attachment: "attachment", attachmentCaption: "attachment__caption", attachmentCaptionEditor: "attachment__caption-editor", attachmentMetadata: "attachment__metadata", attachmentMetadataContainer: "attachment__metadata-container", attachmentName: "attachment__name", attachmentProgress: "attachment__progress", attachmentSize: "attachment__size", attachmentToolbar: "attachment__toolbar", attachmentGallery: "attachment-gallery" }, fileSize: h, input: M, keyNames: { 8: "backspace", 9: "tab", 13: "return", 27: "escape", 37: "left", 39: "right", 46: "delete", 68: "d", 72: "h", 79: "o" }, lang: l, parser: j, textAttributes: W, toolbar: U, undo: q });

class z {
  static proxyMethod(t2) {
    const { name: e2, toMethod: i2, toProperty: n2, optional: r2 } = _(t2);
    this.prototype[e2] = function() {
      let t3, o2;
      var s2, a2;
      i2 ? o2 = r2 ? (s2 = this[i2]) === null || s2 === undefined ? undefined : s2.call(this) : this[i2]() : n2 && (o2 = this[n2]);
      return r2 ? (t3 = (a2 = o2) === null || a2 === undefined ? undefined : a2[e2], t3 ? H.call(t3, o2, arguments) : undefined) : (t3 = o2[e2], H.call(t3, o2, arguments));
    };
  }
}
var _ = function(t2) {
  const e2 = t2.match(J);
  if (!e2)
    throw new Error("can't parse @proxyMethod expression: ".concat(t2));
  const i2 = { name: e2[4] };
  return e2[2] != null ? i2.toMethod = e2[1] : i2.toProperty = e2[1], e2[3] != null && (i2.optional = true), i2;
};
var { apply: H } = Function.prototype;
var J = new RegExp("^(.+?)(\\(\\))?(\\?)?\\.(.+?)$");
var K;
var G;
var $;

class X extends z {
  static box() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    return t2 instanceof this ? t2 : this.fromUCS2String(t2 == null ? undefined : t2.toString());
  }
  static fromUCS2String(t2) {
    return new this(t2, tt(t2));
  }
  static fromCodepoints(t2) {
    return new this(et(t2), t2);
  }
  constructor(t2, e2) {
    super(...arguments), this.ucs2String = t2, this.codepoints = e2, this.length = this.codepoints.length, this.ucs2Length = this.ucs2String.length;
  }
  offsetToUCS2Offset(t2) {
    return et(this.codepoints.slice(0, Math.max(0, t2))).length;
  }
  offsetFromUCS2Offset(t2) {
    return tt(this.ucs2String.slice(0, Math.max(0, t2))).length;
  }
  slice() {
    return this.constructor.fromCodepoints(this.codepoints.slice(...arguments));
  }
  charAt(t2) {
    return this.slice(t2, t2 + 1);
  }
  isEqualTo(t2) {
    return this.constructor.box(t2).ucs2String === this.ucs2String;
  }
  toJSON() {
    return this.ucs2String;
  }
  getCacheKey() {
    return this.ucs2String;
  }
  toString() {
    return this.ucs2String;
  }
}
var Y = ((K = Array.from) === null || K === undefined ? undefined : K.call(Array, "\uD83D\uDC7C").length) === 1;
var Q = ((G = " ".codePointAt) === null || G === undefined ? undefined : G.call(" ", 0)) != null;
var Z = (($ = String.fromCodePoint) === null || $ === undefined ? undefined : $.call(String, 32, 128124)) === " \uD83D\uDC7C";
var tt;
var et;
tt = Y && Q ? (t2) => Array.from(t2).map((t3) => t3.codePointAt(0)) : function(t2) {
  const e2 = [];
  let i2 = 0;
  const { length: n2 } = t2;
  for (;i2 < n2; ) {
    let r2 = t2.charCodeAt(i2++);
    if (55296 <= r2 && r2 <= 56319 && i2 < n2) {
      const e3 = t2.charCodeAt(i2++);
      (64512 & e3) == 56320 ? r2 = ((1023 & r2) << 10) + (1023 & e3) + 65536 : i2--;
    }
    e2.push(r2);
  }
  return e2;
}, et = Z ? (t2) => String.fromCodePoint(...Array.from(t2 || [])) : function(t2) {
  return (() => {
    const e2 = [];
    return Array.from(t2).forEach((t3) => {
      let i2 = "";
      t3 > 65535 && (t3 -= 65536, i2 += String.fromCharCode(t3 >>> 10 & 1023 | 55296), t3 = 56320 | 1023 & t3), e2.push(i2 + String.fromCharCode(t3));
    }), e2;
  })().join("");
};
var it = 0;

class nt extends z {
  static fromJSONString(t2) {
    return this.fromJSON(JSON.parse(t2));
  }
  constructor() {
    super(...arguments), this.id = ++it;
  }
  hasSameConstructorAs(t2) {
    return this.constructor === (t2 == null ? undefined : t2.constructor);
  }
  isEqualTo(t2) {
    return this === t2;
  }
  inspect() {
    const t2 = [], e2 = this.contentsForInspection() || {};
    for (const i2 in e2) {
      const n2 = e2[i2];
      t2.push("".concat(i2, "=").concat(n2));
    }
    return "#<".concat(this.constructor.name, ":").concat(this.id).concat(t2.length ? " ".concat(t2.join(", ")) : "", ">");
  }
  contentsForInspection() {
  }
  toJSONString() {
    return JSON.stringify(this);
  }
  toUTF16String() {
    return X.box(this);
  }
  getCacheKey() {
    return this.id.toString();
  }
}
var rt = function() {
  let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [], e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (t2.length !== e2.length)
    return false;
  for (let i2 = 0;i2 < t2.length; i2++) {
    if (t2[i2] !== e2[i2])
      return false;
  }
  return true;
};
var ot = function(t2) {
  const e2 = t2.slice(0);
  for (var i2 = arguments.length, n2 = new Array(i2 > 1 ? i2 - 1 : 0), r2 = 1;r2 < i2; r2++)
    n2[r2 - 1] = arguments[r2];
  return e2.splice(...n2), e2;
};
var st = /[\u05BE\u05C0\u05C3\u05D0-\u05EA\u05F0-\u05F4\u061B\u061F\u0621-\u063A\u0640-\u064A\u066D\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D5\u06E5\u06E6\u200F\u202B\u202E\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE72\uFE74\uFE76-\uFEFC]/;
var at = function() {
  const t2 = k("input", { dir: "auto", name: "x", dirName: "x.dir" }), e2 = k("textarea", { dir: "auto", name: "y", dirName: "y.dir" }), i2 = k("form");
  i2.appendChild(t2), i2.appendChild(e2);
  const n2 = function() {
    try {
      return new FormData(i2).has(e2.dirName);
    } catch (t3) {
      return false;
    }
  }(), r2 = function() {
    try {
      return t2.matches(":dir(ltr),:dir(rtl)");
    } catch (t3) {
      return false;
    }
  }();
  return n2 ? function(t3) {
    return e2.value = t3, new FormData(i2).get(e2.dirName);
  } : r2 ? function(e3) {
    return t2.value = e3, t2.matches(":dir(rtl)") ? "rtl" : "ltr";
  } : function(t3) {
    const e3 = t3.trim().charAt(0);
    return st.test(e3) ? "rtl" : "ltr";
  };
}();
var lt = null;
var ct = null;
var ht = null;
var ut = null;
var dt = () => (lt || (lt = ft().concat(mt())), lt);
var gt = (t2) => n[t2];
var mt = () => (ct || (ct = Object.keys(n)), ct);
var pt = (t2) => W[t2];
var ft = () => (ht || (ht = Object.keys(W)), ht);
var bt = function(t2, e2) {
  vt(t2).textContent = e2.replace(/%t/g, t2);
};
var vt = function(t2) {
  const e2 = document.createElement("style");
  e2.setAttribute("type", "text/css"), e2.setAttribute("data-tag-name", t2.toLowerCase());
  const i2 = At();
  return i2 && e2.setAttribute("nonce", i2), document.head.insertBefore(e2, document.head.firstChild), e2;
};
var At = function() {
  const t2 = xt("trix-csp-nonce") || xt("csp-nonce");
  if (t2)
    return t2.getAttribute("content");
};
var xt = (t2) => document.head.querySelector("meta[name=".concat(t2, "]"));
var yt = { "application/x-trix-feature-detection": "test" };
var Ct = function(t2) {
  const e2 = t2.getData("text/plain"), i2 = t2.getData("text/html");
  if (!e2 || !i2)
    return e2 == null ? undefined : e2.length;
  {
    const { body: t3 } = new DOMParser().parseFromString(i2, "text/html");
    if (t3.textContent === e2)
      return !t3.querySelector("*");
  }
};
var Rt = /Mac|^iP/.test(navigator.platform) ? (t2) => t2.metaKey : (t2) => t2.ctrlKey;
var St = (t2) => setTimeout(t2, 1);
var Et = function() {
  let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const e2 = {};
  for (const i2 in t2) {
    const n2 = t2[i2];
    e2[i2] = n2;
  }
  return e2;
};
var kt = function() {
  let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}, e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (Object.keys(t2).length !== Object.keys(e2).length)
    return false;
  for (const i2 in t2) {
    if (t2[i2] !== e2[i2])
      return false;
  }
  return true;
};
var Lt = function(t2) {
  if (t2 != null)
    return Array.isArray(t2) || (t2 = [t2, t2]), [Tt(t2[0]), Tt(t2[1] != null ? t2[1] : t2[0])];
};
var Dt = function(t2) {
  if (t2 == null)
    return;
  const [e2, i2] = Lt(t2);
  return Bt(e2, i2);
};
var wt = function(t2, e2) {
  if (t2 == null || e2 == null)
    return;
  const [i2, n2] = Lt(t2), [r2, o2] = Lt(e2);
  return Bt(i2, r2) && Bt(n2, o2);
};
var Tt = function(t2) {
  return typeof t2 == "number" ? t2 : Et(t2);
};
var Bt = function(t2, e2) {
  return typeof t2 == "number" ? t2 === e2 : kt(t2, e2);
};

class Ft extends z {
  constructor() {
    super(...arguments), this.update = this.update.bind(this), this.selectionManagers = [];
  }
  start() {
    this.started || (this.started = true, document.addEventListener("selectionchange", this.update, true));
  }
  stop() {
    if (this.started)
      return this.started = false, document.removeEventListener("selectionchange", this.update, true);
  }
  registerSelectionManager(t2) {
    if (!this.selectionManagers.includes(t2))
      return this.selectionManagers.push(t2), this.start();
  }
  unregisterSelectionManager(t2) {
    if (this.selectionManagers = this.selectionManagers.filter((e2) => e2 !== t2), this.selectionManagers.length === 0)
      return this.stop();
  }
  notifySelectionManagersOfSelectionChange() {
    return this.selectionManagers.map((t2) => t2.selectionDidChange());
  }
  update() {
    this.notifySelectionManagersOfSelectionChange();
  }
  reset() {
    this.update();
  }
}
var It = new Ft;
var Pt = function() {
  const t2 = window.getSelection();
  if (t2.rangeCount > 0)
    return t2;
};
var Nt = function() {
  var t2;
  const e2 = (t2 = Pt()) === null || t2 === undefined ? undefined : t2.getRangeAt(0);
  if (e2 && !Mt(e2))
    return e2;
};
var Ot = function(t2) {
  const e2 = window.getSelection();
  return e2.removeAllRanges(), e2.addRange(t2), It.update();
};
var Mt = (t2) => jt(t2.startContainer) || jt(t2.endContainer);
var jt = (t2) => !Object.getPrototypeOf(t2);
var Wt = (t2) => t2.replace(new RegExp("".concat(u), "g"), "").replace(new RegExp("".concat(d), "g"), " ");
var Ut = new RegExp("[^\\S".concat(d, "]"));
var qt = (t2) => t2.replace(new RegExp("".concat(Ut.source), "g"), " ").replace(/\ {2,}/g, " ");
var Vt = function(t2, e2) {
  if (t2.isEqualTo(e2))
    return ["", ""];
  const i2 = zt(t2, e2), { length: n2 } = i2.utf16String;
  let r2;
  if (n2) {
    const { offset: o2 } = i2, s2 = t2.codepoints.slice(0, o2).concat(t2.codepoints.slice(o2 + n2));
    r2 = zt(e2, X.fromCodepoints(s2));
  } else
    r2 = zt(e2, t2);
  return [i2.utf16String.toString(), r2.utf16String.toString()];
};
var zt = function(t2, e2) {
  let i2 = 0, n2 = t2.length, r2 = e2.length;
  for (;i2 < n2 && t2.charAt(i2).isEqualTo(e2.charAt(i2)); )
    i2++;
  for (;n2 > i2 + 1 && t2.charAt(n2 - 1).isEqualTo(e2.charAt(r2 - 1)); )
    n2--, r2--;
  return { utf16String: t2.slice(i2, n2), offset: i2 };
};

class _t extends nt {
  static fromCommonAttributesOfObjects() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    if (!t2.length)
      return new this;
    let e2 = Gt(t2[0]), i2 = e2.getKeys();
    return t2.slice(1).forEach((t3) => {
      i2 = e2.getKeysCommonToHash(Gt(t3)), e2 = e2.slice(i2);
    }), e2;
  }
  static box(t2) {
    return Gt(t2);
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(...arguments), this.values = Kt(t2);
  }
  add(t2, e2) {
    return this.merge(Ht(t2, e2));
  }
  remove(t2) {
    return new _t(Kt(this.values, t2));
  }
  get(t2) {
    return this.values[t2];
  }
  has(t2) {
    return t2 in this.values;
  }
  merge(t2) {
    return new _t(Jt(this.values, $t(t2)));
  }
  slice(t2) {
    const e2 = {};
    return Array.from(t2).forEach((t3) => {
      this.has(t3) && (e2[t3] = this.values[t3]);
    }), new _t(e2);
  }
  getKeys() {
    return Object.keys(this.values);
  }
  getKeysCommonToHash(t2) {
    return t2 = Gt(t2), this.getKeys().filter((e2) => this.values[e2] === t2.values[e2]);
  }
  isEqualTo(t2) {
    return rt(this.toArray(), Gt(t2).toArray());
  }
  isEmpty() {
    return this.getKeys().length === 0;
  }
  toArray() {
    if (!this.array) {
      const t2 = [];
      for (const e2 in this.values) {
        const i2 = this.values[e2];
        t2.push(t2.push(e2, i2));
      }
      this.array = t2.slice(0);
    }
    return this.array;
  }
  toObject() {
    return Kt(this.values);
  }
  toJSON() {
    return this.toObject();
  }
  contentsForInspection() {
    return { values: JSON.stringify(this.values) };
  }
}
var Ht = function(t2, e2) {
  const i2 = {};
  return i2[t2] = e2, i2;
};
var Jt = function(t2, e2) {
  const i2 = Kt(t2);
  for (const t3 in e2) {
    const n2 = e2[t3];
    i2[t3] = n2;
  }
  return i2;
};
var Kt = function(t2, e2) {
  const i2 = {};
  return Object.keys(t2).sort().forEach((n2) => {
    n2 !== e2 && (i2[n2] = t2[n2]);
  }), i2;
};
var Gt = function(t2) {
  return t2 instanceof _t ? t2 : new _t(t2);
};
var $t = function(t2) {
  return t2 instanceof _t ? t2.values : t2;
};

class Xt {
  static groupObjects() {
    let t2, e2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [], { depth: i2, asTree: n2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    n2 && i2 == null && (i2 = 0);
    const r2 = [];
    return Array.from(e2).forEach((e3) => {
      var o2;
      if (t2) {
        var s2, a2, l2;
        if ((s2 = e3.canBeGrouped) !== null && s2 !== undefined && s2.call(e3, i2) && (a2 = (l2 = t2[t2.length - 1]).canBeGroupedWith) !== null && a2 !== undefined && a2.call(l2, e3, i2))
          return void t2.push(e3);
        r2.push(new this(t2, { depth: i2, asTree: n2 })), t2 = null;
      }
      (o2 = e3.canBeGrouped) !== null && o2 !== undefined && o2.call(e3, i2) ? t2 = [e3] : r2.push(e3);
    }), t2 && r2.push(new this(t2, { depth: i2, asTree: n2 })), r2;
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [], { depth: e2, asTree: i2 } = arguments.length > 1 ? arguments[1] : undefined;
    this.objects = t2, i2 && (this.depth = e2, this.objects = this.constructor.groupObjects(this.objects, { asTree: i2, depth: this.depth + 1 }));
  }
  getObjects() {
    return this.objects;
  }
  getDepth() {
    return this.depth;
  }
  getCacheKey() {
    const t2 = ["objectGroup"];
    return Array.from(this.getObjects()).forEach((e2) => {
      t2.push(e2.getCacheKey());
    }), t2.join("/");
  }
}

class Yt extends z {
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    super(...arguments), this.objects = {}, Array.from(t2).forEach((t3) => {
      const e2 = JSON.stringify(t3);
      this.objects[e2] == null && (this.objects[e2] = t3);
    });
  }
  find(t2) {
    const e2 = JSON.stringify(t2);
    return this.objects[e2];
  }
}

class Qt {
  constructor(t2) {
    this.reset(t2);
  }
  add(t2) {
    const e2 = Zt(t2);
    this.elements[e2] = t2;
  }
  remove(t2) {
    const e2 = Zt(t2), i2 = this.elements[e2];
    if (i2)
      return delete this.elements[e2], i2;
  }
  reset() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return this.elements = {}, Array.from(t2).forEach((t3) => {
      this.add(t3);
    }), t2;
  }
}
var Zt = (t2) => t2.dataset.trixStoreKey;

class te extends z {
  isPerforming() {
    return this.performing === true;
  }
  hasPerformed() {
    return this.performed === true;
  }
  hasSucceeded() {
    return this.performed && this.succeeded;
  }
  hasFailed() {
    return this.performed && !this.succeeded;
  }
  getPromise() {
    return this.promise || (this.promise = new Promise((t2, e2) => (this.performing = true, this.perform((i2, n2) => {
      this.succeeded = i2, this.performing = false, this.performed = true, this.succeeded ? t2(n2) : e2(n2);
    })))), this.promise;
  }
  perform(t2) {
    return t2(false);
  }
  release() {
    var t2, e2;
    (t2 = this.promise) === null || t2 === undefined || (e2 = t2.cancel) === null || e2 === undefined || e2.call(t2), this.promise = null, this.performing = null, this.performed = null, this.succeeded = null;
  }
}
te.proxyMethod("getPromise().then"), te.proxyMethod("getPromise().catch");

class ee extends z {
  constructor(t2) {
    let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(...arguments), this.object = t2, this.options = e2, this.childViews = [], this.rootView = this;
  }
  getNodes() {
    return this.nodes || (this.nodes = this.createNodes()), this.nodes.map((t2) => t2.cloneNode(true));
  }
  invalidate() {
    var t2;
    return this.nodes = null, this.childViews = [], (t2 = this.parentView) === null || t2 === undefined ? undefined : t2.invalidate();
  }
  invalidateViewForObject(t2) {
    var e2;
    return (e2 = this.findViewForObject(t2)) === null || e2 === undefined ? undefined : e2.invalidate();
  }
  findOrCreateCachedChildView(t2, e2, i2) {
    let n2 = this.getCachedViewForObject(e2);
    return n2 ? this.recordChildView(n2) : (n2 = this.createChildView(...arguments), this.cacheViewForObject(n2, e2)), n2;
  }
  createChildView(t2, e2) {
    let i2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    e2 instanceof Xt && (i2.viewClass = t2, t2 = ie);
    const n2 = new t2(e2, i2);
    return this.recordChildView(n2);
  }
  recordChildView(t2) {
    return t2.parentView = this, t2.rootView = this.rootView, this.childViews.push(t2), t2;
  }
  getAllChildViews() {
    let t2 = [];
    return this.childViews.forEach((e2) => {
      t2.push(e2), t2 = t2.concat(e2.getAllChildViews());
    }), t2;
  }
  findElement() {
    return this.findElementForObject(this.object);
  }
  findElementForObject(t2) {
    const e2 = t2 == null ? undefined : t2.id;
    if (e2)
      return this.rootView.element.querySelector("[data-trix-id='".concat(e2, "']"));
  }
  findViewForObject(t2) {
    for (const e2 of this.getAllChildViews())
      if (e2.object === t2)
        return e2;
  }
  getViewCache() {
    return this.rootView !== this ? this.rootView.getViewCache() : this.isViewCachingEnabled() ? (this.viewCache || (this.viewCache = {}), this.viewCache) : undefined;
  }
  isViewCachingEnabled() {
    return this.shouldCacheViews !== false;
  }
  enableViewCaching() {
    this.shouldCacheViews = true;
  }
  disableViewCaching() {
    this.shouldCacheViews = false;
  }
  getCachedViewForObject(t2) {
    var e2;
    return (e2 = this.getViewCache()) === null || e2 === undefined ? undefined : e2[t2.getCacheKey()];
  }
  cacheViewForObject(t2, e2) {
    const i2 = this.getViewCache();
    i2 && (i2[e2.getCacheKey()] = t2);
  }
  garbageCollectCachedViews() {
    const t2 = this.getViewCache();
    if (t2) {
      const e2 = this.getAllChildViews().concat(this).map((t3) => t3.object.getCacheKey());
      for (const i2 in t2)
        e2.includes(i2) || delete t2[i2];
    }
  }
}

class ie extends ee {
  constructor() {
    super(...arguments), this.objectGroup = this.object, this.viewClass = this.options.viewClass, delete this.options.viewClass;
  }
  getChildViews() {
    return this.childViews.length || Array.from(this.objectGroup.getObjects()).forEach((t2) => {
      this.findOrCreateCachedChildView(this.viewClass, t2, this.options);
    }), this.childViews;
  }
  createNodes() {
    const t2 = this.createContainerElement();
    return this.getChildViews().forEach((e2) => {
      Array.from(e2.getNodes()).forEach((e3) => {
        t2.appendChild(e3);
      });
    }), [t2];
  }
  createContainerElement() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.objectGroup.getDepth();
    return this.getChildViews()[0].createContainerElement(t2);
  }
}
var { css: ne } = V;

class re extends ee {
  constructor() {
    super(...arguments), this.attachment = this.object, this.attachment.uploadProgressDelegate = this, this.attachmentPiece = this.options.piece;
  }
  createContentNodes() {
    return [];
  }
  createNodes() {
    let t2;
    const e2 = t2 = k({ tagName: "figure", className: this.getClassName(), data: this.getData(), editable: false }), i2 = this.getHref();
    return i2 && (t2 = k({ tagName: "a", editable: false, attributes: { href: i2, tabindex: -1 } }), e2.appendChild(t2)), this.attachment.hasContent() ? t2.innerHTML = this.attachment.getContent() : this.createContentNodes().forEach((e3) => {
      t2.appendChild(e3);
    }), t2.appendChild(this.createCaptionElement()), this.attachment.isPending() && (this.progressElement = k({ tagName: "progress", attributes: { class: ne.attachmentProgress, value: this.attachment.getUploadProgress(), max: 100 }, data: { trixMutable: true, trixStoreKey: ["progressElement", this.attachment.id].join("/") } }), e2.appendChild(this.progressElement)), [oe("left"), e2, oe("right")];
  }
  createCaptionElement() {
    const t2 = k({ tagName: "figcaption", className: ne.attachmentCaption }), e2 = this.attachmentPiece.getCaption();
    if (e2)
      t2.classList.add("".concat(ne.attachmentCaption, "--edited")), t2.textContent = e2;
    else {
      let e3, i2;
      const n2 = this.getCaptionConfig();
      if (n2.name && (e3 = this.attachment.getFilename()), n2.size && (i2 = this.attachment.getFormattedFilesize()), e3) {
        const i3 = k({ tagName: "span", className: ne.attachmentName, textContent: e3 });
        t2.appendChild(i3);
      }
      if (i2) {
        e3 && t2.appendChild(document.createTextNode(" "));
        const n3 = k({ tagName: "span", className: ne.attachmentSize, textContent: i2 });
        t2.appendChild(n3);
      }
    }
    return t2;
  }
  getClassName() {
    const t2 = [ne.attachment, "".concat(ne.attachment, "--").concat(this.attachment.getType())], e2 = this.attachment.getExtension();
    return e2 && t2.push("".concat(ne.attachment, "--").concat(e2)), t2.join(" ");
  }
  getData() {
    const t2 = { trixAttachment: JSON.stringify(this.attachment), trixContentType: this.attachment.getContentType(), trixId: this.attachment.id }, { attributes: e2 } = this.attachmentPiece;
    return e2.isEmpty() || (t2.trixAttributes = JSON.stringify(e2)), this.attachment.isPending() && (t2.trixSerialize = false), t2;
  }
  getHref() {
    if (!se(this.attachment.getContent(), "a"))
      return this.attachment.getHref();
  }
  getCaptionConfig() {
    var t2;
    const e2 = this.attachment.getType(), n2 = Et((t2 = i[e2]) === null || t2 === undefined ? undefined : t2.caption);
    return e2 === "file" && (n2.name = true), n2;
  }
  findProgressElement() {
    var t2;
    return (t2 = this.findElement()) === null || t2 === undefined ? undefined : t2.querySelector("progress");
  }
  attachmentDidChangeUploadProgress() {
    const t2 = this.attachment.getUploadProgress(), e2 = this.findProgressElement();
    e2 && (e2.value = t2);
  }
}
var oe = (t2) => k({ tagName: "span", textContent: u, data: { trixCursorTarget: t2, trixSerialize: false } });
var se = function(t2, e2) {
  const i2 = k("div");
  return i2.innerHTML = t2 || "", i2.querySelector(e2);
};

class ae extends re {
  constructor() {
    super(...arguments), this.attachment.previewDelegate = this;
  }
  createContentNodes() {
    return this.image = k({ tagName: "img", attributes: { src: "" }, data: { trixMutable: true } }), this.refresh(this.image), [this.image];
  }
  createCaptionElement() {
    const t2 = super.createCaptionElement(...arguments);
    return t2.textContent || t2.setAttribute("data-trix-placeholder", l.captionPlaceholder), t2;
  }
  refresh(t2) {
    var e2;
    t2 || (t2 = (e2 = this.findElement()) === null || e2 === undefined ? undefined : e2.querySelector("img"));
    if (t2)
      return this.updateAttributesForImage(t2);
  }
  updateAttributesForImage(t2) {
    const e2 = this.attachment.getURL(), i2 = this.attachment.getPreviewURL();
    if (t2.src = i2 || e2, i2 === e2)
      t2.removeAttribute("data-trix-serialized-attributes");
    else {
      const i3 = JSON.stringify({ src: e2 });
      t2.setAttribute("data-trix-serialized-attributes", i3);
    }
    const n2 = this.attachment.getWidth(), r2 = this.attachment.getHeight();
    n2 != null && (t2.width = n2), r2 != null && (t2.height = r2);
    const o2 = ["imageElement", this.attachment.id, t2.src, t2.width, t2.height].join("/");
    t2.dataset.trixStoreKey = o2;
  }
  attachmentDidChangeAttributes() {
    return this.refresh(this.image), this.refresh();
  }
}

class le extends ee {
  constructor() {
    super(...arguments), this.piece = this.object, this.attributes = this.piece.getAttributes(), this.textConfig = this.options.textConfig, this.context = this.options.context, this.piece.attachment ? this.attachment = this.piece.attachment : this.string = this.piece.toString();
  }
  createNodes() {
    let t2 = this.attachment ? this.createAttachmentNodes() : this.createStringNodes();
    const e2 = this.createElement();
    if (e2) {
      const i2 = function(t3) {
        for (;(e3 = t3) !== null && e3 !== undefined && e3.firstElementChild; ) {
          var e3;
          t3 = t3.firstElementChild;
        }
        return t3;
      }(e2);
      Array.from(t2).forEach((t3) => {
        i2.appendChild(t3);
      }), t2 = [e2];
    }
    return t2;
  }
  createAttachmentNodes() {
    const t2 = this.attachment.isPreviewable() ? ae : re;
    return this.createChildView(t2, this.piece.attachment, { piece: this.piece }).getNodes();
  }
  createStringNodes() {
    var t2;
    if ((t2 = this.textConfig) !== null && t2 !== undefined && t2.plaintext)
      return [document.createTextNode(this.string)];
    {
      const t3 = [], e2 = this.string.split("\n");
      for (let i2 = 0;i2 < e2.length; i2++) {
        const n2 = e2[i2];
        if (i2 > 0) {
          const e3 = k("br");
          t3.push(e3);
        }
        if (n2.length) {
          const e3 = document.createTextNode(this.preserveSpaces(n2));
          t3.push(e3);
        }
      }
      return t3;
    }
  }
  createElement() {
    let t2, e2, i2;
    const n2 = {};
    for (e2 in this.attributes) {
      i2 = this.attributes[e2];
      const o2 = pt(e2);
      if (o2) {
        if (o2.tagName) {
          var r2;
          const e3 = k(o2.tagName);
          r2 ? (r2.appendChild(e3), r2 = e3) : t2 = r2 = e3;
        }
        if (o2.styleProperty && (n2[o2.styleProperty] = i2), o2.style)
          for (e2 in o2.style)
            i2 = o2.style[e2], n2[e2] = i2;
      }
    }
    if (Object.keys(n2).length)
      for (e2 in t2 || (t2 = k("span")), n2)
        i2 = n2[e2], t2.style[e2] = i2;
    return t2;
  }
  createContainerElement() {
    for (const t2 in this.attributes) {
      const e2 = this.attributes[t2], i2 = pt(t2);
      if (i2 && i2.groupTagName) {
        const n2 = {};
        return n2[t2] = e2, k(i2.groupTagName, n2);
      }
    }
  }
  preserveSpaces(t2) {
    return this.context.isLast && (t2 = t2.replace(/\ $/, d)), t2 = t2.replace(/(\S)\ {3}(\S)/g, "$1 ".concat(d, " $2")).replace(/\ {2}/g, "".concat(d, " ")).replace(/\ {2}/g, " ".concat(d)), (this.context.isFirst || this.context.followsWhitespace) && (t2 = t2.replace(/^\ /, d)), t2;
  }
}

class ce extends ee {
  constructor() {
    super(...arguments), this.text = this.object, this.textConfig = this.options.textConfig;
  }
  createNodes() {
    const t2 = [], e2 = Xt.groupObjects(this.getPieces()), i2 = e2.length - 1;
    for (let r2 = 0;r2 < e2.length; r2++) {
      const o2 = e2[r2], s2 = {};
      r2 === 0 && (s2.isFirst = true), r2 === i2 && (s2.isLast = true), he(n2) && (s2.followsWhitespace = true);
      const a2 = this.findOrCreateCachedChildView(le, o2, { textConfig: this.textConfig, context: s2 });
      t2.push(...Array.from(a2.getNodes() || []));
      var n2 = o2;
    }
    return t2;
  }
  getPieces() {
    return Array.from(this.text.getPieces()).filter((t2) => !t2.hasAttribute("blockBreak"));
  }
}
var he = (t2) => /\s$/.test(t2 == null ? undefined : t2.toString());
var { css: ue } = V;

class de extends ee {
  constructor() {
    super(...arguments), this.block = this.object, this.attributes = this.block.getAttributes();
  }
  createNodes() {
    const t2 = [document.createComment("block")];
    if (this.block.isEmpty())
      t2.push(k("br"));
    else {
      var e2;
      const i2 = (e2 = gt(this.block.getLastAttribute())) === null || e2 === undefined ? undefined : e2.text, n2 = this.findOrCreateCachedChildView(ce, this.block.text, { textConfig: i2 });
      t2.push(...Array.from(n2.getNodes() || [])), this.shouldAddExtraNewlineElement() && t2.push(k("br"));
    }
    if (this.attributes.length)
      return t2;
    {
      let e3;
      const { tagName: i2 } = n.default;
      this.block.isRTL() && (e3 = { dir: "rtl" });
      const r2 = k({ tagName: i2, attributes: e3 });
      return t2.forEach((t3) => r2.appendChild(t3)), [r2];
    }
  }
  createContainerElement(t2) {
    let e2, i2;
    const n2 = this.attributes[t2], { tagName: r2 } = gt(n2);
    if (t2 === 0 && this.block.isRTL() && (e2 = { dir: "rtl" }), n2 === "attachmentGallery") {
      const t3 = this.block.getBlockBreakPosition();
      i2 = "".concat(ue.attachmentGallery, " ").concat(ue.attachmentGallery, "--").concat(t3);
    }
    return k({ tagName: r2, className: i2, attributes: e2 });
  }
  shouldAddExtraNewlineElement() {
    return /\n\n$/.test(this.block.toString());
  }
}

class ge extends ee {
  static render(t2) {
    const e2 = k("div"), i2 = new this(t2, { element: e2 });
    return i2.render(), i2.sync(), e2;
  }
  constructor() {
    super(...arguments), this.element = this.options.element, this.elementStore = new Qt, this.setDocument(this.object);
  }
  setDocument(t2) {
    t2.isEqualTo(this.document) || (this.document = this.object = t2);
  }
  render() {
    if (this.childViews = [], this.shadowElement = k("div"), !this.document.isEmpty()) {
      const t2 = Xt.groupObjects(this.document.getBlocks(), { asTree: true });
      Array.from(t2).forEach((t3) => {
        const e2 = this.findOrCreateCachedChildView(de, t3);
        Array.from(e2.getNodes()).map((t4) => this.shadowElement.appendChild(t4));
      });
    }
  }
  isSynced() {
    return pe(this.shadowElement, this.element);
  }
  sync() {
    const t2 = this.createDocumentFragmentForSync();
    for (;this.element.lastChild; )
      this.element.removeChild(this.element.lastChild);
    return this.element.appendChild(t2), this.didSync();
  }
  didSync() {
    return this.elementStore.reset(me(this.element)), St(() => this.garbageCollectCachedViews());
  }
  createDocumentFragmentForSync() {
    const t2 = document.createDocumentFragment();
    return Array.from(this.shadowElement.childNodes).forEach((e2) => {
      t2.appendChild(e2.cloneNode(true));
    }), Array.from(me(t2)).forEach((t3) => {
      const e2 = this.elementStore.remove(t3);
      e2 && t3.parentNode.replaceChild(e2, t3);
    }), t2;
  }
}
var me = (t2) => t2.querySelectorAll("[data-trix-store-key]");
var pe = (t2, e2) => fe(t2.innerHTML) === fe(e2.innerHTML);
var fe = (t2) => t2.replace(/&nbsp;/g, " ");
be.prototype[typeof Symbol == "function" && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, be.prototype.next = function(t2) {
  return this._invoke("next", t2);
}, be.prototype.throw = function(t2) {
  return this._invoke("throw", t2);
}, be.prototype.return = function(t2) {
  return this._invoke("return", t2);
};

class ye extends nt {
  static registerType(t2, e2) {
    e2.type = t2, this.types[t2] = e2;
  }
  static fromJSON(t2) {
    const e2 = this.types[t2.type];
    if (e2)
      return e2.fromJSON(t2);
  }
  constructor(t2) {
    let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(...arguments), this.attributes = _t.box(e2);
  }
  copyWithAttributes(t2) {
    return new this.constructor(this.getValue(), t2);
  }
  copyWithAdditionalAttributes(t2) {
    return this.copyWithAttributes(this.attributes.merge(t2));
  }
  copyWithoutAttribute(t2) {
    return this.copyWithAttributes(this.attributes.remove(t2));
  }
  copy() {
    return this.copyWithAttributes(this.attributes);
  }
  getAttribute(t2) {
    return this.attributes.get(t2);
  }
  getAttributesHash() {
    return this.attributes;
  }
  getAttributes() {
    return this.attributes.toObject();
  }
  hasAttribute(t2) {
    return this.attributes.has(t2);
  }
  hasSameStringValueAsPiece(t2) {
    return t2 && this.toString() === t2.toString();
  }
  hasSameAttributesAsPiece(t2) {
    return t2 && (this.attributes === t2.attributes || this.attributes.isEqualTo(t2.attributes));
  }
  isBlockBreak() {
    return false;
  }
  isEqualTo(t2) {
    return super.isEqualTo(...arguments) || this.hasSameConstructorAs(t2) && this.hasSameStringValueAsPiece(t2) && this.hasSameAttributesAsPiece(t2);
  }
  isEmpty() {
    return this.length === 0;
  }
  isSerializable() {
    return true;
  }
  toJSON() {
    return { type: this.constructor.type, attributes: this.getAttributes() };
  }
  contentsForInspection() {
    return { type: this.constructor.type, attributes: this.attributes.inspect() };
  }
  canBeGrouped() {
    return this.hasAttribute("href");
  }
  canBeGroupedWith(t2) {
    return this.getAttribute("href") === t2.getAttribute("href");
  }
  getLength() {
    return this.length;
  }
  canBeConsolidatedWith(t2) {
    return false;
  }
}
Ae(ye, "types", {});

class Ce extends te {
  constructor(t2) {
    super(...arguments), this.url = t2;
  }
  perform(t2) {
    const e2 = new Image;
    e2.onload = () => (e2.width = this.width = e2.naturalWidth, e2.height = this.height = e2.naturalHeight, t2(true, e2)), e2.onerror = () => t2(false), e2.src = this.url;
  }
}

class Re extends nt {
  static attachmentForFile(t2) {
    const e2 = new this(this.attributesForFile(t2));
    return e2.setFile(t2), e2;
  }
  static attributesForFile(t2) {
    return new _t({ filename: t2.name, filesize: t2.size, contentType: t2.type });
  }
  static fromJSON(t2) {
    return new this(t2);
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    super(t2), this.releaseFile = this.releaseFile.bind(this), this.attributes = _t.box(t2), this.didChangeAttributes();
  }
  getAttribute(t2) {
    return this.attributes.get(t2);
  }
  hasAttribute(t2) {
    return this.attributes.has(t2);
  }
  getAttributes() {
    return this.attributes.toObject();
  }
  setAttributes() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const e2 = this.attributes.merge(t2);
    var i2, n2, r2, o2;
    if (!this.attributes.isEqualTo(e2))
      return this.attributes = e2, this.didChangeAttributes(), (i2 = this.previewDelegate) === null || i2 === undefined || (n2 = i2.attachmentDidChangeAttributes) === null || n2 === undefined || n2.call(i2, this), (r2 = this.delegate) === null || r2 === undefined || (o2 = r2.attachmentDidChangeAttributes) === null || o2 === undefined ? undefined : o2.call(r2, this);
  }
  didChangeAttributes() {
    if (this.isPreviewable())
      return this.preloadURL();
  }
  isPending() {
    return this.file != null && !(this.getURL() || this.getHref());
  }
  isPreviewable() {
    return this.attributes.has("previewable") ? this.attributes.get("previewable") : Re.previewablePattern.test(this.getContentType());
  }
  getType() {
    return this.hasContent() ? "content" : this.isPreviewable() ? "preview" : "file";
  }
  getURL() {
    return this.attributes.get("url");
  }
  getHref() {
    return this.attributes.get("href");
  }
  getFilename() {
    return this.attributes.get("filename") || "";
  }
  getFilesize() {
    return this.attributes.get("filesize");
  }
  getFormattedFilesize() {
    const t2 = this.attributes.get("filesize");
    return typeof t2 == "number" ? h.formatter(t2) : "";
  }
  getExtension() {
    var t2;
    return (t2 = this.getFilename().match(/\.(\w+)$/)) === null || t2 === undefined ? undefined : t2[1].toLowerCase();
  }
  getContentType() {
    return this.attributes.get("contentType");
  }
  hasContent() {
    return this.attributes.has("content");
  }
  getContent() {
    return this.attributes.get("content");
  }
  getWidth() {
    return this.attributes.get("width");
  }
  getHeight() {
    return this.attributes.get("height");
  }
  getFile() {
    return this.file;
  }
  setFile(t2) {
    if (this.file = t2, this.isPreviewable())
      return this.preloadFile();
  }
  releaseFile() {
    this.releasePreloadedFile(), this.file = null;
  }
  getUploadProgress() {
    return this.uploadProgress != null ? this.uploadProgress : 0;
  }
  setUploadProgress(t2) {
    var e2, i2;
    if (this.uploadProgress !== t2)
      return this.uploadProgress = t2, (e2 = this.uploadProgressDelegate) === null || e2 === undefined || (i2 = e2.attachmentDidChangeUploadProgress) === null || i2 === undefined ? undefined : i2.call(e2, this);
  }
  toJSON() {
    return this.getAttributes();
  }
  getCacheKey() {
    return [super.getCacheKey(...arguments), this.attributes.getCacheKey(), this.getPreviewURL()].join("/");
  }
  getPreviewURL() {
    return this.previewURL || this.preloadingURL;
  }
  setPreviewURL(t2) {
    var e2, i2, n2, r2;
    if (t2 !== this.getPreviewURL())
      return this.previewURL = t2, (e2 = this.previewDelegate) === null || e2 === undefined || (i2 = e2.attachmentDidChangeAttributes) === null || i2 === undefined || i2.call(e2, this), (n2 = this.delegate) === null || n2 === undefined || (r2 = n2.attachmentDidChangePreviewURL) === null || r2 === undefined ? undefined : r2.call(n2, this);
  }
  preloadURL() {
    return this.preload(this.getURL(), this.releaseFile);
  }
  preloadFile() {
    if (this.file)
      return this.fileObjectURL = URL.createObjectURL(this.file), this.preload(this.fileObjectURL);
  }
  releasePreloadedFile() {
    this.fileObjectURL && (URL.revokeObjectURL(this.fileObjectURL), this.fileObjectURL = null);
  }
  preload(t2, e2) {
    if (t2 && t2 !== this.getPreviewURL()) {
      this.preloadingURL = t2;
      return new Ce(t2).then((i2) => {
        let { width: n2, height: r2 } = i2;
        return this.getWidth() && this.getHeight() || this.setAttributes({ width: n2, height: r2 }), this.preloadingURL = null, this.setPreviewURL(t2), e2 == null ? undefined : e2();
      }).catch(() => (this.preloadingURL = null, e2 == null ? undefined : e2()));
    }
  }
}
Ae(Re, "previewablePattern", /^image(\/(gif|png|webp|jpe?g)|$)/);

class Se extends ye {
  static fromJSON(t2) {
    return new this(Re.fromJSON(t2.attachment), t2.attributes);
  }
  constructor(t2) {
    super(...arguments), this.attachment = t2, this.length = 1, this.ensureAttachmentExclusivelyHasAttribute("href"), this.attachment.hasContent() || this.removeProhibitedAttributes();
  }
  ensureAttachmentExclusivelyHasAttribute(t2) {
    this.hasAttribute(t2) && (this.attachment.hasAttribute(t2) || this.attachment.setAttributes(this.attributes.slice([t2])), this.attributes = this.attributes.remove(t2));
  }
  removeProhibitedAttributes() {
    const t2 = this.attributes.slice(Se.permittedAttributes);
    t2.isEqualTo(this.attributes) || (this.attributes = t2);
  }
  getValue() {
    return this.attachment;
  }
  isSerializable() {
    return !this.attachment.isPending();
  }
  getCaption() {
    return this.attributes.get("caption") || "";
  }
  isEqualTo(t2) {
    var e2;
    return super.isEqualTo(t2) && this.attachment.id === (t2 == null || (e2 = t2.attachment) === null || e2 === undefined ? undefined : e2.id);
  }
  toString() {
    return "\uFFFC";
  }
  toJSON() {
    const t2 = super.toJSON(...arguments);
    return t2.attachment = this.attachment, t2;
  }
  getCacheKey() {
    return [super.getCacheKey(...arguments), this.attachment.getCacheKey()].join("/");
  }
  toConsole() {
    return JSON.stringify(this.toString());
  }
}
Ae(Se, "permittedAttributes", ["caption", "presentation"]), ye.registerType("attachment", Se);

class Ee extends ye {
  static fromJSON(t2) {
    return new this(t2.string, t2.attributes);
  }
  constructor(t2) {
    super(...arguments), this.string = ((t3) => t3.replace(/\r\n?/g, "\n"))(t2), this.length = this.string.length;
  }
  getValue() {
    return this.string;
  }
  toString() {
    return this.string.toString();
  }
  isBlockBreak() {
    return this.toString() === "\n" && this.getAttribute("blockBreak") === true;
  }
  toJSON() {
    const t2 = super.toJSON(...arguments);
    return t2.string = this.string, t2;
  }
  canBeConsolidatedWith(t2) {
    return t2 && this.hasSameConstructorAs(t2) && this.hasSameAttributesAsPiece(t2);
  }
  consolidateWith(t2) {
    return new this.constructor(this.toString() + t2.toString(), this.attributes);
  }
  splitAtOffset(t2) {
    let e2, i2;
    return t2 === 0 ? (e2 = null, i2 = this) : t2 === this.length ? (e2 = this, i2 = null) : (e2 = new this.constructor(this.string.slice(0, t2), this.attributes), i2 = new this.constructor(this.string.slice(t2), this.attributes)), [e2, i2];
  }
  toConsole() {
    let { string: t2 } = this;
    return t2.length > 15 && (t2 = t2.slice(0, 14) + "\u2026"), JSON.stringify(t2.toString());
  }
}
ye.registerType("string", Ee);

class ke extends nt {
  static box(t2) {
    return t2 instanceof this ? t2 : new this(t2);
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    super(...arguments), this.objects = t2.slice(0), this.length = this.objects.length;
  }
  indexOf(t2) {
    return this.objects.indexOf(t2);
  }
  splice() {
    for (var t2 = arguments.length, e2 = new Array(t2), i2 = 0;i2 < t2; i2++)
      e2[i2] = arguments[i2];
    return new this.constructor(ot(this.objects, ...e2));
  }
  eachObject(t2) {
    return this.objects.map((e2, i2) => t2(e2, i2));
  }
  insertObjectAtIndex(t2, e2) {
    return this.splice(e2, 0, t2);
  }
  insertSplittableListAtIndex(t2, e2) {
    return this.splice(e2, 0, ...t2.objects);
  }
  insertSplittableListAtPosition(t2, e2) {
    const [i2, n2] = this.splitObjectAtPosition(e2);
    return new this.constructor(i2).insertSplittableListAtIndex(t2, n2);
  }
  editObjectAtIndex(t2, e2) {
    return this.replaceObjectAtIndex(e2(this.objects[t2]), t2);
  }
  replaceObjectAtIndex(t2, e2) {
    return this.splice(e2, 1, t2);
  }
  removeObjectAtIndex(t2) {
    return this.splice(t2, 1);
  }
  getObjectAtIndex(t2) {
    return this.objects[t2];
  }
  getSplittableListInRange(t2) {
    const [e2, i2, n2] = this.splitObjectsAtRange(t2);
    return new this.constructor(e2.slice(i2, n2 + 1));
  }
  selectSplittableList(t2) {
    const e2 = this.objects.filter((e3) => t2(e3));
    return new this.constructor(e2);
  }
  removeObjectsInRange(t2) {
    const [e2, i2, n2] = this.splitObjectsAtRange(t2);
    return new this.constructor(e2).splice(i2, n2 - i2 + 1);
  }
  transformObjectsInRange(t2, e2) {
    const [i2, n2, r2] = this.splitObjectsAtRange(t2), o2 = i2.map((t3, i3) => n2 <= i3 && i3 <= r2 ? e2(t3) : t3);
    return new this.constructor(o2);
  }
  splitObjectsAtRange(t2) {
    let e2, [i2, n2, r2] = this.splitObjectAtPosition(De(t2));
    return [i2, e2] = new this.constructor(i2).splitObjectAtPosition(we(t2) + r2), [i2, n2, e2 - 1];
  }
  getObjectAtPosition(t2) {
    const { index: e2 } = this.findIndexAndOffsetAtPosition(t2);
    return this.objects[e2];
  }
  splitObjectAtPosition(t2) {
    let e2, i2;
    const { index: n2, offset: r2 } = this.findIndexAndOffsetAtPosition(t2), o2 = this.objects.slice(0);
    if (n2 != null)
      if (r2 === 0)
        e2 = n2, i2 = 0;
      else {
        const t3 = this.getObjectAtIndex(n2), [s2, a2] = t3.splitAtOffset(r2);
        o2.splice(n2, 1, s2, a2), e2 = n2 + 1, i2 = s2.getLength() - r2;
      }
    else
      e2 = o2.length, i2 = 0;
    return [o2, e2, i2];
  }
  consolidate() {
    const t2 = [];
    let e2 = this.objects[0];
    return this.objects.slice(1).forEach((i2) => {
      var n2, r2;
      (n2 = (r2 = e2).canBeConsolidatedWith) !== null && n2 !== undefined && n2.call(r2, i2) ? e2 = e2.consolidateWith(i2) : (t2.push(e2), e2 = i2);
    }), e2 && t2.push(e2), new this.constructor(t2);
  }
  consolidateFromIndexToIndex(t2, e2) {
    const i2 = this.objects.slice(0).slice(t2, e2 + 1), n2 = new this.constructor(i2).consolidate().toArray();
    return this.splice(t2, i2.length, ...n2);
  }
  findIndexAndOffsetAtPosition(t2) {
    let e2, i2 = 0;
    for (e2 = 0;e2 < this.objects.length; e2++) {
      const n2 = i2 + this.objects[e2].getLength();
      if (i2 <= t2 && t2 < n2)
        return { index: e2, offset: t2 - i2 };
      i2 = n2;
    }
    return { index: null, offset: null };
  }
  findPositionAtIndexAndOffset(t2, e2) {
    let i2 = 0;
    for (let n2 = 0;n2 < this.objects.length; n2++) {
      const r2 = this.objects[n2];
      if (n2 < t2)
        i2 += r2.getLength();
      else if (n2 === t2) {
        i2 += e2;
        break;
      }
    }
    return i2;
  }
  getEndPosition() {
    return this.endPosition == null && (this.endPosition = 0, this.objects.forEach((t2) => this.endPosition += t2.getLength())), this.endPosition;
  }
  toString() {
    return this.objects.join("");
  }
  toArray() {
    return this.objects.slice(0);
  }
  toJSON() {
    return this.toArray();
  }
  isEqualTo(t2) {
    return super.isEqualTo(...arguments) || Le(this.objects, t2 == null ? undefined : t2.objects);
  }
  contentsForInspection() {
    return { objects: "[".concat(this.objects.map((t2) => t2.inspect()).join(", "), "]") };
  }
}
var Le = function(t2) {
  let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (t2.length !== e2.length)
    return false;
  let i2 = true;
  for (let n2 = 0;n2 < t2.length; n2++) {
    const r2 = t2[n2];
    i2 && !r2.isEqualTo(e2[n2]) && (i2 = false);
  }
  return i2;
};
var De = (t2) => t2[0];
var we = (t2) => t2[1];

class Te extends nt {
  static textForAttachmentWithAttributes(t2, e2) {
    return new this([new Se(t2, e2)]);
  }
  static textForStringWithAttributes(t2, e2) {
    return new this([new Ee(t2, e2)]);
  }
  static fromJSON(t2) {
    return new this(Array.from(t2).map((t3) => ye.fromJSON(t3)));
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    super(...arguments);
    const e2 = t2.filter((t3) => !t3.isEmpty());
    this.pieceList = new ke(e2);
  }
  copy() {
    return this.copyWithPieceList(this.pieceList);
  }
  copyWithPieceList(t2) {
    return new this.constructor(t2.consolidate().toArray());
  }
  copyUsingObjectMap(t2) {
    const e2 = this.getPieces().map((e3) => t2.find(e3) || e3);
    return new this.constructor(e2);
  }
  appendText(t2) {
    return this.insertTextAtPosition(t2, this.getLength());
  }
  insertTextAtPosition(t2, e2) {
    return this.copyWithPieceList(this.pieceList.insertSplittableListAtPosition(t2.pieceList, e2));
  }
  removeTextAtRange(t2) {
    return this.copyWithPieceList(this.pieceList.removeObjectsInRange(t2));
  }
  replaceTextAtRange(t2, e2) {
    return this.removeTextAtRange(e2).insertTextAtPosition(t2, e2[0]);
  }
  moveTextFromRangeToPosition(t2, e2) {
    if (t2[0] <= e2 && e2 <= t2[1])
      return;
    const i2 = this.getTextAtRange(t2), n2 = i2.getLength();
    return t2[0] < e2 && (e2 -= n2), this.removeTextAtRange(t2).insertTextAtPosition(i2, e2);
  }
  addAttributeAtRange(t2, e2, i2) {
    const n2 = {};
    return n2[t2] = e2, this.addAttributesAtRange(n2, i2);
  }
  addAttributesAtRange(t2, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAdditionalAttributes(t2)));
  }
  removeAttributeAtRange(t2, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithoutAttribute(t2)));
  }
  setAttributesAtRange(t2, e2) {
    return this.copyWithPieceList(this.pieceList.transformObjectsInRange(e2, (e3) => e3.copyWithAttributes(t2)));
  }
  getAttributesAtPosition(t2) {
    var e2;
    return ((e2 = this.pieceList.getObjectAtPosition(t2)) === null || e2 === undefined ? undefined : e2.getAttributes()) || {};
  }
  getCommonAttributes() {
    const t2 = Array.from(this.pieceList.toArray()).map((t3) => t3.getAttributes());
    return _t.fromCommonAttributesOfObjects(t2).toObject();
  }
  getCommonAttributesAtRange(t2) {
    return this.getTextAtRange(t2).getCommonAttributes() || {};
  }
  getExpandedRangeForAttributeAtOffset(t2, e2) {
    let i2, n2 = i2 = e2;
    const r2 = this.getLength();
    for (;n2 > 0 && this.getCommonAttributesAtRange([n2 - 1, i2])[t2]; )
      n2--;
    for (;i2 < r2 && this.getCommonAttributesAtRange([e2, i2 + 1])[t2]; )
      i2++;
    return [n2, i2];
  }
  getTextAtRange(t2) {
    return this.copyWithPieceList(this.pieceList.getSplittableListInRange(t2));
  }
  getStringAtRange(t2) {
    return this.pieceList.getSplittableListInRange(t2).toString();
  }
  getStringAtPosition(t2) {
    return this.getStringAtRange([t2, t2 + 1]);
  }
  startsWithString(t2) {
    return this.getStringAtRange([0, t2.length]) === t2;
  }
  endsWithString(t2) {
    const e2 = this.getLength();
    return this.getStringAtRange([e2 - t2.length, e2]) === t2;
  }
  getAttachmentPieces() {
    return this.pieceList.toArray().filter((t2) => !!t2.attachment);
  }
  getAttachments() {
    return this.getAttachmentPieces().map((t2) => t2.attachment);
  }
  getAttachmentAndPositionById(t2) {
    let e2 = 0;
    for (const n2 of this.pieceList.toArray()) {
      var i2;
      if (((i2 = n2.attachment) === null || i2 === undefined ? undefined : i2.id) === t2)
        return { attachment: n2.attachment, position: e2 };
      e2 += n2.length;
    }
    return { attachment: null, position: null };
  }
  getAttachmentById(t2) {
    const { attachment: e2 } = this.getAttachmentAndPositionById(t2);
    return e2;
  }
  getRangeOfAttachment(t2) {
    const e2 = this.getAttachmentAndPositionById(t2.id), i2 = e2.position;
    if (t2 = e2.attachment)
      return [i2, i2 + 1];
  }
  updateAttributesForAttachment(t2, e2) {
    const i2 = this.getRangeOfAttachment(e2);
    return i2 ? this.addAttributesAtRange(t2, i2) : this;
  }
  getLength() {
    return this.pieceList.getEndPosition();
  }
  isEmpty() {
    return this.getLength() === 0;
  }
  isEqualTo(t2) {
    var e2;
    return super.isEqualTo(t2) || (t2 == null || (e2 = t2.pieceList) === null || e2 === undefined ? undefined : e2.isEqualTo(this.pieceList));
  }
  isBlockBreak() {
    return this.getLength() === 1 && this.pieceList.getObjectAtIndex(0).isBlockBreak();
  }
  eachPiece(t2) {
    return this.pieceList.eachObject(t2);
  }
  getPieces() {
    return this.pieceList.toArray();
  }
  getPieceAtPosition(t2) {
    return this.pieceList.getObjectAtPosition(t2);
  }
  contentsForInspection() {
    return { pieceList: this.pieceList.inspect() };
  }
  toSerializableText() {
    const t2 = this.pieceList.selectSplittableList((t3) => t3.isSerializable());
    return this.copyWithPieceList(t2);
  }
  toString() {
    return this.pieceList.toString();
  }
  toJSON() {
    return this.pieceList.toJSON();
  }
  toConsole() {
    return JSON.stringify(this.pieceList.toArray().map((t2) => JSON.parse(t2.toConsole())));
  }
  getDirection() {
    return at(this.toString());
  }
  isRTL() {
    return this.getDirection() === "rtl";
  }
}

class Be extends nt {
  static fromJSON(t2) {
    return new this(Te.fromJSON(t2.text), t2.attributes);
  }
  constructor(t2, e2) {
    super(...arguments), this.text = Fe(t2 || new Te), this.attributes = e2 || [];
  }
  isEmpty() {
    return this.text.isBlockBreak();
  }
  isEqualTo(t2) {
    return !!super.isEqualTo(t2) || this.text.isEqualTo(t2 == null ? undefined : t2.text) && rt(this.attributes, t2 == null ? undefined : t2.attributes);
  }
  copyWithText(t2) {
    return new Be(t2, this.attributes);
  }
  copyWithoutText() {
    return this.copyWithText(null);
  }
  copyWithAttributes(t2) {
    return new Be(this.text, t2);
  }
  copyWithoutAttributes() {
    return this.copyWithAttributes(null);
  }
  copyUsingObjectMap(t2) {
    const e2 = t2.find(this.text);
    return e2 ? this.copyWithText(e2) : this.copyWithText(this.text.copyUsingObjectMap(t2));
  }
  addAttribute(t2) {
    const e2 = this.attributes.concat(je(t2));
    return this.copyWithAttributes(e2);
  }
  removeAttribute(t2) {
    const { listAttribute: e2 } = gt(t2), i2 = Ue(Ue(this.attributes, t2), e2);
    return this.copyWithAttributes(i2);
  }
  removeLastAttribute() {
    return this.removeAttribute(this.getLastAttribute());
  }
  getLastAttribute() {
    return We(this.attributes);
  }
  getAttributes() {
    return this.attributes.slice(0);
  }
  getAttributeLevel() {
    return this.attributes.length;
  }
  getAttributeAtLevel(t2) {
    return this.attributes[t2 - 1];
  }
  hasAttribute(t2) {
    return this.attributes.includes(t2);
  }
  hasAttributes() {
    return this.getAttributeLevel() > 0;
  }
  getLastNestableAttribute() {
    return We(this.getNestableAttributes());
  }
  getNestableAttributes() {
    return this.attributes.filter((t2) => gt(t2).nestable);
  }
  getNestingLevel() {
    return this.getNestableAttributes().length;
  }
  decreaseNestingLevel() {
    const t2 = this.getLastNestableAttribute();
    return t2 ? this.removeAttribute(t2) : this;
  }
  increaseNestingLevel() {
    const t2 = this.getLastNestableAttribute();
    if (t2) {
      const e2 = this.attributes.lastIndexOf(t2), i2 = ot(this.attributes, e2 + 1, 0, ...je(t2));
      return this.copyWithAttributes(i2);
    }
    return this;
  }
  getListItemAttributes() {
    return this.attributes.filter((t2) => gt(t2).listAttribute);
  }
  isListItem() {
    var t2;
    return (t2 = gt(this.getLastAttribute())) === null || t2 === undefined ? undefined : t2.listAttribute;
  }
  isTerminalBlock() {
    var t2;
    return (t2 = gt(this.getLastAttribute())) === null || t2 === undefined ? undefined : t2.terminal;
  }
  breaksOnReturn() {
    var t2;
    return (t2 = gt(this.getLastAttribute())) === null || t2 === undefined ? undefined : t2.breakOnReturn;
  }
  findLineBreakInDirectionFromPosition(t2, e2) {
    const i2 = this.toString();
    let n2;
    switch (t2) {
      case "forward":
        n2 = i2.indexOf("\n", e2);
        break;
      case "backward":
        n2 = i2.slice(0, e2).lastIndexOf("\n");
    }
    if (n2 !== -1)
      return n2;
  }
  contentsForInspection() {
    return { text: this.text.inspect(), attributes: this.attributes };
  }
  toString() {
    return this.text.toString();
  }
  toJSON() {
    return { text: this.text, attributes: this.attributes };
  }
  getDirection() {
    return this.text.getDirection();
  }
  isRTL() {
    return this.text.isRTL();
  }
  getLength() {
    return this.text.getLength();
  }
  canBeConsolidatedWith(t2) {
    return !this.hasAttributes() && !t2.hasAttributes() && this.getDirection() === t2.getDirection();
  }
  consolidateWith(t2) {
    const e2 = Te.textForStringWithAttributes("\n"), i2 = this.getTextWithoutBlockBreak().appendText(e2);
    return this.copyWithText(i2.appendText(t2.text));
  }
  splitAtOffset(t2) {
    let e2, i2;
    return t2 === 0 ? (e2 = null, i2 = this) : t2 === this.getLength() ? (e2 = this, i2 = null) : (e2 = this.copyWithText(this.text.getTextAtRange([0, t2])), i2 = this.copyWithText(this.text.getTextAtRange([t2, this.getLength()]))), [e2, i2];
  }
  getBlockBreakPosition() {
    return this.text.getLength() - 1;
  }
  getTextWithoutBlockBreak() {
    return Oe(this.text) ? this.text.getTextAtRange([0, this.getBlockBreakPosition()]) : this.text.copy();
  }
  canBeGrouped(t2) {
    return this.attributes[t2];
  }
  canBeGroupedWith(t2, e2) {
    const i2 = t2.getAttributes(), r2 = i2[e2], o2 = this.attributes[e2];
    return o2 === r2 && !(gt(o2).group === false && !(() => {
      if (!ut) {
        ut = [];
        for (const t3 in n) {
          const { listAttribute: e3 } = n[t3];
          e3 != null && ut.push(e3);
        }
      }
      return ut;
    })().includes(i2[e2 + 1])) && (this.getDirection() === t2.getDirection() || t2.isEmpty());
  }
}
var Fe = function(t2) {
  return t2 = Ie(t2), t2 = Ne(t2);
};
var Ie = function(t2) {
  let e2 = false;
  const i2 = t2.getPieces();
  let n2 = i2.slice(0, i2.length - 1);
  const r2 = i2[i2.length - 1];
  return r2 ? (n2 = n2.map((t3) => t3.isBlockBreak() ? (e2 = true, Me(t3)) : t3), e2 ? new Te([...n2, r2]) : t2) : t2;
};
var Pe = Te.textForStringWithAttributes("\n", { blockBreak: true });
var Ne = function(t2) {
  return Oe(t2) ? t2 : t2.appendText(Pe);
};
var Oe = function(t2) {
  const e2 = t2.getLength();
  if (e2 === 0)
    return false;
  return t2.getTextAtRange([e2 - 1, e2]).isBlockBreak();
};
var Me = (t2) => t2.copyWithoutAttribute("blockBreak");
var je = function(t2) {
  const { listAttribute: e2 } = gt(t2);
  return e2 ? [e2, t2] : [t2];
};
var We = (t2) => t2.slice(-1)[0];
var Ue = function(t2, e2) {
  const i2 = t2.lastIndexOf(e2);
  return i2 === -1 ? t2 : ot(t2, i2, 1);
};

class qe extends nt {
  static fromJSON(t2) {
    return new this(Array.from(t2).map((t3) => Be.fromJSON(t3)));
  }
  static fromString(t2, e2) {
    const i2 = Te.textForStringWithAttributes(t2, e2);
    return new this([new Be(i2)]);
  }
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    super(...arguments), t2.length === 0 && (t2 = [new Be]), this.blockList = ke.box(t2);
  }
  isEmpty() {
    const t2 = this.getBlockAtIndex(0);
    return this.blockList.length === 1 && t2.isEmpty() && !t2.hasAttributes();
  }
  copy() {
    const t2 = (arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}).consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray();
    return new this.constructor(t2);
  }
  copyUsingObjectsFromDocument(t2) {
    const e2 = new Yt(t2.getObjects());
    return this.copyUsingObjectMap(e2);
  }
  copyUsingObjectMap(t2) {
    const e2 = this.getBlocks().map((e3) => t2.find(e3) || e3.copyUsingObjectMap(t2));
    return new this.constructor(e2);
  }
  copyWithBaseBlockAttributes() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    const e2 = this.getBlocks().map((e3) => {
      const i2 = t2.concat(e3.getAttributes());
      return e3.copyWithAttributes(i2);
    });
    return new this.constructor(e2);
  }
  replaceBlock(t2, e2) {
    const i2 = this.blockList.indexOf(t2);
    return i2 === -1 ? this : new this.constructor(this.blockList.replaceObjectAtIndex(e2, i2));
  }
  insertDocumentAtRange(t2, e2) {
    const { blockList: i2 } = t2;
    e2 = Lt(e2);
    let [n2] = e2;
    const { index: r2, offset: o2 } = this.locationFromPosition(n2);
    let s2 = this;
    const a2 = this.getBlockAtPosition(n2);
    return Dt(e2) && a2.isEmpty() && !a2.hasAttributes() ? s2 = new this.constructor(s2.blockList.removeObjectAtIndex(r2)) : a2.getBlockBreakPosition() === o2 && n2++, s2 = s2.removeTextAtRange(e2), new this.constructor(s2.blockList.insertSplittableListAtPosition(i2, n2));
  }
  mergeDocumentAtRange(t2, e2) {
    let i2, n2;
    e2 = Lt(e2);
    const [r2] = e2, o2 = this.locationFromPosition(r2), s2 = this.getBlockAtIndex(o2.index).getAttributes(), a2 = t2.getBaseBlockAttributes(), l2 = s2.slice(-a2.length);
    if (rt(a2, l2)) {
      const e3 = s2.slice(0, -a2.length);
      i2 = t2.copyWithBaseBlockAttributes(e3);
    } else
      i2 = t2.copy({ consolidateBlocks: true }).copyWithBaseBlockAttributes(s2);
    const c2 = i2.getBlockCount(), h2 = i2.getBlockAtIndex(0);
    if (rt(s2, h2.getAttributes())) {
      const t3 = h2.getTextWithoutBlockBreak();
      if (n2 = this.insertTextAtRange(t3, e2), c2 > 1) {
        i2 = new this.constructor(i2.getBlocks().slice(1));
        const e3 = r2 + t3.getLength();
        n2 = n2.insertDocumentAtRange(i2, e3);
      }
    } else
      n2 = this.insertDocumentAtRange(i2, e2);
    return n2;
  }
  insertTextAtRange(t2, e2) {
    e2 = Lt(e2);
    const [i2] = e2, { index: n2, offset: r2 } = this.locationFromPosition(i2), o2 = this.removeTextAtRange(e2);
    return new this.constructor(o2.blockList.editObjectAtIndex(n2, (e3) => e3.copyWithText(e3.text.insertTextAtPosition(t2, r2))));
  }
  removeTextAtRange(t2) {
    let e2;
    t2 = Lt(t2);
    const [i2, n2] = t2;
    if (Dt(t2))
      return this;
    const [r2, o2] = Array.from(this.locationRangeFromRange(t2)), s2 = r2.index, a2 = r2.offset, l2 = this.getBlockAtIndex(s2), c2 = o2.index, h2 = o2.offset, u2 = this.getBlockAtIndex(c2);
    if (n2 - i2 == 1 && l2.getBlockBreakPosition() === a2 && u2.getBlockBreakPosition() !== h2 && u2.text.getStringAtPosition(h2) === "\n")
      e2 = this.blockList.editObjectAtIndex(c2, (t3) => t3.copyWithText(t3.text.removeTextAtRange([h2, h2 + 1])));
    else {
      let t3;
      const i3 = l2.text.getTextAtRange([0, a2]), n3 = u2.text.getTextAtRange([h2, u2.getLength()]), r3 = i3.appendText(n3);
      t3 = s2 !== c2 && a2 === 0 && l2.getAttributeLevel() >= u2.getAttributeLevel() ? u2.copyWithText(r3) : l2.copyWithText(r3);
      const o3 = c2 + 1 - s2;
      e2 = this.blockList.splice(s2, o3, t3);
    }
    return new this.constructor(e2);
  }
  moveTextFromRangeToPosition(t2, e2) {
    let i2;
    t2 = Lt(t2);
    const [n2, r2] = t2;
    if (n2 <= e2 && e2 <= r2)
      return this;
    let o2 = this.getDocumentAtRange(t2), s2 = this.removeTextAtRange(t2);
    const a2 = n2 < e2;
    a2 && (e2 -= o2.getLength());
    const [l2, ...c2] = o2.getBlocks();
    return c2.length === 0 ? (i2 = l2.getTextWithoutBlockBreak(), a2 && (e2 += 1)) : i2 = l2.text, s2 = s2.insertTextAtRange(i2, e2), c2.length === 0 ? s2 : (o2 = new this.constructor(c2), e2 += i2.getLength(), s2.insertDocumentAtRange(o2, e2));
  }
  addAttributeAtRange(t2, e2, i2) {
    let { blockList: n2 } = this;
    return this.eachBlockAtRange(i2, (i3, r2, o2) => n2 = n2.editObjectAtIndex(o2, function() {
      return gt(t2) ? i3.addAttribute(t2, e2) : r2[0] === r2[1] ? i3 : i3.copyWithText(i3.text.addAttributeAtRange(t2, e2, r2));
    })), new this.constructor(n2);
  }
  addAttribute(t2, e2) {
    let { blockList: i2 } = this;
    return this.eachBlock((n2, r2) => i2 = i2.editObjectAtIndex(r2, () => n2.addAttribute(t2, e2))), new this.constructor(i2);
  }
  removeAttributeAtRange(t2, e2) {
    let { blockList: i2 } = this;
    return this.eachBlockAtRange(e2, function(e3, n2, r2) {
      gt(t2) ? i2 = i2.editObjectAtIndex(r2, () => e3.removeAttribute(t2)) : n2[0] !== n2[1] && (i2 = i2.editObjectAtIndex(r2, () => e3.copyWithText(e3.text.removeAttributeAtRange(t2, n2))));
    }), new this.constructor(i2);
  }
  updateAttributesForAttachment(t2, e2) {
    const i2 = this.getRangeOfAttachment(e2), [n2] = Array.from(i2), { index: r2 } = this.locationFromPosition(n2), o2 = this.getTextAtIndex(r2);
    return new this.constructor(this.blockList.editObjectAtIndex(r2, (i3) => i3.copyWithText(o2.updateAttributesForAttachment(t2, e2))));
  }
  removeAttributeForAttachment(t2, e2) {
    const i2 = this.getRangeOfAttachment(e2);
    return this.removeAttributeAtRange(t2, i2);
  }
  insertBlockBreakAtRange(t2) {
    let e2;
    t2 = Lt(t2);
    const [i2] = t2, { offset: n2 } = this.locationFromPosition(i2), r2 = this.removeTextAtRange(t2);
    return n2 === 0 && (e2 = [new Be]), new this.constructor(r2.blockList.insertSplittableListAtPosition(new ke(e2), i2));
  }
  applyBlockAttributeAtRange(t2, e2, i2) {
    const n2 = this.expandRangeToLineBreaksAndSplitBlocks(i2);
    let r2 = n2.document;
    i2 = n2.range;
    const o2 = gt(t2);
    if (o2.listAttribute) {
      r2 = r2.removeLastListAttributeAtRange(i2, { exceptAttributeName: t2 });
      const e3 = r2.convertLineBreaksToBlockBreaksInRange(i2);
      r2 = e3.document, i2 = e3.range;
    } else
      r2 = o2.exclusive ? r2.removeBlockAttributesAtRange(i2) : o2.terminal ? r2.removeLastTerminalAttributeAtRange(i2) : r2.consolidateBlocksAtRange(i2);
    return r2.addAttributeAtRange(t2, e2, i2);
  }
  removeLastListAttributeAtRange(t2) {
    let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, { blockList: i2 } = this;
    return this.eachBlockAtRange(t2, function(t3, n2, r2) {
      const o2 = t3.getLastAttribute();
      o2 && gt(o2).listAttribute && o2 !== e2.exceptAttributeName && (i2 = i2.editObjectAtIndex(r2, () => t3.removeAttribute(o2)));
    }), new this.constructor(i2);
  }
  removeLastTerminalAttributeAtRange(t2) {
    let { blockList: e2 } = this;
    return this.eachBlockAtRange(t2, function(t3, i2, n2) {
      const r2 = t3.getLastAttribute();
      r2 && gt(r2).terminal && (e2 = e2.editObjectAtIndex(n2, () => t3.removeAttribute(r2)));
    }), new this.constructor(e2);
  }
  removeBlockAttributesAtRange(t2) {
    let { blockList: e2 } = this;
    return this.eachBlockAtRange(t2, function(t3, i2, n2) {
      t3.hasAttributes() && (e2 = e2.editObjectAtIndex(n2, () => t3.copyWithoutAttributes()));
    }), new this.constructor(e2);
  }
  expandRangeToLineBreaksAndSplitBlocks(t2) {
    let e2;
    t2 = Lt(t2);
    let [i2, n2] = t2;
    const r2 = this.locationFromPosition(i2), o2 = this.locationFromPosition(n2);
    let s2 = this;
    const a2 = s2.getBlockAtIndex(r2.index);
    if (r2.offset = a2.findLineBreakInDirectionFromPosition("backward", r2.offset), r2.offset != null && (e2 = s2.positionFromLocation(r2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]), o2.index += 1, o2.offset -= s2.getBlockAtIndex(r2.index).getLength(), r2.index += 1), r2.offset = 0, o2.offset === 0 && o2.index > r2.index)
      o2.index -= 1, o2.offset = s2.getBlockAtIndex(o2.index).getBlockBreakPosition();
    else {
      const t3 = s2.getBlockAtIndex(o2.index);
      t3.text.getStringAtRange([o2.offset - 1, o2.offset]) === "\n" ? o2.offset -= 1 : o2.offset = t3.findLineBreakInDirectionFromPosition("forward", o2.offset), o2.offset !== t3.getBlockBreakPosition() && (e2 = s2.positionFromLocation(o2), s2 = s2.insertBlockBreakAtRange([e2, e2 + 1]));
    }
    return i2 = s2.positionFromLocation(r2), n2 = s2.positionFromLocation(o2), { document: s2, range: t2 = Lt([i2, n2]) };
  }
  convertLineBreaksToBlockBreaksInRange(t2) {
    t2 = Lt(t2);
    let [e2] = t2;
    const i2 = this.getStringAtRange(t2).slice(0, -1);
    let n2 = this;
    return i2.replace(/.*?\n/g, function(t3) {
      e2 += t3.length, n2 = n2.insertBlockBreakAtRange([e2 - 1, e2]);
    }), { document: n2, range: t2 };
  }
  consolidateBlocksAtRange(t2) {
    t2 = Lt(t2);
    const [e2, i2] = t2, n2 = this.locationFromPosition(e2).index, r2 = this.locationFromPosition(i2).index;
    return new this.constructor(this.blockList.consolidateFromIndexToIndex(n2, r2));
  }
  getDocumentAtRange(t2) {
    t2 = Lt(t2);
    const e2 = this.blockList.getSplittableListInRange(t2).toArray();
    return new this.constructor(e2);
  }
  getStringAtRange(t2) {
    let e2;
    const i2 = t2 = Lt(t2);
    return i2[i2.length - 1] !== this.getLength() && (e2 = -1), this.getDocumentAtRange(t2).toString().slice(0, e2);
  }
  getBlockAtIndex(t2) {
    return this.blockList.getObjectAtIndex(t2);
  }
  getBlockAtPosition(t2) {
    const { index: e2 } = this.locationFromPosition(t2);
    return this.getBlockAtIndex(e2);
  }
  getTextAtIndex(t2) {
    var e2;
    return (e2 = this.getBlockAtIndex(t2)) === null || e2 === undefined ? undefined : e2.text;
  }
  getTextAtPosition(t2) {
    const { index: e2 } = this.locationFromPosition(t2);
    return this.getTextAtIndex(e2);
  }
  getPieceAtPosition(t2) {
    const { index: e2, offset: i2 } = this.locationFromPosition(t2);
    return this.getTextAtIndex(e2).getPieceAtPosition(i2);
  }
  getCharacterAtPosition(t2) {
    const { index: e2, offset: i2 } = this.locationFromPosition(t2);
    return this.getTextAtIndex(e2).getStringAtRange([i2, i2 + 1]);
  }
  getLength() {
    return this.blockList.getEndPosition();
  }
  getBlocks() {
    return this.blockList.toArray();
  }
  getBlockCount() {
    return this.blockList.length;
  }
  getEditCount() {
    return this.editCount;
  }
  eachBlock(t2) {
    return this.blockList.eachObject(t2);
  }
  eachBlockAtRange(t2, e2) {
    let i2, n2;
    t2 = Lt(t2);
    const [r2, o2] = t2, s2 = this.locationFromPosition(r2), a2 = this.locationFromPosition(o2);
    if (s2.index === a2.index)
      return i2 = this.getBlockAtIndex(s2.index), n2 = [s2.offset, a2.offset], e2(i2, n2, s2.index);
    for (let t3 = s2.index;t3 <= a2.index; t3++)
      if (i2 = this.getBlockAtIndex(t3), i2) {
        switch (t3) {
          case s2.index:
            n2 = [s2.offset, i2.text.getLength()];
            break;
          case a2.index:
            n2 = [0, a2.offset];
            break;
          default:
            n2 = [0, i2.text.getLength()];
        }
        e2(i2, n2, t3);
      }
  }
  getCommonAttributesAtRange(t2) {
    t2 = Lt(t2);
    const [e2] = t2;
    if (Dt(t2))
      return this.getCommonAttributesAtPosition(e2);
    {
      const e3 = [], i2 = [];
      return this.eachBlockAtRange(t2, function(t3, n2) {
        if (n2[0] !== n2[1])
          return e3.push(t3.text.getCommonAttributesAtRange(n2)), i2.push(Ve(t3));
      }), _t.fromCommonAttributesOfObjects(e3).merge(_t.fromCommonAttributesOfObjects(i2)).toObject();
    }
  }
  getCommonAttributesAtPosition(t2) {
    let e2, i2;
    const { index: n2, offset: r2 } = this.locationFromPosition(t2), o2 = this.getBlockAtIndex(n2);
    if (!o2)
      return {};
    const s2 = Ve(o2), a2 = o2.text.getAttributesAtPosition(r2), l2 = o2.text.getAttributesAtPosition(r2 - 1), c2 = Object.keys(W).filter((t3) => W[t3].inheritable);
    for (e2 in l2)
      i2 = l2[e2], (i2 === a2[e2] || c2.includes(e2)) && (s2[e2] = i2);
    return s2;
  }
  getRangeOfCommonAttributeAtPosition(t2, e2) {
    const { index: i2, offset: n2 } = this.locationFromPosition(e2), r2 = this.getTextAtIndex(i2), [o2, s2] = Array.from(r2.getExpandedRangeForAttributeAtOffset(t2, n2)), a2 = this.positionFromLocation({ index: i2, offset: o2 }), l2 = this.positionFromLocation({ index: i2, offset: s2 });
    return Lt([a2, l2]);
  }
  getBaseBlockAttributes() {
    let t2 = this.getBlockAtIndex(0).getAttributes();
    for (let e2 = 1;e2 < this.getBlockCount(); e2++) {
      const i2 = this.getBlockAtIndex(e2).getAttributes(), n2 = Math.min(t2.length, i2.length);
      t2 = (() => {
        const e3 = [];
        for (let r2 = 0;r2 < n2 && i2[r2] === t2[r2]; r2++)
          e3.push(i2[r2]);
        return e3;
      })();
    }
    return t2;
  }
  getAttachmentById(t2) {
    for (const e2 of this.getAttachments())
      if (e2.id === t2)
        return e2;
  }
  getAttachmentPieces() {
    let t2 = [];
    return this.blockList.eachObject((e2) => {
      let { text: i2 } = e2;
      return t2 = t2.concat(i2.getAttachmentPieces());
    }), t2;
  }
  getAttachments() {
    return this.getAttachmentPieces().map((t2) => t2.attachment);
  }
  getRangeOfAttachment(t2) {
    let e2 = 0;
    const i2 = this.blockList.toArray();
    for (let n2 = 0;n2 < i2.length; n2++) {
      const { text: r2 } = i2[n2], o2 = r2.getRangeOfAttachment(t2);
      if (o2)
        return Lt([e2 + o2[0], e2 + o2[1]]);
      e2 += r2.getLength();
    }
  }
  getLocationRangeOfAttachment(t2) {
    const e2 = this.getRangeOfAttachment(t2);
    return this.locationRangeFromRange(e2);
  }
  getAttachmentPieceForAttachment(t2) {
    for (const e2 of this.getAttachmentPieces())
      if (e2.attachment === t2)
        return e2;
  }
  findRangesForBlockAttribute(t2) {
    let e2 = 0;
    const i2 = [];
    return this.getBlocks().forEach((n2) => {
      const r2 = n2.getLength();
      n2.hasAttribute(t2) && i2.push([e2, e2 + r2]), e2 += r2;
    }), i2;
  }
  findRangesForTextAttribute(t2) {
    let { withValue: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, i2 = 0, n2 = [];
    const r2 = [];
    return this.getPieces().forEach((o2) => {
      const s2 = o2.getLength();
      (function(i3) {
        return e2 ? i3.getAttribute(t2) === e2 : i3.hasAttribute(t2);
      })(o2) && (n2[1] === i2 ? n2[1] = i2 + s2 : r2.push(n2 = [i2, i2 + s2])), i2 += s2;
    }), r2;
  }
  locationFromPosition(t2) {
    const e2 = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, t2));
    if (e2.index != null)
      return e2;
    {
      const t3 = this.getBlocks();
      return { index: t3.length - 1, offset: t3[t3.length - 1].getLength() };
    }
  }
  positionFromLocation(t2) {
    return this.blockList.findPositionAtIndexAndOffset(t2.index, t2.offset);
  }
  locationRangeFromPosition(t2) {
    return Lt(this.locationFromPosition(t2));
  }
  locationRangeFromRange(t2) {
    if (!(t2 = Lt(t2)))
      return;
    const [e2, i2] = Array.from(t2), n2 = this.locationFromPosition(e2), r2 = this.locationFromPosition(i2);
    return Lt([n2, r2]);
  }
  rangeFromLocationRange(t2) {
    let e2;
    t2 = Lt(t2);
    const i2 = this.positionFromLocation(t2[0]);
    return Dt(t2) || (e2 = this.positionFromLocation(t2[1])), Lt([i2, e2]);
  }
  isEqualTo(t2) {
    return this.blockList.isEqualTo(t2 == null ? undefined : t2.blockList);
  }
  getTexts() {
    return this.getBlocks().map((t2) => t2.text);
  }
  getPieces() {
    const t2 = [];
    return Array.from(this.getTexts()).forEach((e2) => {
      t2.push(...Array.from(e2.getPieces() || []));
    }), t2;
  }
  getObjects() {
    return this.getBlocks().concat(this.getTexts()).concat(this.getPieces());
  }
  toSerializableDocument() {
    const t2 = [];
    return this.blockList.eachObject((e2) => t2.push(e2.copyWithText(e2.text.toSerializableText()))), new this.constructor(t2);
  }
  toString() {
    return this.blockList.toString();
  }
  toJSON() {
    return this.blockList.toJSON();
  }
  toConsole() {
    return JSON.stringify(this.blockList.toArray().map((t2) => JSON.parse(t2.text.toConsole())));
  }
}
var Ve = function(t2) {
  const e2 = {}, i2 = t2.getLastAttribute();
  return i2 && (e2[i2] = true), e2;
};
var ze = "style href src width height class".split(" ");
var _e = "javascript:".split(" ");
var He = "script iframe form".split(" ");

class Je extends z {
  static sanitize(t2, e2) {
    const i2 = new this(t2, e2);
    return i2.sanitize(), i2;
  }
  constructor(t2) {
    let { allowedAttributes: e2, forbiddenProtocols: i2, forbiddenElements: n2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(...arguments), this.allowedAttributes = e2 || ze, this.forbiddenProtocols = i2 || _e, this.forbiddenElements = n2 || He, this.body = Ke(t2);
  }
  sanitize() {
    return this.sanitizeElements(), this.normalizeListElementNesting();
  }
  getHTML() {
    return this.body.innerHTML;
  }
  getBody() {
    return this.body;
  }
  sanitizeElements() {
    const t2 = S(this.body), e2 = [];
    for (;t2.nextNode(); ) {
      const i2 = t2.currentNode;
      switch (i2.nodeType) {
        case Node.ELEMENT_NODE:
          this.elementIsRemovable(i2) ? e2.push(i2) : this.sanitizeElement(i2);
          break;
        case Node.COMMENT_NODE:
          e2.push(i2);
      }
    }
    return e2.forEach((t3) => R(t3)), this.body;
  }
  sanitizeElement(t2) {
    return t2.hasAttribute("href") && this.forbiddenProtocols.includes(t2.protocol) && t2.removeAttribute("href"), Array.from(t2.attributes).forEach((e2) => {
      let { name: i2 } = e2;
      this.allowedAttributes.includes(i2) || i2.indexOf("data-trix") === 0 || t2.removeAttribute(i2);
    }), t2;
  }
  normalizeListElementNesting() {
    return Array.from(this.body.querySelectorAll("ul,ol")).forEach((t2) => {
      const e2 = t2.previousElementSibling;
      e2 && E(e2) === "li" && e2.appendChild(t2);
    }), this.body;
  }
  elementIsRemovable(t2) {
    if ((t2 == null ? undefined : t2.nodeType) === Node.ELEMENT_NODE)
      return this.elementIsForbidden(t2) || this.elementIsntSerializable(t2);
  }
  elementIsForbidden(t2) {
    return this.forbiddenElements.includes(E(t2));
  }
  elementIsntSerializable(t2) {
    return t2.getAttribute("data-trix-serialize") === "false" && !P(t2);
  }
}
var Ke = function() {
  let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  t2 = t2.replace(/<\/html[^>]*>[^]*$/i, "</html>");
  const e2 = document.implementation.createHTMLDocument("");
  return e2.documentElement.innerHTML = t2, Array.from(e2.head.querySelectorAll("style")).forEach((t3) => {
    e2.body.appendChild(t3);
  }), e2.body;
};
var Ge = function(t2) {
  let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return { string: t2 = Wt(t2), attributes: e2, type: "string" };
};
var $e = (t2, e2) => {
  try {
    return JSON.parse(t2.getAttribute("data-trix-".concat(e2)));
  } catch (t3) {
    return {};
  }
};

class Xe extends z {
  static parse(t2, e2) {
    const i2 = new this(t2, e2);
    return i2.parse(), i2;
  }
  constructor(t2) {
    let { referenceElement: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    super(...arguments), this.html = t2, this.referenceElement = e2, this.blocks = [], this.blockElements = [], this.processedElements = [];
  }
  getDocument() {
    return qe.fromJSON(this.blocks);
  }
  parse() {
    try {
      this.createHiddenContainer();
      const t2 = Je.sanitize(this.html).getHTML();
      this.containerElement.innerHTML = t2;
      const e2 = S(this.containerElement, { usingFilter: ti });
      for (;e2.nextNode(); )
        this.processNode(e2.currentNode);
      return this.translateBlockElementMarginsToNewlines();
    } finally {
      this.removeHiddenContainer();
    }
  }
  createHiddenContainer() {
    return this.referenceElement ? (this.containerElement = this.referenceElement.cloneNode(false), this.containerElement.removeAttribute("id"), this.containerElement.setAttribute("data-trix-internal", ""), this.containerElement.style.display = "none", this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling)) : (this.containerElement = k({ tagName: "div", style: { display: "none" } }), document.body.appendChild(this.containerElement));
  }
  removeHiddenContainer() {
    return R(this.containerElement);
  }
  processNode(t2) {
    switch (t2.nodeType) {
      case Node.TEXT_NODE:
        if (!this.isInsignificantTextNode(t2))
          return this.appendBlockForTextNode(t2), this.processTextNode(t2);
        break;
      case Node.ELEMENT_NODE:
        return this.appendBlockForElement(t2), this.processElement(t2);
    }
  }
  appendBlockForTextNode(t2) {
    const e2 = t2.parentNode;
    if (e2 === this.currentBlockElement && this.isBlockElement(t2.previousSibling))
      return this.appendStringWithAttributes("\n");
    if (e2 === this.containerElement || this.isBlockElement(e2)) {
      var i2;
      const t3 = this.getBlockAttributes(e2);
      rt(t3, (i2 = this.currentBlock) === null || i2 === undefined ? undefined : i2.attributes) || (this.currentBlock = this.appendBlockForAttributesWithElement(t3, e2), this.currentBlockElement = e2);
    }
  }
  appendBlockForElement(t2) {
    const e2 = this.isBlockElement(t2), i2 = y(this.currentBlockElement, t2);
    if (e2 && !this.isBlockElement(t2.firstChild)) {
      if (!this.isInsignificantTextNode(t2.firstChild) || !this.isBlockElement(t2.firstElementChild)) {
        const e3 = this.getBlockAttributes(t2);
        if (t2.firstChild) {
          if (i2 && rt(e3, this.currentBlock.attributes))
            return this.appendStringWithAttributes("\n");
          this.currentBlock = this.appendBlockForAttributesWithElement(e3, t2), this.currentBlockElement = t2;
        }
      }
    } else if (this.currentBlockElement && !i2 && !e2) {
      const e3 = this.findParentBlockElement(t2);
      if (e3)
        return this.appendBlockForElement(e3);
      this.currentBlock = this.appendEmptyBlock(), this.currentBlockElement = null;
    }
  }
  findParentBlockElement(t2) {
    let { parentElement: e2 } = t2;
    for (;e2 && e2 !== this.containerElement; ) {
      if (this.isBlockElement(e2) && this.blockElements.includes(e2))
        return e2;
      e2 = e2.parentElement;
    }
    return null;
  }
  processTextNode(t2) {
    let e2 = t2.data;
    var i2;
    Ye(t2.parentNode) || (e2 = qt(e2), ni((i2 = t2.previousSibling) === null || i2 === undefined ? undefined : i2.textContent) && (e2 = ei(e2)));
    return this.appendStringWithAttributes(e2, this.getTextAttributes(t2.parentNode));
  }
  processElement(t2) {
    let e2;
    if (P(t2)) {
      if (e2 = $e(t2, "attachment"), Object.keys(e2).length) {
        const i2 = this.getTextAttributes(t2);
        this.appendAttachmentWithAttributes(e2, i2), t2.innerHTML = "";
      }
      return this.processedElements.push(t2);
    }
    switch (E(t2)) {
      case "br":
        return this.isExtraBR(t2) || this.isBlockElement(t2.nextSibling) || this.appendStringWithAttributes("\n", this.getTextAttributes(t2)), this.processedElements.push(t2);
      case "img":
        e2 = { url: t2.getAttribute("src"), contentType: "image" };
        const i2 = ((t3) => {
          const e3 = t3.getAttribute("width"), i3 = t3.getAttribute("height"), n2 = {};
          return e3 && (n2.width = parseInt(e3, 10)), i3 && (n2.height = parseInt(i3, 10)), n2;
        })(t2);
        for (const t3 in i2) {
          const n2 = i2[t3];
          e2[t3] = n2;
        }
        return this.appendAttachmentWithAttributes(e2, this.getTextAttributes(t2)), this.processedElements.push(t2);
      case "tr":
        if (this.needsTableSeparator(t2))
          return this.appendStringWithAttributes(j.tableRowSeparator);
        break;
      case "td":
        if (this.needsTableSeparator(t2))
          return this.appendStringWithAttributes(j.tableCellSeparator);
    }
  }
  appendBlockForAttributesWithElement(t2, e2) {
    this.blockElements.push(e2);
    const i2 = function() {
      return { text: [], attributes: arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {} };
    }(t2);
    return this.blocks.push(i2), i2;
  }
  appendEmptyBlock() {
    return this.appendBlockForAttributesWithElement([], null);
  }
  appendStringWithAttributes(t2, e2) {
    return this.appendPiece(Ge(t2, e2));
  }
  appendAttachmentWithAttributes(t2, e2) {
    return this.appendPiece(function(t3) {
      return { attachment: t3, attributes: arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, type: "attachment" };
    }(t2, e2));
  }
  appendPiece(t2) {
    return this.blocks.length === 0 && this.appendEmptyBlock(), this.blocks[this.blocks.length - 1].text.push(t2);
  }
  appendStringToTextAtIndex(t2, e2) {
    const { text: i2 } = this.blocks[e2], n2 = i2[i2.length - 1];
    if ((n2 == null ? undefined : n2.type) !== "string")
      return i2.push(Ge(t2));
    n2.string += t2;
  }
  prependStringToTextAtIndex(t2, e2) {
    const { text: i2 } = this.blocks[e2], n2 = i2[0];
    if ((n2 == null ? undefined : n2.type) !== "string")
      return i2.unshift(Ge(t2));
    n2.string = t2 + n2.string;
  }
  getTextAttributes(t2) {
    let e2;
    const i2 = {};
    for (const n2 in W) {
      const r2 = W[n2];
      if (r2.tagName && A(t2, { matchingSelector: r2.tagName, untilNode: this.containerElement }))
        i2[n2] = true;
      else if (r2.parser) {
        if (e2 = r2.parser(t2), e2) {
          let o2 = false;
          for (const i3 of this.findBlockElementAncestors(t2))
            if (r2.parser(i3) === e2) {
              o2 = true;
              break;
            }
          o2 || (i2[n2] = e2);
        }
      } else
        r2.styleProperty && (e2 = t2.style[r2.styleProperty], e2 && (i2[n2] = e2));
    }
    if (P(t2)) {
      const n2 = $e(t2, "attributes");
      for (const t3 in n2)
        e2 = n2[t3], i2[t3] = e2;
    }
    return i2;
  }
  getBlockAttributes(t2) {
    const e2 = [];
    for (;t2 && t2 !== this.containerElement; ) {
      for (const r2 in n) {
        const o2 = n[r2];
        var i2;
        if (o2.parse !== false) {
          if (E(t2) === o2.tagName)
            ((i2 = o2.test) !== null && i2 !== undefined && i2.call(o2, t2) || !o2.test) && (e2.push(r2), o2.listAttribute && e2.push(o2.listAttribute));
        }
      }
      t2 = t2.parentNode;
    }
    return e2.reverse();
  }
  findBlockElementAncestors(t2) {
    const e2 = [];
    for (;t2 && t2 !== this.containerElement; ) {
      const i2 = E(t2);
      D().includes(i2) && e2.push(t2), t2 = t2.parentNode;
    }
    return e2;
  }
  isBlockElement(t2) {
    if ((t2 == null ? undefined : t2.nodeType) === Node.ELEMENT_NODE && !P(t2) && !A(t2, { matchingSelector: "td", untilNode: this.containerElement }))
      return D().includes(E(t2)) || window.getComputedStyle(t2).display === "block";
  }
  isInsignificantTextNode(t2) {
    if ((t2 == null ? undefined : t2.nodeType) !== Node.TEXT_NODE)
      return;
    if (!ii(t2.data))
      return;
    const { parentNode: e2, previousSibling: i2, nextSibling: n2 } = t2;
    return Qe(e2.previousSibling) && !this.isBlockElement(e2.previousSibling) || Ye(e2) ? undefined : !i2 || this.isBlockElement(i2) || !n2 || this.isBlockElement(n2);
  }
  isExtraBR(t2) {
    return E(t2) === "br" && this.isBlockElement(t2.parentNode) && t2.parentNode.lastChild === t2;
  }
  needsTableSeparator(t2) {
    if (j.removeBlankTableCells) {
      var e2;
      const i2 = (e2 = t2.previousSibling) === null || e2 === undefined ? undefined : e2.textContent;
      return i2 && /\S/.test(i2);
    }
    return t2.previousSibling;
  }
  translateBlockElementMarginsToNewlines() {
    const t2 = this.getMarginOfDefaultBlockElement();
    for (let e2 = 0;e2 < this.blocks.length; e2++) {
      const i2 = this.getMarginOfBlockElementAtIndex(e2);
      i2 && (i2.top > 2 * t2.top && this.prependStringToTextAtIndex("\n", e2), i2.bottom > 2 * t2.bottom && this.appendStringToTextAtIndex("\n", e2));
    }
  }
  getMarginOfBlockElementAtIndex(t2) {
    const e2 = this.blockElements[t2];
    if (e2 && e2.textContent && !D().includes(E(e2)) && !this.processedElements.includes(e2))
      return Ze(e2);
  }
  getMarginOfDefaultBlockElement() {
    const t2 = k(n.default.tagName);
    return this.containerElement.appendChild(t2), Ze(t2);
  }
}
var Ye = function(t2) {
  const { whiteSpace: e2 } = window.getComputedStyle(t2);
  return ["pre", "pre-wrap", "pre-line"].includes(e2);
};
var Qe = (t2) => t2 && !ni(t2.textContent);
var Ze = function(t2) {
  const e2 = window.getComputedStyle(t2);
  if (e2.display === "block")
    return { top: parseInt(e2.marginTop), bottom: parseInt(e2.marginBottom) };
};
var ti = function(t2) {
  return E(t2) === "style" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};
var ei = (t2) => t2.replace(new RegExp("^".concat(Ut.source, "+")), "");
var ii = (t2) => new RegExp("^".concat(Ut.source, "*$")).test(t2);
var ni = (t2) => /\s$/.test(t2);
var ri = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"];
var oi = "data-trix-serialized-attributes";
var si = "[".concat(oi, "]");
var ai = new RegExp("<!--block-->", "g");
var li = { "application/json": function(t2) {
  let e2;
  if (t2 instanceof qe)
    e2 = t2;
  else {
    if (!(t2 instanceof HTMLElement))
      throw new Error("unserializable object");
    e2 = Xe.parse(t2.innerHTML).getDocument();
  }
  return e2.toSerializableDocument().toJSONString();
}, "text/html": function(t2) {
  let e2;
  if (t2 instanceof qe)
    e2 = ge.render(t2);
  else {
    if (!(t2 instanceof HTMLElement))
      throw new Error("unserializable object");
    e2 = t2.cloneNode(true);
  }
  return Array.from(e2.querySelectorAll("[data-trix-serialize=false]")).forEach((t3) => {
    R(t3);
  }), ri.forEach((t3) => {
    Array.from(e2.querySelectorAll("[".concat(t3, "]"))).forEach((e3) => {
      e3.removeAttribute(t3);
    });
  }), Array.from(e2.querySelectorAll(si)).forEach((t3) => {
    try {
      const e3 = JSON.parse(t3.getAttribute(oi));
      t3.removeAttribute(oi);
      for (const i2 in e3) {
        const n2 = e3[i2];
        t3.setAttribute(i2, n2);
      }
    } catch (t4) {
    }
  }), e2.innerHTML.replace(ai, "");
} };
var ci = Object.freeze({ __proto__: null });

class hi extends z {
  constructor(t2, e2) {
    super(...arguments), this.attachmentManager = t2, this.attachment = e2, this.id = this.attachment.id, this.file = this.attachment.file;
  }
  remove() {
    return this.attachmentManager.requestRemovalOfAttachment(this.attachment);
  }
}
hi.proxyMethod("attachment.getAttribute"), hi.proxyMethod("attachment.hasAttribute"), hi.proxyMethod("attachment.setAttribute"), hi.proxyMethod("attachment.getAttributes"), hi.proxyMethod("attachment.setAttributes"), hi.proxyMethod("attachment.isPending"), hi.proxyMethod("attachment.isPreviewable"), hi.proxyMethod("attachment.getURL"), hi.proxyMethod("attachment.getHref"), hi.proxyMethod("attachment.getFilename"), hi.proxyMethod("attachment.getFilesize"), hi.proxyMethod("attachment.getFormattedFilesize"), hi.proxyMethod("attachment.getExtension"), hi.proxyMethod("attachment.getContentType"), hi.proxyMethod("attachment.getFile"), hi.proxyMethod("attachment.setFile"), hi.proxyMethod("attachment.releaseFile"), hi.proxyMethod("attachment.getUploadProgress"), hi.proxyMethod("attachment.setUploadProgress");

class ui extends z {
  constructor() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    super(...arguments), this.managedAttachments = {}, Array.from(t2).forEach((t3) => {
      this.manageAttachment(t3);
    });
  }
  getAttachments() {
    const t2 = [];
    for (const e2 in this.managedAttachments) {
      const i2 = this.managedAttachments[e2];
      t2.push(i2);
    }
    return t2;
  }
  manageAttachment(t2) {
    return this.managedAttachments[t2.id] || (this.managedAttachments[t2.id] = new hi(this, t2)), this.managedAttachments[t2.id];
  }
  attachmentIsManaged(t2) {
    return t2.id in this.managedAttachments;
  }
  requestRemovalOfAttachment(t2) {
    var e2, i2;
    if (this.attachmentIsManaged(t2))
      return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.attachmentManagerDidRequestRemovalOfAttachment) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  unmanageAttachment(t2) {
    const e2 = this.managedAttachments[t2.id];
    return delete this.managedAttachments[t2.id], e2;
  }
}

class di {
  constructor(t2) {
    this.composition = t2, this.document = this.composition.document;
    const e2 = this.composition.getSelectedRange();
    this.startPosition = e2[0], this.endPosition = e2[1], this.startLocation = this.document.locationFromPosition(this.startPosition), this.endLocation = this.document.locationFromPosition(this.endPosition), this.block = this.document.getBlockAtIndex(this.endLocation.index), this.breaksOnReturn = this.block.breaksOnReturn(), this.previousCharacter = this.block.text.getStringAtPosition(this.endLocation.offset - 1), this.nextCharacter = this.block.text.getStringAtPosition(this.endLocation.offset);
  }
  shouldInsertBlockBreak() {
    return this.block.hasAttributes() && this.block.isListItem() && !this.block.isEmpty() ? this.startLocation.offset !== 0 : this.breaksOnReturn && this.nextCharacter !== "\n";
  }
  shouldBreakFormattedBlock() {
    return this.block.hasAttributes() && !this.block.isListItem() && (this.breaksOnReturn && this.nextCharacter === "\n" || this.previousCharacter === "\n");
  }
  shouldDecreaseListLevel() {
    return this.block.hasAttributes() && this.block.isListItem() && this.block.isEmpty();
  }
  shouldPrependListItem() {
    return this.block.isListItem() && this.startLocation.offset === 0 && !this.block.isEmpty();
  }
  shouldRemoveLastBlockAttribute() {
    return this.block.hasAttributes() && !this.block.isListItem() && this.block.isEmpty();
  }
}

class gi extends z {
  constructor() {
    super(...arguments), this.document = new qe, this.attachments = [], this.currentAttributes = {}, this.revision = 0;
  }
  setDocument(t2) {
    var e2, i2;
    if (!t2.isEqualTo(this.document))
      return this.document = t2, this.refreshAttachments(), this.revision++, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionDidChangeDocument) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  getSnapshot() {
    return { document: this.document, selectedRange: this.getSelectedRange() };
  }
  loadSnapshot(t2) {
    var e2, i2, n2, r2;
    let { document: o2, selectedRange: s2 } = t2;
    return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionWillLoadSnapshot) === null || i2 === undefined || i2.call(e2), this.setDocument(o2 != null ? o2 : new qe), this.setSelection(s2 != null ? s2 : [0, 0]), (n2 = this.delegate) === null || n2 === undefined || (r2 = n2.compositionDidLoadSnapshot) === null || r2 === undefined ? undefined : r2.call(n2);
  }
  insertText(t2) {
    let { updatePosition: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { updatePosition: true };
    const i2 = this.getSelectedRange();
    this.setDocument(this.document.insertTextAtRange(t2, i2));
    const n2 = i2[0], r2 = n2 + t2.getLength();
    return e2 && this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
  }
  insertBlock() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Be;
    const e2 = new qe([t2]);
    return this.insertDocument(e2);
  }
  insertDocument() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new qe;
    const e2 = this.getSelectedRange();
    this.setDocument(this.document.insertDocumentAtRange(t2, e2));
    const i2 = e2[0], n2 = i2 + t2.getLength();
    return this.setSelection(n2), this.notifyDelegateOfInsertionAtRange([i2, n2]);
  }
  insertString(t2, e2) {
    const i2 = this.getCurrentTextAttributes(), n2 = Te.textForStringWithAttributes(t2, i2);
    return this.insertText(n2, e2);
  }
  insertBlockBreak() {
    const t2 = this.getSelectedRange();
    this.setDocument(this.document.insertBlockBreakAtRange(t2));
    const e2 = t2[0], i2 = e2 + 1;
    return this.setSelection(i2), this.notifyDelegateOfInsertionAtRange([e2, i2]);
  }
  insertLineBreak() {
    const t2 = new di(this);
    if (t2.shouldDecreaseListLevel())
      return this.decreaseListLevel(), this.setSelection(t2.startPosition);
    if (t2.shouldPrependListItem()) {
      const e2 = new qe([t2.block.copyWithoutText()]);
      return this.insertDocument(e2);
    }
    return t2.shouldInsertBlockBreak() ? this.insertBlockBreak() : t2.shouldRemoveLastBlockAttribute() ? this.removeLastBlockAttribute() : t2.shouldBreakFormattedBlock() ? this.breakFormattedBlock(t2) : this.insertString("\n");
  }
  insertHTML(t2) {
    const e2 = Xe.parse(t2).getDocument(), i2 = this.getSelectedRange();
    this.setDocument(this.document.mergeDocumentAtRange(e2, i2));
    const n2 = i2[0], r2 = n2 + e2.getLength() - 1;
    return this.setSelection(r2), this.notifyDelegateOfInsertionAtRange([n2, r2]);
  }
  replaceHTML(t2) {
    const e2 = Xe.parse(t2).getDocument().copyUsingObjectsFromDocument(this.document), i2 = this.getLocationRange({ strict: false }), n2 = this.document.rangeFromLocationRange(i2);
    return this.setDocument(e2), this.setSelection(n2);
  }
  insertFile(t2) {
    return this.insertFiles([t2]);
  }
  insertFiles(t2) {
    const e2 = [];
    return Array.from(t2).forEach((t3) => {
      var i2;
      if ((i2 = this.delegate) !== null && i2 !== undefined && i2.compositionShouldAcceptFile(t3)) {
        const i3 = Re.attachmentForFile(t3);
        e2.push(i3);
      }
    }), this.insertAttachments(e2);
  }
  insertAttachment(t2) {
    return this.insertAttachments([t2]);
  }
  insertAttachments(t2) {
    let e2 = new Te;
    return Array.from(t2).forEach((t3) => {
      var n2;
      const r2 = t3.getType(), o2 = (n2 = i[r2]) === null || n2 === undefined ? undefined : n2.presentation, s2 = this.getCurrentTextAttributes();
      o2 && (s2.presentation = o2);
      const a2 = Te.textForAttachmentWithAttributes(t3, s2);
      e2 = e2.appendText(a2);
    }), this.insertText(e2);
  }
  shouldManageDeletingInDirection(t2) {
    const e2 = this.getLocationRange();
    if (Dt(e2)) {
      if (t2 === "backward" && e2[0].offset === 0)
        return true;
      if (this.shouldManageMovingCursorInDirection(t2))
        return true;
    } else if (e2[0].index !== e2[1].index)
      return true;
    return false;
  }
  deleteInDirection(t2) {
    let e2, i2, n2, { length: r2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const o2 = this.getLocationRange();
    let s2 = this.getSelectedRange();
    const a2 = Dt(s2);
    if (a2 ? i2 = t2 === "backward" && o2[0].offset === 0 : n2 = o2[0].index !== o2[1].index, i2 && this.canDecreaseBlockAttributeLevel()) {
      const t3 = this.getBlock();
      if (t3.isListItem() ? this.decreaseListLevel() : this.decreaseBlockAttributeLevel(), this.setSelection(s2[0]), t3.isEmpty())
        return false;
    }
    return a2 && (s2 = this.getExpandedRangeInDirection(t2, { length: r2 }), t2 === "backward" && (e2 = this.getAttachmentAtRange(s2))), e2 ? (this.editAttachment(e2), false) : (this.setDocument(this.document.removeTextAtRange(s2)), this.setSelection(s2[0]), !i2 && !n2 && undefined);
  }
  moveTextFromRange(t2) {
    const [e2] = Array.from(this.getSelectedRange());
    return this.setDocument(this.document.moveTextFromRangeToPosition(t2, e2)), this.setSelection(e2);
  }
  removeAttachment(t2) {
    const e2 = this.document.getRangeOfAttachment(t2);
    if (e2)
      return this.stopEditingAttachment(), this.setDocument(this.document.removeTextAtRange(e2)), this.setSelection(e2[0]);
  }
  removeLastBlockAttribute() {
    const [t2, e2] = Array.from(this.getSelectedRange()), i2 = this.document.getBlockAtPosition(e2);
    return this.removeCurrentAttribute(i2.getLastAttribute()), this.setSelection(t2);
  }
  insertPlaceholder() {
    return this.placeholderPosition = this.getPosition(), this.insertString(" ");
  }
  selectPlaceholder() {
    if (this.placeholderPosition != null)
      return this.setSelectedRange([this.placeholderPosition, this.placeholderPosition + 1]), this.getSelectedRange();
  }
  forgetPlaceholder() {
    this.placeholderPosition = null;
  }
  hasCurrentAttribute(t2) {
    const e2 = this.currentAttributes[t2];
    return e2 != null && e2 !== false;
  }
  toggleCurrentAttribute(t2) {
    const e2 = !this.currentAttributes[t2];
    return e2 ? this.setCurrentAttribute(t2, e2) : this.removeCurrentAttribute(t2);
  }
  canSetCurrentAttribute(t2) {
    return gt(t2) ? this.canSetCurrentBlockAttribute(t2) : this.canSetCurrentTextAttribute(t2);
  }
  canSetCurrentTextAttribute(t2) {
    const e2 = this.getSelectedDocument();
    if (e2) {
      for (const t3 of Array.from(e2.getAttachments()))
        if (!t3.hasContent())
          return false;
      return true;
    }
  }
  canSetCurrentBlockAttribute(t2) {
    const e2 = this.getBlock();
    if (e2)
      return !e2.isTerminalBlock();
  }
  setCurrentAttribute(t2, e2) {
    return gt(t2) ? this.setBlockAttribute(t2, e2) : (this.setTextAttribute(t2, e2), this.currentAttributes[t2] = e2, this.notifyDelegateOfCurrentAttributesChange());
  }
  setTextAttribute(t2, e2) {
    const i2 = this.getSelectedRange();
    if (!i2)
      return;
    const [n2, r2] = Array.from(i2);
    if (n2 !== r2)
      return this.setDocument(this.document.addAttributeAtRange(t2, e2, i2));
    if (t2 === "href") {
      const t3 = Te.textForStringWithAttributes(e2, { href: e2 });
      return this.insertText(t3);
    }
  }
  setBlockAttribute(t2, e2) {
    const i2 = this.getSelectedRange();
    if (this.canSetCurrentAttribute(t2))
      return this.setDocument(this.document.applyBlockAttributeAtRange(t2, e2, i2)), this.setSelection(i2);
  }
  removeCurrentAttribute(t2) {
    return gt(t2) ? (this.removeBlockAttribute(t2), this.updateCurrentAttributes()) : (this.removeTextAttribute(t2), delete this.currentAttributes[t2], this.notifyDelegateOfCurrentAttributesChange());
  }
  removeTextAttribute(t2) {
    const e2 = this.getSelectedRange();
    if (e2)
      return this.setDocument(this.document.removeAttributeAtRange(t2, e2));
  }
  removeBlockAttribute(t2) {
    const e2 = this.getSelectedRange();
    if (e2)
      return this.setDocument(this.document.removeAttributeAtRange(t2, e2));
  }
  canDecreaseNestingLevel() {
    var t2;
    return ((t2 = this.getBlock()) === null || t2 === undefined ? undefined : t2.getNestingLevel()) > 0;
  }
  canIncreaseNestingLevel() {
    var t2;
    const e2 = this.getBlock();
    if (e2) {
      if ((t2 = gt(e2.getLastNestableAttribute())) === null || t2 === undefined || !t2.listAttribute)
        return e2.getNestingLevel() > 0;
      {
        const t3 = this.getPreviousBlock();
        if (t3)
          return function() {
            let t4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            return rt((arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : []).slice(0, t4.length), t4);
          }(t3.getListItemAttributes(), e2.getListItemAttributes());
      }
    }
  }
  decreaseNestingLevel() {
    const t2 = this.getBlock();
    if (t2)
      return this.setDocument(this.document.replaceBlock(t2, t2.decreaseNestingLevel()));
  }
  increaseNestingLevel() {
    const t2 = this.getBlock();
    if (t2)
      return this.setDocument(this.document.replaceBlock(t2, t2.increaseNestingLevel()));
  }
  canDecreaseBlockAttributeLevel() {
    var t2;
    return ((t2 = this.getBlock()) === null || t2 === undefined ? undefined : t2.getAttributeLevel()) > 0;
  }
  decreaseBlockAttributeLevel() {
    var t2;
    const e2 = (t2 = this.getBlock()) === null || t2 === undefined ? undefined : t2.getLastAttribute();
    if (e2)
      return this.removeCurrentAttribute(e2);
  }
  decreaseListLevel() {
    let [t2] = Array.from(this.getSelectedRange());
    const { index: e2 } = this.document.locationFromPosition(t2);
    let i2 = e2;
    const n2 = this.getBlock().getAttributeLevel();
    let r2 = this.document.getBlockAtIndex(i2 + 1);
    for (;r2 && r2.isListItem() && !(r2.getAttributeLevel() <= n2); )
      i2++, r2 = this.document.getBlockAtIndex(i2 + 1);
    t2 = this.document.positionFromLocation({ index: e2, offset: 0 });
    const o2 = this.document.positionFromLocation({ index: i2, offset: 0 });
    return this.setDocument(this.document.removeLastListAttributeAtRange([t2, o2]));
  }
  updateCurrentAttributes() {
    const t2 = this.getSelectedRange({ ignoreLock: true });
    if (t2) {
      const e2 = this.document.getCommonAttributesAtRange(t2);
      if (Array.from(dt()).forEach((t3) => {
        e2[t3] || this.canSetCurrentAttribute(t3) || (e2[t3] = false);
      }), !kt(e2, this.currentAttributes))
        return this.currentAttributes = e2, this.notifyDelegateOfCurrentAttributesChange();
    }
  }
  getCurrentAttributes() {
    return g.call({}, this.currentAttributes);
  }
  getCurrentTextAttributes() {
    const t2 = {};
    for (const e2 in this.currentAttributes) {
      const i2 = this.currentAttributes[e2];
      i2 !== false && pt(e2) && (t2[e2] = i2);
    }
    return t2;
  }
  freezeSelection() {
    return this.setCurrentAttribute("frozen", true);
  }
  thawSelection() {
    return this.removeCurrentAttribute("frozen");
  }
  hasFrozenSelection() {
    return this.hasCurrentAttribute("frozen");
  }
  setSelection(t2) {
    var e2;
    const i2 = this.document.locationRangeFromRange(t2);
    return (e2 = this.delegate) === null || e2 === undefined ? undefined : e2.compositionDidRequestChangingSelectionToLocationRange(i2);
  }
  getSelectedRange() {
    const t2 = this.getLocationRange();
    if (t2)
      return this.document.rangeFromLocationRange(t2);
  }
  setSelectedRange(t2) {
    const e2 = this.document.locationRangeFromRange(t2);
    return this.getSelectionManager().setLocationRange(e2);
  }
  getPosition() {
    const t2 = this.getLocationRange();
    if (t2)
      return this.document.positionFromLocation(t2[0]);
  }
  getLocationRange(t2) {
    return this.targetLocationRange ? this.targetLocationRange : this.getSelectionManager().getLocationRange(t2) || Lt({ index: 0, offset: 0 });
  }
  withTargetLocationRange(t2, e2) {
    let i2;
    this.targetLocationRange = t2;
    try {
      i2 = e2();
    } finally {
      this.targetLocationRange = null;
    }
    return i2;
  }
  withTargetRange(t2, e2) {
    const i2 = this.document.locationRangeFromRange(t2);
    return this.withTargetLocationRange(i2, e2);
  }
  withTargetDOMRange(t2, e2) {
    const i2 = this.createLocationRangeFromDOMRange(t2, { strict: false });
    return this.withTargetLocationRange(i2, e2);
  }
  getExpandedRangeInDirection(t2) {
    let { length: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}, [i2, n2] = Array.from(this.getSelectedRange());
    return t2 === "backward" ? e2 ? i2 -= e2 : i2 = this.translateUTF16PositionFromOffset(i2, -1) : e2 ? n2 += e2 : n2 = this.translateUTF16PositionFromOffset(n2, 1), Lt([i2, n2]);
  }
  shouldManageMovingCursorInDirection(t2) {
    if (this.editingAttachment)
      return true;
    const e2 = this.getExpandedRangeInDirection(t2);
    return this.getAttachmentAtRange(e2) != null;
  }
  moveCursorInDirection(t2) {
    let e2, i2;
    if (this.editingAttachment)
      i2 = this.document.getRangeOfAttachment(this.editingAttachment);
    else {
      const n2 = this.getSelectedRange();
      i2 = this.getExpandedRangeInDirection(t2), e2 = !wt(n2, i2);
    }
    if (t2 === "backward" ? this.setSelectedRange(i2[0]) : this.setSelectedRange(i2[1]), e2) {
      const t3 = this.getAttachmentAtRange(i2);
      if (t3)
        return this.editAttachment(t3);
    }
  }
  expandSelectionInDirection(t2) {
    let { length: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const i2 = this.getExpandedRangeInDirection(t2, { length: e2 });
    return this.setSelectedRange(i2);
  }
  expandSelectionForEditing() {
    if (this.hasCurrentAttribute("href"))
      return this.expandSelectionAroundCommonAttribute("href");
  }
  expandSelectionAroundCommonAttribute(t2) {
    const e2 = this.getPosition(), i2 = this.document.getRangeOfCommonAttributeAtPosition(t2, e2);
    return this.setSelectedRange(i2);
  }
  selectionContainsAttachments() {
    var t2;
    return ((t2 = this.getSelectedAttachments()) === null || t2 === undefined ? undefined : t2.length) > 0;
  }
  selectionIsInCursorTarget() {
    return this.editingAttachment || this.positionIsCursorTarget(this.getPosition());
  }
  positionIsCursorTarget(t2) {
    const e2 = this.document.locationFromPosition(t2);
    if (e2)
      return this.locationIsCursorTarget(e2);
  }
  positionIsBlockBreak(t2) {
    var e2;
    return (e2 = this.document.getPieceAtPosition(t2)) === null || e2 === undefined ? undefined : e2.isBlockBreak();
  }
  getSelectedDocument() {
    const t2 = this.getSelectedRange();
    if (t2)
      return this.document.getDocumentAtRange(t2);
  }
  getSelectedAttachments() {
    var t2;
    return (t2 = this.getSelectedDocument()) === null || t2 === undefined ? undefined : t2.getAttachments();
  }
  getAttachments() {
    return this.attachments.slice(0);
  }
  refreshAttachments() {
    const t2 = this.document.getAttachments(), { added: e2, removed: i2 } = function() {
      let t3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [], e3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      const i3 = [], n2 = [], r2 = new Set;
      t3.forEach((t4) => {
        r2.add(t4);
      });
      const o2 = new Set;
      return e3.forEach((t4) => {
        o2.add(t4), r2.has(t4) || i3.push(t4);
      }), t3.forEach((t4) => {
        o2.has(t4) || n2.push(t4);
      }), { added: i3, removed: n2 };
    }(this.attachments, t2);
    return this.attachments = t2, Array.from(i2).forEach((t3) => {
      var e3, i3;
      t3.delegate = null, (e3 = this.delegate) === null || e3 === undefined || (i3 = e3.compositionDidRemoveAttachment) === null || i3 === undefined || i3.call(e3, t3);
    }), (() => {
      const t3 = [];
      return Array.from(e2).forEach((e3) => {
        var i3, n2;
        e3.delegate = this, t3.push((i3 = this.delegate) === null || i3 === undefined || (n2 = i3.compositionDidAddAttachment) === null || n2 === undefined ? undefined : n2.call(i3, e3));
      }), t3;
    })();
  }
  attachmentDidChangeAttributes(t2) {
    var e2, i2;
    return this.revision++, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionDidEditAttachment) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  attachmentDidChangePreviewURL(t2) {
    var e2, i2;
    return this.revision++, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionDidChangeAttachmentPreviewURL) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  editAttachment(t2, e2) {
    var i2, n2;
    if (t2 !== this.editingAttachment)
      return this.stopEditingAttachment(), this.editingAttachment = t2, (i2 = this.delegate) === null || i2 === undefined || (n2 = i2.compositionDidStartEditingAttachment) === null || n2 === undefined ? undefined : n2.call(i2, this.editingAttachment, e2);
  }
  stopEditingAttachment() {
    var t2, e2;
    this.editingAttachment && ((t2 = this.delegate) === null || t2 === undefined || (e2 = t2.compositionDidStopEditingAttachment) === null || e2 === undefined || e2.call(t2, this.editingAttachment), this.editingAttachment = null);
  }
  updateAttributesForAttachment(t2, e2) {
    return this.setDocument(this.document.updateAttributesForAttachment(t2, e2));
  }
  removeAttributeForAttachment(t2, e2) {
    return this.setDocument(this.document.removeAttributeForAttachment(t2, e2));
  }
  breakFormattedBlock(t2) {
    let { document: e2 } = t2;
    const { block: i2 } = t2;
    let n2 = t2.startPosition, r2 = [n2 - 1, n2];
    i2.getBlockBreakPosition() === t2.startLocation.offset ? (i2.breaksOnReturn() && t2.nextCharacter === "\n" ? n2 += 1 : e2 = e2.removeTextAtRange(r2), r2 = [n2, n2]) : t2.nextCharacter === "\n" ? t2.previousCharacter === "\n" ? r2 = [n2 - 1, n2 + 1] : (r2 = [n2, n2 + 1], n2 += 1) : t2.startLocation.offset - 1 != 0 && (n2 += 1);
    const o2 = new qe([i2.removeLastAttribute().copyWithoutText()]);
    return this.setDocument(e2.insertDocumentAtRange(o2, r2)), this.setSelection(n2);
  }
  getPreviousBlock() {
    const t2 = this.getLocationRange();
    if (t2) {
      const { index: e2 } = t2[0];
      if (e2 > 0)
        return this.document.getBlockAtIndex(e2 - 1);
    }
  }
  getBlock() {
    const t2 = this.getLocationRange();
    if (t2)
      return this.document.getBlockAtIndex(t2[0].index);
  }
  getAttachmentAtRange(t2) {
    const e2 = this.document.getDocumentAtRange(t2);
    if (e2.toString() === "".concat("\uFFFC", "\n"))
      return e2.getAttachments()[0];
  }
  notifyDelegateOfCurrentAttributesChange() {
    var t2, e2;
    return (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.compositionDidChangeCurrentAttributes) === null || e2 === undefined ? undefined : e2.call(t2, this.currentAttributes);
  }
  notifyDelegateOfInsertionAtRange(t2) {
    var e2, i2;
    return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionDidPerformInsertionAtRange) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  translateUTF16PositionFromOffset(t2, e2) {
    const i2 = this.document.toUTF16String(), n2 = i2.offsetFromUCS2Offset(t2);
    return i2.offsetToUCS2Offset(n2 + e2);
  }
}
gi.proxyMethod("getSelectionManager().getPointRange"), gi.proxyMethod("getSelectionManager().setLocationRangeFromPointRange"), gi.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange"), gi.proxyMethod("getSelectionManager().locationIsCursorTarget"), gi.proxyMethod("getSelectionManager().selectionIsExpanded"), gi.proxyMethod("delegate?.getSelectionManager");

class mi extends z {
  constructor(t2) {
    super(...arguments), this.composition = t2, this.undoEntries = [], this.redoEntries = [];
  }
  recordUndoEntry(t2) {
    let { context: e2, consolidatable: i2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const n2 = this.undoEntries.slice(-1)[0];
    if (!i2 || !pi(n2, t2, e2)) {
      const i3 = this.createEntry({ description: t2, context: e2 });
      this.undoEntries.push(i3), this.redoEntries = [];
    }
  }
  undo() {
    const t2 = this.undoEntries.pop();
    if (t2) {
      const e2 = this.createEntry(t2);
      return this.redoEntries.push(e2), this.composition.loadSnapshot(t2.snapshot);
    }
  }
  redo() {
    const t2 = this.redoEntries.pop();
    if (t2) {
      const e2 = this.createEntry(t2);
      return this.undoEntries.push(e2), this.composition.loadSnapshot(t2.snapshot);
    }
  }
  canUndo() {
    return this.undoEntries.length > 0;
  }
  canRedo() {
    return this.redoEntries.length > 0;
  }
  createEntry() {
    let { description: t2, context: e2 } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return { description: t2 == null ? undefined : t2.toString(), context: JSON.stringify(e2), snapshot: this.composition.getSnapshot() };
  }
}
var pi = (t2, e2, i2) => (t2 == null ? undefined : t2.description) === (e2 == null ? undefined : e2.toString()) && (t2 == null ? undefined : t2.context) === JSON.stringify(i2);
var fi = "attachmentGallery";

class bi {
  constructor(t2) {
    this.document = t2.document, this.selectedRange = t2.selectedRange;
  }
  perform() {
    return this.removeBlockAttribute(), this.applyBlockAttribute();
  }
  getSnapshot() {
    return { document: this.document, selectedRange: this.selectedRange };
  }
  removeBlockAttribute() {
    return this.findRangesOfBlocks().map((t2) => this.document = this.document.removeAttributeAtRange(fi, t2));
  }
  applyBlockAttribute() {
    let t2 = 0;
    this.findRangesOfPieces().forEach((e2) => {
      e2[1] - e2[0] > 1 && (e2[0] += t2, e2[1] += t2, this.document.getCharacterAtPosition(e2[1]) !== "\n" && (this.document = this.document.insertBlockBreakAtRange(e2[1]), e2[1] < this.selectedRange[1] && this.moveSelectedRangeForward(), e2[1]++, t2++), e2[0] !== 0 && this.document.getCharacterAtPosition(e2[0] - 1) !== "\n" && (this.document = this.document.insertBlockBreakAtRange(e2[0]), e2[0] < this.selectedRange[0] && this.moveSelectedRangeForward(), e2[0]++, t2++), this.document = this.document.applyBlockAttributeAtRange(fi, true, e2));
    });
  }
  findRangesOfBlocks() {
    return this.document.findRangesForBlockAttribute(fi);
  }
  findRangesOfPieces() {
    return this.document.findRangesForTextAttribute("presentation", { withValue: "gallery" });
  }
  moveSelectedRangeForward() {
    this.selectedRange[0] += 1, this.selectedRange[1] += 1;
  }
}
var vi = function(t2) {
  const e2 = new bi(t2);
  return e2.perform(), e2.getSnapshot();
};
var Ai = [vi];

class xi {
  constructor(t2, e2, i2) {
    this.insertFiles = this.insertFiles.bind(this), this.composition = t2, this.selectionManager = e2, this.element = i2, this.undoManager = new mi(this.composition), this.filters = Ai.slice(0);
  }
  loadDocument(t2) {
    return this.loadSnapshot({ document: t2, selectedRange: [0, 0] });
  }
  loadHTML() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    const e2 = Xe.parse(t2, { referenceElement: this.element }).getDocument();
    return this.loadDocument(e2);
  }
  loadJSON(t2) {
    let { document: e2, selectedRange: i2 } = t2;
    return e2 = qe.fromJSON(e2), this.loadSnapshot({ document: e2, selectedRange: i2 });
  }
  loadSnapshot(t2) {
    return this.undoManager = new mi(this.composition), this.composition.loadSnapshot(t2);
  }
  getDocument() {
    return this.composition.document;
  }
  getSelectedDocument() {
    return this.composition.getSelectedDocument();
  }
  getSnapshot() {
    return this.composition.getSnapshot();
  }
  toJSON() {
    return this.getSnapshot();
  }
  deleteInDirection(t2) {
    return this.composition.deleteInDirection(t2);
  }
  insertAttachment(t2) {
    return this.composition.insertAttachment(t2);
  }
  insertAttachments(t2) {
    return this.composition.insertAttachments(t2);
  }
  insertDocument(t2) {
    return this.composition.insertDocument(t2);
  }
  insertFile(t2) {
    return this.composition.insertFile(t2);
  }
  insertFiles(t2) {
    return this.composition.insertFiles(t2);
  }
  insertHTML(t2) {
    return this.composition.insertHTML(t2);
  }
  insertString(t2) {
    return this.composition.insertString(t2);
  }
  insertText(t2) {
    return this.composition.insertText(t2);
  }
  insertLineBreak() {
    return this.composition.insertLineBreak();
  }
  getSelectedRange() {
    return this.composition.getSelectedRange();
  }
  getPosition() {
    return this.composition.getPosition();
  }
  getClientRectAtPosition(t2) {
    const e2 = this.getDocument().locationRangeFromRange([t2, t2 + 1]);
    return this.selectionManager.getClientRectAtLocationRange(e2);
  }
  expandSelectionInDirection(t2) {
    return this.composition.expandSelectionInDirection(t2);
  }
  moveCursorInDirection(t2) {
    return this.composition.moveCursorInDirection(t2);
  }
  setSelectedRange(t2) {
    return this.composition.setSelectedRange(t2);
  }
  activateAttribute(t2) {
    let e2 = !(arguments.length > 1 && arguments[1] !== undefined) || arguments[1];
    return this.composition.setCurrentAttribute(t2, e2);
  }
  attributeIsActive(t2) {
    return this.composition.hasCurrentAttribute(t2);
  }
  canActivateAttribute(t2) {
    return this.composition.canSetCurrentAttribute(t2);
  }
  deactivateAttribute(t2) {
    return this.composition.removeCurrentAttribute(t2);
  }
  canDecreaseNestingLevel() {
    return this.composition.canDecreaseNestingLevel();
  }
  canIncreaseNestingLevel() {
    return this.composition.canIncreaseNestingLevel();
  }
  decreaseNestingLevel() {
    if (this.canDecreaseNestingLevel())
      return this.composition.decreaseNestingLevel();
  }
  increaseNestingLevel() {
    if (this.canIncreaseNestingLevel())
      return this.composition.increaseNestingLevel();
  }
  canRedo() {
    return this.undoManager.canRedo();
  }
  canUndo() {
    return this.undoManager.canUndo();
  }
  recordUndoEntry(t2) {
    let { context: e2, consolidatable: i2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return this.undoManager.recordUndoEntry(t2, { context: e2, consolidatable: i2 });
  }
  redo() {
    if (this.canRedo())
      return this.undoManager.redo();
  }
  undo() {
    if (this.canUndo())
      return this.undoManager.undo();
  }
}

class yi {
  constructor(t2) {
    this.element = t2;
  }
  findLocationFromContainerAndOffset(t2, e2) {
    let { strict: i2 } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { strict: true }, n2 = 0, r2 = false;
    const o2 = { index: 0, offset: 0 }, s2 = this.findAttachmentElementParentForNode(t2);
    s2 && (t2 = s2.parentNode, e2 = C(s2));
    const a2 = S(this.element, { usingFilter: Ei });
    for (;a2.nextNode(); ) {
      const s3 = a2.currentNode;
      if (s3 === t2 && O(t2)) {
        I(s3) || (o2.offset += e2);
        break;
      }
      if (s3.parentNode === t2) {
        if (n2++ === e2)
          break;
      } else if (!y(t2, s3) && n2 > 0)
        break;
      T(s3, { strict: i2 }) ? (r2 && o2.index++, o2.offset = 0, r2 = true) : o2.offset += Ci(s3);
    }
    return o2;
  }
  findContainerAndOffsetFromLocation(t2) {
    let e2, i2;
    if (t2.index === 0 && t2.offset === 0) {
      for (e2 = this.element, i2 = 0;e2.firstChild; )
        if (e2 = e2.firstChild, w(e2)) {
          i2 = 1;
          break;
        }
      return [e2, i2];
    }
    let [n2, r2] = this.findNodeAndOffsetFromLocation(t2);
    if (n2) {
      if (O(n2))
        Ci(n2) === 0 ? (e2 = n2.parentNode.parentNode, i2 = C(n2.parentNode), I(n2, { name: "right" }) && i2++) : (e2 = n2, i2 = t2.offset - r2);
      else {
        if (e2 = n2.parentNode, !T(n2.previousSibling) && !w(e2))
          for (;n2 === e2.lastChild && (n2 = e2, e2 = e2.parentNode, !w(e2)); )
            ;
        i2 = C(n2), t2.offset !== 0 && i2++;
      }
      return [e2, i2];
    }
  }
  findNodeAndOffsetFromLocation(t2) {
    let e2, i2, n2 = 0;
    for (const r2 of this.getSignificantNodesForIndex(t2.index)) {
      const o2 = Ci(r2);
      if (t2.offset <= n2 + o2)
        if (O(r2)) {
          if (e2 = r2, i2 = n2, t2.offset === i2 && I(e2))
            break;
        } else
          e2 || (e2 = r2, i2 = n2);
      if (n2 += o2, n2 > t2.offset)
        break;
    }
    return [e2, i2];
  }
  findAttachmentElementParentForNode(t2) {
    for (;t2 && t2 !== this.element; ) {
      if (P(t2))
        return t2;
      t2 = t2.parentNode;
    }
  }
  getSignificantNodesForIndex(t2) {
    const e2 = [], i2 = S(this.element, { usingFilter: Ri });
    let n2 = false;
    for (;i2.nextNode(); ) {
      const o2 = i2.currentNode;
      var r2;
      if (B(o2)) {
        if (r2 != null ? r2++ : r2 = 0, r2 === t2)
          n2 = true;
        else if (n2)
          break;
      } else
        n2 && e2.push(o2);
    }
    return e2;
  }
}
var Ci = function(t2) {
  if (t2.nodeType === Node.TEXT_NODE) {
    if (I(t2))
      return 0;
    return t2.textContent.length;
  }
  return E(t2) === "br" || P(t2) ? 1 : 0;
};
var Ri = function(t2) {
  return Si(t2) === NodeFilter.FILTER_ACCEPT ? Ei(t2) : NodeFilter.FILTER_REJECT;
};
var Si = function(t2) {
  return N(t2) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};
var Ei = function(t2) {
  return P(t2.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
};

class ki {
  createDOMRangeFromPoint(t2) {
    let e2, { x: i2, y: n2 } = t2;
    if (document.caretPositionFromPoint) {
      const { offsetNode: t3, offset: r2 } = document.caretPositionFromPoint(i2, n2);
      return e2 = document.createRange(), e2.setStart(t3, r2), e2;
    }
    if (document.caretRangeFromPoint)
      return document.caretRangeFromPoint(i2, n2);
    if (document.body.createTextRange) {
      const t3 = Nt();
      try {
        const t4 = document.body.createTextRange();
        t4.moveToPoint(i2, n2), t4.select();
      } catch (t4) {
      }
      return e2 = Nt(), Ot(t3), e2;
    }
  }
  getClientRectsForDOMRange(t2) {
    const e2 = Array.from(t2.getClientRects());
    return [e2[0], e2[e2.length - 1]];
  }
}

class Li extends z {
  constructor(t2) {
    super(...arguments), this.didMouseDown = this.didMouseDown.bind(this), this.selectionDidChange = this.selectionDidChange.bind(this), this.element = t2, this.locationMapper = new yi(this.element), this.pointMapper = new ki, this.lockCount = 0, f("mousedown", { onElement: this.element, withCallback: this.didMouseDown });
  }
  getLocationRange() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return t2.strict === false ? this.createLocationRangeFromDOMRange(Nt()) : t2.ignoreLock ? this.currentLocationRange : this.lockedLocationRange ? this.lockedLocationRange : this.currentLocationRange;
  }
  setLocationRange(t2) {
    if (this.lockedLocationRange)
      return;
    t2 = Lt(t2);
    const e2 = this.createDOMRangeFromLocationRange(t2);
    e2 && (Ot(e2), this.updateCurrentLocationRange(t2));
  }
  setLocationRangeFromPointRange(t2) {
    t2 = Lt(t2);
    const e2 = this.getLocationAtPoint(t2[0]), i2 = this.getLocationAtPoint(t2[1]);
    this.setLocationRange([e2, i2]);
  }
  getClientRectAtLocationRange(t2) {
    const e2 = this.createDOMRangeFromLocationRange(t2);
    if (e2)
      return this.getClientRectsForDOMRange(e2)[1];
  }
  locationIsCursorTarget(t2) {
    const e2 = Array.from(this.findNodeAndOffsetFromLocation(t2))[0];
    return I(e2);
  }
  lock() {
    this.lockCount++ == 0 && (this.updateCurrentLocationRange(), this.lockedLocationRange = this.getLocationRange());
  }
  unlock() {
    if (--this.lockCount == 0) {
      const { lockedLocationRange: t2 } = this;
      if (this.lockedLocationRange = null, t2 != null)
        return this.setLocationRange(t2);
    }
  }
  clearSelection() {
    var t2;
    return (t2 = Pt()) === null || t2 === undefined ? undefined : t2.removeAllRanges();
  }
  selectionIsCollapsed() {
    var t2;
    return ((t2 = Nt()) === null || t2 === undefined ? undefined : t2.collapsed) === true;
  }
  selectionIsExpanded() {
    return !this.selectionIsCollapsed();
  }
  createLocationRangeFromDOMRange(t2, e2) {
    if (t2 == null || !this.domRangeWithinElement(t2))
      return;
    const i2 = this.findLocationFromContainerAndOffset(t2.startContainer, t2.startOffset, e2);
    if (!i2)
      return;
    const n2 = t2.collapsed ? undefined : this.findLocationFromContainerAndOffset(t2.endContainer, t2.endOffset, e2);
    return Lt([i2, n2]);
  }
  didMouseDown() {
    return this.pauseTemporarily();
  }
  pauseTemporarily() {
    let t2;
    this.paused = true;
    const e2 = () => {
      if (this.paused = false, clearTimeout(i2), Array.from(t2).forEach((t3) => {
        t3.destroy();
      }), y(document, this.element))
        return this.selectionDidChange();
    }, i2 = setTimeout(e2, 200);
    t2 = ["mousemove", "keydown"].map((t3) => f(t3, { onElement: document, withCallback: e2 }));
  }
  selectionDidChange() {
    if (!this.paused && !x(this.element))
      return this.updateCurrentLocationRange();
  }
  updateCurrentLocationRange(t2) {
    var e2, i2;
    if ((t2 != null ? t2 : t2 = this.createLocationRangeFromDOMRange(Nt())) && !wt(t2, this.currentLocationRange))
      return this.currentLocationRange = t2, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.locationRangeDidChange) === null || i2 === undefined ? undefined : i2.call(e2, this.currentLocationRange.slice(0));
  }
  createDOMRangeFromLocationRange(t2) {
    const e2 = this.findContainerAndOffsetFromLocation(t2[0]), i2 = Dt(t2) ? e2 : this.findContainerAndOffsetFromLocation(t2[1]) || e2;
    if (e2 != null && i2 != null) {
      const t3 = document.createRange();
      return t3.setStart(...Array.from(e2 || [])), t3.setEnd(...Array.from(i2 || [])), t3;
    }
  }
  getLocationAtPoint(t2) {
    const e2 = this.createDOMRangeFromPoint(t2);
    var i2;
    if (e2)
      return (i2 = this.createLocationRangeFromDOMRange(e2)) === null || i2 === undefined ? undefined : i2[0];
  }
  domRangeWithinElement(t2) {
    return t2.collapsed ? y(this.element, t2.startContainer) : y(this.element, t2.startContainer) && y(this.element, t2.endContainer);
  }
}
Li.proxyMethod("locationMapper.findLocationFromContainerAndOffset"), Li.proxyMethod("locationMapper.findContainerAndOffsetFromLocation"), Li.proxyMethod("locationMapper.findNodeAndOffsetFromLocation"), Li.proxyMethod("pointMapper.createDOMRangeFromPoint"), Li.proxyMethod("pointMapper.getClientRectsForDOMRange");
var Di = Object.freeze({ __proto__: null, Attachment: Re, AttachmentManager: ui, AttachmentPiece: Se, Block: Be, Composition: gi, Document: qe, Editor: xi, HTMLParser: Xe, HTMLSanitizer: Je, LineBreakInsertion: di, LocationMapper: yi, ManagedAttachment: hi, Piece: ye, PointMapper: ki, SelectionManager: Li, SplittableList: ke, StringPiece: Ee, Text: Te, UndoManager: mi });
var wi = Object.freeze({ __proto__: null, ObjectView: ee, AttachmentView: re, BlockView: de, DocumentView: ge, PieceView: le, PreviewableAttachmentView: ae, TextView: ce });
var { lang: Ti, css: Bi, keyNames: Fi } = V;
var Ii = function(t2) {
  return function() {
    const e2 = t2.apply(this, arguments);
    e2.do(), this.undos || (this.undos = []), this.undos.push(e2.undo);
  };
};

class Pi extends z {
  constructor(t2, e2, i2) {
    let n2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    super(...arguments), Ae(this, "makeElementMutable", Ii(() => ({ do: () => {
      this.element.dataset.trixMutable = true;
    }, undo: () => delete this.element.dataset.trixMutable }))), Ae(this, "addToolbar", Ii(() => {
      const t3 = k({ tagName: "div", className: Bi.attachmentToolbar, data: { trixMutable: true }, childNodes: k({ tagName: "div", className: "trix-button-row", childNodes: k({ tagName: "span", className: "trix-button-group trix-button-group--actions", childNodes: k({ tagName: "button", className: "trix-button trix-button--remove", textContent: Ti.remove, attributes: { title: Ti.remove }, data: { trixAction: "remove" } }) }) }) });
      return this.attachment.isPreviewable() && t3.appendChild(k({ tagName: "div", className: Bi.attachmentMetadataContainer, childNodes: k({ tagName: "span", className: Bi.attachmentMetadata, childNodes: [k({ tagName: "span", className: Bi.attachmentName, textContent: this.attachment.getFilename(), attributes: { title: this.attachment.getFilename() } }), k({ tagName: "span", className: Bi.attachmentSize, textContent: this.attachment.getFormattedFilesize() })] }) })), f("click", { onElement: t3, withCallback: this.didClickToolbar }), f("click", { onElement: t3, matchingSelector: "[data-trix-action]", withCallback: this.didClickActionButton }), b("trix-attachment-before-toolbar", { onElement: this.element, attributes: { toolbar: t3, attachment: this.attachment } }), { do: () => this.element.appendChild(t3), undo: () => R(t3) };
    })), Ae(this, "installCaptionEditor", Ii(() => {
      const t3 = k({ tagName: "textarea", className: Bi.attachmentCaptionEditor, attributes: { placeholder: Ti.captionPlaceholder }, data: { trixMutable: true } });
      t3.value = this.attachmentPiece.getCaption();
      const e3 = t3.cloneNode();
      e3.classList.add("trix-autoresize-clone"), e3.tabIndex = -1;
      const i3 = function() {
        e3.value = t3.value, t3.style.height = e3.scrollHeight + "px";
      };
      f("input", { onElement: t3, withCallback: i3 }), f("input", { onElement: t3, withCallback: this.didInputCaption }), f("keydown", { onElement: t3, withCallback: this.didKeyDownCaption }), f("change", { onElement: t3, withCallback: this.didChangeCaption }), f("blur", { onElement: t3, withCallback: this.didBlurCaption });
      const n3 = this.element.querySelector("figcaption"), r2 = n3.cloneNode();
      return { do: () => {
        if (n3.style.display = "none", r2.appendChild(t3), r2.appendChild(e3), r2.classList.add("".concat(Bi.attachmentCaption, "--editing")), n3.parentElement.insertBefore(r2, n3), i3(), this.options.editCaption)
          return St(() => t3.focus());
      }, undo() {
        R(r2), n3.style.display = null;
      } };
    })), this.didClickToolbar = this.didClickToolbar.bind(this), this.didClickActionButton = this.didClickActionButton.bind(this), this.didKeyDownCaption = this.didKeyDownCaption.bind(this), this.didInputCaption = this.didInputCaption.bind(this), this.didChangeCaption = this.didChangeCaption.bind(this), this.didBlurCaption = this.didBlurCaption.bind(this), this.attachmentPiece = t2, this.element = e2, this.container = i2, this.options = n2, this.attachment = this.attachmentPiece.attachment, E(this.element) === "a" && (this.element = this.element.firstChild), this.install();
  }
  install() {
    this.makeElementMutable(), this.addToolbar(), this.attachment.isPreviewable() && this.installCaptionEditor();
  }
  uninstall() {
    var t2;
    let e2 = this.undos.pop();
    for (this.savePendingCaption();e2; )
      e2(), e2 = this.undos.pop();
    (t2 = this.delegate) === null || t2 === undefined || t2.didUninstallAttachmentEditor(this);
  }
  savePendingCaption() {
    if (this.pendingCaption != null) {
      const r2 = this.pendingCaption;
      var t2, e2, i2, n2;
      if (this.pendingCaption = null, r2)
        (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.attachmentEditorDidRequestUpdatingAttributesForAttachment) === null || e2 === undefined || e2.call(t2, { caption: r2 }, this.attachment);
      else
        (i2 = this.delegate) === null || i2 === undefined || (n2 = i2.attachmentEditorDidRequestRemovingAttributeForAttachment) === null || n2 === undefined || n2.call(i2, "caption", this.attachment);
    }
  }
  didClickToolbar(t2) {
    return t2.preventDefault(), t2.stopPropagation();
  }
  didClickActionButton(t2) {
    var e2;
    if (t2.target.getAttribute("data-trix-action") === "remove")
      return (e2 = this.delegate) === null || e2 === undefined ? undefined : e2.attachmentEditorDidRequestRemovalOfAttachment(this.attachment);
  }
  didKeyDownCaption(t2) {
    var e2, i2;
    if (Fi[t2.keyCode] === "return")
      return t2.preventDefault(), this.savePendingCaption(), (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.attachmentEditorDidRequestDeselectingAttachment) === null || i2 === undefined ? undefined : i2.call(e2, this.attachment);
  }
  didInputCaption(t2) {
    this.pendingCaption = t2.target.value.replace(/\s/g, " ").trim();
  }
  didChangeCaption(t2) {
    return this.savePendingCaption();
  }
  didBlurCaption(t2) {
    return this.savePendingCaption();
  }
}

class Ni extends z {
  constructor(t2, i2) {
    super(...arguments), this.didFocus = this.didFocus.bind(this), this.didBlur = this.didBlur.bind(this), this.didClickAttachment = this.didClickAttachment.bind(this), this.element = t2, this.composition = i2, this.documentView = new ge(this.composition.document, { element: this.element }), f("focus", { onElement: this.element, withCallback: this.didFocus }), f("blur", { onElement: this.element, withCallback: this.didBlur }), f("click", { onElement: this.element, matchingSelector: "a[contenteditable=false]", preventDefault: true }), f("mousedown", { onElement: this.element, matchingSelector: e, withCallback: this.didClickAttachment }), f("click", { onElement: this.element, matchingSelector: "a".concat(e), preventDefault: true });
  }
  didFocus(t2) {
    var e2;
    const i2 = () => {
      var t3, e3;
      if (!this.focused)
        return this.focused = true, (t3 = this.delegate) === null || t3 === undefined || (e3 = t3.compositionControllerDidFocus) === null || e3 === undefined ? undefined : e3.call(t3);
    };
    return ((e2 = this.blurPromise) === null || e2 === undefined ? undefined : e2.then(i2)) || i2();
  }
  didBlur(t2) {
    this.blurPromise = new Promise((t3) => St(() => {
      var e2, i2;
      x(this.element) || (this.focused = null, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionControllerDidBlur) === null || i2 === undefined || i2.call(e2));
      return this.blurPromise = null, t3();
    }));
  }
  didClickAttachment(t2, e2) {
    var i2, n2;
    const r2 = this.findAttachmentForElement(e2), o2 = !!A(t2.target, { matchingSelector: "figcaption" });
    return (i2 = this.delegate) === null || i2 === undefined || (n2 = i2.compositionControllerDidSelectAttachment) === null || n2 === undefined ? undefined : n2.call(i2, r2, { editCaption: o2 });
  }
  getSerializableElement() {
    return this.isEditingAttachment() ? this.documentView.shadowElement : this.element;
  }
  render() {
    var t2, e2, i2, n2, r2, o2;
    (this.revision !== this.composition.revision && (this.documentView.setDocument(this.composition.document), this.documentView.render(), this.revision = this.composition.revision), this.canSyncDocumentView() && !this.documentView.isSynced()) && ((i2 = this.delegate) === null || i2 === undefined || (n2 = i2.compositionControllerWillSyncDocumentView) === null || n2 === undefined || n2.call(i2), this.documentView.sync(), (r2 = this.delegate) === null || r2 === undefined || (o2 = r2.compositionControllerDidSyncDocumentView) === null || o2 === undefined || o2.call(r2));
    return (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.compositionControllerDidRender) === null || e2 === undefined ? undefined : e2.call(t2);
  }
  rerenderViewForObject(t2) {
    return this.invalidateViewForObject(t2), this.render();
  }
  invalidateViewForObject(t2) {
    return this.documentView.invalidateViewForObject(t2);
  }
  isViewCachingEnabled() {
    return this.documentView.isViewCachingEnabled();
  }
  enableViewCaching() {
    return this.documentView.enableViewCaching();
  }
  disableViewCaching() {
    return this.documentView.disableViewCaching();
  }
  refreshViewCache() {
    return this.documentView.garbageCollectCachedViews();
  }
  isEditingAttachment() {
    return !!this.attachmentEditor;
  }
  installAttachmentEditorForAttachment(t2, e2) {
    var i2;
    if (((i2 = this.attachmentEditor) === null || i2 === undefined ? undefined : i2.attachment) === t2)
      return;
    const n2 = this.documentView.findElementForObject(t2);
    if (!n2)
      return;
    this.uninstallAttachmentEditor();
    const r2 = this.composition.document.getAttachmentPieceForAttachment(t2);
    this.attachmentEditor = new Pi(r2, n2, this.element, e2), this.attachmentEditor.delegate = this;
  }
  uninstallAttachmentEditor() {
    var t2;
    return (t2 = this.attachmentEditor) === null || t2 === undefined ? undefined : t2.uninstall();
  }
  didUninstallAttachmentEditor() {
    return this.attachmentEditor = null, this.render();
  }
  attachmentEditorDidRequestUpdatingAttributesForAttachment(t2, e2) {
    var i2, n2;
    return (i2 = this.delegate) === null || i2 === undefined || (n2 = i2.compositionControllerWillUpdateAttachment) === null || n2 === undefined || n2.call(i2, e2), this.composition.updateAttributesForAttachment(t2, e2);
  }
  attachmentEditorDidRequestRemovingAttributeForAttachment(t2, e2) {
    var i2, n2;
    return (i2 = this.delegate) === null || i2 === undefined || (n2 = i2.compositionControllerWillUpdateAttachment) === null || n2 === undefined || n2.call(i2, e2), this.composition.removeAttributeForAttachment(t2, e2);
  }
  attachmentEditorDidRequestRemovalOfAttachment(t2) {
    var e2, i2;
    return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionControllerDidRequestRemovalOfAttachment) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  attachmentEditorDidRequestDeselectingAttachment(t2) {
    var e2, i2;
    return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.compositionControllerDidRequestDeselectingAttachment) === null || i2 === undefined ? undefined : i2.call(e2, t2);
  }
  canSyncDocumentView() {
    return !this.isEditingAttachment();
  }
  findAttachmentForElement(t2) {
    return this.composition.document.getAttachmentById(parseInt(t2.dataset.trixId, 10));
  }
}

class Oi extends z {
}
var Mi = "data-trix-mutable";
var ji = "[".concat(Mi, "]");
var Wi = { attributes: true, childList: true, characterData: true, characterDataOldValue: true, subtree: true };

class Ui extends z {
  constructor(t2) {
    super(t2), this.didMutate = this.didMutate.bind(this), this.element = t2, this.observer = new window.MutationObserver(this.didMutate), this.start();
  }
  start() {
    return this.reset(), this.observer.observe(this.element, Wi);
  }
  stop() {
    return this.observer.disconnect();
  }
  didMutate(t2) {
    var e2, i2;
    if (this.mutations.push(...Array.from(this.findSignificantMutations(t2) || [])), this.mutations.length)
      return (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.elementDidMutate) === null || i2 === undefined || i2.call(e2, this.getMutationSummary()), this.reset();
  }
  reset() {
    this.mutations = [];
  }
  findSignificantMutations(t2) {
    return t2.filter((t3) => this.mutationIsSignificant(t3));
  }
  mutationIsSignificant(t2) {
    if (this.nodeIsMutable(t2.target))
      return false;
    for (const e2 of Array.from(this.nodesModifiedByMutation(t2)))
      if (this.nodeIsSignificant(e2))
        return true;
    return false;
  }
  nodeIsSignificant(t2) {
    return t2 !== this.element && !this.nodeIsMutable(t2) && !N(t2);
  }
  nodeIsMutable(t2) {
    return A(t2, { matchingSelector: ji });
  }
  nodesModifiedByMutation(t2) {
    const e2 = [];
    switch (t2.type) {
      case "attributes":
        t2.attributeName !== Mi && e2.push(t2.target);
        break;
      case "characterData":
        e2.push(t2.target.parentNode), e2.push(t2.target);
        break;
      case "childList":
        e2.push(...Array.from(t2.addedNodes || [])), e2.push(...Array.from(t2.removedNodes || []));
    }
    return e2;
  }
  getMutationSummary() {
    return this.getTextMutationSummary();
  }
  getTextMutationSummary() {
    const { additions: t2, deletions: e2 } = this.getTextChangesFromCharacterData(), i2 = this.getTextChangesFromChildList();
    Array.from(i2.additions).forEach((e3) => {
      Array.from(t2).includes(e3) || t2.push(e3);
    }), e2.push(...Array.from(i2.deletions || []));
    const n2 = {}, r2 = t2.join("");
    r2 && (n2.textAdded = r2);
    const o2 = e2.join("");
    return o2 && (n2.textDeleted = o2), n2;
  }
  getMutationsByType(t2) {
    return Array.from(this.mutations).filter((e2) => e2.type === t2);
  }
  getTextChangesFromChildList() {
    let t2, e2;
    const i2 = [], n2 = [];
    Array.from(this.getMutationsByType("childList")).forEach((t3) => {
      i2.push(...Array.from(t3.addedNodes || [])), n2.push(...Array.from(t3.removedNodes || []));
    });
    i2.length === 0 && n2.length === 1 && B(n2[0]) ? (t2 = [], e2 = ["\n"]) : (t2 = qi(i2), e2 = qi(n2));
    return { additions: t2.filter((t3, i3) => t3 !== e2[i3]).map(Wt), deletions: e2.filter((e3, i3) => e3 !== t2[i3]).map(Wt) };
  }
  getTextChangesFromCharacterData() {
    let t2, e2;
    const i2 = this.getMutationsByType("characterData");
    if (i2.length) {
      const n2 = i2[0], r2 = i2[i2.length - 1], o2 = function(t3, e3) {
        let i3, n3;
        return t3 = X.box(t3), (e3 = X.box(e3)).length < t3.length ? [n3, i3] = Vt(t3, e3) : [i3, n3] = Vt(e3, t3), { added: i3, removed: n3 };
      }(Wt(n2.oldValue), Wt(r2.target.data));
      t2 = o2.added, e2 = o2.removed;
    }
    return { additions: t2 ? [t2] : [], deletions: e2 ? [e2] : [] };
  }
}
var qi = function() {
  let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  const e2 = [];
  for (const i2 of Array.from(t2))
    switch (i2.nodeType) {
      case Node.TEXT_NODE:
        e2.push(i2.data);
        break;
      case Node.ELEMENT_NODE:
        E(i2) === "br" ? e2.push("\n") : e2.push(...Array.from(qi(i2.childNodes) || []));
    }
  return e2;
};

class Vi extends te {
  constructor(t2) {
    super(...arguments), this.file = t2;
  }
  perform(t2) {
    const e2 = new FileReader;
    return e2.onerror = () => t2(false), e2.onload = () => {
      e2.onerror = null;
      try {
        e2.abort();
      } catch (t3) {
      }
      return t2(true, this.file);
    }, e2.readAsArrayBuffer(this.file);
  }
}

class zi {
  constructor(t2) {
    this.element = t2;
  }
  shouldIgnore(t2) {
    return !!a.samsungAndroid && (this.previousEvent = this.event, this.event = t2, this.checkSamsungKeyboardBuggyModeStart(), this.checkSamsungKeyboardBuggyModeEnd(), this.buggyMode);
  }
  checkSamsungKeyboardBuggyModeStart() {
    this.insertingLongTextAfterUnidentifiedChar() && _i(this.element.innerText, this.event.data) && (this.buggyMode = true, this.event.preventDefault());
  }
  checkSamsungKeyboardBuggyModeEnd() {
    this.buggyMode && this.event.inputType !== "insertText" && (this.buggyMode = false);
  }
  insertingLongTextAfterUnidentifiedChar() {
    var t2;
    return this.isBeforeInputInsertText() && this.previousEventWasUnidentifiedKeydown() && ((t2 = this.event.data) === null || t2 === undefined ? undefined : t2.length) > 50;
  }
  isBeforeInputInsertText() {
    return this.event.type === "beforeinput" && this.event.inputType === "insertText";
  }
  previousEventWasUnidentifiedKeydown() {
    var t2, e2;
    return ((t2 = this.previousEvent) === null || t2 === undefined ? undefined : t2.type) === "keydown" && ((e2 = this.previousEvent) === null || e2 === undefined ? undefined : e2.key) === "Unidentified";
  }
}
var _i = (t2, e2) => Ji(t2) === Ji(e2);
var Hi = new RegExp("(".concat("\uFFFC", "|").concat(u, "|").concat(d, "|\\s)+"), "g");
var Ji = (t2) => t2.replace(Hi, " ").trim();

class Ki extends z {
  constructor(t2) {
    super(...arguments), this.element = t2, this.mutationObserver = new Ui(this.element), this.mutationObserver.delegate = this, this.flakyKeyboardDetector = new zi(this.element);
    for (const t3 in this.constructor.events)
      f(t3, { onElement: this.element, withCallback: this.handlerFor(t3) });
  }
  elementDidMutate(t2) {
  }
  editorWillSyncDocumentView() {
    return this.mutationObserver.stop();
  }
  editorDidSyncDocumentView() {
    return this.mutationObserver.start();
  }
  requestRender() {
    var t2, e2;
    return (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.inputControllerDidRequestRender) === null || e2 === undefined ? undefined : e2.call(t2);
  }
  requestReparse() {
    var t2, e2;
    return (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.inputControllerDidRequestReparse) === null || e2 === undefined || e2.call(t2), this.requestRender();
  }
  attachFiles(t2) {
    const e2 = Array.from(t2).map((t3) => new Vi(t3));
    return Promise.all(e2).then((t3) => {
      this.handleInput(function() {
        var e3, i2;
        return (e3 = this.delegate) === null || e3 === undefined || e3.inputControllerWillAttachFiles(), (i2 = this.responder) === null || i2 === undefined || i2.insertFiles(t3), this.requestRender();
      });
    });
  }
  handlerFor(t2) {
    return (e2) => {
      e2.defaultPrevented || this.handleInput(() => {
        if (!x(this.element)) {
          if (this.flakyKeyboardDetector.shouldIgnore(e2))
            return;
          this.eventName = t2, this.constructor.events[t2].call(this, e2);
        }
      });
    };
  }
  handleInput(t2) {
    try {
      var e2;
      (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillHandleInput(), t2.call(this);
    } finally {
      var i2;
      (i2 = this.delegate) === null || i2 === undefined || i2.inputControllerDidHandleInput();
    }
  }
  createLinkHTML(t2, e2) {
    const i2 = document.createElement("a");
    return i2.href = t2, i2.textContent = e2 || t2, i2.outerHTML;
  }
}
var Gi;
Ae(Ki, "events", {});
var { browser: $i, keyNames: Xi } = V;
var Yi = 0;

class Qi extends Ki {
  constructor() {
    super(...arguments), this.resetInputSummary();
  }
  setInputSummary() {
    let t2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.inputSummary.eventName = this.eventName;
    for (const e2 in t2) {
      const i2 = t2[e2];
      this.inputSummary[e2] = i2;
    }
    return this.inputSummary;
  }
  resetInputSummary() {
    this.inputSummary = {};
  }
  reset() {
    return this.resetInputSummary(), It.reset();
  }
  elementDidMutate(t2) {
    var e2, i2;
    return this.isComposing() ? (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.inputControllerDidAllowUnhandledInput) === null || i2 === undefined ? undefined : i2.call(e2) : this.handleInput(function() {
      return this.mutationIsSignificant(t2) && (this.mutationIsExpected(t2) ? this.requestRender() : this.requestReparse()), this.reset();
    });
  }
  mutationIsExpected(t2) {
    let { textAdded: e2, textDeleted: i2 } = t2;
    if (this.inputSummary.preferDocument)
      return true;
    const n2 = e2 != null ? e2 === this.inputSummary.textAdded : !this.inputSummary.textAdded, r2 = i2 != null ? this.inputSummary.didDelete : !this.inputSummary.didDelete, o2 = ["\n", " \n"].includes(e2) && !n2, s2 = i2 === "\n" && !r2;
    if (o2 && !s2 || s2 && !o2) {
      const t3 = this.getSelectedRange();
      if (t3) {
        var a2;
        const i3 = o2 ? e2.replace(/\n$/, "").length || -1 : (e2 == null ? undefined : e2.length) || 1;
        if ((a2 = this.responder) !== null && a2 !== undefined && a2.positionIsBlockBreak(t3[1] + i3))
          return true;
      }
    }
    return n2 && r2;
  }
  mutationIsSignificant(t2) {
    var e2;
    const i2 = Object.keys(t2).length > 0, n2 = ((e2 = this.compositionInput) === null || e2 === undefined ? undefined : e2.getEndData()) === "";
    return i2 || !n2;
  }
  getCompositionInput() {
    if (this.isComposing())
      return this.compositionInput;
    this.compositionInput = new rn(this);
  }
  isComposing() {
    return this.compositionInput && !this.compositionInput.isEnded();
  }
  deleteInDirection(t2, e2) {
    var i2;
    return ((i2 = this.responder) === null || i2 === undefined ? undefined : i2.deleteInDirection(t2)) !== false ? this.setInputSummary({ didDelete: true }) : e2 ? (e2.preventDefault(), this.requestRender()) : undefined;
  }
  serializeSelectionToDataTransfer(t2) {
    var e2;
    if (!function(t3) {
      if (t3 == null || !t3.setData)
        return false;
      for (const e3 in yt) {
        const i3 = yt[e3];
        try {
          if (t3.setData(e3, i3), !t3.getData(e3) === i3)
            return false;
        } catch (t4) {
          return false;
        }
      }
      return true;
    }(t2))
      return;
    const i2 = (e2 = this.responder) === null || e2 === undefined ? undefined : e2.getSelectedDocument().toSerializableDocument();
    return t2.setData("application/x-trix-document", JSON.stringify(i2)), t2.setData("text/html", ge.render(i2).innerHTML), t2.setData("text/plain", i2.toString().replace(/\n$/, "")), true;
  }
  canAcceptDataTransfer(t2) {
    const e2 = {};
    return Array.from((t2 == null ? undefined : t2.types) || []).forEach((t3) => {
      e2[t3] = true;
    }), e2.Files || e2["application/x-trix-document"] || e2["text/html"] || e2["text/plain"];
  }
  getPastedHTMLUsingHiddenElement(t2) {
    const e2 = this.getSelectedRange(), i2 = { position: "absolute", left: "".concat(window.pageXOffset, "px"), top: "".concat(window.pageYOffset, "px"), opacity: 0 }, n2 = k({ style: i2, tagName: "div", editable: true });
    return document.body.appendChild(n2), n2.focus(), requestAnimationFrame(() => {
      const i3 = n2.innerHTML;
      return R(n2), this.setSelectedRange(e2), t2(i3);
    });
  }
}
Ae(Qi, "events", { keydown(t2) {
  this.isComposing() || this.resetInputSummary(), this.inputSummary.didInput = true;
  const e2 = Xi[t2.keyCode];
  if (e2) {
    var i2;
    let n3 = this.keys;
    ["ctrl", "alt", "shift", "meta"].forEach((e3) => {
      var i3;
      t2["".concat(e3, "Key")] && (e3 === "ctrl" && (e3 = "control"), n3 = (i3 = n3) === null || i3 === undefined ? undefined : i3[e3]);
    }), ((i2 = n3) === null || i2 === undefined ? undefined : i2[e2]) != null && (this.setInputSummary({ keyName: e2 }), It.reset(), n3[e2].call(this, t2));
  }
  if (Rt(t2)) {
    const e3 = String.fromCharCode(t2.keyCode).toLowerCase();
    if (e3) {
      var n2;
      const i3 = ["alt", "shift"].map((e4) => {
        if (t2["".concat(e4, "Key")])
          return e4;
      }).filter((t3) => t3);
      i3.push(e3), (n2 = this.delegate) !== null && n2 !== undefined && n2.inputControllerDidReceiveKeyboardCommand(i3) && t2.preventDefault();
    }
  }
}, keypress(t2) {
  if (this.inputSummary.eventName != null)
    return;
  if (t2.metaKey)
    return;
  if (t2.ctrlKey && !t2.altKey)
    return;
  const e2 = en(t2);
  var i2, n2;
  return e2 ? ((i2 = this.delegate) === null || i2 === undefined || i2.inputControllerWillPerformTyping(), (n2 = this.responder) === null || n2 === undefined || n2.insertString(e2), this.setInputSummary({ textAdded: e2, didDelete: this.selectionIsExpanded() })) : undefined;
}, textInput(t2) {
  const { data: e2 } = t2, { textAdded: i2 } = this.inputSummary;
  if (i2 && i2 !== e2 && i2.toUpperCase() === e2) {
    var n2;
    const t3 = this.getSelectedRange();
    return this.setSelectedRange([t3[0], t3[1] + i2.length]), (n2 = this.responder) === null || n2 === undefined || n2.insertString(e2), this.setInputSummary({ textAdded: e2 }), this.setSelectedRange(t3);
  }
}, dragenter(t2) {
  t2.preventDefault();
}, dragstart(t2) {
  var e2, i2;
  return this.serializeSelectionToDataTransfer(t2.dataTransfer), this.draggedRange = this.getSelectedRange(), (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.inputControllerDidStartDrag) === null || i2 === undefined ? undefined : i2.call(e2);
}, dragover(t2) {
  if (this.draggedRange || this.canAcceptDataTransfer(t2.dataTransfer)) {
    t2.preventDefault();
    const n2 = { x: t2.clientX, y: t2.clientY };
    var e2, i2;
    if (!kt(n2, this.draggingPoint))
      return this.draggingPoint = n2, (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.inputControllerDidReceiveDragOverPoint) === null || i2 === undefined ? undefined : i2.call(e2, this.draggingPoint);
  }
}, dragend(t2) {
  var e2, i2;
  (e2 = this.delegate) === null || e2 === undefined || (i2 = e2.inputControllerDidCancelDrag) === null || i2 === undefined || i2.call(e2), this.draggedRange = null, this.draggingPoint = null;
}, drop(t2) {
  var e2, i2;
  t2.preventDefault();
  const n2 = (e2 = t2.dataTransfer) === null || e2 === undefined ? undefined : e2.files, r2 = t2.dataTransfer.getData("application/x-trix-document"), o2 = { x: t2.clientX, y: t2.clientY };
  if ((i2 = this.responder) === null || i2 === undefined || i2.setLocationRangeFromPointRange(o2), n2 != null && n2.length)
    this.attachFiles(n2);
  else if (this.draggedRange) {
    var s2, a2;
    (s2 = this.delegate) === null || s2 === undefined || s2.inputControllerWillMoveText(), (a2 = this.responder) === null || a2 === undefined || a2.moveTextFromRange(this.draggedRange), this.draggedRange = null, this.requestRender();
  } else if (r2) {
    var l2;
    const t3 = qe.fromJSONString(r2);
    (l2 = this.responder) === null || l2 === undefined || l2.insertDocument(t3), this.requestRender();
  }
  this.draggedRange = null, this.draggingPoint = null;
}, cut(t2) {
  var e2, i2;
  if ((e2 = this.responder) !== null && e2 !== undefined && e2.selectionIsExpanded() && (this.serializeSelectionToDataTransfer(t2.clipboardData) && t2.preventDefault(), (i2 = this.delegate) === null || i2 === undefined || i2.inputControllerWillCutText(), this.deleteInDirection("backward"), t2.defaultPrevented))
    return this.requestRender();
}, copy(t2) {
  var e2;
  (e2 = this.responder) !== null && e2 !== undefined && e2.selectionIsExpanded() && this.serializeSelectionToDataTransfer(t2.clipboardData) && t2.preventDefault();
}, paste(t2) {
  const e2 = t2.clipboardData || t2.testClipboardData, i2 = { clipboard: e2 };
  if (!e2 || nn(t2))
    return void this.getPastedHTMLUsingHiddenElement((t3) => {
      var e3, n3, r3;
      return i2.type = "text/html", i2.html = t3, (e3 = this.delegate) === null || e3 === undefined || e3.inputControllerWillPaste(i2), (n3 = this.responder) === null || n3 === undefined || n3.insertHTML(i2.html), this.requestRender(), (r3 = this.delegate) === null || r3 === undefined ? undefined : r3.inputControllerDidPaste(i2);
    });
  const n2 = e2.getData("URL"), r2 = e2.getData("text/html"), o2 = e2.getData("public.url-name");
  if (n2) {
    var s2, a2, l2;
    let t3;
    i2.type = "text/html", t3 = o2 ? qt(o2).trim() : n2, i2.html = this.createLinkHTML(n2, t3), (s2 = this.delegate) === null || s2 === undefined || s2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: t3, didDelete: this.selectionIsExpanded() }), (a2 = this.responder) === null || a2 === undefined || a2.insertHTML(i2.html), this.requestRender(), (l2 = this.delegate) === null || l2 === undefined || l2.inputControllerDidPaste(i2);
  } else if (Ct(e2)) {
    var c2, h2, u2;
    i2.type = "text/plain", i2.string = e2.getData("text/plain"), (c2 = this.delegate) === null || c2 === undefined || c2.inputControllerWillPaste(i2), this.setInputSummary({ textAdded: i2.string, didDelete: this.selectionIsExpanded() }), (h2 = this.responder) === null || h2 === undefined || h2.insertString(i2.string), this.requestRender(), (u2 = this.delegate) === null || u2 === undefined || u2.inputControllerDidPaste(i2);
  } else if (r2) {
    var d2, g2, m2;
    i2.type = "text/html", i2.html = r2, (d2 = this.delegate) === null || d2 === undefined || d2.inputControllerWillPaste(i2), (g2 = this.responder) === null || g2 === undefined || g2.insertHTML(i2.html), this.requestRender(), (m2 = this.delegate) === null || m2 === undefined || m2.inputControllerDidPaste(i2);
  } else if (Array.from(e2.types).includes("Files")) {
    var p2, f2;
    const t3 = (p2 = e2.items) === null || p2 === undefined || (p2 = p2[0]) === null || p2 === undefined || (f2 = p2.getAsFile) === null || f2 === undefined ? undefined : f2.call(p2);
    if (t3) {
      var b2, v2, A2;
      const e3 = Zi(t3);
      !t3.name && e3 && (t3.name = "pasted-file-".concat(++Yi, ".").concat(e3)), i2.type = "File", i2.file = t3, (b2 = this.delegate) === null || b2 === undefined || b2.inputControllerWillAttachFiles(), (v2 = this.responder) === null || v2 === undefined || v2.insertFile(i2.file), this.requestRender(), (A2 = this.delegate) === null || A2 === undefined || A2.inputControllerDidPaste(i2);
    }
  }
  t2.preventDefault();
}, compositionstart(t2) {
  return this.getCompositionInput().start(t2.data);
}, compositionupdate(t2) {
  return this.getCompositionInput().update(t2.data);
}, compositionend(t2) {
  return this.getCompositionInput().end(t2.data);
}, beforeinput(t2) {
  this.inputSummary.didInput = true;
}, input(t2) {
  return this.inputSummary.didInput = true, t2.stopPropagation();
} }), Ae(Qi, "keys", { backspace(t2) {
  var e2;
  return (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t2);
}, delete(t2) {
  var e2;
  return (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t2);
}, return(t2) {
  var e2, i2;
  return this.setInputSummary({ preferDocument: true }), (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), (i2 = this.responder) === null || i2 === undefined ? undefined : i2.insertLineBreak();
}, tab(t2) {
  var e2, i2;
  (e2 = this.responder) !== null && e2 !== undefined && e2.canIncreaseNestingLevel() && ((i2 = this.responder) === null || i2 === undefined || i2.increaseNestingLevel(), this.requestRender(), t2.preventDefault());
}, left(t2) {
  var e2;
  if (this.selectionIsInCursorTarget())
    return t2.preventDefault(), (e2 = this.responder) === null || e2 === undefined ? undefined : e2.moveCursorInDirection("backward");
}, right(t2) {
  var e2;
  if (this.selectionIsInCursorTarget())
    return t2.preventDefault(), (e2 = this.responder) === null || e2 === undefined ? undefined : e2.moveCursorInDirection("forward");
}, control: { d(t2) {
  var e2;
  return (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), this.deleteInDirection("forward", t2);
}, h(t2) {
  var e2;
  return (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), this.deleteInDirection("backward", t2);
}, o(t2) {
  var e2, i2;
  return t2.preventDefault(), (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), (i2 = this.responder) === null || i2 === undefined || i2.insertString("\n", { updatePosition: false }), this.requestRender();
} }, shift: { return(t2) {
  var e2, i2;
  (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), (i2 = this.responder) === null || i2 === undefined || i2.insertString("\n"), this.requestRender(), t2.preventDefault();
}, tab(t2) {
  var e2, i2;
  (e2 = this.responder) !== null && e2 !== undefined && e2.canDecreaseNestingLevel() && ((i2 = this.responder) === null || i2 === undefined || i2.decreaseNestingLevel(), this.requestRender(), t2.preventDefault());
}, left(t2) {
  if (this.selectionIsInCursorTarget())
    return t2.preventDefault(), this.expandSelectionInDirection("backward");
}, right(t2) {
  if (this.selectionIsInCursorTarget())
    return t2.preventDefault(), this.expandSelectionInDirection("forward");
} }, alt: { backspace(t2) {
  var e2;
  return this.setInputSummary({ preferDocument: false }), (e2 = this.delegate) === null || e2 === undefined ? undefined : e2.inputControllerWillPerformTyping();
} }, meta: { backspace(t2) {
  var e2;
  return this.setInputSummary({ preferDocument: false }), (e2 = this.delegate) === null || e2 === undefined ? undefined : e2.inputControllerWillPerformTyping();
} } }), Qi.proxyMethod("responder?.getSelectedRange"), Qi.proxyMethod("responder?.setSelectedRange"), Qi.proxyMethod("responder?.expandSelectionInDirection"), Qi.proxyMethod("responder?.selectionIsInCursorTarget"), Qi.proxyMethod("responder?.selectionIsExpanded");
var Zi = (t2) => {
  var e2;
  return (e2 = t2.type) === null || e2 === undefined || (e2 = e2.match(/\/(\w+)$/)) === null || e2 === undefined ? undefined : e2[1];
};
var tn = !((Gi = " ".codePointAt) === null || Gi === undefined || !Gi.call(" ", 0));
var en = function(t2) {
  if (t2.key && tn && t2.key.codePointAt(0) === t2.keyCode)
    return t2.key;
  {
    let e2;
    if (t2.which === null ? e2 = t2.keyCode : t2.which !== 0 && t2.charCode !== 0 && (e2 = t2.charCode), e2 != null && Xi[e2] !== "escape")
      return X.fromCodepoints([e2]).toString();
  }
};
var nn = function(t2) {
  const e2 = t2.clipboardData;
  if (e2) {
    if (e2.types.includes("text/html")) {
      for (const t3 of e2.types) {
        const i2 = /^CorePasteboardFlavorType/.test(t3), n2 = /^dyn\./.test(t3) && e2.getData(t3);
        if (i2 || n2)
          return true;
      }
      return false;
    }
    {
      const t3 = e2.types.includes("com.apple.webarchive"), i2 = e2.types.includes("com.apple.flat-rtfd");
      return t3 || i2;
    }
  }
};

class rn extends z {
  constructor(t2) {
    super(...arguments), this.inputController = t2, this.responder = this.inputController.responder, this.delegate = this.inputController.delegate, this.inputSummary = this.inputController.inputSummary, this.data = {};
  }
  start(t2) {
    if (this.data.start = t2, this.isSignificant()) {
      var e2, i2;
      if (this.inputSummary.eventName === "keypress" && this.inputSummary.textAdded)
        (i2 = this.responder) === null || i2 === undefined || i2.deleteInDirection("left");
      this.selectionIsExpanded() || (this.insertPlaceholder(), this.requestRender()), this.range = (e2 = this.responder) === null || e2 === undefined ? undefined : e2.getSelectedRange();
    }
  }
  update(t2) {
    if (this.data.update = t2, this.isSignificant()) {
      const t3 = this.selectPlaceholder();
      t3 && (this.forgetPlaceholder(), this.range = t3);
    }
  }
  end(t2) {
    return this.data.end = t2, this.isSignificant() ? (this.forgetPlaceholder(), this.canApplyToDocument() ? (this.setInputSummary({ preferDocument: true, didInput: false }), (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), (i2 = this.responder) === null || i2 === undefined || i2.setSelectedRange(this.range), (n2 = this.responder) === null || n2 === undefined || n2.insertString(this.data.end), (r2 = this.responder) === null || r2 === undefined ? undefined : r2.setSelectedRange(this.range[0] + this.data.end.length)) : this.data.start != null || this.data.update != null ? (this.requestReparse(), this.inputController.reset()) : undefined) : this.inputController.reset();
    var e2, i2, n2, r2;
  }
  getEndData() {
    return this.data.end;
  }
  isEnded() {
    return this.getEndData() != null;
  }
  isSignificant() {
    return !$i.composesExistingText || this.inputSummary.didInput;
  }
  canApplyToDocument() {
    var t2, e2;
    return ((t2 = this.data.start) === null || t2 === undefined ? undefined : t2.length) === 0 && ((e2 = this.data.end) === null || e2 === undefined ? undefined : e2.length) > 0 && this.range;
  }
}
rn.proxyMethod("inputController.setInputSummary"), rn.proxyMethod("inputController.requestRender"), rn.proxyMethod("inputController.requestReparse"), rn.proxyMethod("responder?.selectionIsExpanded"), rn.proxyMethod("responder?.insertPlaceholder"), rn.proxyMethod("responder?.selectPlaceholder"), rn.proxyMethod("responder?.forgetPlaceholder");

class on extends Ki {
  constructor() {
    super(...arguments), this.render = this.render.bind(this);
  }
  elementDidMutate() {
    return this.scheduledRender ? this.composing ? (t2 = this.delegate) === null || t2 === undefined || (e2 = t2.inputControllerDidAllowUnhandledInput) === null || e2 === undefined ? undefined : e2.call(t2) : undefined : this.reparse();
    var t2, e2;
  }
  scheduleRender() {
    return this.scheduledRender ? this.scheduledRender : this.scheduledRender = requestAnimationFrame(this.render);
  }
  render() {
    var t2, e2;
    (cancelAnimationFrame(this.scheduledRender), this.scheduledRender = null, this.composing) || ((e2 = this.delegate) === null || e2 === undefined || e2.render());
    (t2 = this.afterRender) === null || t2 === undefined || t2.call(this), this.afterRender = null;
  }
  reparse() {
    var t2;
    return (t2 = this.delegate) === null || t2 === undefined ? undefined : t2.reparse();
  }
  insertString() {
    var t2;
    let e2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "", i2 = arguments.length > 1 ? arguments[1] : undefined;
    return (t2 = this.delegate) === null || t2 === undefined || t2.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.insertString(e2, i2);
    });
  }
  toggleAttributeIfSupported(t2) {
    var e2;
    if (dt().includes(t2))
      return (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformFormatting(t2), this.withTargetDOMRange(function() {
        var e3;
        return (e3 = this.responder) === null || e3 === undefined ? undefined : e3.toggleCurrentAttribute(t2);
      });
  }
  activateAttributeIfSupported(t2, e2) {
    var i2;
    if (dt().includes(t2))
      return (i2 = this.delegate) === null || i2 === undefined || i2.inputControllerWillPerformFormatting(t2), this.withTargetDOMRange(function() {
        var i3;
        return (i3 = this.responder) === null || i3 === undefined ? undefined : i3.setCurrentAttribute(t2, e2);
      });
  }
  deleteInDirection(t2) {
    let { recordUndoEntry: e2 } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { recordUndoEntry: true };
    var i2;
    e2 && ((i2 = this.delegate) === null || i2 === undefined || i2.inputControllerWillPerformTyping());
    const n2 = () => {
      var e3;
      return (e3 = this.responder) === null || e3 === undefined ? undefined : e3.deleteInDirection(t2);
    }, r2 = this.getTargetDOMRange({ minLength: 2 });
    return r2 ? this.withTargetDOMRange(r2, n2) : n2();
  }
  withTargetDOMRange(t2, e2) {
    var i2;
    return typeof t2 == "function" && (e2 = t2, t2 = this.getTargetDOMRange()), t2 ? (i2 = this.responder) === null || i2 === undefined ? undefined : i2.withTargetDOMRange(t2, e2.bind(this)) : (It.reset(), e2.call(this));
  }
  getTargetDOMRange() {
    var t2, e2;
    let { minLength: i2 } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { minLength: 0 };
    const n2 = (t2 = (e2 = this.event).getTargetRanges) === null || t2 === undefined ? undefined : t2.call(e2);
    if (n2 && n2.length) {
      const t3 = sn(n2[0]);
      if (i2 === 0 || t3.toString().length >= i2)
        return t3;
    }
  }
  withEvent(t2, e2) {
    let i2;
    this.event = t2;
    try {
      i2 = e2.call(this);
    } finally {
      this.event = null;
    }
    return i2;
  }
}
Ae(on, "events", { keydown(t2) {
  if (Rt(t2)) {
    var e2;
    const i2 = hn(t2);
    (e2 = this.delegate) !== null && e2 !== undefined && e2.inputControllerDidReceiveKeyboardCommand(i2) && t2.preventDefault();
  } else {
    let e3 = t2.key;
    t2.altKey && (e3 += "+Alt"), t2.shiftKey && (e3 += "+Shift");
    const i2 = this.constructor.keys[e3];
    if (i2)
      return this.withEvent(t2, i2);
  }
}, paste(t2) {
  var e2;
  let i2;
  const n2 = (e2 = t2.clipboardData) === null || e2 === undefined ? undefined : e2.getData("URL");
  return ln(t2) ? (t2.preventDefault(), this.attachFiles(t2.clipboardData.files)) : cn(t2) ? (t2.preventDefault(), i2 = { type: "text/plain", string: t2.clipboardData.getData("text/plain") }, (r2 = this.delegate) === null || r2 === undefined || r2.inputControllerWillPaste(i2), (o2 = this.responder) === null || o2 === undefined || o2.insertString(i2.string), this.render(), (s2 = this.delegate) === null || s2 === undefined ? undefined : s2.inputControllerDidPaste(i2)) : n2 ? (t2.preventDefault(), i2 = { type: "text/html", html: this.createLinkHTML(n2) }, (a2 = this.delegate) === null || a2 === undefined || a2.inputControllerWillPaste(i2), (l2 = this.responder) === null || l2 === undefined || l2.insertHTML(i2.html), this.render(), (c2 = this.delegate) === null || c2 === undefined ? undefined : c2.inputControllerDidPaste(i2)) : undefined;
  var r2, o2, s2, a2, l2, c2;
}, beforeinput(t2) {
  const e2 = this.constructor.inputTypes[t2.inputType];
  e2 && (this.withEvent(t2, e2), this.scheduleRender());
}, input(t2) {
  It.reset();
}, dragstart(t2) {
  var e2, i2;
  (e2 = this.responder) !== null && e2 !== undefined && e2.selectionContainsAttachments() && (t2.dataTransfer.setData("application/x-trix-dragging", true), this.dragging = { range: (i2 = this.responder) === null || i2 === undefined ? undefined : i2.getSelectedRange(), point: un(t2) });
}, dragenter(t2) {
  an(t2) && t2.preventDefault();
}, dragover(t2) {
  if (this.dragging) {
    t2.preventDefault();
    const i2 = un(t2);
    var e2;
    if (!kt(i2, this.dragging.point))
      return this.dragging.point = i2, (e2 = this.responder) === null || e2 === undefined ? undefined : e2.setLocationRangeFromPointRange(i2);
  } else
    an(t2) && t2.preventDefault();
}, drop(t2) {
  var e2, i2;
  if (this.dragging)
    return t2.preventDefault(), (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillMoveText(), (i2 = this.responder) === null || i2 === undefined || i2.moveTextFromRange(this.dragging.range), this.dragging = null, this.scheduleRender();
  if (an(t2)) {
    var n2;
    t2.preventDefault();
    const e3 = un(t2);
    return (n2 = this.responder) === null || n2 === undefined || n2.setLocationRangeFromPointRange(e3), this.attachFiles(t2.dataTransfer.files);
  }
}, dragend() {
  var t2;
  this.dragging && ((t2 = this.responder) === null || t2 === undefined || t2.setSelectedRange(this.dragging.range), this.dragging = null);
}, compositionend(t2) {
  this.composing && (this.composing = false, a.recentAndroid || this.scheduleRender());
} }), Ae(on, "keys", { ArrowLeft() {
  var t2, e2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.shouldManageMovingCursorInDirection("backward"))
    return this.event.preventDefault(), (e2 = this.responder) === null || e2 === undefined ? undefined : e2.moveCursorInDirection("backward");
}, ArrowRight() {
  var t2, e2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.shouldManageMovingCursorInDirection("forward"))
    return this.event.preventDefault(), (e2 = this.responder) === null || e2 === undefined ? undefined : e2.moveCursorInDirection("forward");
}, Backspace() {
  var t2, e2, i2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.shouldManageDeletingInDirection("backward"))
    return this.event.preventDefault(), (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillPerformTyping(), (i2 = this.responder) === null || i2 === undefined || i2.deleteInDirection("backward"), this.render();
}, Tab() {
  var t2, e2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.canIncreaseNestingLevel())
    return this.event.preventDefault(), (e2 = this.responder) === null || e2 === undefined || e2.increaseNestingLevel(), this.render();
}, "Tab+Shift"() {
  var t2, e2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.canDecreaseNestingLevel())
    return this.event.preventDefault(), (e2 = this.responder) === null || e2 === undefined || e2.decreaseNestingLevel(), this.render();
} }), Ae(on, "inputTypes", { deleteByComposition() {
  return this.deleteInDirection("backward", { recordUndoEntry: false });
}, deleteByCut() {
  return this.deleteInDirection("backward");
}, deleteByDrag() {
  return this.event.preventDefault(), this.withTargetDOMRange(function() {
    var t2;
    this.deleteByDragRange = (t2 = this.responder) === null || t2 === undefined ? undefined : t2.getSelectedRange();
  });
}, deleteCompositionText() {
  return this.deleteInDirection("backward", { recordUndoEntry: false });
}, deleteContent() {
  return this.deleteInDirection("backward");
}, deleteContentBackward() {
  return this.deleteInDirection("backward");
}, deleteContentForward() {
  return this.deleteInDirection("forward");
}, deleteEntireSoftLine() {
  return this.deleteInDirection("forward");
}, deleteHardLineBackward() {
  return this.deleteInDirection("backward");
}, deleteHardLineForward() {
  return this.deleteInDirection("forward");
}, deleteSoftLineBackward() {
  return this.deleteInDirection("backward");
}, deleteSoftLineForward() {
  return this.deleteInDirection("forward");
}, deleteWordBackward() {
  return this.deleteInDirection("backward");
}, deleteWordForward() {
  return this.deleteInDirection("forward");
}, formatBackColor() {
  return this.activateAttributeIfSupported("backgroundColor", this.event.data);
}, formatBold() {
  return this.toggleAttributeIfSupported("bold");
}, formatFontColor() {
  return this.activateAttributeIfSupported("color", this.event.data);
}, formatFontName() {
  return this.activateAttributeIfSupported("font", this.event.data);
}, formatIndent() {
  var t2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.canIncreaseNestingLevel())
    return this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.increaseNestingLevel();
    });
}, formatItalic() {
  return this.toggleAttributeIfSupported("italic");
}, formatJustifyCenter() {
  return this.toggleAttributeIfSupported("justifyCenter");
}, formatJustifyFull() {
  return this.toggleAttributeIfSupported("justifyFull");
}, formatJustifyLeft() {
  return this.toggleAttributeIfSupported("justifyLeft");
}, formatJustifyRight() {
  return this.toggleAttributeIfSupported("justifyRight");
}, formatOutdent() {
  var t2;
  if ((t2 = this.responder) !== null && t2 !== undefined && t2.canDecreaseNestingLevel())
    return this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.decreaseNestingLevel();
    });
}, formatRemove() {
  this.withTargetDOMRange(function() {
    for (const i2 in (t2 = this.responder) === null || t2 === undefined ? undefined : t2.getCurrentAttributes()) {
      var t2, e2;
      (e2 = this.responder) === null || e2 === undefined || e2.removeCurrentAttribute(i2);
    }
  });
}, formatSetBlockTextDirection() {
  return this.activateAttributeIfSupported("blockDir", this.event.data);
}, formatSetInlineTextDirection() {
  return this.activateAttributeIfSupported("textDir", this.event.data);
}, formatStrikeThrough() {
  return this.toggleAttributeIfSupported("strike");
}, formatSubscript() {
  return this.toggleAttributeIfSupported("sub");
}, formatSuperscript() {
  return this.toggleAttributeIfSupported("sup");
}, formatUnderline() {
  return this.toggleAttributeIfSupported("underline");
}, historyRedo() {
  var t2;
  return (t2 = this.delegate) === null || t2 === undefined ? undefined : t2.inputControllerWillPerformRedo();
}, historyUndo() {
  var t2;
  return (t2 = this.delegate) === null || t2 === undefined ? undefined : t2.inputControllerWillPerformUndo();
}, insertCompositionText() {
  return this.composing = true, this.insertString(this.event.data);
}, insertFromComposition() {
  return this.composing = false, this.insertString(this.event.data);
}, insertFromDrop() {
  const t2 = this.deleteByDragRange;
  var e2;
  if (t2)
    return this.deleteByDragRange = null, (e2 = this.delegate) === null || e2 === undefined || e2.inputControllerWillMoveText(), this.withTargetDOMRange(function() {
      var e3;
      return (e3 = this.responder) === null || e3 === undefined ? undefined : e3.moveTextFromRange(t2);
    });
}, insertFromPaste() {
  var t2;
  const { dataTransfer: e2 } = this.event, i2 = { dataTransfer: e2 }, n2 = e2.getData("URL"), r2 = e2.getData("text/html");
  if (n2) {
    var o2;
    let t3;
    this.event.preventDefault(), i2.type = "text/html";
    const r3 = e2.getData("public.url-name");
    t3 = r3 ? qt(r3).trim() : n2, i2.html = this.createLinkHTML(n2, t3), (o2 = this.delegate) === null || o2 === undefined || o2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
      var t4;
      return (t4 = this.responder) === null || t4 === undefined ? undefined : t4.insertHTML(i2.html);
    }), this.afterRender = () => {
      var t4;
      return (t4 = this.delegate) === null || t4 === undefined ? undefined : t4.inputControllerDidPaste(i2);
    };
  } else if (Ct(e2)) {
    var s2;
    i2.type = "text/plain", i2.string = e2.getData("text/plain"), (s2 = this.delegate) === null || s2 === undefined || s2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.insertString(i2.string);
    }), this.afterRender = () => {
      var t3;
      return (t3 = this.delegate) === null || t3 === undefined ? undefined : t3.inputControllerDidPaste(i2);
    };
  } else if (r2) {
    var a2;
    this.event.preventDefault(), i2.type = "text/html", i2.html = r2, (a2 = this.delegate) === null || a2 === undefined || a2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.insertHTML(i2.html);
    }), this.afterRender = () => {
      var t3;
      return (t3 = this.delegate) === null || t3 === undefined ? undefined : t3.inputControllerDidPaste(i2);
    };
  } else if ((t2 = e2.files) !== null && t2 !== undefined && t2.length) {
    var l2;
    i2.type = "File", i2.file = e2.files[0], (l2 = this.delegate) === null || l2 === undefined || l2.inputControllerWillPaste(i2), this.withTargetDOMRange(function() {
      var t3;
      return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.insertFile(i2.file);
    }), this.afterRender = () => {
      var t3;
      return (t3 = this.delegate) === null || t3 === undefined ? undefined : t3.inputControllerDidPaste(i2);
    };
  }
}, insertFromYank() {
  return this.insertString(this.event.data);
}, insertLineBreak() {
  return this.insertString("\n");
}, insertLink() {
  return this.activateAttributeIfSupported("href", this.event.data);
}, insertOrderedList() {
  return this.toggleAttributeIfSupported("number");
}, insertParagraph() {
  var t2;
  return (t2 = this.delegate) === null || t2 === undefined || t2.inputControllerWillPerformTyping(), this.withTargetDOMRange(function() {
    var t3;
    return (t3 = this.responder) === null || t3 === undefined ? undefined : t3.insertLineBreak();
  });
}, insertReplacementText() {
  return this.insertString(this.event.dataTransfer.getData("text/plain"), { updatePosition: false });
}, insertText() {
  var t2;
  return this.insertString(this.event.data || ((t2 = this.event.dataTransfer) === null || t2 === undefined ? undefined : t2.getData("text/plain")));
}, insertTranspose() {
  return this.insertString(this.event.data);
}, insertUnorderedList() {
  return this.toggleAttributeIfSupported("bullet");
} });
var sn = function(t2) {
  const e2 = document.createRange();
  return e2.setStart(t2.startContainer, t2.startOffset), e2.setEnd(t2.endContainer, t2.endOffset), e2;
};
var an = (t2) => {
  var e2;
  return Array.from(((e2 = t2.dataTransfer) === null || e2 === undefined ? undefined : e2.types) || []).includes("Files");
};
var ln = function(t2) {
  const e2 = t2.clipboardData;
  if (e2)
    return e2.types.includes("Files") && e2.types.length === 1 && e2.files.length >= 1;
};
var cn = function(t2) {
  const e2 = t2.clipboardData;
  if (e2)
    return e2.types.includes("text/plain") && e2.types.length === 1;
};
var hn = function(t2) {
  const e2 = [];
  return t2.altKey && e2.push("alt"), t2.shiftKey && e2.push("shift"), e2.push(t2.key), e2;
};
var un = (t2) => ({ x: t2.clientX, y: t2.clientY });
var dn = "[data-trix-attribute]";
var gn = "[data-trix-action]";
var mn = "".concat(dn, ", ").concat(gn);
var pn = "[data-trix-dialog]";
var fn = "".concat(pn, "[data-trix-active]");
var bn = "".concat(pn, " [data-trix-method]");
var vn = "".concat(pn, " [data-trix-input]");
var An = (t2, e2) => (e2 || (e2 = yn(t2)), t2.querySelector("[data-trix-input][name='".concat(e2, "']")));
var xn = (t2) => t2.getAttribute("data-trix-action");
var yn = (t2) => t2.getAttribute("data-trix-attribute") || t2.getAttribute("data-trix-dialog-attribute");

class Cn extends z {
  constructor(t2) {
    super(t2), this.didClickActionButton = this.didClickActionButton.bind(this), this.didClickAttributeButton = this.didClickAttributeButton.bind(this), this.didClickDialogButton = this.didClickDialogButton.bind(this), this.didKeyDownDialogInput = this.didKeyDownDialogInput.bind(this), this.element = t2, this.attributes = {}, this.actions = {}, this.resetDialogInputs(), f("mousedown", { onElement: this.element, matchingSelector: gn, withCallback: this.didClickActionButton }), f("mousedown", { onElement: this.element, matchingSelector: dn, withCallback: this.didClickAttributeButton }), f("click", { onElement: this.element, matchingSelector: mn, preventDefault: true }), f("click", { onElement: this.element, matchingSelector: bn, withCallback: this.didClickDialogButton }), f("keydown", { onElement: this.element, matchingSelector: vn, withCallback: this.didKeyDownDialogInput });
  }
  didClickActionButton(t2, e2) {
    var i2;
    (i2 = this.delegate) === null || i2 === undefined || i2.toolbarDidClickButton(), t2.preventDefault();
    const n2 = xn(e2);
    return this.getDialog(n2) ? this.toggleDialog(n2) : (r2 = this.delegate) === null || r2 === undefined ? undefined : r2.toolbarDidInvokeAction(n2);
    var r2;
  }
  didClickAttributeButton(t2, e2) {
    var i2;
    (i2 = this.delegate) === null || i2 === undefined || i2.toolbarDidClickButton(), t2.preventDefault();
    const n2 = yn(e2);
    var r2;
    this.getDialog(n2) ? this.toggleDialog(n2) : (r2 = this.delegate) === null || r2 === undefined || r2.toolbarDidToggleAttribute(n2);
    return this.refreshAttributeButtons();
  }
  didClickDialogButton(t2, e2) {
    const i2 = A(e2, { matchingSelector: pn });
    return this[e2.getAttribute("data-trix-method")].call(this, i2);
  }
  didKeyDownDialogInput(t2, e2) {
    if (t2.keyCode === 13) {
      t2.preventDefault();
      const i2 = e2.getAttribute("name"), n2 = this.getDialog(i2);
      this.setAttribute(n2);
    }
    if (t2.keyCode === 27)
      return t2.preventDefault(), this.hideDialog();
  }
  updateActions(t2) {
    return this.actions = t2, this.refreshActionButtons();
  }
  refreshActionButtons() {
    return this.eachActionButton((t2, e2) => {
      t2.disabled = this.actions[e2] === false;
    });
  }
  eachActionButton(t2) {
    return Array.from(this.element.querySelectorAll(gn)).map((e2) => t2(e2, xn(e2)));
  }
  updateAttributes(t2) {
    return this.attributes = t2, this.refreshAttributeButtons();
  }
  refreshAttributeButtons() {
    return this.eachAttributeButton((t2, e2) => (t2.disabled = this.attributes[e2] === false, this.attributes[e2] || this.dialogIsVisible(e2) ? (t2.setAttribute("data-trix-active", ""), t2.classList.add("trix-active")) : (t2.removeAttribute("data-trix-active"), t2.classList.remove("trix-active"))));
  }
  eachAttributeButton(t2) {
    return Array.from(this.element.querySelectorAll(dn)).map((e2) => t2(e2, yn(e2)));
  }
  applyKeyboardCommand(t2) {
    const e2 = JSON.stringify(t2.sort());
    for (const t3 of Array.from(this.element.querySelectorAll("[data-trix-key]"))) {
      const i2 = t3.getAttribute("data-trix-key").split("+");
      if (JSON.stringify(i2.sort()) === e2)
        return b("mousedown", { onElement: t3 }), true;
    }
    return false;
  }
  dialogIsVisible(t2) {
    const e2 = this.getDialog(t2);
    if (e2)
      return e2.hasAttribute("data-trix-active");
  }
  toggleDialog(t2) {
    return this.dialogIsVisible(t2) ? this.hideDialog() : this.showDialog(t2);
  }
  showDialog(t2) {
    var e2, i2;
    this.hideDialog(), (e2 = this.delegate) === null || e2 === undefined || e2.toolbarWillShowDialog();
    const n2 = this.getDialog(t2);
    n2.setAttribute("data-trix-active", ""), n2.classList.add("trix-active"), Array.from(n2.querySelectorAll("input[disabled]")).forEach((t3) => {
      t3.removeAttribute("disabled");
    });
    const r2 = yn(n2);
    if (r2) {
      const e3 = An(n2, t2);
      e3 && (e3.value = this.attributes[r2] || "", e3.select());
    }
    return (i2 = this.delegate) === null || i2 === undefined ? undefined : i2.toolbarDidShowDialog(t2);
  }
  setAttribute(t2) {
    const e2 = yn(t2), i2 = An(t2, e2);
    return i2.willValidate && !i2.checkValidity() ? (i2.setAttribute("data-trix-validate", ""), i2.classList.add("trix-validate"), i2.focus()) : ((n2 = this.delegate) === null || n2 === undefined || n2.toolbarDidUpdateAttribute(e2, i2.value), this.hideDialog());
    var n2;
  }
  removeAttribute(t2) {
    var e2;
    const i2 = yn(t2);
    return (e2 = this.delegate) === null || e2 === undefined || e2.toolbarDidRemoveAttribute(i2), this.hideDialog();
  }
  hideDialog() {
    const t2 = this.element.querySelector(fn);
    var e2;
    if (t2)
      return t2.removeAttribute("data-trix-active"), t2.classList.remove("trix-active"), this.resetDialogInputs(), (e2 = this.delegate) === null || e2 === undefined ? undefined : e2.toolbarDidHideDialog(((t3) => t3.getAttribute("data-trix-dialog"))(t2));
  }
  resetDialogInputs() {
    Array.from(this.element.querySelectorAll(vn)).forEach((t2) => {
      t2.setAttribute("disabled", "disabled"), t2.removeAttribute("data-trix-validate"), t2.classList.remove("trix-validate");
    });
  }
  getDialog(t2) {
    return this.element.querySelector("[data-trix-dialog=".concat(t2, "]"));
  }
}

class Rn extends Oi {
  constructor(t2) {
    let { editorElement: e2, document: i2, html: n2 } = t2;
    super(...arguments), this.editorElement = e2, this.selectionManager = new Li(this.editorElement), this.selectionManager.delegate = this, this.composition = new gi, this.composition.delegate = this, this.attachmentManager = new ui(this.composition.getAttachments()), this.attachmentManager.delegate = this, this.inputController = M.getLevel() === 2 ? new on(this.editorElement) : new Qi(this.editorElement), this.inputController.delegate = this, this.inputController.responder = this.composition, this.compositionController = new Ni(this.editorElement, this.composition), this.compositionController.delegate = this, this.toolbarController = new Cn(this.editorElement.toolbarElement), this.toolbarController.delegate = this, this.editor = new xi(this.composition, this.selectionManager, this.editorElement), i2 ? this.editor.loadDocument(i2) : this.editor.loadHTML(n2);
  }
  registerSelectionManager() {
    return It.registerSelectionManager(this.selectionManager);
  }
  unregisterSelectionManager() {
    return It.unregisterSelectionManager(this.selectionManager);
  }
  render() {
    return this.compositionController.render();
  }
  reparse() {
    return this.composition.replaceHTML(this.editorElement.innerHTML);
  }
  compositionDidChangeDocument(t2) {
    if (this.notifyEditorElement("document-change"), !this.handlingInput)
      return this.render();
  }
  compositionDidChangeCurrentAttributes(t2) {
    return this.currentAttributes = t2, this.toolbarController.updateAttributes(this.currentAttributes), this.updateCurrentActions(), this.notifyEditorElement("attributes-change", { attributes: this.currentAttributes });
  }
  compositionDidPerformInsertionAtRange(t2) {
    this.pasting && (this.pastedRange = t2);
  }
  compositionShouldAcceptFile(t2) {
    return this.notifyEditorElement("file-accept", { file: t2 });
  }
  compositionDidAddAttachment(t2) {
    const e2 = this.attachmentManager.manageAttachment(t2);
    return this.notifyEditorElement("attachment-add", { attachment: e2 });
  }
  compositionDidEditAttachment(t2) {
    this.compositionController.rerenderViewForObject(t2);
    const e2 = this.attachmentManager.manageAttachment(t2);
    return this.notifyEditorElement("attachment-edit", { attachment: e2 }), this.notifyEditorElement("change");
  }
  compositionDidChangeAttachmentPreviewURL(t2) {
    return this.compositionController.invalidateViewForObject(t2), this.notifyEditorElement("change");
  }
  compositionDidRemoveAttachment(t2) {
    const e2 = this.attachmentManager.unmanageAttachment(t2);
    return this.notifyEditorElement("attachment-remove", { attachment: e2 });
  }
  compositionDidStartEditingAttachment(t2, e2) {
    return this.attachmentLocationRange = this.composition.document.getLocationRangeOfAttachment(t2), this.compositionController.installAttachmentEditorForAttachment(t2, e2), this.selectionManager.setLocationRange(this.attachmentLocationRange);
  }
  compositionDidStopEditingAttachment(t2) {
    this.compositionController.uninstallAttachmentEditor(), this.attachmentLocationRange = null;
  }
  compositionDidRequestChangingSelectionToLocationRange(t2) {
    if (!this.loadingSnapshot || this.isFocused())
      return this.requestedLocationRange = t2, this.compositionRevisionWhenLocationRangeRequested = this.composition.revision, this.handlingInput ? undefined : this.render();
  }
  compositionWillLoadSnapshot() {
    this.loadingSnapshot = true;
  }
  compositionDidLoadSnapshot() {
    this.compositionController.refreshViewCache(), this.render(), this.loadingSnapshot = false;
  }
  getSelectionManager() {
    return this.selectionManager;
  }
  attachmentManagerDidRequestRemovalOfAttachment(t2) {
    return this.removeAttachment(t2);
  }
  compositionControllerWillSyncDocumentView() {
    return this.inputController.editorWillSyncDocumentView(), this.selectionManager.lock(), this.selectionManager.clearSelection();
  }
  compositionControllerDidSyncDocumentView() {
    return this.inputController.editorDidSyncDocumentView(), this.selectionManager.unlock(), this.updateCurrentActions(), this.notifyEditorElement("sync");
  }
  compositionControllerDidRender() {
    this.requestedLocationRange && (this.compositionRevisionWhenLocationRangeRequested === this.composition.revision && this.selectionManager.setLocationRange(this.requestedLocationRange), this.requestedLocationRange = null, this.compositionRevisionWhenLocationRangeRequested = null), this.renderedCompositionRevision !== this.composition.revision && (this.runEditorFilters(), this.composition.updateCurrentAttributes(), this.notifyEditorElement("render")), this.renderedCompositionRevision = this.composition.revision;
  }
  compositionControllerDidFocus() {
    return this.isFocusedInvisibly() && this.setLocationRange({ index: 0, offset: 0 }), this.toolbarController.hideDialog(), this.notifyEditorElement("focus");
  }
  compositionControllerDidBlur() {
    return this.notifyEditorElement("blur");
  }
  compositionControllerDidSelectAttachment(t2, e2) {
    return this.toolbarController.hideDialog(), this.composition.editAttachment(t2, e2);
  }
  compositionControllerDidRequestDeselectingAttachment(t2) {
    const e2 = this.attachmentLocationRange || this.composition.document.getLocationRangeOfAttachment(t2);
    return this.selectionManager.setLocationRange(e2[1]);
  }
  compositionControllerWillUpdateAttachment(t2) {
    return this.editor.recordUndoEntry("Edit Attachment", { context: t2.id, consolidatable: true });
  }
  compositionControllerDidRequestRemovalOfAttachment(t2) {
    return this.removeAttachment(t2);
  }
  inputControllerWillHandleInput() {
    this.handlingInput = true, this.requestedRender = false;
  }
  inputControllerDidRequestRender() {
    this.requestedRender = true;
  }
  inputControllerDidHandleInput() {
    if (this.handlingInput = false, this.requestedRender)
      return this.requestedRender = false, this.render();
  }
  inputControllerDidAllowUnhandledInput() {
    return this.notifyEditorElement("change");
  }
  inputControllerDidRequestReparse() {
    return this.reparse();
  }
  inputControllerWillPerformTyping() {
    return this.recordTypingUndoEntry();
  }
  inputControllerWillPerformFormatting(t2) {
    return this.recordFormattingUndoEntry(t2);
  }
  inputControllerWillCutText() {
    return this.editor.recordUndoEntry("Cut");
  }
  inputControllerWillPaste(t2) {
    return this.editor.recordUndoEntry("Paste"), this.pasting = true, this.notifyEditorElement("before-paste", { paste: t2 });
  }
  inputControllerDidPaste(t2) {
    return t2.range = this.pastedRange, this.pastedRange = null, this.pasting = null, this.notifyEditorElement("paste", { paste: t2 });
  }
  inputControllerWillMoveText() {
    return this.editor.recordUndoEntry("Move");
  }
  inputControllerWillAttachFiles() {
    return this.editor.recordUndoEntry("Drop Files");
  }
  inputControllerWillPerformUndo() {
    return this.editor.undo();
  }
  inputControllerWillPerformRedo() {
    return this.editor.redo();
  }
  inputControllerDidReceiveKeyboardCommand(t2) {
    return this.toolbarController.applyKeyboardCommand(t2);
  }
  inputControllerDidStartDrag() {
    this.locationRangeBeforeDrag = this.selectionManager.getLocationRange();
  }
  inputControllerDidReceiveDragOverPoint(t2) {
    return this.selectionManager.setLocationRangeFromPointRange(t2);
  }
  inputControllerDidCancelDrag() {
    this.selectionManager.setLocationRange(this.locationRangeBeforeDrag), this.locationRangeBeforeDrag = null;
  }
  locationRangeDidChange(t2) {
    return this.composition.updateCurrentAttributes(), this.updateCurrentActions(), this.attachmentLocationRange && !wt(this.attachmentLocationRange, t2) && this.composition.stopEditingAttachment(), this.notifyEditorElement("selection-change");
  }
  toolbarDidClickButton() {
    if (!this.getLocationRange())
      return this.setLocationRange({ index: 0, offset: 0 });
  }
  toolbarDidInvokeAction(t2) {
    return this.invokeAction(t2);
  }
  toolbarDidToggleAttribute(t2) {
    if (this.recordFormattingUndoEntry(t2), this.composition.toggleCurrentAttribute(t2), this.render(), !this.selectionFrozen)
      return this.editorElement.focus();
  }
  toolbarDidUpdateAttribute(t2, e2) {
    if (this.recordFormattingUndoEntry(t2), this.composition.setCurrentAttribute(t2, e2), this.render(), !this.selectionFrozen)
      return this.editorElement.focus();
  }
  toolbarDidRemoveAttribute(t2) {
    if (this.recordFormattingUndoEntry(t2), this.composition.removeCurrentAttribute(t2), this.render(), !this.selectionFrozen)
      return this.editorElement.focus();
  }
  toolbarWillShowDialog(t2) {
    return this.composition.expandSelectionForEditing(), this.freezeSelection();
  }
  toolbarDidShowDialog(t2) {
    return this.notifyEditorElement("toolbar-dialog-show", { dialogName: t2 });
  }
  toolbarDidHideDialog(t2) {
    return this.thawSelection(), this.editorElement.focus(), this.notifyEditorElement("toolbar-dialog-hide", { dialogName: t2 });
  }
  freezeSelection() {
    if (!this.selectionFrozen)
      return this.selectionManager.lock(), this.composition.freezeSelection(), this.selectionFrozen = true, this.render();
  }
  thawSelection() {
    if (this.selectionFrozen)
      return this.composition.thawSelection(), this.selectionManager.unlock(), this.selectionFrozen = false, this.render();
  }
  canInvokeAction(t2) {
    return !!this.actionIsExternal(t2) || !((e2 = this.actions[t2]) === null || e2 === undefined || (e2 = e2.test) === null || e2 === undefined || !e2.call(this));
    var e2;
  }
  invokeAction(t2) {
    return this.actionIsExternal(t2) ? this.notifyEditorElement("action-invoke", { actionName: t2 }) : (e2 = this.actions[t2]) === null || e2 === undefined || (e2 = e2.perform) === null || e2 === undefined ? undefined : e2.call(this);
    var e2;
  }
  actionIsExternal(t2) {
    return /^x-./.test(t2);
  }
  getCurrentActions() {
    const t2 = {};
    for (const e2 in this.actions)
      t2[e2] = this.canInvokeAction(e2);
    return t2;
  }
  updateCurrentActions() {
    const t2 = this.getCurrentActions();
    if (!kt(t2, this.currentActions))
      return this.currentActions = t2, this.toolbarController.updateActions(this.currentActions), this.notifyEditorElement("actions-change", { actions: this.currentActions });
  }
  runEditorFilters() {
    let t2 = this.composition.getSnapshot();
    if (Array.from(this.editor.filters).forEach((e3) => {
      const { document: i3, selectedRange: n2 } = t2;
      t2 = e3.call(this.editor, t2) || {}, t2.document || (t2.document = i3), t2.selectedRange || (t2.selectedRange = n2);
    }), e2 = t2, i2 = this.composition.getSnapshot(), !wt(e2.selectedRange, i2.selectedRange) || !e2.document.isEqualTo(i2.document))
      return this.composition.loadSnapshot(t2);
    var e2, i2;
  }
  updateInputElement() {
    const t2 = function(t3, e2) {
      const i2 = li[e2];
      if (i2)
        return i2(t3);
      throw new Error("unknown content type: ".concat(e2));
    }(this.compositionController.getSerializableElement(), "text/html");
    return this.editorElement.setInputElementValue(t2);
  }
  notifyEditorElement(t2, e2) {
    switch (t2) {
      case "document-change":
        this.documentChangedSinceLastRender = true;
        break;
      case "render":
        this.documentChangedSinceLastRender && (this.documentChangedSinceLastRender = false, this.notifyEditorElement("change"));
        break;
      case "change":
      case "attachment-add":
      case "attachment-edit":
      case "attachment-remove":
        this.updateInputElement();
    }
    return this.editorElement.notify(t2, e2);
  }
  removeAttachment(t2) {
    return this.editor.recordUndoEntry("Delete Attachment"), this.composition.removeAttachment(t2), this.render();
  }
  recordFormattingUndoEntry(t2) {
    const e2 = gt(t2), i2 = this.selectionManager.getLocationRange();
    if (e2 || !Dt(i2))
      return this.editor.recordUndoEntry("Formatting", { context: this.getUndoContext(), consolidatable: true });
  }
  recordTypingUndoEntry() {
    return this.editor.recordUndoEntry("Typing", { context: this.getUndoContext(this.currentAttributes), consolidatable: true });
  }
  getUndoContext() {
    for (var t2 = arguments.length, e2 = new Array(t2), i2 = 0;i2 < t2; i2++)
      e2[i2] = arguments[i2];
    return [this.getLocationContext(), this.getTimeContext(), ...Array.from(e2)];
  }
  getLocationContext() {
    const t2 = this.selectionManager.getLocationRange();
    return Dt(t2) ? t2[0].index : t2;
  }
  getTimeContext() {
    return q.interval > 0 ? Math.floor(new Date().getTime() / q.interval) : 0;
  }
  isFocused() {
    var t2;
    return this.editorElement === ((t2 = this.editorElement.ownerDocument) === null || t2 === undefined ? undefined : t2.activeElement);
  }
  isFocusedInvisibly() {
    return this.isFocused() && !this.getLocationRange();
  }
  get actions() {
    return this.constructor.actions;
  }
}
Ae(Rn, "actions", { undo: { test() {
  return this.editor.canUndo();
}, perform() {
  return this.editor.undo();
} }, redo: { test() {
  return this.editor.canRedo();
}, perform() {
  return this.editor.redo();
} }, link: { test() {
  return this.editor.canActivateAttribute("href");
} }, increaseNestingLevel: { test() {
  return this.editor.canIncreaseNestingLevel();
}, perform() {
  return this.editor.increaseNestingLevel() && this.render();
} }, decreaseNestingLevel: { test() {
  return this.editor.canDecreaseNestingLevel();
}, perform() {
  return this.editor.decreaseNestingLevel() && this.render();
} }, attachFiles: { test: () => true, perform() {
  return M.pickFiles(this.editor.insertFiles);
} } }), Rn.proxyMethod("getSelectionManager().setLocationRange"), Rn.proxyMethod("getSelectionManager().getLocationRange");
var Sn = Object.freeze({ __proto__: null, AttachmentEditorController: Pi, CompositionController: Ni, Controller: Oi, EditorController: Rn, InputController: Ki, Level0InputController: Qi, Level2InputController: on, ToolbarController: Cn });
var En = Object.freeze({ __proto__: null, MutationObserver: Ui, SelectionChangeObserver: Ft });
var kn = Object.freeze({ __proto__: null, FileVerificationOperation: Vi, ImagePreloadOperation: Ce });
bt("trix-toolbar", "%t {\n  display: block;\n}\n\n%t {\n  white-space: nowrap;\n}\n\n%t [data-trix-dialog] {\n  display: none;\n}\n\n%t [data-trix-dialog][data-trix-active] {\n  display: block;\n}\n\n%t [data-trix-dialog] [data-trix-validate]:invalid {\n  background-color: #ffdddd;\n}");

class Ln extends HTMLElement {
  connectedCallback() {
    this.innerHTML === "" && (this.innerHTML = U.getDefaultHTML());
  }
}
var Dn = 0;
var wn = function(t2) {
  if (!t2.hasAttribute("contenteditable"))
    return t2.setAttribute("contenteditable", ""), function(t3) {
      let e2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return e2.times = 1, f(t3, e2);
    }("focus", { onElement: t2, withCallback: () => Tn(t2) });
};
var Tn = function(t2) {
  return Bn(t2), Fn(t2);
};
var Bn = function(t2) {
  var e2, i2;
  if ((e2 = (i2 = document).queryCommandSupported) !== null && e2 !== undefined && e2.call(i2, "enableObjectResizing"))
    return document.execCommand("enableObjectResizing", false, false), f("mscontrolselect", { onElement: t2, preventDefault: true });
};
var Fn = function(t2) {
  var e2, i2;
  if ((e2 = (i2 = document).queryCommandSupported) !== null && e2 !== undefined && e2.call(i2, "DefaultParagraphSeparator")) {
    const { tagName: t3 } = n.default;
    if (["div", "p"].includes(t3))
      return document.execCommand("DefaultParagraphSeparator", false, t3);
  }
};
var In = a.forcesObjectResizing ? { display: "inline", width: "auto" } : { display: "inline-block", width: "1px" };
bt("trix-editor", "%t {\n    display: block;\n}\n\n%t:empty:not(:focus)::before {\n    content: attr(placeholder);\n    color: graytext;\n    cursor: text;\n    pointer-events: none;\n    white-space: pre-line;\n}\n\n%t a[contenteditable=false] {\n    cursor: text;\n}\n\n%t img {\n    max-width: 100%;\n    height: auto;\n}\n\n%t ".concat(e, " figcaption textarea {\n    resize: none;\n}\n\n%t ").concat(e, " figcaption textarea.trix-autoresize-clone {\n    position: absolute;\n    left: -9999px;\n    max-height: 0px;\n}\n\n%t ").concat(e, " figcaption[data-trix-placeholder]:empty::before {\n    content: attr(data-trix-placeholder);\n    color: graytext;\n}\n\n%t [data-trix-cursor-target] {\n    display: ").concat(In.display, " !important;\n    width: ").concat(In.width, " !important;\n    padding: 0 !important;\n    margin: 0 !important;\n    border: none !important;\n}\n\n%t [data-trix-cursor-target=left] {\n    vertical-align: top !important;\n    margin-left: -1px !important;\n}\n\n%t [data-trix-cursor-target=right] {\n    vertical-align: bottom !important;\n    margin-right: -1px !important;\n}"));

class Pn extends HTMLElement {
  get trixId() {
    return this.hasAttribute("trix-id") ? this.getAttribute("trix-id") : (this.setAttribute("trix-id", ++Dn), this.trixId);
  }
  get labels() {
    const t2 = [];
    this.id && this.ownerDocument && t2.push(...Array.from(this.ownerDocument.querySelectorAll("label[for='".concat(this.id, "']")) || []));
    const e2 = A(this, { matchingSelector: "label" });
    return e2 && [this, null].includes(e2.control) && t2.push(e2), t2;
  }
  get toolbarElement() {
    var t2;
    if (this.hasAttribute("toolbar"))
      return (t2 = this.ownerDocument) === null || t2 === undefined ? undefined : t2.getElementById(this.getAttribute("toolbar"));
    if (this.parentNode) {
      const t3 = "trix-toolbar-".concat(this.trixId);
      this.setAttribute("toolbar", t3);
      const e2 = k("trix-toolbar", { id: t3 });
      return this.parentNode.insertBefore(e2, this), e2;
    }
  }
  get form() {
    var t2;
    return (t2 = this.inputElement) === null || t2 === undefined ? undefined : t2.form;
  }
  get inputElement() {
    var t2;
    if (this.hasAttribute("input"))
      return (t2 = this.ownerDocument) === null || t2 === undefined ? undefined : t2.getElementById(this.getAttribute("input"));
    if (this.parentNode) {
      const t3 = "trix-input-".concat(this.trixId);
      this.setAttribute("input", t3);
      const e2 = k("input", { type: "hidden", id: t3 });
      return this.parentNode.insertBefore(e2, this.nextElementSibling), e2;
    }
  }
  get editor() {
    var t2;
    return (t2 = this.editorController) === null || t2 === undefined ? undefined : t2.editor;
  }
  get name() {
    var t2;
    return (t2 = this.inputElement) === null || t2 === undefined ? undefined : t2.name;
  }
  get value() {
    var t2;
    return (t2 = this.inputElement) === null || t2 === undefined ? undefined : t2.value;
  }
  set value(t2) {
    var e2;
    this.defaultValue = t2, (e2 = this.editor) === null || e2 === undefined || e2.loadHTML(this.defaultValue);
  }
  notify(t2, e2) {
    if (this.editorController)
      return b("trix-".concat(t2), { onElement: this, attributes: e2 });
  }
  setInputElementValue(t2) {
    this.inputElement && (this.inputElement.value = t2);
  }
  connectedCallback() {
    this.hasAttribute("data-trix-internal") || (wn(this), function(t2) {
      if (!t2.hasAttribute("role"))
        t2.setAttribute("role", "textbox");
    }(this), function(t2) {
      if (t2.hasAttribute("aria-label") || t2.hasAttribute("aria-labelledby"))
        return;
      const e2 = function() {
        const e3 = Array.from(t2.labels).map((e4) => {
          if (!e4.contains(t2))
            return e4.textContent;
        }).filter((t3) => t3), i2 = e3.join(" ");
        return i2 ? t2.setAttribute("aria-label", i2) : t2.removeAttribute("aria-label");
      };
      e2(), f("focus", { onElement: t2, withCallback: e2 });
    }(this), this.editorController || (b("trix-before-initialize", { onElement: this }), this.editorController = new Rn({ editorElement: this, html: this.defaultValue = this.value }), requestAnimationFrame(() => b("trix-initialize", { onElement: this }))), this.editorController.registerSelectionManager(), this.registerResetListener(), this.registerClickListener(), function(t2) {
      if (!document.querySelector(":focus") && t2.hasAttribute("autofocus") && document.querySelector("[autofocus]") === t2)
        t2.focus();
    }(this));
  }
  disconnectedCallback() {
    var t2;
    return (t2 = this.editorController) === null || t2 === undefined || t2.unregisterSelectionManager(), this.unregisterResetListener(), this.unregisterClickListener();
  }
  registerResetListener() {
    return this.resetListener = this.resetBubbled.bind(this), window.addEventListener("reset", this.resetListener, false);
  }
  unregisterResetListener() {
    return window.removeEventListener("reset", this.resetListener, false);
  }
  registerClickListener() {
    return this.clickListener = this.clickBubbled.bind(this), window.addEventListener("click", this.clickListener, false);
  }
  unregisterClickListener() {
    return window.removeEventListener("click", this.clickListener, false);
  }
  resetBubbled(t2) {
    if (!t2.defaultPrevented && t2.target === this.form)
      return this.reset();
  }
  clickBubbled(t2) {
    if (t2.defaultPrevented)
      return;
    if (this.contains(t2.target))
      return;
    const e2 = A(t2.target, { matchingSelector: "label" });
    return e2 && Array.from(this.labels).includes(e2) ? this.focus() : undefined;
  }
  reset() {
    this.value = this.defaultValue;
  }
}
var Nn = { VERSION: t, config: V, core: ci, models: Di, views: wi, controllers: Sn, observers: En, operations: kn, elements: Object.freeze({ __proto__: null, TrixEditorElement: Pn, TrixToolbarElement: Ln }), filters: Object.freeze({ __proto__: null, Filter: bi, attachmentGalleryFilter: vi }) };
Object.assign(Nn, Di), window.Trix = Nn, setTimeout(function() {
  customElements.get("trix-toolbar") || customElements.define("trix-toolbar", Ln), customElements.get("trix-editor") || customElements.define("trix-editor", Pn);
}, 0);

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarantor.jsize.jssts.
var getMetaValue = function(name) {
  const element = findElement(document.head, `meta[name="${name}"]`);
  if (element) {
    return element.getAttribute("content");
  }
};
var findElements = function(root, selector) {
  if (typeof root == "string") {
    selector = root;
    root = document;
  }
  const elements = root.querySelectorAll(selector);
  return toArray(elements);
};
var findElement = function(root, selector) {
  if (typeof root == "string") {
    selector = root;
    root = document;
  }
  return root.querySelector(selector);
};
var dispatchEvent2 = function(element, type, eventInit = {}) {
  const { disabled } = element;
  const { bubbles, cancelable, detail } = eventInit;
  const event = document.createEvent("Event");
  event.initEvent(type, bubbles || true, cancelable || true);
  event.detail = detail || {};
  try {
    element.disabled = false;
    element.dispatchEvent(event);
  } finally {
    element.disabled = disabled;
  }
  return event;
};
var toArray = function(value) {
  if (Array.isArray(value)) {
    return value;
  } else if (Array.from) {
    return Array.from(value);
  } else {
    return [].slice.call(value);
  }
};
var notify = function(object, methodName, ...messages) {
  if (object && typeof object[methodName] == "function") {
    return object[methodName](...messages);
  }
};
var start2 = function() {
  if (!started) {
    started = true;
    document.addEventListener("click", didClick, true);
    document.addEventListener("submit", didSubmitForm, true);
    document.addEventListener("ajax:before", didSubmitRemoteElement);
  }
};
var didClick = function(event) {
  const { target } = event;
  if ((target.tagName == "INPUT" || target.tagName == "BUTTON") && target.type == "submit" && target.form) {
    submitButtonsByForm.set(target.form, target);
  }
};
var didSubmitForm = function(event) {
  handleFormSubmissionEvent(event);
};
var didSubmitRemoteElement = function(event) {
  if (event.target.tagName == "FORM") {
    handleFormSubmissionEvent(event);
  }
};
var handleFormSubmissionEvent = function(event) {
  const form = event.target;
  if (form.hasAttribute(processingAttribute)) {
    event.preventDefault();
    return;
  }
  const controller = new DirectUploadsController(form);
  const { inputs } = controller;
  if (inputs.length) {
    event.preventDefault();
    form.setAttribute(processingAttribute, "");
    inputs.forEach(disable);
    controller.start((error2) => {
      form.removeAttribute(processingAttribute);
      if (error2) {
        inputs.forEach(enable);
      } else {
        submitForm(form);
      }
    });
  }
};
var submitForm = function(form) {
  let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
  if (button) {
    const { disabled } = button;
    button.disabled = false;
    button.focus();
    button.click();
    button.disabled = disabled;
  } else {
    button = document.createElement("input");
    button.type = "submit";
    button.style.display = "none";
    form.appendChild(button);
    button.click();
    form.removeChild(button);
  }
  submitButtonsByForm.delete(form);
};
var disable = function(input) {
  input.disabled = true;
};
var enable = function(input) {
  input.disabled = false;
};
var autostart = function() {
  if (window.ActiveStorage) {
    start2();
  }
};
var sparkMd5 = {
  exports: {}
};
(function(module, exports) {
  (function(factory) {
    {
      module.exports = factory();
    }
  })(function(undefined$1) {
    var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    function md5cycle(x2, k2) {
      var a2 = x2[0], b2 = x2[1], c2 = x2[2], d2 = x2[3];
      a2 += (b2 & c2 | ~b2 & d2) + k2[0] - 680876936 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[1] - 389564586 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[2] + 606105819 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[3] - 1044525330 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[4] - 176418897 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[5] + 1200080426 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[6] - 1473231341 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[7] - 45705983 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[8] + 1770035416 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[9] - 1958414417 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[10] - 42063 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[11] - 1990404162 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & c2 | ~b2 & d2) + k2[12] + 1804603682 | 0;
      a2 = (a2 << 7 | a2 >>> 25) + b2 | 0;
      d2 += (a2 & b2 | ~a2 & c2) + k2[13] - 40341101 | 0;
      d2 = (d2 << 12 | d2 >>> 20) + a2 | 0;
      c2 += (d2 & a2 | ~d2 & b2) + k2[14] - 1502002290 | 0;
      c2 = (c2 << 17 | c2 >>> 15) + d2 | 0;
      b2 += (c2 & d2 | ~c2 & a2) + k2[15] + 1236535329 | 0;
      b2 = (b2 << 22 | b2 >>> 10) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[1] - 165796510 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[6] - 1069501632 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[11] + 643717713 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[0] - 373897302 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[5] - 701558691 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[10] + 38016083 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[15] - 660478335 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[4] - 405537848 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[9] + 568446438 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[14] - 1019803690 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[3] - 187363961 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[8] + 1163531501 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 & d2 | c2 & ~d2) + k2[13] - 1444681467 | 0;
      a2 = (a2 << 5 | a2 >>> 27) + b2 | 0;
      d2 += (a2 & c2 | b2 & ~c2) + k2[2] - 51403784 | 0;
      d2 = (d2 << 9 | d2 >>> 23) + a2 | 0;
      c2 += (d2 & b2 | a2 & ~b2) + k2[7] + 1735328473 | 0;
      c2 = (c2 << 14 | c2 >>> 18) + d2 | 0;
      b2 += (c2 & a2 | d2 & ~a2) + k2[12] - 1926607734 | 0;
      b2 = (b2 << 20 | b2 >>> 12) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[5] - 378558 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[8] - 2022574463 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[11] + 1839030562 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[14] - 35309556 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[1] - 1530992060 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[4] + 1272893353 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[7] - 155497632 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[10] - 1094730640 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[13] + 681279174 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[0] - 358537222 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[3] - 722521979 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[6] + 76029189 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (b2 ^ c2 ^ d2) + k2[9] - 640364487 | 0;
      a2 = (a2 << 4 | a2 >>> 28) + b2 | 0;
      d2 += (a2 ^ b2 ^ c2) + k2[12] - 421815835 | 0;
      d2 = (d2 << 11 | d2 >>> 21) + a2 | 0;
      c2 += (d2 ^ a2 ^ b2) + k2[15] + 530742520 | 0;
      c2 = (c2 << 16 | c2 >>> 16) + d2 | 0;
      b2 += (c2 ^ d2 ^ a2) + k2[2] - 995338651 | 0;
      b2 = (b2 << 23 | b2 >>> 9) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[0] - 198630844 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[7] + 1126891415 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[14] - 1416354905 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[5] - 57434055 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[12] + 1700485571 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[3] - 1894986606 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[10] - 1051523 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[1] - 2054922799 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[8] + 1873313359 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[15] - 30611744 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[6] - 1560198380 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[13] + 1309151649 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      a2 += (c2 ^ (b2 | ~d2)) + k2[4] - 145523070 | 0;
      a2 = (a2 << 6 | a2 >>> 26) + b2 | 0;
      d2 += (b2 ^ (a2 | ~c2)) + k2[11] - 1120210379 | 0;
      d2 = (d2 << 10 | d2 >>> 22) + a2 | 0;
      c2 += (a2 ^ (d2 | ~b2)) + k2[2] + 718787259 | 0;
      c2 = (c2 << 15 | c2 >>> 17) + d2 | 0;
      b2 += (d2 ^ (c2 | ~a2)) + k2[9] - 343485551 | 0;
      b2 = (b2 << 21 | b2 >>> 11) + c2 | 0;
      x2[0] = a2 + x2[0] | 0;
      x2[1] = b2 + x2[1] | 0;
      x2[2] = c2 + x2[2] | 0;
      x2[3] = d2 + x2[3] | 0;
    }
    function md5blk(s2) {
      var md5blks = [], i2;
      for (i2 = 0;i2 < 64; i2 += 4) {
        md5blks[i2 >> 2] = s2.charCodeAt(i2) + (s2.charCodeAt(i2 + 1) << 8) + (s2.charCodeAt(i2 + 2) << 16) + (s2.charCodeAt(i2 + 3) << 24);
      }
      return md5blks;
    }
    function md5blk_array(a2) {
      var md5blks = [], i2;
      for (i2 = 0;i2 < 64; i2 += 4) {
        md5blks[i2 >> 2] = a2[i2] + (a2[i2 + 1] << 8) + (a2[i2 + 2] << 16) + (a2[i2 + 3] << 24);
      }
      return md5blks;
    }
    function md51(s2) {
      var n2 = s2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
      for (i2 = 64;i2 <= n2; i2 += 64) {
        md5cycle(state, md5blk(s2.substring(i2 - 64, i2)));
      }
      s2 = s2.substring(i2 - 64);
      length = s2.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i2 = 0;i2 < length; i2 += 1) {
        tail[i2 >> 2] |= s2.charCodeAt(i2) << (i2 % 4 << 3);
      }
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(state, tail);
        for (i2 = 0;i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(state, tail);
      return state;
    }
    function md51_array(a2) {
      var n2 = a2.length, state = [1732584193, -271733879, -1732584194, 271733878], i2, length, tail, tmp, lo, hi2;
      for (i2 = 64;i2 <= n2; i2 += 64) {
        md5cycle(state, md5blk_array(a2.subarray(i2 - 64, i2)));
      }
      a2 = i2 - 64 < n2 ? a2.subarray(i2 - 64) : new Uint8Array(0);
      length = a2.length;
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i2 = 0;i2 < length; i2 += 1) {
        tail[i2 >> 2] |= a2[i2] << (i2 % 4 << 3);
      }
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(state, tail);
        for (i2 = 0;i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = n2 * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(state, tail);
      return state;
    }
    function rhex(n2) {
      var s2 = "", j2;
      for (j2 = 0;j2 < 4; j2 += 1) {
        s2 += hex_chr[n2 >> j2 * 8 + 4 & 15] + hex_chr[n2 >> j2 * 8 & 15];
      }
      return s2;
    }
    function hex(x2) {
      var i2;
      for (i2 = 0;i2 < x2.length; i2 += 1) {
        x2[i2] = rhex(x2[i2]);
      }
      return x2.join("");
    }
    if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592")
      ;
    if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
      (function() {
        function clamp(val, length) {
          val = val | 0 || 0;
          if (val < 0) {
            return Math.max(val + length, 0);
          }
          return Math.min(val, length);
        }
        ArrayBuffer.prototype.slice = function(from, to) {
          var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
          if (to !== undefined$1) {
            end = clamp(to, length);
          }
          if (begin > end) {
            return new ArrayBuffer(0);
          }
          num = end - begin;
          target = new ArrayBuffer(num);
          targetArray = new Uint8Array(target);
          sourceArray = new Uint8Array(this, begin, num);
          targetArray.set(sourceArray);
          return target;
        };
      })();
    }
    function toUtf8(str) {
      if (/[\u0080-\uFFFF]/.test(str)) {
        str = unescape(encodeURIComponent(str));
      }
      return str;
    }
    function utf8Str2ArrayBuffer(str, returnUInt8Array) {
      var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i2;
      for (i2 = 0;i2 < length; i2 += 1) {
        arr[i2] = str.charCodeAt(i2);
      }
      return returnUInt8Array ? arr : buff;
    }
    function arrayBuffer2Utf8Str(buff) {
      return String.fromCharCode.apply(null, new Uint8Array(buff));
    }
    function concatenateArrayBuffers(first, second, returnUInt8Array) {
      var result = new Uint8Array(first.byteLength + second.byteLength);
      result.set(new Uint8Array(first));
      result.set(new Uint8Array(second), first.byteLength);
      return returnUInt8Array ? result : result.buffer;
    }
    function hexToBinaryString(hex2) {
      var bytes = [], length = hex2.length, x2;
      for (x2 = 0;x2 < length - 1; x2 += 2) {
        bytes.push(parseInt(hex2.substr(x2, 2), 16));
      }
      return String.fromCharCode.apply(String, bytes);
    }
    function SparkMD5() {
      this.reset();
    }
    SparkMD5.prototype.append = function(str) {
      this.appendBinary(toUtf8(str));
      return this;
    };
    SparkMD5.prototype.appendBinary = function(contents) {
      this._buff += contents;
      this._length += contents.length;
      var length = this._buff.length, i2;
      for (i2 = 64;i2 <= length; i2 += 64) {
        md5cycle(this._hash, md5blk(this._buff.substring(i2 - 64, i2)));
      }
      this._buff = this._buff.substring(i2 - 64);
      return this;
    };
    SparkMD5.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, i2, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
      for (i2 = 0;i2 < length; i2 += 1) {
        tail[i2 >> 2] |= buff.charCodeAt(i2) << (i2 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD5.prototype.reset = function() {
      this._buff = "";
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD5.prototype.getState = function() {
      return {
        buff: this._buff,
        length: this._length,
        hash: this._hash.slice()
      };
    };
    SparkMD5.prototype.setState = function(state) {
      this._buff = state.buff;
      this._length = state.length;
      this._hash = state.hash;
      return this;
    };
    SparkMD5.prototype.destroy = function() {
      delete this._hash;
      delete this._buff;
      delete this._length;
    };
    SparkMD5.prototype._finish = function(tail, length) {
      var i2 = length, tmp, lo, hi2;
      tail[i2 >> 2] |= 128 << (i2 % 4 << 3);
      if (i2 > 55) {
        md5cycle(this._hash, tail);
        for (i2 = 0;i2 < 16; i2 += 1) {
          tail[i2] = 0;
        }
      }
      tmp = this._length * 8;
      tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
      lo = parseInt(tmp[2], 16);
      hi2 = parseInt(tmp[1], 16) || 0;
      tail[14] = lo;
      tail[15] = hi2;
      md5cycle(this._hash, tail);
    };
    SparkMD5.hash = function(str, raw) {
      return SparkMD5.hashBinary(toUtf8(str), raw);
    };
    SparkMD5.hashBinary = function(content, raw) {
      var hash = md51(content), ret = hex(hash);
      return raw ? hexToBinaryString(ret) : ret;
    };
    SparkMD5.ArrayBuffer = function() {
      this.reset();
    };
    SparkMD5.ArrayBuffer.prototype.append = function(arr) {
      var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i2;
      this._length += arr.byteLength;
      for (i2 = 64;i2 <= length; i2 += 64) {
        md5cycle(this._hash, md5blk_array(buff.subarray(i2 - 64, i2)));
      }
      this._buff = i2 - 64 < length ? new Uint8Array(buff.buffer.slice(i2 - 64)) : new Uint8Array(0);
      return this;
    };
    SparkMD5.ArrayBuffer.prototype.end = function(raw) {
      var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i2, ret;
      for (i2 = 0;i2 < length; i2 += 1) {
        tail[i2 >> 2] |= buff[i2] << (i2 % 4 << 3);
      }
      this._finish(tail, length);
      ret = hex(this._hash);
      if (raw) {
        ret = hexToBinaryString(ret);
      }
      this.reset();
      return ret;
    };
    SparkMD5.ArrayBuffer.prototype.reset = function() {
      this._buff = new Uint8Array(0);
      this._length = 0;
      this._hash = [1732584193, -271733879, -1732584194, 271733878];
      return this;
    };
    SparkMD5.ArrayBuffer.prototype.getState = function() {
      var state = SparkMD5.prototype.getState.call(this);
      state.buff = arrayBuffer2Utf8Str(state.buff);
      return state;
    };
    SparkMD5.ArrayBuffer.prototype.setState = function(state) {
      state.buff = utf8Str2ArrayBuffer(state.buff, true);
      return SparkMD5.prototype.setState.call(this, state);
    };
    SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
    SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
    SparkMD5.ArrayBuffer.hash = function(arr, raw) {
      var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
      return raw ? hexToBinaryString(ret) : ret;
    };
    return SparkMD5;
  });
})(sparkMd5);
var SparkMD5 = sparkMd5.exports;
var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;

class FileChecksum {
  static create(file, callback) {
    const instance = new FileChecksum(file);
    instance.create(callback);
  }
  constructor(file) {
    this.file = file;
    this.chunkSize = 2097152;
    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
    this.chunkIndex = 0;
  }
  create(callback) {
    this.callback = callback;
    this.md5Buffer = new SparkMD5.ArrayBuffer;
    this.fileReader = new FileReader;
    this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
    this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
    this.readNextChunk();
  }
  fileReaderDidLoad(event) {
    this.md5Buffer.append(event.target.result);
    if (!this.readNextChunk()) {
      const binaryDigest = this.md5Buffer.end(true);
      const base64digest = btoa(binaryDigest);
      this.callback(null, base64digest);
    }
  }
  fileReaderDidError(event) {
    this.callback(`Error reading ${this.file.name}`);
  }
  readNextChunk() {
    if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
      const start3 = this.chunkIndex * this.chunkSize;
      const end = Math.min(start3 + this.chunkSize, this.file.size);
      const bytes = fileSlice.call(this.file, start3, end);
      this.fileReader.readAsArrayBuffer(bytes);
      this.chunkIndex++;
      return true;
    } else {
      return false;
    }
  }
}

class BlobRecord {
  constructor(file, checksum, url, customHeaders = {}) {
    this.file = file;
    this.attributes = {
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      byte_size: file.size,
      checksum
    };
    this.xhr = new XMLHttpRequest;
    this.xhr.open("POST", url, true);
    this.xhr.responseType = "json";
    this.xhr.setRequestHeader("Content-Type", "application/json");
    this.xhr.setRequestHeader("Accept", "application/json");
    this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    Object.keys(customHeaders).forEach((headerKey) => {
      this.xhr.setRequestHeader(headerKey, customHeaders[headerKey]);
    });
    const csrfToken = getMetaValue("csrf-token");
    if (csrfToken != null) {
      this.xhr.setRequestHeader("X-CSRF-Token", csrfToken);
    }
    this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
    this.xhr.addEventListener("error", (event) => this.requestDidError(event));
  }
  get status() {
    return this.xhr.status;
  }
  get response() {
    const { responseType, response } = this.xhr;
    if (responseType == "json") {
      return response;
    } else {
      return JSON.parse(response);
    }
  }
  create(callback) {
    this.callback = callback;
    this.xhr.send(JSON.stringify({
      blob: this.attributes
    }));
  }
  requestDidLoad(event) {
    if (this.status >= 200 && this.status < 300) {
      const { response } = this;
      const { direct_upload } = response;
      delete response.direct_upload;
      this.attributes = response;
      this.directUploadData = direct_upload;
      this.callback(null, this.toJSON());
    } else {
      this.requestDidError(event);
    }
  }
  requestDidError(event) {
    this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
  }
  toJSON() {
    const result = {};
    for (const key in this.attributes) {
      result[key] = this.attributes[key];
    }
    return result;
  }
}

class BlobUpload {
  constructor(blob) {
    this.blob = blob;
    this.file = blob.file;
    const { url, headers } = blob.directUploadData;
    this.xhr = new XMLHttpRequest;
    this.xhr.open("PUT", url, true);
    this.xhr.responseType = "text";
    for (const key in headers) {
      this.xhr.setRequestHeader(key, headers[key]);
    }
    this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
    this.xhr.addEventListener("error", (event) => this.requestDidError(event));
  }
  create(callback) {
    this.callback = callback;
    this.xhr.send(this.file.slice());
  }
  requestDidLoad(event) {
    const { status, response } = this.xhr;
    if (status >= 200 && status < 300) {
      this.callback(null, response);
    } else {
      this.requestDidError(event);
    }
  }
  requestDidError(event) {
    this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
  }
}
var id = 0;

class DirectUpload {
  constructor(file, url, delegate, customHeaders = {}) {
    this.id = ++id;
    this.file = file;
    this.url = url;
    this.delegate = delegate;
    this.customHeaders = customHeaders;
  }
  create(callback) {
    FileChecksum.create(this.file, (error2, checksum) => {
      if (error2) {
        callback(error2);
        return;
      }
      const blob = new BlobRecord(this.file, checksum, this.url, this.customHeaders);
      notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
      blob.create((error3) => {
        if (error3) {
          callback(error3);
        } else {
          const upload = new BlobUpload(blob);
          notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
          upload.create((error4) => {
            if (error4) {
              callback(error4);
            } else {
              callback(null, blob.toJSON());
            }
          });
        }
      });
    });
  }
}

class DirectUploadController {
  constructor(input, file) {
    this.input = input;
    this.file = file;
    this.directUpload = new DirectUpload(this.file, this.url, this);
    this.dispatch("initialize");
  }
  start(callback) {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = this.input.name;
    this.input.insertAdjacentElement("beforebegin", hiddenInput);
    this.dispatch("start");
    this.directUpload.create((error2, attributes) => {
      if (error2) {
        hiddenInput.parentNode.removeChild(hiddenInput);
        this.dispatchError(error2);
      } else {
        hiddenInput.value = attributes.signed_id;
      }
      this.dispatch("end");
      callback(error2);
    });
  }
  uploadRequestDidProgress(event) {
    const progress = event.loaded / event.total * 100;
    if (progress) {
      this.dispatch("progress", {
        progress
      });
    }
  }
  get url() {
    return this.input.getAttribute("data-direct-upload-url");
  }
  dispatch(name, detail = {}) {
    detail.file = this.file;
    detail.id = this.directUpload.id;
    return dispatchEvent2(this.input, `direct-upload:${name}`, {
      detail
    });
  }
  dispatchError(error2) {
    const event = this.dispatch("error", {
      error: error2
    });
    if (!event.defaultPrevented) {
      alert(error2);
    }
  }
  directUploadWillCreateBlobWithXHR(xhr) {
    this.dispatch("before-blob-request", {
      xhr
    });
  }
  directUploadWillStoreFileWithXHR(xhr) {
    this.dispatch("before-storage-request", {
      xhr
    });
    xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
  }
}
var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";

class DirectUploadsController {
  constructor(form) {
    this.form = form;
    this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
  }
  start(callback) {
    const controllers = this.createDirectUploadControllers();
    const startNextController = () => {
      const controller = controllers.shift();
      if (controller) {
        controller.start((error2) => {
          if (error2) {
            callback(error2);
            this.dispatch("end");
          } else {
            startNextController();
          }
        });
      } else {
        callback();
        this.dispatch("end");
      }
    };
    this.dispatch("start");
    startNextController();
  }
  createDirectUploadControllers() {
    const controllers = [];
    this.inputs.forEach((input) => {
      toArray(input.files).forEach((file) => {
        const controller = new DirectUploadController(input, file);
        controllers.push(controller);
      });
    });
    return controllers;
  }
  dispatch(name, detail = {}) {
    return dispatchEvent2(this.form, `direct-uploads:${name}`, {
      detail
    });
  }
}
var processingAttribute = "data-direct-uploads-processing";
var submitButtonsByForm = new WeakMap;
var started = false;
setTimeout(autostart, 1);

class AttachmentUpload {
  constructor(attachment, element) {
    this.attachment = attachment;
    this.element = element;
    this.directUpload = new DirectUpload(attachment.file, this.directUploadUrl, this);
  }
  start() {
    this.directUpload.create(this.directUploadDidComplete.bind(this));
  }
  directUploadWillStoreFileWithXHR(xhr) {
    xhr.upload.addEventListener("progress", (event) => {
      const progress = event.loaded / event.total * 100;
      this.attachment.setUploadProgress(progress);
    });
  }
  directUploadDidComplete(error2, attributes) {
    if (error2) {
      throw new Error(`Direct upload failed: ${error2}`);
    }
    this.attachment.setAttributes({
      sgid: attributes.attachable_sgid,
      url: this.createBlobUrl(attributes.signed_id, attributes.filename)
    });
  }
  createBlobUrl(signedId, filename) {
    return this.blobUrlTemplate.replace(":signed_id", signedId).replace(":filename", encodeURIComponent(filename));
  }
  get directUploadUrl() {
    return this.element.dataset.directUploadUrl;
  }
  get blobUrlTemplate() {
    return this.element.dataset.blobUrlTemplate;
  }
}
addEventListener("trix-attachment-add", (event) => {
  const { attachment, target } = event;
  if (attachment.file) {
    const upload = new AttachmentUpload(attachment, target);
    upload.start();
  }
});

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarant
var ownKeys = function(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
};
var _objectSpread2 = function(target) {
  for (var i2 = 1;i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    i2 % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
};
var _typeof = function(obj) {
  return _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && typeof Symbol == "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
};
var _classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var _defineProperties = function(target, props) {
  for (var i2 = 0;i2 < props.length; i2++) {
    var descriptor = props[i2];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor)
      descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
};
var _createClass = function(Constructor, protoProps, staticProps) {
  if (protoProps)
    _defineProperties(Constructor.prototype, protoProps);
  if (staticProps)
    _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
};
var _defineProperty = function(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
};
var _slicedToArray = function(arr, i2) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i2) || _unsupportedIterableToArray(arr, i2) || _nonIterableRest();
};
var _toConsumableArray = function(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
};
var _arrayWithoutHoles = function(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
};
var _arrayWithHoles = function(arr) {
  if (Array.isArray(arr))
    return arr;
};
var _iterableToArray = function(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null)
    return Array.from(iter);
};
var _iterableToArrayLimit = function(arr, i2) {
  var _i2 = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i2 == null)
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e2;
  try {
    for (_i2 = _i2.call(arr);!(_n = (_s = _i2.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i2 && _arr.length === i2)
        break;
    }
  } catch (err) {
    _d = true;
    _e2 = err;
  } finally {
    try {
      if (!_n && _i2["return"] != null)
        _i2["return"]();
    } finally {
      if (_d)
        throw _e2;
    }
  }
  return _arr;
};
var _unsupportedIterableToArray = function(o2, minLen) {
  if (!o2)
    return;
  if (typeof o2 === "string")
    return _arrayLikeToArray(o2, minLen);
  var n2 = Object.prototype.toString.call(o2).slice(8, -1);
  if (n2 === "Object" && o2.constructor)
    n2 = o2.constructor.name;
  if (n2 === "Map" || n2 === "Set")
    return Array.from(o2);
  if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2))
    return _arrayLikeToArray(o2, minLen);
};
var _arrayLikeToArray = function(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i2 = 0, arr2 = new Array(len);i2 < len; i2++)
    arr2[i2] = arr[i2];
  return arr2;
};
var _nonIterableSpread = function() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
};
var _nonIterableRest = function() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
};
var familyProxy = function(obj) {
  return new Proxy(obj, {
    get: function get(target, prop) {
      return prop in target ? target[prop] : target[FAMILY_CLASSIC];
    }
  });
};
var getAttrConfig = function(attr) {
  var element = DOCUMENT.querySelector("script[" + attr + "]");
  if (element) {
    return element.getAttribute(attr);
  }
};
var coerce = function(val) {
  if (val === "")
    return true;
  if (val === "false")
    return false;
  if (val === "true")
    return true;
  return val;
};
var onChange = function(cb) {
  _onChangeCb.push(cb);
  return function() {
    _onChangeCb.splice(_onChangeCb.indexOf(cb), 1);
  };
};
var insertCss = function(css) {
  if (!css || !IS_DOM) {
    return;
  }
  var style = DOCUMENT.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = css;
  var headChildren = DOCUMENT.head.childNodes;
  var beforeChild = null;
  for (var i2 = headChildren.length - 1;i2 > -1; i2--) {
    var child = headChildren[i2];
    var tagName = (child.tagName || "").toUpperCase();
    if (["STYLE", "LINK"].indexOf(tagName) > -1) {
      beforeChild = child;
    }
  }
  DOCUMENT.head.insertBefore(style, beforeChild);
  return css;
};
var nextUniqueId = function() {
  var size = 12;
  var id2 = "";
  while (size-- > 0) {
    id2 += idPool[Math.random() * 62 | 0];
  }
  return id2;
};
var toArray2 = function(obj) {
  var array = [];
  for (var i2 = (obj || []).length >>> 0;i2--; ) {
    array[i2] = obj[i2];
  }
  return array;
};
var classArray = function(node) {
  if (node.classList) {
    return toArray2(node.classList);
  } else {
    return (node.getAttribute("class") || "").split(" ").filter(function(i2) {
      return i2;
    });
  }
};
var htmlEscape = function(str) {
  return "".concat(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var joinAttributes = function(attributes) {
  return Object.keys(attributes || {}).reduce(function(acc, attributeName) {
    return acc + "".concat(attributeName, "=\"").concat(htmlEscape(attributes[attributeName]), "\" ");
  }, "").trim();
};
var joinStyles = function(styles) {
  return Object.keys(styles || {}).reduce(function(acc, styleName) {
    return acc + "".concat(styleName, ": ").concat(styles[styleName].trim(), ";");
  }, "");
};
var transformIsMeaningful = function(transform) {
  return transform.size !== meaninglessTransform.size || transform.x !== meaninglessTransform.x || transform.y !== meaninglessTransform.y || transform.rotate !== meaninglessTransform.rotate || transform.flipX || transform.flipY;
};
var transformForSvg = function(_ref) {
  var { transform, containerWidth, iconWidth } = _ref;
  var outer = {
    transform: "translate(".concat(containerWidth / 2, " 256)")
  };
  var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
  var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
  var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
  var inner = {
    transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
  };
  var path = {
    transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
  };
  return {
    outer,
    inner,
    path
  };
};
var transformForCss = function(_ref2) {
  var { transform, width: _ref2$width } = _ref2, width = _ref2$width === undefined ? UNITS_IN_GRID : _ref2$width, _ref2$height = _ref2.height, height = _ref2$height === undefined ? UNITS_IN_GRID : _ref2$height, _ref2$startCentered = _ref2.startCentered, startCentered = _ref2$startCentered === undefined ? false : _ref2$startCentered;
  var val = "";
  if (startCentered && IS_IE) {
    val += "translate(".concat(transform.x / d2 - width / 2, "em, ").concat(transform.y / d2 - height / 2, "em) ");
  } else if (startCentered) {
    val += "translate(calc(-50% + ".concat(transform.x / d2, "em), calc(-50% + ").concat(transform.y / d2, "em)) ");
  } else {
    val += "translate(".concat(transform.x / d2, "em, ").concat(transform.y / d2, "em) ");
  }
  val += "scale(".concat(transform.size / d2 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / d2 * (transform.flipY ? -1 : 1), ") ");
  val += "rotate(".concat(transform.rotate, "deg) ");
  return val;
};
var css = function() {
  var dcp = DEFAULT_CSS_PREFIX;
  var drc = DEFAULT_REPLACEMENT_CLASS;
  var fp = config.cssPrefix;
  var rc = config.replacementClass;
  var s2 = baseStyles;
  if (fp !== dcp || rc !== drc) {
    var dPatt = new RegExp("\\.".concat(dcp, "\\-"), "g");
    var customPropPatt = new RegExp("\\--".concat(dcp, "\\-"), "g");
    var rPatt = new RegExp("\\.".concat(drc), "g");
    s2 = s2.replace(dPatt, ".".concat(fp, "-")).replace(customPropPatt, "--".concat(fp, "-")).replace(rPatt, ".".concat(rc));
  }
  return s2;
};
var ensureCss = function() {
  if (config.autoAddCss && !_cssInserted) {
    insertCss(css());
    _cssInserted = true;
  }
};
var domready = function(fn2) {
  if (!IS_DOM)
    return;
  loaded ? setTimeout(fn2, 0) : functions.push(fn2);
};
var toHtml = function(abstractNodes) {
  var { tag, attributes: _abstractNodes$attrib } = abstractNodes, attributes = _abstractNodes$attrib === undefined ? {} : _abstractNodes$attrib, _abstractNodes$childr = abstractNodes.children, children = _abstractNodes$childr === undefined ? [] : _abstractNodes$childr;
  if (typeof abstractNodes === "string") {
    return htmlEscape(abstractNodes);
  } else {
    return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(""), "</").concat(tag, ">");
  }
};
var iconFromMapping = function(mapping, prefix, iconName) {
  if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
    return {
      prefix,
      iconName,
      icon: mapping[prefix][iconName]
    };
  }
};
var ucs2decode = function(string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = string.charCodeAt(counter++);
    if (value >= 55296 && value <= 56319 && counter < length) {
      var extra = string.charCodeAt(counter++);
      if ((extra & 64512) == 56320) {
        output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
};
var toHex = function(unicode) {
  var decoded = ucs2decode(unicode);
  return decoded.length === 1 ? decoded[0].toString(16) : null;
};
var codePointAt = function(string, index) {
  var size = string.length;
  var first = string.charCodeAt(index);
  var second;
  if (first >= 55296 && first <= 56319 && size > index + 1) {
    second = string.charCodeAt(index + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
};
var normalizeIcons = function(icons) {
  return Object.keys(icons).reduce(function(acc, iconName) {
    var icon = icons[iconName];
    var expanded = !!icon.icon;
    if (expanded) {
      acc[icon.iconName] = icon.icon;
    } else {
      acc[iconName] = icon;
    }
    return acc;
  }, {});
};
var defineIcons = function(prefix, icons) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _params$skipHooks = params.skipHooks, skipHooks = _params$skipHooks === undefined ? false : _params$skipHooks;
  var normalized = normalizeIcons(icons);
  if (typeof namespace.hooks.addPack === "function" && !skipHooks) {
    namespace.hooks.addPack(prefix, normalizeIcons(icons));
  } else {
    namespace.styles[prefix] = _objectSpread2(_objectSpread2({}, namespace.styles[prefix] || {}), normalized);
  }
  if (prefix === "fas") {
    defineIcons("fa", icons);
  }
};
var isReserved = function(name) {
  return ~RESERVED_CLASSES.indexOf(name);
};
var getIconName = function(cssPrefix, cls) {
  var parts = cls.split("-");
  var prefix = parts[0];
  var iconName = parts.slice(1).join("-");
  if (prefix === cssPrefix && iconName !== "" && !isReserved(iconName)) {
    return iconName;
  } else {
    return null;
  }
};
var byUnicode = function(prefix, unicode) {
  return (_byUnicode[prefix] || {})[unicode];
};
var byLigature = function(prefix, ligature) {
  return (_byLigature[prefix] || {})[ligature];
};
var byAlias = function(prefix, alias) {
  return (_byAlias[prefix] || {})[alias];
};
var byOldName = function(name) {
  return _byOldName[name] || {
    prefix: null,
    iconName: null
  };
};
var byOldUnicode = function(unicode) {
  var oldUnicode = _byOldUnicode[unicode];
  var newUnicode = byUnicode("fas", unicode);
  return oldUnicode || (newUnicode ? {
    prefix: "fas",
    iconName: newUnicode
  } : null) || {
    prefix: null,
    iconName: null
  };
};
var getDefaultUsablePrefix = function() {
  return _defaultUsablePrefix;
};
var getCanonicalPrefix = function(styleOrPrefix) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$family = params.family, family = _params$family === undefined ? FAMILY_CLASSIC : _params$family;
  var style = PREFIX_TO_STYLE[family][styleOrPrefix];
  var prefix = STYLE_TO_PREFIX[family][styleOrPrefix] || STYLE_TO_PREFIX[family][style];
  var defined = styleOrPrefix in namespace.styles ? styleOrPrefix : null;
  return prefix || defined || null;
};
var getCanonicalIcon = function(values) {
  var _famProps;
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$skipLookups = params.skipLookups, skipLookups = _params$skipLookups === undefined ? false : _params$skipLookups;
  var famProps = (_famProps = {}, _defineProperty(_famProps, FAMILY_CLASSIC, "".concat(config.cssPrefix, "-").concat(FAMILY_CLASSIC)), _defineProperty(_famProps, FAMILY_SHARP, "".concat(config.cssPrefix, "-").concat(FAMILY_SHARP)), _famProps);
  var givenPrefix = null;
  var family = FAMILY_CLASSIC;
  if (values.includes(famProps[FAMILY_CLASSIC]) || values.some(function(v2) {
    return PREFIXES_FOR_FAMILY[FAMILY_CLASSIC].includes(v2);
  })) {
    family = FAMILY_CLASSIC;
  }
  if (values.includes(famProps[FAMILY_SHARP]) || values.some(function(v2) {
    return PREFIXES_FOR_FAMILY[FAMILY_SHARP].includes(v2);
  })) {
    family = FAMILY_SHARP;
  }
  var canonical = values.reduce(function(acc, cls) {
    var iconName = getIconName(config.cssPrefix, cls);
    if (styles[cls]) {
      cls = LONG_STYLE[family].includes(cls) ? LONG_STYLE_TO_PREFIX[family][cls] : cls;
      givenPrefix = cls;
      acc.prefix = cls;
    } else if (PREFIXES[family].indexOf(cls) > -1) {
      givenPrefix = cls;
      acc.prefix = getCanonicalPrefix(cls, {
        family
      });
    } else if (iconName) {
      acc.iconName = iconName;
    } else if (cls !== config.replacementClass && cls !== famProps[FAMILY_CLASSIC] && cls !== famProps[FAMILY_SHARP]) {
      acc.rest.push(cls);
    }
    if (!skipLookups && acc.prefix && acc.iconName) {
      var shim = givenPrefix === "fa" ? byOldName(acc.iconName) : {};
      var aliasIconName = byAlias(acc.prefix, acc.iconName);
      if (shim.prefix) {
        givenPrefix = null;
      }
      acc.iconName = shim.iconName || aliasIconName || acc.iconName;
      acc.prefix = shim.prefix || acc.prefix;
      if (acc.prefix === "far" && !styles["far"] && styles["fas"] && !config.autoFetchSvg) {
        acc.prefix = "fas";
      }
    }
    return acc;
  }, emptyCanonicalIcon());
  if (values.includes("fa-brands") || values.includes("fab")) {
    canonical.prefix = "fab";
  }
  if (values.includes("fa-duotone") || values.includes("fad")) {
    canonical.prefix = "fad";
  }
  if (!canonical.prefix && family === FAMILY_SHARP && (styles["fass"] || config.autoFetchSvg)) {
    canonical.prefix = "fass";
    canonical.iconName = byAlias(canonical.prefix, canonical.iconName) || canonical.iconName;
  }
  if (canonical.prefix === "fa" || givenPrefix === "fa") {
    canonical.prefix = getDefaultUsablePrefix() || "fas";
  }
  return canonical;
};
var registerPlugins = function(nextPlugins, _ref) {
  var obj = _ref.mixoutsTo;
  _plugins = nextPlugins;
  _hooks = {};
  Object.keys(providers).forEach(function(k2) {
    if (defaultProviderKeys.indexOf(k2) === -1) {
      delete providers[k2];
    }
  });
  _plugins.forEach(function(plugin) {
    var mixout = plugin.mixout ? plugin.mixout() : {};
    Object.keys(mixout).forEach(function(tk) {
      if (typeof mixout[tk] === "function") {
        obj[tk] = mixout[tk];
      }
      if (_typeof(mixout[tk]) === "object") {
        Object.keys(mixout[tk]).forEach(function(sk) {
          if (!obj[tk]) {
            obj[tk] = {};
          }
          obj[tk][sk] = mixout[tk][sk];
        });
      }
    });
    if (plugin.hooks) {
      var hooks = plugin.hooks();
      Object.keys(hooks).forEach(function(hook) {
        if (!_hooks[hook]) {
          _hooks[hook] = [];
        }
        _hooks[hook].push(hooks[hook]);
      });
    }
    if (plugin.provides) {
      plugin.provides(providers);
    }
  });
  return obj;
};
var chainHooks = function(hook, accumulator) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2;_key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  var hookFns = _hooks[hook] || [];
  hookFns.forEach(function(hookFn) {
    accumulator = hookFn.apply(null, [accumulator].concat(args));
  });
  return accumulator;
};
var callHooks = function(hook) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;_key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  var hookFns = _hooks[hook] || [];
  hookFns.forEach(function(hookFn) {
    hookFn.apply(null, args);
  });
  return;
};
var callProvided = function() {
  var hook = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  return providers[hook] ? providers[hook].apply(null, args) : undefined;
};
var findIconDefinition = function(iconLookup) {
  if (iconLookup.prefix === "fa") {
    iconLookup.prefix = "fas";
  }
  var iconName = iconLookup.iconName;
  var prefix = iconLookup.prefix || getDefaultUsablePrefix();
  if (!iconName)
    return;
  iconName = byAlias(prefix, iconName) || iconName;
  return iconFromMapping(library.definitions, prefix, iconName) || iconFromMapping(namespace.styles, prefix, iconName);
};
var domVariants = function(val, abstractCreator) {
  Object.defineProperty(val, "abstract", {
    get: abstractCreator
  });
  Object.defineProperty(val, "html", {
    get: function get() {
      return val.abstract.map(function(a2) {
        return toHtml(a2);
      });
    }
  });
  Object.defineProperty(val, "node", {
    get: function get() {
      if (!IS_DOM)
        return;
      var container = DOCUMENT.createElement("div");
      container.innerHTML = val.html;
      return container.children;
    }
  });
  return val;
};
var asIcon = function(_ref) {
  var { children, main, mask, attributes, styles, transform } = _ref;
  if (transformIsMeaningful(transform) && main.found && !mask.found) {
    var { width, height } = main;
    var offset = {
      x: width / height / 2,
      y: 0.5
    };
    attributes["style"] = joinStyles(_objectSpread2(_objectSpread2({}, styles), {}, {
      "transform-origin": "".concat(offset.x + transform.x / 16, "em ").concat(offset.y + transform.y / 16, "em")
    }));
  }
  return [{
    tag: "svg",
    attributes,
    children
  }];
};
var asSymbol = function(_ref) {
  var { prefix, iconName, children, attributes, symbol } = _ref;
  var id2 = symbol === true ? "".concat(prefix, "-").concat(config.cssPrefix, "-").concat(iconName) : symbol;
  return [{
    tag: "svg",
    attributes: {
      style: "display: none;"
    },
    children: [{
      tag: "symbol",
      attributes: _objectSpread2(_objectSpread2({}, attributes), {}, {
        id: id2
      }),
      children
    }]
  }];
};
var makeInlineSvgAbstract = function(params) {
  var _params$icons = params.icons, main = _params$icons.main, mask = _params$icons.mask, prefix = params.prefix, iconName = params.iconName, transform = params.transform, symbol = params.symbol, title = params.title, maskId = params.maskId, titleId = params.titleId, extra = params.extra, _params$watchable = params.watchable, watchable = _params$watchable === undefined ? false : _params$watchable;
  var _ref = mask.found ? mask : main, width = _ref.width, height = _ref.height;
  var isUploadedIcon = prefix === "fak";
  var attrClass = [config.replacementClass, iconName ? "".concat(config.cssPrefix, "-").concat(iconName) : ""].filter(function(c2) {
    return extra.classes.indexOf(c2) === -1;
  }).filter(function(c2) {
    return c2 !== "" || !!c2;
  }).concat(extra.classes).join(" ");
  var content = {
    children: [],
    attributes: _objectSpread2(_objectSpread2({}, extra.attributes), {}, {
      "data-prefix": prefix,
      "data-icon": iconName,
      class: attrClass,
      role: extra.attributes.role || "img",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 ".concat(width, " ").concat(height)
    })
  };
  var uploadedIconWidthStyle = isUploadedIcon && !~extra.classes.indexOf("fa-fw") ? {
    width: "".concat(width / height * 16 * 0.0625, "em")
  } : {};
  if (watchable) {
    content.attributes[DATA_FA_I2SVG] = "";
  }
  if (title) {
    content.children.push({
      tag: "title",
      attributes: {
        id: content.attributes["aria-labelledby"] || "title-".concat(titleId || nextUniqueId())
      },
      children: [title]
    });
    delete content.attributes.title;
  }
  var args = _objectSpread2(_objectSpread2({}, content), {}, {
    prefix,
    iconName,
    main,
    mask,
    maskId,
    transform,
    symbol,
    styles: _objectSpread2(_objectSpread2({}, uploadedIconWidthStyle), extra.styles)
  });
  var _ref2 = mask.found && main.found ? callProvided("generateAbstractMask", args) || {
    children: [],
    attributes: {}
  } : callProvided("generateAbstractIcon", args) || {
    children: [],
    attributes: {}
  }, children = _ref2.children, attributes = _ref2.attributes;
  args.children = children;
  args.attributes = attributes;
  if (symbol) {
    return asSymbol(args);
  } else {
    return asIcon(args);
  }
};
var makeLayersTextAbstract = function(params) {
  var { content, width, height, transform, title, extra, watchable: _params$watchable2 } = params, watchable = _params$watchable2 === undefined ? false : _params$watchable2;
  var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
    title
  } : {}), {}, {
    class: extra.classes.join(" ")
  });
  if (watchable) {
    attributes[DATA_FA_I2SVG] = "";
  }
  var styles = _objectSpread2({}, extra.styles);
  if (transformIsMeaningful(transform)) {
    styles["transform"] = transformForCss({
      transform,
      startCentered: true,
      width,
      height
    });
    styles["-webkit-transform"] = styles["transform"];
  }
  var styleString = joinStyles(styles);
  if (styleString.length > 0) {
    attributes["style"] = styleString;
  }
  var val = [];
  val.push({
    tag: "span",
    attributes,
    children: [content]
  });
  if (title) {
    val.push({
      tag: "span",
      attributes: {
        class: "sr-only"
      },
      children: [title]
    });
  }
  return val;
};
var makeLayersCounterAbstract = function(params) {
  var { content, title, extra } = params;
  var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
    title
  } : {}), {}, {
    class: extra.classes.join(" ")
  });
  var styleString = joinStyles(extra.styles);
  if (styleString.length > 0) {
    attributes["style"] = styleString;
  }
  var val = [];
  val.push({
    tag: "span",
    attributes,
    children: [content]
  });
  if (title) {
    val.push({
      tag: "span",
      attributes: {
        class: "sr-only"
      },
      children: [title]
    });
  }
  return val;
};
var asFoundIcon = function(icon) {
  var width = icon[0];
  var height = icon[1];
  var _icon$slice = icon.slice(4), _icon$slice2 = _slicedToArray(_icon$slice, 1), vectorData = _icon$slice2[0];
  var element = null;
  if (Array.isArray(vectorData)) {
    element = {
      tag: "g",
      attributes: {
        class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.GROUP)
      },
      children: [{
        tag: "path",
        attributes: {
          class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.SECONDARY),
          fill: "currentColor",
          d: vectorData[0]
        }
      }, {
        tag: "path",
        attributes: {
          class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.PRIMARY),
          fill: "currentColor",
          d: vectorData[1]
        }
      }]
    };
  } else {
    element = {
      tag: "path",
      attributes: {
        fill: "currentColor",
        d: vectorData
      }
    };
  }
  return {
    found: true,
    width,
    height,
    icon: element
  };
};
var maybeNotifyMissing = function(iconName, prefix) {
  if (!PRODUCTION && !config.showMissingIcons && iconName) {
    console.error("Icon with name \"".concat(iconName, "\" and prefix \"").concat(prefix, "\" is missing."));
  }
};
var findIcon = function(iconName, prefix) {
  var givenPrefix = prefix;
  if (prefix === "fa" && config.styleDefault !== null) {
    prefix = getDefaultUsablePrefix();
  }
  return new Promise(function(resolve, reject) {
    var val = {
      found: false,
      width: 512,
      height: 512,
      icon: callProvided("missingIconAbstract") || {}
    };
    if (givenPrefix === "fa") {
      var shim = byOldName(iconName) || {};
      iconName = shim.iconName || iconName;
      prefix = shim.prefix || prefix;
    }
    if (iconName && prefix && styles$1[prefix] && styles$1[prefix][iconName]) {
      var icon = styles$1[prefix][iconName];
      return resolve(asFoundIcon(icon));
    }
    maybeNotifyMissing(iconName, prefix);
    resolve(_objectSpread2(_objectSpread2({}, missingIconResolutionMixin), {}, {
      icon: config.showMissingIcons && iconName ? callProvided("missingIconAbstract") || {} : {}
    }));
  });
};
var isWatched = function(node) {
  var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
  return typeof i2svg === "string";
};
var hasPrefixAndIcon = function(node) {
  var prefix = node.getAttribute ? node.getAttribute(DATA_PREFIX) : null;
  var icon = node.getAttribute ? node.getAttribute(DATA_ICON) : null;
  return prefix && icon;
};
var hasBeenReplaced = function(node) {
  return node && node.classList && node.classList.contains && node.classList.contains(config.replacementClass);
};
var getMutator = function() {
  if (config.autoReplaceSvg === true) {
    return mutators.replace;
  }
  var mutator = mutators[config.autoReplaceSvg];
  return mutator || mutators.replace;
};
var createElementNS = function(tag) {
  return DOCUMENT.createElementNS("http://www.w3.org/2000/svg", tag);
};
var createElement = function(tag) {
  return DOCUMENT.createElement(tag);
};
var convertSVG = function(abstractObj) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$ceFn = params.ceFn, ceFn = _params$ceFn === undefined ? abstractObj.tag === "svg" ? createElementNS : createElement : _params$ceFn;
  if (typeof abstractObj === "string") {
    return DOCUMENT.createTextNode(abstractObj);
  }
  var tag = ceFn(abstractObj.tag);
  Object.keys(abstractObj.attributes || []).forEach(function(key) {
    tag.setAttribute(key, abstractObj.attributes[key]);
  });
  var children = abstractObj.children || [];
  children.forEach(function(child) {
    tag.appendChild(convertSVG(child, {
      ceFn
    }));
  });
  return tag;
};
var nodeAsComment = function(node) {
  var comment = " ".concat(node.outerHTML, " ");
  comment = "".concat(comment, "Font Awesome fontawesome.com ");
  return comment;
};
var performOperationSync = function(op) {
  op();
};
var perform = function(mutations, callback) {
  var callbackFunction = typeof callback === "function" ? callback : noop$2;
  if (mutations.length === 0) {
    callbackFunction();
  } else {
    var frame = performOperationSync;
    if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
      frame = WINDOW.requestAnimationFrame || performOperationSync;
    }
    frame(function() {
      var mutator = getMutator();
      var mark = perf.begin("mutate");
      mutations.map(mutator);
      mark();
      callbackFunction();
    });
  }
};
var disableObservation = function() {
  disabled = true;
};
var enableObservation = function() {
  disabled = false;
};
var observe = function(options) {
  if (!MUTATION_OBSERVER) {
    return;
  }
  if (!config.observeMutations) {
    return;
  }
  var _options$treeCallback = options.treeCallback, treeCallback = _options$treeCallback === undefined ? noop$2 : _options$treeCallback, _options$nodeCallback = options.nodeCallback, nodeCallback = _options$nodeCallback === undefined ? noop$2 : _options$nodeCallback, _options$pseudoElemen = options.pseudoElementsCallback, pseudoElementsCallback = _options$pseudoElemen === undefined ? noop$2 : _options$pseudoElemen, _options$observeMutat = options.observeMutationsRoot, observeMutationsRoot = _options$observeMutat === undefined ? DOCUMENT : _options$observeMutat;
  mo = new MUTATION_OBSERVER(function(objects) {
    if (disabled)
      return;
    var defaultPrefix = getDefaultUsablePrefix();
    toArray2(objects).forEach(function(mutationRecord) {
      if (mutationRecord.type === "childList" && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
        if (config.searchPseudoElements) {
          pseudoElementsCallback(mutationRecord.target);
        }
        treeCallback(mutationRecord.target);
      }
      if (mutationRecord.type === "attributes" && mutationRecord.target.parentNode && config.searchPseudoElements) {
        pseudoElementsCallback(mutationRecord.target.parentNode);
      }
      if (mutationRecord.type === "attributes" && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
        if (mutationRecord.attributeName === "class" && hasPrefixAndIcon(mutationRecord.target)) {
          var _getCanonicalIcon = getCanonicalIcon(classArray(mutationRecord.target)), prefix = _getCanonicalIcon.prefix, iconName = _getCanonicalIcon.iconName;
          mutationRecord.target.setAttribute(DATA_PREFIX, prefix || defaultPrefix);
          if (iconName)
            mutationRecord.target.setAttribute(DATA_ICON, iconName);
        } else if (hasBeenReplaced(mutationRecord.target)) {
          nodeCallback(mutationRecord.target);
        }
      }
    });
  });
  if (!IS_DOM)
    return;
  mo.observe(observeMutationsRoot, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
  });
};
var disconnect = function() {
  if (!mo)
    return;
  mo.disconnect();
};
var styleParser = function(node) {
  var style = node.getAttribute("style");
  var val = [];
  if (style) {
    val = style.split(";").reduce(function(acc, style2) {
      var styles = style2.split(":");
      var prop = styles[0];
      var value = styles.slice(1);
      if (prop && value.length > 0) {
        acc[prop] = value.join(":").trim();
      }
      return acc;
    }, {});
  }
  return val;
};
var classParser = function(node) {
  var existingPrefix = node.getAttribute("data-prefix");
  var existingIconName = node.getAttribute("data-icon");
  var innerText = node.innerText !== undefined ? node.innerText.trim() : "";
  var val = getCanonicalIcon(classArray(node));
  if (!val.prefix) {
    val.prefix = getDefaultUsablePrefix();
  }
  if (existingPrefix && existingIconName) {
    val.prefix = existingPrefix;
    val.iconName = existingIconName;
  }
  if (val.iconName && val.prefix) {
    return val;
  }
  if (val.prefix && innerText.length > 0) {
    val.iconName = byLigature(val.prefix, node.innerText) || byUnicode(val.prefix, toHex(node.innerText));
  }
  if (!val.iconName && config.autoFetchSvg && node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
    val.iconName = node.firstChild.data;
  }
  return val;
};
var attributesParser = function(node) {
  var extraAttributes = toArray2(node.attributes).reduce(function(acc, attr) {
    if (acc.name !== "class" && acc.name !== "style") {
      acc[attr.name] = attr.value;
    }
    return acc;
  }, {});
  var title = node.getAttribute("title");
  var titleId = node.getAttribute("data-fa-title-id");
  if (config.autoA11y) {
    if (title) {
      extraAttributes["aria-labelledby"] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
    } else {
      extraAttributes["aria-hidden"] = "true";
      extraAttributes["focusable"] = "false";
    }
  }
  return extraAttributes;
};
var blankMeta = function() {
  return {
    iconName: null,
    title: null,
    titleId: null,
    prefix: null,
    transform: meaninglessTransform,
    symbol: false,
    mask: {
      iconName: null,
      prefix: null,
      rest: []
    },
    maskId: null,
    extra: {
      classes: [],
      styles: {},
      attributes: {}
    }
  };
};
var parseMeta = function(node) {
  var parser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    styleParser: true
  };
  var _classParser = classParser(node), iconName = _classParser.iconName, prefix = _classParser.prefix, extraClasses = _classParser.rest;
  var extraAttributes = attributesParser(node);
  var pluginMeta = chainHooks("parseNodeAttributes", {}, node);
  var extraStyles = parser.styleParser ? styleParser(node) : [];
  return _objectSpread2({
    iconName,
    title: node.getAttribute("title"),
    titleId: node.getAttribute("data-fa-title-id"),
    prefix,
    transform: meaninglessTransform,
    mask: {
      iconName: null,
      prefix: null,
      rest: []
    },
    maskId: null,
    symbol: false,
    extra: {
      classes: extraClasses,
      styles: extraStyles,
      attributes: extraAttributes
    }
  }, pluginMeta);
};
var generateMutation = function(node) {
  var nodeMeta = config.autoReplaceSvg === "nest" ? parseMeta(node, {
    styleParser: false
  }) : parseMeta(node);
  if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
    return callProvided("generateLayersText", node, nodeMeta);
  } else {
    return callProvided("generateSvgReplacementMutation", node, nodeMeta);
  }
};
var onTree = function(root) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (!IS_DOM)
    return Promise.resolve();
  var htmlClassList = DOCUMENT.documentElement.classList;
  var hclAdd = function hclAdd(suffix) {
    return htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
  };
  var hclRemove = function hclRemove(suffix) {
    return htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
  };
  var prefixes = config.autoFetchSvg ? knownPrefixes : FAMILIES.map(function(f2) {
    return "fa-".concat(f2);
  }).concat(Object.keys(styles$2));
  if (!prefixes.includes("fa")) {
    prefixes.push("fa");
  }
  var prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map(function(p2) {
    return ".".concat(p2, ":not([").concat(DATA_FA_I2SVG, "])");
  })).join(", ");
  if (prefixesDomQuery.length === 0) {
    return Promise.resolve();
  }
  var candidates = [];
  try {
    candidates = toArray2(root.querySelectorAll(prefixesDomQuery));
  } catch (e2) {
  }
  if (candidates.length > 0) {
    hclAdd("pending");
    hclRemove("complete");
  } else {
    return Promise.resolve();
  }
  var mark = perf.begin("onTree");
  var mutations = candidates.reduce(function(acc, node) {
    try {
      var mutation = generateMutation(node);
      if (mutation) {
        acc.push(mutation);
      }
    } catch (e2) {
      if (!PRODUCTION) {
        if (e2.name === "MissingIcon") {
          console.error(e2);
        }
      }
    }
    return acc;
  }, []);
  return new Promise(function(resolve, reject) {
    Promise.all(mutations).then(function(resolvedMutations) {
      perform(resolvedMutations, function() {
        hclAdd("active");
        hclAdd("complete");
        hclRemove("pending");
        if (typeof callback === "function")
          callback();
        mark();
        resolve();
      });
    }).catch(function(e2) {
      mark();
      reject(e2);
    });
  });
};
var onNode = function(node) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  generateMutation(node).then(function(mutation) {
    if (mutation) {
      perform([mutation], callback);
    }
  });
};
var resolveIcons = function(next) {
  return function(maybeIconDefinition) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var iconDefinition = (maybeIconDefinition || {}).icon ? maybeIconDefinition : findIconDefinition(maybeIconDefinition || {});
    var mask = params.mask;
    if (mask) {
      mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
    }
    return next(iconDefinition, _objectSpread2(_objectSpread2({}, params), {}, {
      mask
    }));
  };
};
var hexValueFromContent = function(content) {
  var cleaned = content.replace(CLEAN_CONTENT_PATTERN, "");
  var codePoint = codePointAt(cleaned, 0);
  var isPrependTen = codePoint >= SECONDARY_UNICODE_RANGE[0] && codePoint <= SECONDARY_UNICODE_RANGE[1];
  var isDoubled = cleaned.length === 2 ? cleaned[0] === cleaned[1] : false;
  return {
    value: isDoubled ? toHex(cleaned[0]) : toHex(cleaned),
    isSecondary: isPrependTen || isDoubled
  };
};
var replaceForPosition = function(node, position) {
  var pendingAttribute = "".concat(DATA_FA_PSEUDO_ELEMENT_PENDING).concat(position.replace(":", "-"));
  return new Promise(function(resolve, reject) {
    if (node.getAttribute(pendingAttribute) !== null) {
      return resolve();
    }
    var children = toArray2(node.children);
    var alreadyProcessedPseudoElement = children.filter(function(c2) {
      return c2.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position;
    })[0];
    var styles = WINDOW.getComputedStyle(node, position);
    var fontFamily = styles.getPropertyValue("font-family").match(FONT_FAMILY_PATTERN);
    var fontWeight = styles.getPropertyValue("font-weight");
    var content = styles.getPropertyValue("content");
    if (alreadyProcessedPseudoElement && !fontFamily) {
      node.removeChild(alreadyProcessedPseudoElement);
      return resolve();
    } else if (fontFamily && content !== "none" && content !== "") {
      var _content = styles.getPropertyValue("content");
      var family = ~["Sharp"].indexOf(fontFamily[2]) ? FAMILY_SHARP : FAMILY_CLASSIC;
      var prefix = ~["Solid", "Regular", "Light", "Thin", "Duotone", "Brands", "Kit"].indexOf(fontFamily[2]) ? STYLE_TO_PREFIX[family][fontFamily[2].toLowerCase()] : FONT_WEIGHT_TO_PREFIX[family][fontWeight];
      var _hexValueFromContent = hexValueFromContent(_content), hexValue = _hexValueFromContent.value, isSecondary = _hexValueFromContent.isSecondary;
      var isV4 = fontFamily[0].startsWith("FontAwesome");
      var iconName = byUnicode(prefix, hexValue);
      var iconIdentifier = iconName;
      if (isV4) {
        var iconName4 = byOldUnicode(hexValue);
        if (iconName4.iconName && iconName4.prefix) {
          iconName = iconName4.iconName;
          prefix = iconName4.prefix;
        }
      }
      if (iconName && !isSecondary && (!alreadyProcessedPseudoElement || alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !== prefix || alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !== iconIdentifier)) {
        node.setAttribute(pendingAttribute, iconIdentifier);
        if (alreadyProcessedPseudoElement) {
          node.removeChild(alreadyProcessedPseudoElement);
        }
        var meta = blankMeta();
        var extra = meta.extra;
        extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
        findIcon(iconName, prefix).then(function(main) {
          var _abstract = makeInlineSvgAbstract(_objectSpread2(_objectSpread2({}, meta), {}, {
            icons: {
              main,
              mask: emptyCanonicalIcon()
            },
            prefix,
            iconName: iconIdentifier,
            extra,
            watchable: true
          }));
          var element = DOCUMENT.createElementNS("http://www.w3.org/2000/svg", "svg");
          if (position === "::before") {
            node.insertBefore(element, node.firstChild);
          } else {
            node.appendChild(element);
          }
          element.outerHTML = _abstract.map(function(a2) {
            return toHtml(a2);
          }).join("\n");
          node.removeAttribute(pendingAttribute);
          resolve();
        }).catch(reject);
      } else {
        resolve();
      }
    } else {
      resolve();
    }
  });
};
var replace = function(node) {
  return Promise.all([replaceForPosition(node, "::before"), replaceForPosition(node, "::after")]);
};
var processable = function(node) {
  return node.parentNode !== document.head && !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(node.tagName.toUpperCase()) && !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) && (!node.parentNode || node.parentNode.tagName !== "svg");
};
var searchPseudoElements = function(root) {
  if (!IS_DOM)
    return;
  return new Promise(function(resolve, reject) {
    var operations = toArray2(root.querySelectorAll("*")).filter(processable).map(replace);
    var end = perf.begin("searchPseudoElements");
    disableObservation();
    Promise.all(operations).then(function() {
      end();
      enableObservation();
      resolve();
    }).catch(function() {
      end();
      enableObservation();
      reject();
    });
  });
};
var fillBlack = function(_abstract) {
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  if (_abstract.attributes && (_abstract.attributes.fill || force)) {
    _abstract.attributes.fill = "black";
  }
  return _abstract;
};
var deGroup = function(_abstract2) {
  if (_abstract2.tag === "g") {
    return _abstract2.children;
  } else {
    return [_abstract2];
  }
};
var noop = function noop2() {
};
var _WINDOW = {};
var _DOCUMENT = {};
var _MUTATION_OBSERVER = null;
var _PERFORMANCE = {
  mark: noop,
  measure: noop
};
try {
  if (typeof window !== "undefined")
    _WINDOW = window;
  if (typeof document !== "undefined")
    _DOCUMENT = document;
  if (typeof MutationObserver !== "undefined")
    _MUTATION_OBSERVER = MutationObserver;
  if (typeof performance !== "undefined")
    _PERFORMANCE = performance;
} catch (e2) {
}
var _ref = _WINDOW.navigator || {};
var _ref$userAgent = _ref.userAgent;
var userAgent = _ref$userAgent === undefined ? "" : _ref$userAgent;
var WINDOW = _WINDOW;
var DOCUMENT = _DOCUMENT;
var MUTATION_OBSERVER = _MUTATION_OBSERVER;
var PERFORMANCE = _PERFORMANCE;
var IS_BROWSER = !!WINDOW.document;
var IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === "function" && typeof DOCUMENT.createElement === "function";
var IS_IE = ~userAgent.indexOf("MSIE") || ~userAgent.indexOf("Trident/");
var _familyProxy;
var _familyProxy2;
var _familyProxy3;
var _familyProxy4;
var _familyProxy5;
var NAMESPACE_IDENTIFIER = "___FONT_AWESOME___";
var UNITS_IN_GRID = 16;
var DEFAULT_CSS_PREFIX = "fa";
var DEFAULT_REPLACEMENT_CLASS = "svg-inline--fa";
var DATA_FA_I2SVG = "data-fa-i2svg";
var DATA_FA_PSEUDO_ELEMENT = "data-fa-pseudo-element";
var DATA_FA_PSEUDO_ELEMENT_PENDING = "data-fa-pseudo-element-pending";
var DATA_PREFIX = "data-prefix";
var DATA_ICON = "data-icon";
var HTML_CLASS_I2SVG_BASE_CLASS = "fontawesome-i2svg";
var MUTATION_APPROACH_ASYNC = "async";
var TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ["HTML", "HEAD", "STYLE", "SCRIPT"];
var PRODUCTION = function() {
  try {
    return false;
  } catch (e2) {
    return false;
  }
}();
var FAMILY_CLASSIC = "classic";
var FAMILY_SHARP = "sharp";
var FAMILIES = [FAMILY_CLASSIC, FAMILY_SHARP];
var PREFIX_TO_STYLE = familyProxy((_familyProxy = {}, _defineProperty(_familyProxy, FAMILY_CLASSIC, {
  fa: "solid",
  fas: "solid",
  "fa-solid": "solid",
  far: "regular",
  "fa-regular": "regular",
  fal: "light",
  "fa-light": "light",
  fat: "thin",
  "fa-thin": "thin",
  fad: "duotone",
  "fa-duotone": "duotone",
  fab: "brands",
  "fa-brands": "brands",
  fak: "kit",
  fakd: "kit",
  "fa-kit": "kit",
  "fa-kit-duotone": "kit"
}), _defineProperty(_familyProxy, FAMILY_SHARP, {
  fa: "solid",
  fass: "solid",
  "fa-solid": "solid",
  fasr: "regular",
  "fa-regular": "regular",
  fasl: "light",
  "fa-light": "light",
  fast: "thin",
  "fa-thin": "thin"
}), _familyProxy));
var STYLE_TO_PREFIX = familyProxy((_familyProxy2 = {}, _defineProperty(_familyProxy2, FAMILY_CLASSIC, {
  solid: "fas",
  regular: "far",
  light: "fal",
  thin: "fat",
  duotone: "fad",
  brands: "fab",
  kit: "fak"
}), _defineProperty(_familyProxy2, FAMILY_SHARP, {
  solid: "fass",
  regular: "fasr",
  light: "fasl",
  thin: "fast"
}), _familyProxy2));
var PREFIX_TO_LONG_STYLE = familyProxy((_familyProxy3 = {}, _defineProperty(_familyProxy3, FAMILY_CLASSIC, {
  fab: "fa-brands",
  fad: "fa-duotone",
  fak: "fa-kit",
  fal: "fa-light",
  far: "fa-regular",
  fas: "fa-solid",
  fat: "fa-thin"
}), _defineProperty(_familyProxy3, FAMILY_SHARP, {
  fass: "fa-solid",
  fasr: "fa-regular",
  fasl: "fa-light",
  fast: "fa-thin"
}), _familyProxy3));
var LONG_STYLE_TO_PREFIX = familyProxy((_familyProxy4 = {}, _defineProperty(_familyProxy4, FAMILY_CLASSIC, {
  "fa-brands": "fab",
  "fa-duotone": "fad",
  "fa-kit": "fak",
  "fa-light": "fal",
  "fa-regular": "far",
  "fa-solid": "fas",
  "fa-thin": "fat"
}), _defineProperty(_familyProxy4, FAMILY_SHARP, {
  "fa-solid": "fass",
  "fa-regular": "fasr",
  "fa-light": "fasl",
  "fa-thin": "fast"
}), _familyProxy4));
var ICON_SELECTION_SYNTAX_PATTERN = /fa(s|r|l|t|d|b|k|ss|sr|sl|st)?[\-\ ]/;
var LAYERS_TEXT_CLASSNAME = "fa-layers-text";
var FONT_FAMILY_PATTERN = /Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp|Kit)?.*/i;
var FONT_WEIGHT_TO_PREFIX = familyProxy((_familyProxy5 = {}, _defineProperty(_familyProxy5, FAMILY_CLASSIC, {
  900: "fas",
  400: "far",
  normal: "far",
  300: "fal",
  100: "fat"
}), _defineProperty(_familyProxy5, FAMILY_SHARP, {
  900: "fass",
  400: "fasr",
  300: "fasl",
  100: "fast"
}), _familyProxy5));
var oneToTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var oneToTwenty = oneToTen.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
var ATTRIBUTES_WATCHED_FOR_MUTATION = ["class", "data-prefix", "data-icon", "data-fa-transform", "data-fa-mask"];
var DUOTONE_CLASSES = {
  GROUP: "duotone-group",
  SWAP_OPACITY: "swap-opacity",
  PRIMARY: "primary",
  SECONDARY: "secondary"
};
var prefixes = new Set;
Object.keys(STYLE_TO_PREFIX[FAMILY_CLASSIC]).map(prefixes.add.bind(prefixes));
Object.keys(STYLE_TO_PREFIX[FAMILY_SHARP]).map(prefixes.add.bind(prefixes));
var RESERVED_CLASSES = [].concat(FAMILIES, _toConsumableArray(prefixes), ["2xs", "xs", "sm", "lg", "xl", "2xl", "beat", "border", "fade", "beat-fade", "bounce", "flip-both", "flip-horizontal", "flip-vertical", "flip", "fw", "inverse", "layers-counter", "layers-text", "layers", "li", "pull-left", "pull-right", "pulse", "rotate-180", "rotate-270", "rotate-90", "rotate-by", "shake", "spin-pulse", "spin-reverse", "spin", "stack-1x", "stack-2x", "stack", "ul", DUOTONE_CLASSES.GROUP, DUOTONE_CLASSES.SWAP_OPACITY, DUOTONE_CLASSES.PRIMARY, DUOTONE_CLASSES.SECONDARY]).concat(oneToTen.map(function(n2) {
  return "".concat(n2, "x");
})).concat(oneToTwenty.map(function(n2) {
  return "w-".concat(n2);
}));
var initial = WINDOW.FontAwesomeConfig || {};
if (DOCUMENT && typeof DOCUMENT.querySelector === "function") {
  attrs = [["data-family-prefix", "familyPrefix"], ["data-css-prefix", "cssPrefix"], ["data-family-default", "familyDefault"], ["data-style-default", "styleDefault"], ["data-replacement-class", "replacementClass"], ["data-auto-replace-svg", "autoReplaceSvg"], ["data-auto-add-css", "autoAddCss"], ["data-auto-a11y", "autoA11y"], ["data-search-pseudo-elements", "searchPseudoElements"], ["data-observe-mutations", "observeMutations"], ["data-mutate-approach", "mutateApproach"], ["data-keep-original-source", "keepOriginalSource"], ["data-measure-performance", "measurePerformance"], ["data-show-missing-icons", "showMissingIcons"]];
  attrs.forEach(function(_ref2) {
    var _ref22 = _slicedToArray(_ref2, 2), attr = _ref22[0], key = _ref22[1];
    var val = coerce(getAttrConfig(attr));
    if (val !== undefined && val !== null) {
      initial[key] = val;
    }
  });
}
var attrs;
var _default = {
  styleDefault: "solid",
  familyDefault: "classic",
  cssPrefix: DEFAULT_CSS_PREFIX,
  replacementClass: DEFAULT_REPLACEMENT_CLASS,
  autoReplaceSvg: true,
  autoAddCss: true,
  autoA11y: true,
  searchPseudoElements: false,
  observeMutations: true,
  mutateApproach: "async",
  keepOriginalSource: true,
  measurePerformance: false,
  showMissingIcons: true
};
if (initial.familyPrefix) {
  initial.cssPrefix = initial.familyPrefix;
}
var _config = _objectSpread2(_objectSpread2({}, _default), initial);
if (!_config.autoReplaceSvg)
  _config.observeMutations = false;
var config = {};
Object.keys(_default).forEach(function(key) {
  Object.defineProperty(config, key, {
    enumerable: true,
    set: function set(val) {
      _config[key] = val;
      _onChangeCb.forEach(function(cb) {
        return cb(config);
      });
    },
    get: function get() {
      return _config[key];
    }
  });
});
Object.defineProperty(config, "familyPrefix", {
  enumerable: true,
  set: function set(val) {
    _config.cssPrefix = val;
    _onChangeCb.forEach(function(cb) {
      return cb(config);
    });
  },
  get: function get() {
    return _config.cssPrefix;
  }
});
WINDOW.FontAwesomeConfig = config;
var _onChangeCb = [];
var d2 = UNITS_IN_GRID;
var meaninglessTransform = {
  size: 16,
  x: 0,
  y: 0,
  rotate: 0,
  flipX: false,
  flipY: false
};
var idPool = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
var baseStyles = ":root, :host {\n  --fa-font-solid: normal 900 1em/1 \"Font Awesome 6 Solid\";\n  --fa-font-regular: normal 400 1em/1 \"Font Awesome 6 Regular\";\n  --fa-font-light: normal 300 1em/1 \"Font Awesome 6 Light\";\n  --fa-font-thin: normal 100 1em/1 \"Font Awesome 6 Thin\";\n  --fa-font-duotone: normal 900 1em/1 \"Font Awesome 6 Duotone\";\n  --fa-font-sharp-solid: normal 900 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-regular: normal 400 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-light: normal 300 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-thin: normal 100 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-brands: normal 400 1em/1 \"Font Awesome 6 Brands\";\n}\n\nsvg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {\n  overflow: visible;\n  box-sizing: content-box;\n}\n\n.svg-inline--fa {\n  display: var(--fa-display, inline-block);\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-2xs {\n  vertical-align: 0.1em;\n}\n.svg-inline--fa.fa-xs {\n  vertical-align: 0em;\n}\n.svg-inline--fa.fa-sm {\n  vertical-align: -0.0714285705em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.2em;\n}\n.svg-inline--fa.fa-xl {\n  vertical-align: -0.25em;\n}\n.svg-inline--fa.fa-2xl {\n  vertical-align: -0.3125em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-li {\n  width: var(--fa-li-width, 2em);\n  top: 0.25em;\n}\n.svg-inline--fa.fa-fw {\n  width: var(--fa-fw-width, 1.25em);\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: var(--fa-counter-background-color, #ff253a);\n  border-radius: var(--fa-counter-border-radius, 1em);\n  box-sizing: border-box;\n  color: var(--fa-inverse, #fff);\n  line-height: var(--fa-counter-line-height, 1);\n  max-width: var(--fa-counter-max-width, 5em);\n  min-width: var(--fa-counter-min-width, 1.5em);\n  overflow: hidden;\n  padding: var(--fa-counter-padding, 0.25em 0.5em);\n  right: var(--fa-right, 0);\n  text-overflow: ellipsis;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-counter-scale, 0.25));\n          transform: scale(var(--fa-counter-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: var(--fa-bottom, 0);\n  right: var(--fa-right, 0);\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom right;\n          transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: var(--fa-bottom, 0);\n  left: var(--fa-left, 0);\n  right: auto;\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom left;\n          transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  top: var(--fa-top, 0);\n  right: var(--fa-right, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: var(--fa-left, 0);\n  right: auto;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top left;\n          transform-origin: top left;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.0833333337em;\n  vertical-align: 0.125em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.0714285718em;\n  vertical-align: 0.0535714295em;\n}\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em;\n}\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.0416666682em;\n  vertical-align: -0.125em;\n}\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: calc(var(--fa-li-width, 2em) * -1);\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit;\n}\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);\n}\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-beat {\n  -webkit-animation-name: fa-beat;\n          animation-name: fa-beat;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-bounce {\n  -webkit-animation-name: fa-bounce;\n          animation-name: fa-bounce;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n}\n\n.fa-fade {\n  -webkit-animation-name: fa-fade;\n          animation-name: fa-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-beat-fade {\n  -webkit-animation-name: fa-beat-fade;\n          animation-name: fa-beat-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-flip {\n  -webkit-animation-name: fa-flip;\n          animation-name: fa-flip;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-shake {\n  -webkit-animation-name: fa-shake;\n          animation-name: fa-shake;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 2s);\n          animation-duration: var(--fa-animation-duration, 2s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse;\n}\n\n.fa-pulse,\n.fa-spin-pulse {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, steps(8));\n          animation-timing-function: var(--fa-animation-timing, steps(8));\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n.fa-bounce,\n.fa-fade,\n.fa-beat-fade,\n.fa-flip,\n.fa-pulse,\n.fa-shake,\n.fa-spin,\n.fa-spin-pulse {\n    -webkit-animation-delay: -1ms;\n            animation-delay: -1ms;\n    -webkit-animation-duration: 1ms;\n            animation-duration: 1ms;\n    -webkit-animation-iteration-count: 1;\n            animation-iteration-count: 1;\n    -webkit-transition-delay: 0s;\n            transition-delay: 0s;\n    -webkit-transition-duration: 0s;\n            transition-duration: 0s;\n  }\n}\n@-webkit-keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@-webkit-keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@-webkit-keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@-webkit-keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@-webkit-keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@-webkit-keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  -webkit-transform: scale(-1, 1);\n          transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  -webkit-transform: scale(1, -1);\n          transform: scale(1, -1);\n}\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  -webkit-transform: scale(-1, -1);\n          transform: scale(-1, -1);\n}\n\n.fa-rotate-by {\n  -webkit-transform: rotate(var(--fa-rotate-angle, none));\n          transform: rotate(var(--fa-rotate-angle, none));\n}\n\n.fa-stack {\n  display: inline-block;\n  vertical-align: middle;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n  z-index: var(--fa-stack-z-index, auto);\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}\n\n.fad.fa-inverse,\n.fa-duotone.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}";
var _cssInserted = false;
var InjectCSS = {
  mixout: function mixout() {
    return {
      dom: {
        css,
        insertCss: ensureCss
      }
    };
  },
  hooks: function hooks() {
    return {
      beforeDOMElementCreation: function beforeDOMElementCreation() {
        ensureCss();
      },
      beforeI2svg: function beforeI2svg() {
        ensureCss();
      }
    };
  }
};
var w2 = WINDOW || {};
if (!w2[NAMESPACE_IDENTIFIER])
  w2[NAMESPACE_IDENTIFIER] = {};
if (!w2[NAMESPACE_IDENTIFIER].styles)
  w2[NAMESPACE_IDENTIFIER].styles = {};
if (!w2[NAMESPACE_IDENTIFIER].hooks)
  w2[NAMESPACE_IDENTIFIER].hooks = {};
if (!w2[NAMESPACE_IDENTIFIER].shims)
  w2[NAMESPACE_IDENTIFIER].shims = [];
var namespace = w2[NAMESPACE_IDENTIFIER];
var functions = [];
var listener = function listener2() {
  DOCUMENT.removeEventListener("DOMContentLoaded", listener2);
  loaded = 1;
  functions.map(function(fn2) {
    return fn2();
  });
};
var loaded = false;
if (IS_DOM) {
  loaded = (DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(DOCUMENT.readyState);
  if (!loaded)
    DOCUMENT.addEventListener("DOMContentLoaded", listener);
}
var bindInternal4 = function bindInternal42(func, thisContext) {
  return function(a2, b2, c2, d3) {
    return func.call(thisContext, a2, b2, c2, d3);
  };
};
var reduce = function fastReduceObject(subject, fn2, initialValue, thisContext) {
  var keys = Object.keys(subject), length = keys.length, iterator = thisContext !== undefined ? bindInternal4(fn2, thisContext) : fn2, i2, key, result;
  if (initialValue === undefined) {
    i2 = 1;
    result = subject[keys[0]];
  } else {
    i2 = 0;
    result = initialValue;
  }
  for (;i2 < length; i2++) {
    key = keys[i2];
    result = iterator(result, subject[key], key, subject);
  }
  return result;
};
var _LONG_STYLE;
var _PREFIXES;
var _PREFIXES_FOR_FAMILY;
var styles = namespace.styles;
var shims = namespace.shims;
var LONG_STYLE = (_LONG_STYLE = {}, _defineProperty(_LONG_STYLE, FAMILY_CLASSIC, Object.values(PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC])), _defineProperty(_LONG_STYLE, FAMILY_SHARP, Object.values(PREFIX_TO_LONG_STYLE[FAMILY_SHARP])), _LONG_STYLE);
var _defaultUsablePrefix = null;
var _byUnicode = {};
var _byLigature = {};
var _byOldName = {};
var _byOldUnicode = {};
var _byAlias = {};
var PREFIXES = (_PREFIXES = {}, _defineProperty(_PREFIXES, FAMILY_CLASSIC, Object.keys(PREFIX_TO_STYLE[FAMILY_CLASSIC])), _defineProperty(_PREFIXES, FAMILY_SHARP, Object.keys(PREFIX_TO_STYLE[FAMILY_SHARP])), _PREFIXES);
var build = function build2() {
  var lookup = function lookup(reducer) {
    return reduce(styles, function(o2, style, prefix) {
      o2[prefix] = reduce(style, reducer, {});
      return o2;
    }, {});
  };
  _byUnicode = lookup(function(acc, icon, iconName) {
    if (icon[3]) {
      acc[icon[3]] = iconName;
    }
    if (icon[2]) {
      var aliases = icon[2].filter(function(a2) {
        return typeof a2 === "number";
      });
      aliases.forEach(function(alias) {
        acc[alias.toString(16)] = iconName;
      });
    }
    return acc;
  });
  _byLigature = lookup(function(acc, icon, iconName) {
    acc[iconName] = iconName;
    if (icon[2]) {
      var aliases = icon[2].filter(function(a2) {
        return typeof a2 === "string";
      });
      aliases.forEach(function(alias) {
        acc[alias] = iconName;
      });
    }
    return acc;
  });
  _byAlias = lookup(function(acc, icon, iconName) {
    var aliases = icon[2];
    acc[iconName] = iconName;
    aliases.forEach(function(alias) {
      acc[alias] = iconName;
    });
    return acc;
  });
  var hasRegular = ("far" in styles) || config.autoFetchSvg;
  var shimLookups = reduce(shims, function(acc, shim) {
    var maybeNameMaybeUnicode = shim[0];
    var prefix = shim[1];
    var iconName = shim[2];
    if (prefix === "far" && !hasRegular) {
      prefix = "fas";
    }
    if (typeof maybeNameMaybeUnicode === "string") {
      acc.names[maybeNameMaybeUnicode] = {
        prefix,
        iconName
      };
    }
    if (typeof maybeNameMaybeUnicode === "number") {
      acc.unicodes[maybeNameMaybeUnicode.toString(16)] = {
        prefix,
        iconName
      };
    }
    return acc;
  }, {
    names: {},
    unicodes: {}
  });
  _byOldName = shimLookups.names;
  _byOldUnicode = shimLookups.unicodes;
  _defaultUsablePrefix = getCanonicalPrefix(config.styleDefault, {
    family: config.familyDefault
  });
};
onChange(function(c2) {
  _defaultUsablePrefix = getCanonicalPrefix(c2.styleDefault, {
    family: config.familyDefault
  });
});
build();
var emptyCanonicalIcon = function emptyCanonicalIcon2() {
  return {
    prefix: null,
    iconName: null,
    rest: []
  };
};
var PREFIXES_FOR_FAMILY = (_PREFIXES_FOR_FAMILY = {}, _defineProperty(_PREFIXES_FOR_FAMILY, FAMILY_CLASSIC, Object.keys(PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC])), _defineProperty(_PREFIXES_FOR_FAMILY, FAMILY_SHARP, Object.keys(PREFIX_TO_LONG_STYLE[FAMILY_SHARP])), _PREFIXES_FOR_FAMILY);
var Library = function() {
  function Library2() {
    _classCallCheck(this, Library2);
    this.definitions = {};
  }
  _createClass(Library2, [{
    key: "add",
    value: function add() {
      var _this = this;
      for (var _len = arguments.length, definitions = new Array(_len), _key = 0;_key < _len; _key++) {
        definitions[_key] = arguments[_key];
      }
      var additions = definitions.reduce(this._pullDefinitions, {});
      Object.keys(additions).forEach(function(key) {
        _this.definitions[key] = _objectSpread2(_objectSpread2({}, _this.definitions[key] || {}), additions[key]);
        defineIcons(key, additions[key]);
        var longPrefix = PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC][key];
        if (longPrefix)
          defineIcons(longPrefix, additions[key]);
        build();
      });
    }
  }, {
    key: "reset",
    value: function reset() {
      this.definitions = {};
    }
  }, {
    key: "_pullDefinitions",
    value: function _pullDefinitions(additions, definition) {
      var normalized = definition.prefix && definition.iconName && definition.icon ? {
        0: definition
      } : definition;
      Object.keys(normalized).map(function(key) {
        var _normalized$key = normalized[key], prefix = _normalized$key.prefix, iconName = _normalized$key.iconName, icon = _normalized$key.icon;
        var aliases = icon[2];
        if (!additions[prefix])
          additions[prefix] = {};
        if (aliases.length > 0) {
          aliases.forEach(function(alias) {
            if (typeof alias === "string") {
              additions[prefix][alias] = icon;
            }
          });
        }
        additions[prefix][iconName] = icon;
      });
      return additions;
    }
  }]);
  return Library2;
}();
var _plugins = [];
var _hooks = {};
var providers = {};
var defaultProviderKeys = Object.keys(providers);
var library = new Library;
var noAuto = function noAuto2() {
  config.autoReplaceSvg = false;
  config.observeMutations = false;
  callHooks("noAuto");
};
var dom = {
  i2svg: function i2svg() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (IS_DOM) {
      callHooks("beforeI2svg", params);
      callProvided("pseudoElements2svg", params);
      return callProvided("i2svg", params);
    } else {
      return Promise.reject("Operation requires a DOM of some kind.");
    }
  },
  watch: function watch() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var autoReplaceSvgRoot = params.autoReplaceSvgRoot;
    if (config.autoReplaceSvg === false) {
      config.autoReplaceSvg = true;
    }
    config.observeMutations = true;
    domready(function() {
      autoReplace({
        autoReplaceSvgRoot
      });
      callHooks("watch", params);
    });
  }
};
var parse = {
  icon: function icon(_icon) {
    if (_icon === null) {
      return null;
    }
    if (_typeof(_icon) === "object" && _icon.prefix && _icon.iconName) {
      return {
        prefix: _icon.prefix,
        iconName: byAlias(_icon.prefix, _icon.iconName) || _icon.iconName
      };
    }
    if (Array.isArray(_icon) && _icon.length === 2) {
      var iconName = _icon[1].indexOf("fa-") === 0 ? _icon[1].slice(3) : _icon[1];
      var prefix = getCanonicalPrefix(_icon[0]);
      return {
        prefix,
        iconName: byAlias(prefix, iconName) || iconName
      };
    }
    if (typeof _icon === "string" && (_icon.indexOf("".concat(config.cssPrefix, "-")) > -1 || _icon.match(ICON_SELECTION_SYNTAX_PATTERN))) {
      var canonicalIcon = getCanonicalIcon(_icon.split(" "), {
        skipLookups: true
      });
      return {
        prefix: canonicalIcon.prefix || getDefaultUsablePrefix(),
        iconName: byAlias(canonicalIcon.prefix, canonicalIcon.iconName) || canonicalIcon.iconName
      };
    }
    if (typeof _icon === "string") {
      var _prefix = getDefaultUsablePrefix();
      return {
        prefix: _prefix,
        iconName: byAlias(_prefix, _icon) || _icon
      };
    }
  }
};
var api = {
  noAuto,
  config,
  dom,
  parse,
  library,
  findIconDefinition,
  toHtml
};
var autoReplace = function autoReplace2() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _params$autoReplaceSv = params.autoReplaceSvgRoot, autoReplaceSvgRoot = _params$autoReplaceSv === undefined ? DOCUMENT : _params$autoReplaceSv;
  if ((Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) && IS_DOM && config.autoReplaceSvg)
    api.dom.i2svg({
      node: autoReplaceSvgRoot
    });
};
var styles$1 = namespace.styles;
var missingIconResolutionMixin = {
  found: false,
  width: 512,
  height: 512
};
var noop$1 = function noop3() {
};
var p2 = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
  mark: noop$1,
  measure: noop$1
};
var preamble = "FA \"6.5.1\"";
var begin = function begin2(name) {
  p2.mark("".concat(preamble, " ").concat(name, " begins"));
  return function() {
    return end(name);
  };
};
var end = function end2(name) {
  p2.mark("".concat(preamble, " ").concat(name, " ends"));
  p2.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
};
var perf = {
  begin,
  end
};
var noop$2 = function noop4() {
};
var mutators = {
  replace: function replace2(mutation) {
    var node = mutation[0];
    if (node.parentNode) {
      mutation[1].forEach(function(_abstract) {
        node.parentNode.insertBefore(convertSVG(_abstract), node);
      });
      if (node.getAttribute(DATA_FA_I2SVG) === null && config.keepOriginalSource) {
        var comment = DOCUMENT.createComment(nodeAsComment(node));
        node.parentNode.replaceChild(comment, node);
      } else {
        node.remove();
      }
    }
  },
  nest: function nest(mutation) {
    var node = mutation[0];
    var _abstract2 = mutation[1];
    if (~classArray(node).indexOf(config.replacementClass)) {
      return mutators.replace(mutation);
    }
    var forSvg = new RegExp("".concat(config.cssPrefix, "-.*"));
    delete _abstract2[0].attributes.id;
    if (_abstract2[0].attributes.class) {
      var splitClasses = _abstract2[0].attributes.class.split(" ").reduce(function(acc, cls) {
        if (cls === config.replacementClass || cls.match(forSvg)) {
          acc.toSvg.push(cls);
        } else {
          acc.toNode.push(cls);
        }
        return acc;
      }, {
        toNode: [],
        toSvg: []
      });
      _abstract2[0].attributes.class = splitClasses.toSvg.join(" ");
      if (splitClasses.toNode.length === 0) {
        node.removeAttribute("class");
      } else {
        node.setAttribute("class", splitClasses.toNode.join(" "));
      }
    }
    var newInnerHTML = _abstract2.map(function(a2) {
      return toHtml(a2);
    }).join("\n");
    node.setAttribute(DATA_FA_I2SVG, "");
    node.innerHTML = newInnerHTML;
  }
};
var disabled = false;
var mo = null;
var styles$2 = namespace.styles;
var knownPrefixes = new Set;
FAMILIES.map(function(family) {
  knownPrefixes.add("fa-".concat(family));
});
Object.keys(PREFIX_TO_STYLE[FAMILY_CLASSIC]).map(knownPrefixes.add.bind(knownPrefixes));
Object.keys(PREFIX_TO_STYLE[FAMILY_SHARP]).map(knownPrefixes.add.bind(knownPrefixes));
knownPrefixes = _toConsumableArray(knownPrefixes);
var render = function render2(iconDefinition) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$transform = params.transform, transform = _params$transform === undefined ? meaninglessTransform : _params$transform, _params$symbol = params.symbol, symbol = _params$symbol === undefined ? false : _params$symbol, _params$mask = params.mask, mask = _params$mask === undefined ? null : _params$mask, _params$maskId = params.maskId, maskId = _params$maskId === undefined ? null : _params$maskId, _params$title = params.title, title = _params$title === undefined ? null : _params$title, _params$titleId = params.titleId, titleId = _params$titleId === undefined ? null : _params$titleId, _params$classes = params.classes, classes = _params$classes === undefined ? [] : _params$classes, _params$attributes = params.attributes, attributes = _params$attributes === undefined ? {} : _params$attributes, _params$styles = params.styles, styles2 = _params$styles === undefined ? {} : _params$styles;
  if (!iconDefinition)
    return;
  var { prefix, iconName, icon: icon2 } = iconDefinition;
  return domVariants(_objectSpread2({
    type: "icon"
  }, iconDefinition), function() {
    callHooks("beforeDOMElementCreation", {
      iconDefinition,
      params
    });
    if (config.autoA11y) {
      if (title) {
        attributes["aria-labelledby"] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
      } else {
        attributes["aria-hidden"] = "true";
        attributes["focusable"] = "false";
      }
    }
    return makeInlineSvgAbstract({
      icons: {
        main: asFoundIcon(icon2),
        mask: mask ? asFoundIcon(mask.icon) : {
          found: false,
          width: null,
          height: null,
          icon: {}
        }
      },
      prefix,
      iconName,
      transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
      symbol,
      title,
      maskId,
      titleId,
      extra: {
        attributes,
        styles: styles2,
        classes
      }
    });
  });
};
var ReplaceElements = {
  mixout: function mixout2() {
    return {
      icon: resolveIcons(render)
    };
  },
  hooks: function hooks2() {
    return {
      mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
        accumulator.treeCallback = onTree;
        accumulator.nodeCallback = onNode;
        return accumulator;
      }
    };
  },
  provides: function provides(providers$$1) {
    providers$$1.i2svg = function(params) {
      var _params$node = params.node, node = _params$node === undefined ? DOCUMENT : _params$node, _params$callback = params.callback, callback = _params$callback === undefined ? function() {
      } : _params$callback;
      return onTree(node, callback);
    };
    providers$$1.generateSvgReplacementMutation = function(node, nodeMeta) {
      var { iconName, title, titleId, prefix, transform, symbol, mask, maskId, extra } = nodeMeta;
      return new Promise(function(resolve, reject) {
        Promise.all([findIcon(iconName, prefix), mask.iconName ? findIcon(mask.iconName, mask.prefix) : Promise.resolve({
          found: false,
          width: 512,
          height: 512,
          icon: {}
        })]).then(function(_ref2) {
          var _ref22 = _slicedToArray(_ref2, 2), main = _ref22[0], mask2 = _ref22[1];
          resolve([node, makeInlineSvgAbstract({
            icons: {
              main,
              mask: mask2
            },
            prefix,
            iconName,
            transform,
            symbol,
            maskId,
            title,
            titleId,
            extra,
            watchable: true
          })]);
        }).catch(reject);
      });
    };
    providers$$1.generateAbstractIcon = function(_ref3) {
      var { children, attributes, main, transform, styles: styles2 } = _ref3;
      var styleString = joinStyles(styles2);
      if (styleString.length > 0) {
        attributes["style"] = styleString;
      }
      var nextChild;
      if (transformIsMeaningful(transform)) {
        nextChild = callProvided("generateAbstractTransformGrouping", {
          main,
          transform,
          containerWidth: main.width,
          iconWidth: main.width
        });
      }
      children.push(nextChild || main.icon);
      return {
        children,
        attributes
      };
    };
  }
};
var Layers = {
  mixout: function mixout3() {
    return {
      layer: function layer(assembler) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _params$classes = params.classes, classes = _params$classes === undefined ? [] : _params$classes;
        return domVariants({
          type: "layer"
        }, function() {
          callHooks("beforeDOMElementCreation", {
            assembler,
            params
          });
          var children = [];
          assembler(function(args) {
            Array.isArray(args) ? args.map(function(a2) {
              children = children.concat(a2.abstract);
            }) : children = children.concat(args.abstract);
          });
          return [{
            tag: "span",
            attributes: {
              class: ["".concat(config.cssPrefix, "-layers")].concat(_toConsumableArray(classes)).join(" ")
            },
            children
          }];
        });
      }
    };
  }
};
var LayersCounter = {
  mixout: function mixout4() {
    return {
      counter: function counter(content) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _params$title = params.title, title = _params$title === undefined ? null : _params$title, _params$classes = params.classes, classes = _params$classes === undefined ? [] : _params$classes, _params$attributes = params.attributes, attributes = _params$attributes === undefined ? {} : _params$attributes, _params$styles = params.styles, styles2 = _params$styles === undefined ? {} : _params$styles;
        return domVariants({
          type: "counter",
          content
        }, function() {
          callHooks("beforeDOMElementCreation", {
            content,
            params
          });
          return makeLayersCounterAbstract({
            content: content.toString(),
            title,
            extra: {
              attributes,
              styles: styles2,
              classes: ["".concat(config.cssPrefix, "-layers-counter")].concat(_toConsumableArray(classes))
            }
          });
        });
      }
    };
  }
};
var LayersText = {
  mixout: function mixout5() {
    return {
      text: function text(content) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var _params$transform = params.transform, transform = _params$transform === undefined ? meaninglessTransform : _params$transform, _params$title = params.title, title = _params$title === undefined ? null : _params$title, _params$classes = params.classes, classes = _params$classes === undefined ? [] : _params$classes, _params$attributes = params.attributes, attributes = _params$attributes === undefined ? {} : _params$attributes, _params$styles = params.styles, styles2 = _params$styles === undefined ? {} : _params$styles;
        return domVariants({
          type: "text",
          content
        }, function() {
          callHooks("beforeDOMElementCreation", {
            content,
            params
          });
          return makeLayersTextAbstract({
            content,
            transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
            title,
            extra: {
              attributes,
              styles: styles2,
              classes: ["".concat(config.cssPrefix, "-layers-text")].concat(_toConsumableArray(classes))
            }
          });
        });
      }
    };
  },
  provides: function provides2(providers$$1) {
    providers$$1.generateLayersText = function(node, nodeMeta) {
      var { title, transform, extra } = nodeMeta;
      var width = null;
      var height = null;
      if (IS_IE) {
        var computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
        var boundingClientRect = node.getBoundingClientRect();
        width = boundingClientRect.width / computedFontSize;
        height = boundingClientRect.height / computedFontSize;
      }
      if (config.autoA11y && !title) {
        extra.attributes["aria-hidden"] = "true";
      }
      return Promise.resolve([node, makeLayersTextAbstract({
        content: node.innerHTML,
        width,
        height,
        transform,
        title,
        extra,
        watchable: true
      })]);
    };
  }
};
var CLEAN_CONTENT_PATTERN = new RegExp("\"", "ug");
var SECONDARY_UNICODE_RANGE = [1105920, 1112319];
var PseudoElements = {
  hooks: function hooks3() {
    return {
      mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
        accumulator.pseudoElementsCallback = searchPseudoElements;
        return accumulator;
      }
    };
  },
  provides: function provides3(providers$$1) {
    providers$$1.pseudoElements2svg = function(params) {
      var _params$node = params.node, node = _params$node === undefined ? DOCUMENT : _params$node;
      if (config.searchPseudoElements) {
        searchPseudoElements(node);
      }
    };
  }
};
var _unwatched = false;
var MutationObserver$1 = {
  mixout: function mixout6() {
    return {
      dom: {
        unwatch: function unwatch() {
          disableObservation();
          _unwatched = true;
        }
      }
    };
  },
  hooks: function hooks4() {
    return {
      bootstrap: function bootstrap() {
        observe(chainHooks("mutationObserverCallbacks", {}));
      },
      noAuto: function noAuto() {
        disconnect();
      },
      watch: function watch(params) {
        var observeMutationsRoot = params.observeMutationsRoot;
        if (_unwatched) {
          enableObservation();
        } else {
          observe(chainHooks("mutationObserverCallbacks", {
            observeMutationsRoot
          }));
        }
      }
    };
  }
};
var parseTransformString = function parseTransformString2(transformString) {
  var transform = {
    size: 16,
    x: 0,
    y: 0,
    flipX: false,
    flipY: false,
    rotate: 0
  };
  return transformString.toLowerCase().split(" ").reduce(function(acc, n2) {
    var parts = n2.toLowerCase().split("-");
    var first = parts[0];
    var rest = parts.slice(1).join("-");
    if (first && rest === "h") {
      acc.flipX = true;
      return acc;
    }
    if (first && rest === "v") {
      acc.flipY = true;
      return acc;
    }
    rest = parseFloat(rest);
    if (isNaN(rest)) {
      return acc;
    }
    switch (first) {
      case "grow":
        acc.size = acc.size + rest;
        break;
      case "shrink":
        acc.size = acc.size - rest;
        break;
      case "left":
        acc.x = acc.x - rest;
        break;
      case "right":
        acc.x = acc.x + rest;
        break;
      case "up":
        acc.y = acc.y - rest;
        break;
      case "down":
        acc.y = acc.y + rest;
        break;
      case "rotate":
        acc.rotate = acc.rotate + rest;
        break;
    }
    return acc;
  }, transform);
};
var PowerTransforms = {
  mixout: function mixout7() {
    return {
      parse: {
        transform: function transform(transformString) {
          return parseTransformString(transformString);
        }
      }
    };
  },
  hooks: function hooks5() {
    return {
      parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
        var transformString = node.getAttribute("data-fa-transform");
        if (transformString) {
          accumulator.transform = parseTransformString(transformString);
        }
        return accumulator;
      }
    };
  },
  provides: function provides4(providers2) {
    providers2.generateAbstractTransformGrouping = function(_ref2) {
      var { main, transform, containerWidth, iconWidth } = _ref2;
      var outer = {
        transform: "translate(".concat(containerWidth / 2, " 256)")
      };
      var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
      var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
      var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
      var inner = {
        transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
      };
      var path = {
        transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
      };
      var operations = {
        outer,
        inner,
        path
      };
      return {
        tag: "g",
        attributes: _objectSpread2({}, operations.outer),
        children: [{
          tag: "g",
          attributes: _objectSpread2({}, operations.inner),
          children: [{
            tag: main.icon.tag,
            children: main.icon.children,
            attributes: _objectSpread2(_objectSpread2({}, main.icon.attributes), operations.path)
          }]
        }]
      };
    };
  }
};
var ALL_SPACE = {
  x: 0,
  y: 0,
  width: "100%",
  height: "100%"
};
var Masks = {
  hooks: function hooks6() {
    return {
      parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
        var maskData = node.getAttribute("data-fa-mask");
        var mask = !maskData ? emptyCanonicalIcon() : getCanonicalIcon(maskData.split(" ").map(function(i2) {
          return i2.trim();
        }));
        if (!mask.prefix) {
          mask.prefix = getDefaultUsablePrefix();
        }
        accumulator.mask = mask;
        accumulator.maskId = node.getAttribute("data-fa-mask-id");
        return accumulator;
      }
    };
  },
  provides: function provides5(providers2) {
    providers2.generateAbstractMask = function(_ref2) {
      var { children, attributes, main, mask, maskId: explicitMaskId, transform } = _ref2;
      var { width: mainWidth, icon: mainPath } = main;
      var { width: maskWidth, icon: maskPath } = mask;
      var trans = transformForSvg({
        transform,
        containerWidth: maskWidth,
        iconWidth: mainWidth
      });
      var maskRect = {
        tag: "rect",
        attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
          fill: "white"
        })
      };
      var maskInnerGroupChildrenMixin = mainPath.children ? {
        children: mainPath.children.map(fillBlack)
      } : {};
      var maskInnerGroup = {
        tag: "g",
        attributes: _objectSpread2({}, trans.inner),
        children: [fillBlack(_objectSpread2({
          tag: mainPath.tag,
          attributes: _objectSpread2(_objectSpread2({}, mainPath.attributes), trans.path)
        }, maskInnerGroupChildrenMixin))]
      };
      var maskOuterGroup = {
        tag: "g",
        attributes: _objectSpread2({}, trans.outer),
        children: [maskInnerGroup]
      };
      var maskId = "mask-".concat(explicitMaskId || nextUniqueId());
      var clipId = "clip-".concat(explicitMaskId || nextUniqueId());
      var maskTag = {
        tag: "mask",
        attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
          id: maskId,
          maskUnits: "userSpaceOnUse",
          maskContentUnits: "userSpaceOnUse"
        }),
        children: [maskRect, maskOuterGroup]
      };
      var defs = {
        tag: "defs",
        children: [{
          tag: "clipPath",
          attributes: {
            id: clipId
          },
          children: deGroup(maskPath)
        }, maskTag]
      };
      children.push(defs, {
        tag: "rect",
        attributes: _objectSpread2({
          fill: "currentColor",
          "clip-path": "url(#".concat(clipId, ")"),
          mask: "url(#".concat(maskId, ")")
        }, ALL_SPACE)
      });
      return {
        children,
        attributes
      };
    };
  }
};
var MissingIconIndicator = {
  provides: function provides6(providers2) {
    var reduceMotion = false;
    if (WINDOW.matchMedia) {
      reduceMotion = WINDOW.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    providers2.missingIconAbstract = function() {
      var gChildren = [];
      var FILL = {
        fill: "currentColor"
      };
      var ANIMATION_BASE = {
        attributeType: "XML",
        repeatCount: "indefinite",
        dur: "2s"
      };
      gChildren.push({
        tag: "path",
        attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
          d: "M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"
        })
      });
      var OPACITY_ANIMATE = _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
        attributeName: "opacity"
      });
      var dot = {
        tag: "circle",
        attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
          cx: "256",
          cy: "364",
          r: "28"
        }),
        children: []
      };
      if (!reduceMotion) {
        dot.children.push({
          tag: "animate",
          attributes: _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
            attributeName: "r",
            values: "28;14;28;28;14;28;"
          })
        }, {
          tag: "animate",
          attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
            values: "1;0;1;1;0;1;"
          })
        });
      }
      gChildren.push(dot);
      gChildren.push({
        tag: "path",
        attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
          opacity: "1",
          d: "M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"
        }),
        children: reduceMotion ? [] : [{
          tag: "animate",
          attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
            values: "1;0;0;0;0;1;"
          })
        }]
      });
      if (!reduceMotion) {
        gChildren.push({
          tag: "path",
          attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
            opacity: "0",
            d: "M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"
          }),
          children: [{
            tag: "animate",
            attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
              values: "0;0;1;1;0;0;"
            })
          }]
        });
      }
      return {
        tag: "g",
        attributes: {
          class: "missing"
        },
        children: gChildren
      };
    };
  }
};
var SvgSymbols = {
  hooks: function hooks7() {
    return {
      parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
        var symbolData = node.getAttribute("data-fa-symbol");
        var symbol = symbolData === null ? false : symbolData === "" ? true : symbolData;
        accumulator["symbol"] = symbol;
        return accumulator;
      }
    };
  }
};
var plugins = [InjectCSS, ReplaceElements, Layers, LayersCounter, LayersText, PseudoElements, MutationObserver$1, PowerTransforms, Masks, MissingIconIndicator, SvgSymbols];
registerPlugins(plugins, {
  mixoutsTo: api
});
var noAuto$1 = api.noAuto;
var config$1 = api.config;
var library$1 = api.library;
var dom$1 = api.dom;
var parse$1 = api.parse;
var findIconDefinition$1 = api.findIconDefinition;
var toHtml$1 = api.toHtml;
var icon2 = api.icon;
var layer = api.layer;
var text = api.text;
var counter = api.counter;

// node_modules/slim-select/dist/slimselect.jsjsjsn_guarant
var faCalendarDays = {
  prefix: "fas",
  iconName: "calendar-days",
  icon: [448, 512, ["calendar-alt"], "f073", "M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z"]
};
var faCalendarAlt = faCalendarDays;
var faRightFromBracket = {
  prefix: "fas",
  iconName: "right-from-bracket",
  icon: [512, 512, ["sign-out-alt"], "f2f5", "M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"]
};
var faSignOutAlt = faRightFromBracket;
var faFileCsv = {
  prefix: "fas",
  iconName: "file-csv",
  icon: [512, 512, [], "f6dd", "M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM200 352h16c22.1 0 40 17.9 40 40v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v80c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8v-8c0-8.8 7.2-16 16-16s16 7.2 16 16v8c0 22.1-17.9 40-40 40H200c-22.1 0-40-17.9-40-40V392c0-22.1 17.9-40 40-40zm133.1 0H368c8.8 0 16 7.2 16 16s-7.2 16-16 16H333.1c-7.2 0-13.1 5.9-13.1 13.1c0 5.2 3 9.9 7.8 12l37.4 16.6c16.3 7.2 26.8 23.4 26.8 41.2c0 24.9-20.2 45.1-45.1 45.1H304c-8.8 0-16-7.2-16-16s7.2-16 16-16h42.9c7.2 0 13.1-5.9 13.1-13.1c0-5.2-3-9.9-7.8-12l-37.4-16.6c-16.3-7.2-26.8-23.4-26.8-41.2c0-24.9 20.2-45.1 45.1-45.1zm98.9 0c8.8 0 16 7.2 16 16v31.6c0 23 5.5 45.6 16 66c10.5-20.3 16-42.9 16-66V368c0-8.8 7.2-16 16-16s16 7.2 16 16v31.6c0 34.7-10.3 68.7-29.6 97.6l-5.1 7.7c-3 4.5-8 7.1-13.3 7.1s-10.3-2.7-13.3-7.1l-5.1-7.7c-19.3-28.9-29.6-62.9-29.6-97.6V368c0-8.8 7.2-16 16-16z"]
};
var faHeading = {
  prefix: "fas",
  iconName: "heading",
  icon: [448, 512, ["header"], "f1dc", "M0 64C0 46.3 14.3 32 32 32H80h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H112V208H336V96H320c-17.7 0-32-14.3-32-32s14.3-32 32-32h48 48c17.7 0 32 14.3 32 32s-14.3 32-32 32H400V240 416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H368 320c-17.7 0-32-14.3-32-32s14.3-32 32-32h16V272H112V416h16c17.7 0 32 14.3 32 32s-14.3 32-32 32H80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V240 96H32C14.3 96 0 81.7 0 64z"]
};
var faList = {
  prefix: "fas",
  iconName: "list",
  icon: [512, 512, ["list-squares"], "f03a", "M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"]
};
var faPenToSquare = {
  prefix: "fas",
  iconName: "pen-to-square",
  icon: [512, 512, ["edit"], "f044", "M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"]
};
var faEdit = faPenToSquare;
var faUsers = {
  prefix: "fas",
  iconName: "users",
  icon: [640, 512, [], "f0c0", "M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z"]
};
var faUser = {
  prefix: "fas",
  iconName: "user",
  icon: [448, 512, [128100, 62144], "f007", "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"]
};
var faGlobe = {
  prefix: "fas",
  iconName: "globe",
  icon: [512, 512, [127760], "f0ac", "M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"]
};
var faMaximize = {
  prefix: "fas",
  iconName: "maximize",
  icon: [512, 512, ["expand-arrows-alt"], "f31e", "M200 32H56C42.7 32 32 42.7 32 56V200c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79L73 295c-6.9-6.9-17.2-8.9-26.2-5.2S32 302.3 32 312V456c0 13.3 10.7 24 24 24H200c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H456c13.3 0 24-10.7 24-24V312c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2V56c0-13.3-10.7-24-24-24H312c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S209.7 32 200 32z"]
};
var faRightToBracket = {
  prefix: "fas",
  iconName: "right-to-bracket",
  icon: [512, 512, ["sign-in-alt"], "f2f6", "M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"]
};
var faSignInAlt = faRightToBracket;
var faFolderOpen = {
  prefix: "fas",
  iconName: "folder-open",
  icon: [576, 512, [128194, 128449, 61717], "f07c", "M88.7 223.8L0 375.8V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H416c35.3 0 64 28.7 64 64v32H144c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224H544c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480H32c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z"]
};
var faSignature = {
  prefix: "fas",
  iconName: "signature",
  icon: [640, 512, [], "f5b7", "M192 128c0-17.7 14.3-32 32-32s32 14.3 32 32v7.8c0 27.7-2.4 55.3-7.1 82.5l-84.4 25.3c-40.6 12.2-68.4 49.6-68.4 92v71.9c0 40 32.5 72.5 72.5 72.5c26 0 50-13.9 62.9-36.5l13.9-24.3c26.8-47 46.5-97.7 58.4-150.5l94.4-28.3-12.5 37.5c-3.3 9.8-1.6 20.5 4.4 28.8s15.7 13.3 26 13.3H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H460.4l18-53.9c3.8-11.3 .9-23.8-7.4-32.4s-20.7-11.8-32.2-8.4L316.4 198.1c2.4-20.7 3.6-41.4 3.6-62.3V128c0-53-43-96-96-96s-96 43-96 96v32c0 17.7 14.3 32 32 32s32-14.3 32-32V128zm-9.2 177l49-14.7c-10.4 33.8-24.5 66.4-42.1 97.2l-13.9 24.3c-1.5 2.6-4.3 4.3-7.4 4.3c-4.7 0-8.5-3.8-8.5-8.5V335.6c0-14.1 9.3-26.6 22.8-30.7zM24 368c-13.3 0-24 10.7-24 24s10.7 24 24 24H64.3c-.2-2.8-.3-5.6-.3-8.5V368H24zm592 48c13.3 0 24-10.7 24-24s-10.7-24-24-24H305.9c-6.7 16.3-14.2 32.3-22.3 48H616z"]
};
var faChair = {
  prefix: "fas",
  iconName: "chair",
  icon: [448, 512, [129681], "f6c0", "M248 48V256h48V58.7c23.9 13.8 40 39.7 40 69.3V256h48V128C384 57.3 326.7 0 256 0H192C121.3 0 64 57.3 64 128V256h48V128c0-29.6 16.1-55.5 40-69.3V256h48V48h48zM48 288c-12.1 0-23.2 6.8-28.6 17.7l-16 32c-5 9.9-4.4 21.7 1.4 31.1S20.9 384 32 384l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32V384H352v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384c11.1 0 21.4-5.7 27.2-15.2s6.4-21.2 1.4-31.1l-16-32C423.2 294.8 412.1 288 400 288H48z"]
};
var faLocationPin = {
  prefix: "fas",
  iconName: "location-pin",
  icon: [384, 512, ["map-marker"], "f041", "M384 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C117 435 0 279.4 0 192C0 86 86 0 192 0S384 86 384 192z"]
};
var faMapMarker = faLocationPin;
var faScrewdriverWrench = {
  prefix: "fas",
  iconName: "screwdriver-wrench",
  icon: [512, 512, ["tools"], "f7d9", "M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4h54.1l109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3l-109-109V104c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1C0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L233.7 374.3c-7.8-20.9-9-43.6-3.6-65.1l-61.7-61.7L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5c-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7H352c-8.8 0-16-7.2-16-16V102.6c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C388.7 1.1 378.5 0 368 0C288.5 0 224 64.5 224 144l0 .8 85.3 85.3c36-9.1 75.8 .5 104 28.7L429 274.5c49-23 83-72.8 83-130.5zM56 432a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"]
};
var faTools = faScrewdriverWrench;
var faFloppyDisk = {
  prefix: "fas",
  iconName: "floppy-disk",
  icon: [448, 512, [128190, 128426, "save"], "f0c7", "M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"]
};
var faSave = faFloppyDisk;
var faUserGear = {
  prefix: "fas",
  iconName: "user-gear",
  icon: [640, 512, ["user-cog"], "f4fe", "M224 0a128 128 0 1 1 0 256A128 128 0 1 1 224 0zM178.3 304h91.4c11.8 0 23.4 1.2 34.5 3.3c-2.1 18.5 7.4 35.6 21.8 44.8c-16.6 10.6-26.7 31.6-20 53.3c4 12.9 9.4 25.5 16.4 37.6s15.2 23.1 24.4 33c15.7 16.9 39.6 18.4 57.2 8.7v.9c0 9.2 2.7 18.5 7.9 26.3H29.7C13.3 512 0 498.7 0 482.3C0 383.8 79.8 304 178.3 304zM436 218.2c0-7 4.5-13.3 11.3-14.8c10.5-2.4 21.5-3.7 32.7-3.7s22.2 1.3 32.7 3.7c6.8 1.5 11.3 7.8 11.3 14.8v17.7c0 7.8 4.8 14.8 11.6 18.7c6.8 3.9 15.1 4.5 21.8 .6l13.8-7.9c6.1-3.5 13.7-2.7 18.5 2.4c7.6 8.1 14.3 17.2 20.1 27.2s10.3 20.4 13.5 31c2.1 6.7-1.1 13.7-7.2 17.2l-14.4 8.3c-6.5 3.7-10 10.9-10 18.4s3.5 14.7 10 18.4l14.4 8.3c6.1 3.5 9.2 10.5 7.2 17.2c-3.3 10.6-7.8 21-13.5 31s-12.5 19.1-20.1 27.2c-4.8 5.1-12.5 5.9-18.5 2.4l-13.8-7.9c-6.7-3.9-15.1-3.3-21.8 .6c-6.8 3.9-11.6 10.9-11.6 18.7v17.7c0 7-4.5 13.3-11.3 14.8c-10.5 2.4-21.5 3.7-32.7 3.7s-22.2-1.3-32.7-3.7c-6.8-1.5-11.3-7.8-11.3-14.8V467.8c0-7.9-4.9-14.9-11.7-18.9c-6.8-3.9-15.2-4.5-22-.6l-13.5 7.8c-6.1 3.5-13.7 2.7-18.5-2.4c-7.6-8.1-14.3-17.2-20.1-27.2s-10.3-20.4-13.5-31c-2.1-6.7 1.1-13.7 7.2-17.2l14-8.1c6.5-3.8 10.1-11.1 10.1-18.6s-3.5-14.8-10.1-18.6l-14-8.1c-6.1-3.5-9.2-10.5-7.2-17.2c3.3-10.6 7.7-21 13.5-31s12.5-19.1 20.1-27.2c4.8-5.1 12.4-5.9 18.5-2.4l13.6 7.8c6.8 3.9 15.2 3.3 22-.6c6.9-3.9 11.7-11 11.7-18.9V218.2zm92.1 133.5a48.1 48.1 0 1 0 -96.1 0 48.1 48.1 0 1 0 96.1 0z"]
};
var faUserCog = faUserGear;
var faTrash = {
  prefix: "fas",
  iconName: "trash",
  icon: [448, 512, [], "f1f8", "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"]
};
var faFilePdf = {
  prefix: "fas",
  iconName: "file-pdf",
  icon: [512, 512, [], "f1c1", "M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"]
};
var faCalendarCheck = {
  prefix: "fas",
  iconName: "calendar-check",
  icon: [448, 512, [], "f274", "M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zM329 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-95 95-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L329 305z"]
};
var faHouse = {
  prefix: "fas",
  iconName: "house",
  icon: [576, 512, [127968, 63498, 63500, "home", "home-alt", "home-lg-alt"], "f015", "M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"]
};
var faHome = faHouse;
var faStop = {
  prefix: "fas",
  iconName: "stop",
  icon: [384, 512, [9209], "f04d", "M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"]
};
var faUpload = {
  prefix: "fas",
  iconName: "upload",
  icon: [512, 512, [], "f093", "M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"]
};
var faLink = {
  prefix: "fas",
  iconName: "link",
  icon: [640, 512, [128279, "chain"], "f0c1", "M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"]
};
var faPlay = {
  prefix: "fas",
  iconName: "play",
  icon: [384, 512, [9654], "f04b", "M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"]
};
var faMagnifyingGlass = {
  prefix: "fas",
  iconName: "magnifying-glass",
  icon: [512, 512, [128269, "search"], "f002", "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"]
};
var faSearch = faMagnifyingGlass;
var faUserShield = {
  prefix: "fas",
  iconName: "user-shield",
  icon: [640, 512, [], "f505", "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c1.8 0 3.5-.2 5.3-.5c-76.3-55.1-99.8-141-103.1-200.2c-16.1-4.8-33.1-7.3-50.7-7.3H178.3zm308.8-78.3l-120 48C358 277.4 352 286.2 352 296c0 63.3 25.9 168.8 134.8 214.2c5.9 2.5 12.6 2.5 18.5 0C614.1 464.8 640 359.3 640 296c0-9.8-6-18.6-15.1-22.3l-120-48c-5.7-2.3-12.1-2.3-17.8 0zM591.4 312c-3.9 50.7-27.2 116.7-95.4 149.7V273.8L591.4 312z"]
};
var faPlus = {
  prefix: "fas",
  iconName: "plus",
  icon: [448, 512, [10133, 61543, "add"], "2b", "M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"]
};
var faChevronLeft = {
  prefix: "fas",
  iconName: "chevron-left",
  icon: [320, 512, [9001], "f053", "M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"]
};
var faTicketSimple = {
  prefix: "fas",
  iconName: "ticket-simple",
  icon: [576, 512, ["ticket-alt"], "f3ff", "M0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64v64c0 8.8-7.4 15.7-15.7 18.6C541.5 217.1 528 235 528 256s13.5 38.9 32.3 45.4c8.3 2.9 15.7 9.8 15.7 18.6v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320c0-8.8 7.4-15.7 15.7-18.6C34.5 294.9 48 277 48 256s-13.5-38.9-32.3-45.4C7.4 207.7 0 200.8 0 192V128z"]
};
var faTicketAlt = faTicketSimple;
var faCalendar = {
  prefix: "fas",
  iconName: "calendar",
  icon: [448, 512, [128197, 128198], "f133", "M96 32V64H48C21.5 64 0 85.5 0 112v48H448V112c0-26.5-21.5-48-48-48H352V32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H160V32c0-17.7-14.3-32-32-32S96 14.3 96 32zM448 192H0V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V192z"]
};
var faRss = {
  prefix: "fas",
  iconName: "rss",
  icon: [448, 512, ["feed"], "f09e", "M0 64C0 46.3 14.3 32 32 32c229.8 0 416 186.2 416 416c0 17.7-14.3 32-32 32s-32-14.3-32-32C384 253.6 226.4 96 32 96C14.3 96 0 81.7 0 64zM0 416a64 64 0 1 1 128 0A64 64 0 1 1 0 416zM32 160c159.1 0 288 128.9 288 288c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-123.7-100.3-224-224-224c-17.7 0-32-14.3-32-32s14.3-32 32-32z"]
};
var faTriangleExclamation = {
  prefix: "fas",
  iconName: "triangle-exclamation",
  icon: [512, 512, [9888, "exclamation-triangle", "warning"], "f071", "M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"]
};
var faExclamationTriangle = faTriangleExclamation;
var faCalendarDay = {
  prefix: "fas",
  iconName: "calendar-day",
  icon: [448, 512, [], "f783", "M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm80 64c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80z"]
};
var faUserClock = {
  prefix: "fas",
  iconName: "user-clock",
  icon: [640, 512, [], "f4fd", "M224 0a128 128 0 1 1 0 256A128 128 0 1 1 224 0zM178.3 304h91.4c20.6 0 40.4 3.5 58.8 9.9C323 331 320 349.1 320 368c0 59.5 29.5 112.1 74.8 144H29.7C13.3 512 0 498.7 0 482.3C0 383.8 79.8 304 178.3 304zM352 368a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-80c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H512V304c0-8.8-7.2-16-16-16z"]
};

// node_modules/slim-select/
config$1.mutateApproach = "sync";
library$1.add(faCalendar, faCalendarAlt, faCalendarDay, faCalendarCheck, faChair, faChevronLeft, faHeading, faEdit, faExclamationTriangle, faFileCsv, faFilePdf, faFolderOpen, faGlobe, faHome, faLink, faList, faMapMarker, faMaximize, faPlay, faPlus, faRss, faSave, faSearch, faSignature, faSignInAlt, faSignOutAlt, faStop, faTicketAlt, faTools, faTrash, faUpload, faUser, faUserClock, faUserCog, faUsers, faUserShield);
dom$1.watch();

//# debugId=2FA37373FDEAFB3664756e2164756e21
