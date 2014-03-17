var irc = require('irc');

/**
 * A class that takes an object (or an object prototype),
 * finds all methods and creates a new mock object with the same methods
 * as the provided object.
 *
 * @param objectPrototype
 * @constructor
 */
function Mock(objectPrototype) {
    /**
     * Reference to this
     * @type {Mock}
     * @private
     */
    var _this = this;

    /**
     * A map of calls, where keys are the method names and the values are
     * arrays of calls to the method.
     * @type {object}
     * @private
     */
    this._methodCalls = {};

    /**
     * Helper method for creating a function that, when called, adds
     * to the appropriate methodCalls array.
     * @param methodName The name of the method that the mock method
     * is for.
     * @returns {Function}
     */
    var createMockMethod = function createMockMethod(methodName) {
        return function mockMethod() {
            // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments
            var args = Array.prototype.slice.call(arguments);
            if (!_this._methodCalls[methodName]) {
                _this._methodCalls[methodName] = [];
            }
            _this._methodCalls[methodName].push(args);
        };
    };

    for (var method in objectPrototype) {
        if (objectPrototype.hasOwnProperty(method) &&
            typeof objectPrototype[method] === "function" && !Mock.prototype.hasOwnProperty(method)) {

            Mock.prototype[method] = createMockMethod(method);
        }
    }
}

Mock.prototype.getCallsForMethod = function getCallsForMethod(methodName) {
    if (methodName in this._methodCalls) {
        return this._methodCalls[methodName];
    } else {
        return [];
    }
};



function MockIrc() {
}


MockIrc.prototype = new Mock(irc.Client.prototype);


var m = new MockIrc();

m.send('abc', '1');
m.send('abc', '2');
console.log(m.getCallsForMethod('send'));

module.exports.MockIrc = MockIrc;