/**
 * A class that takes an object (or an object prototype),
 * finds all methods and creates a new mock object with the same methods
 * as the provided object.
 *
 * This is limited in the sense that no method will return any values.
 * If a mock return is necessary one will have to override the
 * appropriate method and make it call registerMethodCall. See the example
 * below.
 *
 * Also note that the lookup of methods is not recursive, only methods
 * directly attached to the provided objectPrototype will be mocked.
 *
 * Example on how extend and to use this class;
 *      function MockIrcClient() {}
 *      MockIrcClient.prototype = new Mock(irc.Client.prototype);
 *      MockIrcClient.prototype.connect = function connect() {
 *          this.registerMethodCall('connect', arguments);
 *          return true;
 *      };
 *      var mock = new MockIrcClient();
 *      // Pass the mock instance instead of the real instance
 *      mock.say('abc');            // Returns nothing, only registers
 *      mock.connect();             // Calls the MockIrcClient.connect above.
 *      // In the tests, one can now access the list of method calls
 *      mock.getMethodCalls('say'); // [['abc']]
 *      mock.reset();               // Removes all registered calls
 *      mock.getMethodCalls('say'); // []
 *
 * @param objectPrototype
 * @constructor
 */
function Mock(objectPrototype) {
    /**
     * Stored reference to this
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
    var methodCalls = {};

    /**
     * Helper method for creating a function that, when called, adds
     * to the appropriate methodCalls array.
     * @param methodName The name of the method that the mock method
     * is for.
     * @returns {Function}
     */
    var createMockMethod = function createMockMethod(methodName) {
        return function mockMethod() {
            _this.registerMethodCall(methodName, arguments);
        };
    };

    /**
     * Registers a call to a method.
     * @param methodName The name of the method called.
     * @param methodArgs The arguments object that should be stored for the call.
     * @protected
     */
    this.registerMethodCall = function registerMethodCall(methodName, methodArgs) {
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments
        var argsArray = Array.prototype.slice.call(methodArgs);
        if (!methodCalls[methodName]) {
            methodCalls[methodName] = [];
        }
        methodCalls[methodName].push(argsArray);
    };

    /**
     * Returns a list of calls made to the method methodName.
     * @param methodName The method name to return calls for.
     * @returns {[]}
     */
    this.getMethodCalls = function getMethodCalls(methodName) {
        if (methodName in methodCalls) {
            return methodCalls[methodName];
        } else {
            return [];
        }
    };

    /**
     * Resets the recorded method calls.
     * @returns {Mock} The this object, for chaining.
     */
    this.reset = function reset() {
        methodCalls = {};
        return this;
    };

    // Find all methods in the objectPrototype and add a mock
    // method for each of them to the Mock prototype.
    (function cloneMethods() {
        for (var method in objectPrototype) {
            if (objectPrototype.hasOwnProperty(method) &&
                typeof objectPrototype[method] === "function" && !Mock.prototype.hasOwnProperty(method)) {

                Mock.prototype[method] = createMockMethod(method);
            }
        }
    })();
}

module.exports = Mock;
