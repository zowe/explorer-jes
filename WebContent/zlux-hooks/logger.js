
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
Object.defineProperty(exports, '__esModule', { value: true });
let componentLoggers; // Because each componentLogger is accessible through its parent logger at run-time, and componentLoggers
let LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel.CRITICAL = 0] = 'CRITICAL';
    LogLevel[LogLevel.WARN = 1] = 'WARN';
    LogLevel[LogLevel.INFO = 2] = 'INFO';
    LogLevel[LogLevel.DEBUG = 3] = 'DEBUG';
    LogLevel[LogLevel.FINER = 4] = 'FINER';
    LogLevel[LogLevel.TRACE = 5] = 'TRACE';
}(LogLevel = exports.LogLevel || (exports.LogLevel = {})));
const ComponentLogger = /** @class */ (function () {
    function ComponentLogger(parentLogger, componentName, messages) {
        this.parentLogger = parentLogger;
        this.componentName = componentName;
        this.CRITICAL = LogLevel.CRITICAL;
        this.SEVERE = LogLevel.CRITICAL;
        this.WARNING = LogLevel.WARN;
        this.WARN = LogLevel.WARN;
        this.INFO = LogLevel.INFO;
        this.FINE = LogLevel.DEBUG;
        this.DEBUG = LogLevel.DEBUG;
        this.FINER = LogLevel.FINER;
        this.FINEST = LogLevel.TRACE;
        this.TRACE = LogLevel.TRACE;
        this._messages = messages;
        this._subLoggers = [];
    }
    ComponentLogger.prototype._setMessages = function (table) {
        this._messages = table;
        this._subLoggers.forEach(sublogger => { return sublogger._messages = table; });
    };
    ComponentLogger.prototype.makeSublogger = function (componentNameSuffix) {
        const subLogger = new ComponentLogger(this.parentLogger, `${this.componentName}:${componentNameSuffix}`, this._messages);
        this._subLoggers.push(subLogger);
        return subLogger;
    };
    ComponentLogger.prototype.log = function (minimumLevel) {
        const loggableItems = [];
        for (let _i = 1; _i < arguments.length; _i++) {
            loggableItems[_i - 1] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, minimumLevel].concat(loggableItems));
    };
    ComponentLogger.prototype.severe = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, LogLevel.CRITICAL].concat(loggableItems));
    };
    ComponentLogger.prototype.critical = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, LogLevel.CRITICAL].concat(loggableItems));
    };
    ComponentLogger.prototype.info = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, Logger.INFO].concat(loggableItems));
    };
    ComponentLogger.prototype.warn = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, Logger.WARN].concat(loggableItems));
    };
    ComponentLogger.prototype.debug = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, Logger.DEBUG].concat(loggableItems));
    };
    ComponentLogger.prototype.trace = function () {
        const loggableItems = [];
        for (let _i = 0; _i < arguments.length; _i++) {
            loggableItems[_i] = arguments[_i];
        }
        let _a;
        const firstLoggableItem = loggableItems[0];
        if (this._messages && this._messages[firstLoggableItem]) {
            loggableItems[0] = `${firstLoggableItem} - ${this._messages[firstLoggableItem]}`;
        }
        (_a = this.parentLogger).log.apply(_a, [this.componentName, Logger.TRACE].concat(loggableItems));
    };
    return ComponentLogger;
}());
exports.ComponentLogger = ComponentLogger;
const RegExpLevel = /** @class */ (function () {
    function RegExpLevel(regex, level) {
        this.regex = regex;
        this.level = level;
    }
    return RegExpLevel;
}());
var Logger = /** @class */ (function () {
    function Logger(offsetMs) {
        if (offsetMs === void 0) { offsetMs = 0; }
        this.knownComponentNames = [];
        componentLoggers = new Map();
        this.configuration = {};
        Logger.offsetMs = offsetMs;
        this.destinations = new Array();
        this.previousPatterns = new Array();
        if (!Logger.processString) {
            const runningInNode = new Function('try { return this === global; } catch (error) { return false; }');
            if (runningInNode()) {
                Logger.useV8Tracing = true;
                Logger.processString = `<ZWED:${process.pid}> `;
                Logger.os = require('os');
                if (Logger.os.platform() == 'win32') {
                    Logger.seperator = '\\';
                }
                try {
                    Logger.username = Logger.os.userInfo().username;
                } catch (e) {
                    // OK
                    const platform = Logger.os.platform();
                    if (platform != 'win32' && platform != 'android') {
                        Logger.euid = process.geteuid();
                    }
                }
            } else {
                Logger.processString = '<ZWED:> ';
            }
        }
    }
    Logger.prototype.toggleV8Tracing = function () {
        Logger.useV8Tracing = !Logger.useV8Tracing;
        return Logger.useV8Tracing;
    };
    Logger.prototype._setBrowserUsername = function (username) {
        // browser check
        if (!Logger.os && (username.length > 0)) {
            Logger.username = username;
        }
    };
    Logger.prototype.addDestination = function (destinationCallback) {
        this.destinations.push(destinationCallback);
    };
    Logger.prototype.shouldLogInternal = function (componentName, level) {
        let configuredLevel = this.configuration[componentName];
        if (configuredLevel === undefined) {
            configuredLevel = Logger.INFO;
        }
        return configuredLevel >= level;
    };

    Logger.createPrependingStrings = function (prependLevel, prependProcess, prependUser) {
        let formatting = '';
        if (prependProcess) {
            formatting += Logger.processString;
        }
        if (prependUser) {
            if (Logger.username) {
                formatting += `${Logger.username} `;
            } else {
                formatting += `${Logger.euid} `;
            }
        }
        if (prependLevel) {
            return [
                `${formatting}${LogLevel[0]} `,
                `${formatting}${LogLevel[1]} `,
                `${formatting}${LogLevel[2]} `,
                `${formatting}${LogLevel[3]} `,
                `${formatting}${LogLevel[4]} `,
                `${formatting}${LogLevel[5]} `,
            ];
        }

        return [
            `${formatting} `,
            `${formatting} `,
            `${formatting} `,
            `${formatting} `,
            `${formatting} `,
            `${formatting} `,
        ];
    };
    Logger.prototype.consoleLogInternal = function (componentName, minimumLevel, prependingString, prependDate, prependName) {
        const loggableItems = [];
        for (let _i = 5; _i < arguments.length; _i++) {
            loggableItems[_i - 5] = arguments[_i];
        }
        let formatting = '';
        if (prependDate) {
            const d = new Date();
            d.setTime(d.getTime() - Logger.offsetMs);
            let dateString = d.toISOString();
            dateString = dateString.substring(0, dateString.length - 1).replace('T', ' ');
            formatting += `${dateString} `;
        }
        formatting += prependingString;
        // v8 tracing only intended for v8 browsers & nodejs. Not likely to work elsewhere, so defaults to off for web code.
        // Inspired from https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
        // API def: https://v8.dev/docs/stack-trace-api
        if (prependName && Logger.useV8Tracing) {
            const originalFunc = Error.prepareStackTrace;
            let callerFunction = '';
            let callerLine = '';
            try {
                const err = new Error();
                Error.prepareStackTrace = function (err, stack) {
                    err;
                    return stack;
                };
                if (err.stack.shift) {
                    const thisFile = err.stack.shift().getFileName();
                    while (err.stack.length) {
                        const stackEntry = err.stack.shift();
                        callerFunction = stackEntry.getFileName();
                        if (callerFunction && (callerFunction != thisFile)) {
                            callerFunction = callerFunction.substring(callerFunction.lastIndexOf(Logger.seperator) + 1);
                            callerLine = stackEntry.getLineNumber();
                            break;
                        }
                    }
                }
            } catch (e) {
                console.warn(`Error on stack analysis, ${e}`);
            }
            Error.prepareStackTrace = originalFunc;
            formatting += `(${componentName},${callerFunction}:${callerLine}) `;
        } else if (prependName) {
            formatting += `(${componentName},:) `;
        }
        if (loggableItems && (typeof loggableItems[0] === 'string')) {
            formatting += loggableItems[0];
            loggableItems.shift();
        }
        if (minimumLevel === LogLevel.CRITICAL) {
            console.error(...[formatting].concat(loggableItems));
        } else if (minimumLevel === LogLevel.WARN) {
            console.warn(...[formatting].concat(loggableItems));
        } else {
            console.log(...[formatting].concat(loggableItems));
        }
    };

    Logger.prototype.makeDefaultDestination = function (prependDate, prependName, prependLevel, prependProcess, prependUser) {
        const theLogger = this;
        return function (componentName, minimumLevel) {
            const loggableItems = [];
            for (let _i = 2; _i < arguments.length; _i++) {
                loggableItems[_i - 2] = arguments[_i];
            }
            const prependingStrings = Logger.createPrependingStrings(prependLevel, prependProcess, prependUser);
            if (theLogger.shouldLogInternal(componentName, minimumLevel)) {
                theLogger.consoleLogInternal(...[componentName, minimumLevel, prependingStrings[minimumLevel], prependDate, prependName].concat(loggableItems));
            }
        };
    };

    Logger.prototype.log = function (componentName, minimumLevel) {
        const loggableItems = [];
        for (let _i = 2; _i < arguments.length; _i++) {
            loggableItems[_i - 2] = arguments[_i];
        }
        this.noteComponentNameInternal(componentName);
        this.destinations.forEach(destinationCallback => {
            destinationCallback(...[componentName, minimumLevel].concat(loggableItems));
        });
    };

    Logger.prototype.setLogLevelForComponentPattern = function (componentNamePattern, level) {
        const theLogger = this;
        const componentNameArray = Object.keys(this.configuration);
        const regex = new RegExp(componentNamePattern);
        this.previousPatterns.push(new RegExpLevel(regex, level));
        componentNameArray.filter(componentName => {
            return regex.test(componentName);
        }).forEach(componentName => {
            theLogger.configuration[componentName] = level;
        });
    };

    Logger.prototype.setLogLevelForComponentName = function (componentName, level) {
        if (level >= LogLevel.CRITICAL && level <= LogLevel.TRACE) {
            this.configuration[componentName] = level;
        }
    };
    Logger.prototype.getComponentLevel = function (componentName) {
        return this.configuration[componentName];
    };
    Logger.prototype.getConfig = function () {
        return this.configuration;
    };
    Logger.prototype.noteComponentNameInternal = function (componentName) {
        if (!this.knownComponentNames.find(name => { return name == componentName; })) {
            this.knownComponentNames.push(componentName);
        }
    };

    Logger.prototype.replayPatternsOnLogger = function (componentName) {
        for (let i = this.previousPatterns.length - 1; i > -1; i--) {
            const pattern = this.previousPatterns[i];
            if (pattern.regex.test(componentName)) {
                this.setLogLevelForComponentName(componentName, pattern.level);
                return true;
            }
        }
        return false;
    };
    Logger.prototype.makeComponentLogger = function (componentName, _messages) {
        let componentLogger = componentLoggers.get(componentName);
        if (componentLogger) {
            this.consoleLogInternal('_internal', LogLevel.WARN, `${Logger.processString}${Logger.username} ${LogLevel[1]}`, true, true, 'Logger created with identical component name to pre-existing logger. _messages overlap may occur.');
        } else {
            if (_messages) {
                componentLogger = new ComponentLogger(this, componentName, _messages);
            } else {
                componentLogger = new ComponentLogger(this, componentName);
            }
            this.configuration[componentName] = LogLevel.INFO;
            componentLoggers.set(componentName, componentLogger);
            this.replayPatternsOnLogger(componentName);
        }
        return componentLogger;
    };
    Logger.SEVERE = LogLevel.CRITICAL;
    Logger.CRITICAL = LogLevel.CRITICAL;
    Logger.WARNING = LogLevel.WARN;
    Logger.WARN = LogLevel.WARN;
    Logger.INFO = LogLevel.INFO;
    Logger.DEBUG = LogLevel.DEBUG;
    Logger.FINE = LogLevel.DEBUG;
    Logger.FINER = LogLevel.FINER;
    Logger.FINEST = LogLevel.TRACE;
    Logger.TRACE = LogLevel.TRACE;
    Logger.username = 'N/A';
    Logger.offsetMs = 0;
    Logger.seperator = '/';
    Logger.useV8Tracing = false;
    return Logger;
}());
exports.Logger = Logger;
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
// # sourceMappingURL=logger.js.map
