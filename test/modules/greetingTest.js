// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Create a mock Loader used for global.config
var mockConfigLoader = new (require('./../mock').MockLoader)({
    'greeting': 'testGreeting',
    'nick': 'testNick',
    'greeting-ignore': 'ignoredTestNick'
});
global.config = mockConfigLoader;

// Create global.irc object, as it is used by the module
global.irc = {};

// Create a mock irc client
var mockIrcClient = new (require('./../mock').MockIrcClient)();

// Import our module we want to test
var Greeting = require("./../../modules/greeting/greeting");

describe('Module Greeting', function () {
    describe('#join()', function () {
        it('should send a greeting to users joining the channel', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a join to the channel testChan
            Greeting.join('testChan', 'testUser', 'testMsg');

            assert.deepEqual(mockIrcClient.getMethodCalls('say'), [
                [
                    'testChan',
                    'testGreeting testUser'
                ]
            ]);
        });

        it('should not send greeting to itself when joining the channel', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a join of itself to the channel testChan
            Greeting.join('testChan', 'testNick', 'testMsg');

            assert.deepEqual(mockIrcClient.getMethodCalls('say'), []);
        });

        it('should not send greeting to a user if the user is on the greeting-ignore list', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a join of itself to the channel testChan
            Greeting.join('testChan', 'ignoredTestNick', 'testMsg');

            assert.deepEqual(mockIrcClient.getMethodCalls('say'), []);
        });
    });
});
